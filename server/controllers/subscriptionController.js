const crypto = require('crypto');
const User = require('../models/User');
const Project = require('../models/Project');
const Subscription = require('../models/Subscription');
const razorpay = require('../config/razorpay');
const { reactivatePortfolios } = require('../services/portfolioLifecycle');

// 1. Get Subscription Status and Usage Limits
exports.getSubscriptionStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const plan = user.plan || 'free';
        const subscription = user.subscription || {};

        // Active portfolios count
        const activePortfolios = await Project.countDocuments({
            user: user._id,
            status: 'Live'
        });

        // Archived portfolios count
        const archivedPortfolios = await Project.countDocuments({
            user: user._id,
            status: 'Archived'
        });

        // Total portfolios count
        const totalPortfolios = await Project.countDocuments({
            user: user._id
        });

        const limits = {
            free: { maxPortfolios: 1, hostingDuration: '7 days', canExportCode: false },
            pro: { maxPortfolios: 5, hostingDuration: 'active subscription', canExportCode: true },
            lifetime: { maxPortfolios: Infinity, hostingDuration: 'lifetime', canExportCode: true }
        };

        const currentLimits = limits[plan] || limits.free;
        const canCreatePortfolio = totalPortfolios < currentLimits.maxPortfolios;
        const canExportCode = currentLimits.canExportCode;

        const payments = await Subscription.find({ user: user._id }).sort({ createdAt: -1 }).limit(10);

        res.status(200).json({
            plan,
            subscription,
            limits: {
                maxPortfolios: currentLimits.maxPortfolios,
                hostingDuration: currentLimits.hostingDuration
            },
            usage: {
                activePortfolios,
                archivedPortfolios,
                totalPortfolios
            },
            canCreatePortfolio,
            canExportCode,
            payments
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Create Razorpay Subscription (Pro plan - ₹199/month recurring)
exports.createProSubscription = async (req, res) => {
    try {
        const planId = process.env.RAZORPAY_PLAN_ID_PRO;
        if (!planId) {
            return res.status(400).json({ error: 'Pro plan ID not configured on server.' });
        }

        // Check if user already has an active subscription
        if (req.user.plan === 'lifetime') {
            return res.status(400).json({ error: 'You already have Lifetime Access.' });
        }

        // Create subscription on Razorpay
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            total_count: 120, // 10 years
            quantity: 1,
            customer_notify: 1,
            notes: {
                userId: req.user._id.toString(),
                email: req.user.email
            }
        });

        // Create initial Subscription record
        await Subscription.create({
            user: req.user._id,
            type: 'pro_monthly',
            razorpaySubscriptionId: subscription.id,
            amount: 19900, // ₹199
            status: 'created'
        });

        // Update User object with temp subscription status
        await User.findByIdAndUpdate(req.user._id, {
            'subscription.razorpaySubscriptionId': subscription.id,
            'subscription.status': 'created'
        });

        res.status(201).json({
            subscriptionId: subscription.id,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Create Razorpay Order (Lifetime plan - ₹999 one-time)
exports.createLifetimeOrder = async (req, res) => {
    try {
        if (req.user.plan === 'lifetime') {
            return res.status(400).json({ error: 'You already have Lifetime Access.' });
        }

        const options = {
            amount: 99900, // ₹999 in paise
            currency: 'INR',
            receipt: `receipt_lifetime_${req.user._id}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                email: req.user.email
            }
        };

        const order = await razorpay.orders.create(options);

        // Save subscription record
        await Subscription.create({
            user: req.user._id,
            type: 'lifetime',
            razorpayOrderId: order.id,
            amount: 99900,
            status: 'created'
        });

        res.status(201).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Verify Razorpay Payment (both Pro subscription & Lifetime order)
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id,
            razorpay_order_id,
            type
        } = req.body;

        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) {
            return res.status(500).json({ error: 'Razorpay secret not configured.' });
        }

        let expectedSignature;
        let query = {};

        if (type === 'pro') {
            // Subscription signature verification
            expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(razorpay_payment_id + '|' + razorpay_subscription_id)
                .digest('hex');
            query = { razorpaySubscriptionId: razorpay_subscription_id };
        } else {
            // Order signature verification
            expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(razorpay_order_id + '|' + razorpay_payment_id)
                .digest('hex');
            query = { razorpayOrderId: razorpay_order_id };
        }

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
        }

        const now = new Date();
        const user = await User.findById(req.user._id);

        if (type === 'pro') {
            user.plan = 'pro';
            user.planUpdatedAt = now;
            user.subscription = {
                razorpaySubscriptionId: razorpay_subscription_id,
                status: 'active',
                currentPeriodStart: now,
                currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 days
                gracePeriodEnd: null
            };
        } else if (type === 'lifetime') {
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
        await Subscription.findOneAndUpdate(query, {
            status: 'paid',
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature
        });

        // Reactivate any archived portfolios
        await reactivatePortfolios(user._id, user.plan);

        res.status(200).json({
            success: true,
            plan: user.plan,
            message: 'Payment verified successfully. Plan upgraded.'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Cancel Subscription (Pro Monthly)
exports.cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.plan !== 'pro' || !user.subscription || !user.subscription.razorpaySubscriptionId) {
            return res.status(400).json({ error: 'No active Pro subscription found to cancel.' });
        }

        const subId = user.subscription.razorpaySubscriptionId;

        // Cancel subscription on Razorpay
        await razorpay.subscriptions.cancel(subId);

        // Calculate grace period: end of current period + 7 days
        const currentEnd = user.subscription.currentPeriodEnd 
            ? new Date(user.subscription.currentPeriodEnd) 
            : new Date();
        const gracePeriodEnd = new Date(currentEnd.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days

        user.subscription.status = 'cancelled';
        user.subscription.gracePeriodEnd = gracePeriodEnd;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Subscription cancelled. Grace period started.',
            gracePeriodEnd
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Webhook handler for Razorpay billing events
exports.handleWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return res.status(500).json({ error: 'Webhook secret not configured.' });
        }

        // Razorpay sends signature in header
        const signature = req.headers['x-razorpay-signature'];
        
        // Compute signature on raw body
        const rawBody = req.rawBody || JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ error: 'Invalid webhook signature.' });
        }

        const eventObj = req.body;
        const eventType = eventObj.event;
        const payload = eventObj.payload;

        console.log(`Received Razorpay webhook event: ${eventType}`);

        const now = new Date();

        if (eventType.startsWith('subscription.')) {
            const razorpaySubId = payload.subscription.entity.id;
            const user = await User.findOne({ 'subscription.razorpaySubscriptionId': razorpaySubId });

            if (user) {
                const subEntity = payload.subscription.entity;
                const statusMap = {
                    activated: 'active',
                    charged: 'active',
                    pending: 'pending',
                    halted: 'halted',
                    cancelled: 'cancelled',
                    completed: 'completed'
                };

                const subStatus = statusMap[eventType.split('.')[1]] || subEntity.status;
                user.subscription.status = subStatus;

                if (eventType === 'subscription.charged') {
                    // Update validity dates
                    user.plan = 'pro';
                    user.subscription.currentPeriodStart = new Date(subEntity.current_start * 1000);
                    user.subscription.currentPeriodEnd = new Date(subEntity.current_end * 1000);
                    user.subscription.gracePeriodEnd = null; // Reset grace period on charge success
                    
                    // Log the payment
                    await Subscription.create({
                        user: user._id,
                        type: 'pro_monthly',
                        razorpaySubscriptionId: razorpaySubId,
                        razorpayPaymentId: payload.payment ? payload.payment.entity.id : null,
                        amount: subEntity.charge_at ? 19900 : 0,
                        status: 'paid',
                        webhookEvent: eventType
                    });

                    // Reactivate portfolios
                    await reactivatePortfolios(user._id, 'pro');

                } else if (['subscription.pending', 'subscription.halted', 'subscription.cancelled'].includes(eventType)) {
                    // Start 7-day grace period from webhook event time or currentPeriodEnd
                    const baseDate = user.subscription.currentPeriodEnd && user.subscription.currentPeriodEnd > now 
                        ? user.subscription.currentPeriodEnd 
                        : now;
                    user.subscription.gracePeriodEnd = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
                }

                await user.save();
            }
        } else if (eventType === 'payment.captured') {
            // Primarily for Lifetime Orders (captured)
            const razorpayOrderId = payload.payment.entity.order_id;
            const paymentId = payload.payment.entity.id;
            const email = payload.payment.entity.email;

            let subscriptionRecord = await Subscription.findOne({ razorpayOrderId });
            let user;

            if (subscriptionRecord) {
                user = await User.findById(subscriptionRecord.user);
            } else {
                // Fallback: look up by notes or email
                const notesUserId = payload.payment.entity.notes ? payload.payment.entity.notes.userId : null;
                if (notesUserId) {
                    user = await User.findById(notesUserId);
                } else {
                    user = await User.findOne({ email });
                }
            }

            if (user && user.plan !== 'lifetime') {
                user.plan = 'lifetime';
                user.planUpdatedAt = now;
                user.subscription = {
                    status: 'active',
                    currentPeriodStart: now,
                    currentPeriodEnd: null,
                    gracePeriodEnd: null
                };
                await user.save();

                if (subscriptionRecord) {
                    subscriptionRecord.status = 'paid';
                    subscriptionRecord.razorpayPaymentId = paymentId;
                    subscriptionRecord.webhookEvent = eventType;
                    await subscriptionRecord.save();
                } else {
                    await Subscription.create({
                        user: user._id,
                        type: 'lifetime',
                        razorpayOrderId,
                        razorpayPaymentId: paymentId,
                        amount: payload.payment.entity.amount,
                        status: 'paid',
                        webhookEvent: eventType
                    });
                }

                // Reactivate all portfolios
                await reactivatePortfolios(user._id, 'lifetime');
            }
        } else if (eventType === 'payment.failed') {
            const razorpayOrderId = payload.payment.entity.order_id;
            const paymentId = payload.payment.entity.id;
            
            await Subscription.findOneAndUpdate({ razorpayOrderId }, {
                status: 'failed',
                razorpayPaymentId: paymentId,
                failureReason: payload.payment.entity.error_description || 'Payment failed',
                webhookEvent: eventType
            });
        }

        // Always return 200 OK to Razorpay to prevent retry storms
        res.status(200).json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({ error: err.message });
    }
};
