const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSubscriptionStatus,
    createProSubscription,
    createLifetimeOrder,
    verifyPayment,
    cancelSubscription,
    handleWebhook
} = require('../controllers/subscriptionController');

// Public route for Razorpay webhook (handles signature validation internally)
router.post('/webhook', handleWebhook);

// Protected routes requiring authentication
router.get('/status', protect, getSubscriptionStatus);
router.post('/pro', protect, createProSubscription);
router.post('/lifetime', protect, createLifetimeOrder);
router.post('/verify', protect, verifyPayment);
router.post('/cancel', protect, cancelSubscription);

module.exports = router;
