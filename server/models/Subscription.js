const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['pro_monthly', 'lifetime'],
        required: true
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySubscriptionId: String,
    razorpaySignature: String,
    amount: {
        type: Number,
        required: true // in paise, e.g. 19900 or 99900
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'refunded'],
        default: 'created'
    },
    failureReason: String,
    webhookEvent: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
