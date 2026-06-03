const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { reactivatePortfolios } = require('../services/portfolioLifecycle');

// POST /api/create-order
// Call Razorpay API to generate an order ID
router.post('/create-order', protect, async (req, res) => {
    try {
        const { amount, currency, receipt, plan } = req.body;

        // Validate amount >= 100 paise
        if (amount === undefined || amount < 100) {
            return res.status(400).json({ error: 'Amount is required and must be at least 100 paise (1 INR).' });
        }

        const options = {
            amount: Number(amount),
            currency: currency || 'INR',
            receipt: receipt || `receipt_order_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                email: req.user.email,
                plan: plan || 'custom'
            }
        };

        const order = await razorpay.orders.create(options);

        // Save a draft subscription record in database
        await Subscription.create({
            user: req.user._id,
            type: plan === 'pro' ? 'pro_monthly' : (plan === 'lifetime' ? 'lifetime' : 'custom'),
            razorpayOrderId: order.id,
            amount: Number(amount),
            status: 'created'
        });

        // Return standard order details
        res.status(200).json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (err) {
        console.error('Razorpay Order Creation Error:', err);
        res.status(500).json({ error: err.message || 'Failed to create Razorpay order.' });
    }
});

// POST /api/verify-payment
// Verify Razorpay HMAC-SHA256 signature
router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

        // Missing fields check
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ error: 'Missing required signature verification fields.' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({ error: 'Razorpay secret key not configured.' });
        }

        // Generate expected signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            const now = new Date();
            const user = await User.findById(req.user._id);

            if (user) {
                if (plan === 'pro') {
                    user.plan = 'pro';
                    user.planUpdatedAt = now;
                    user.subscription = {
                        razorpaySubscriptionId: '',
                        status: 'active',
                        currentPeriodStart: now,
                        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
                        gracePeriodEnd: null
                    };
                } else if (plan === 'lifetime') {
                    user.plan = 'lifetime';
                    user.planUpdatedAt = now;
                    user.subscription = {
                        status: 'active',
                        currentPeriodStart: now,
                        currentPeriodEnd: null,
                        gracePeriodEnd: null
                    };
                }
                await user.save();

                // Update Subscription Record
                await Subscription.findOneAndUpdate(
                    { razorpayOrderId: razorpay_order_id },
                    {
                        status: 'paid',
                        razorpayPaymentId: razorpay_payment_id,
                        razorpaySignature: razorpay_signature
                    }
                );

                // Reactivate any archived portfolios
                await reactivatePortfolios(user._id, user.plan);
            }

            res.status(200).json({
                success: true,
                plan: user ? user.plan : 'free',
                message: 'Signature verified successfully.'
            });
        } else {
            // Mismatch: return 400
            res.status(400).json({
                success: false,
                error: 'Signature verification mismatch.'
            });
        }
    } catch (err) {
        console.error('Payment Verification Error:', err);
        res.status(500).json({ error: err.message || 'Payment verification failed.' });
    }
});

module.exports = router;

