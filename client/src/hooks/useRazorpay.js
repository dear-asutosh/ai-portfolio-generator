import { useState, useCallback } from 'react';
import api from '../apis/api';

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const useRazorpay = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const openProCheckout = useCallback(async (onSuccess, onFailure) => {
        setIsProcessing(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Are you offline?');
            }

            // 1. Create Razorpay Subscription in backend
            const { data } = await api.post('/subscription/pro');
            const { subscriptionId, key } = data;

            // 2. Configure Razorpay options
            const options = {
                key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
                subscription_id: subscriptionId,
                name: 'Profilio',
                description: 'Pro Monthly Subscription',
                image: '/src/assets/images/logo.png', // Add logo
                theme: { color: '#06b6d4' },
                handler: async (response) => {
                    setIsProcessing(true);
                    try {
                        // Verify subscription payment on backend
                        const verificationRes = await api.post('/subscription/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            type: 'pro'
                        });

                        if (verificationRes.data.success) {
                            if (onSuccess) onSuccess(verificationRes.data.plan);
                        } else {
                            throw new Error(verificationRes.data.error || 'Signature verification failed');
                        }
                    } catch (verifyErr) {
                        console.error('Signature verification failed:', verifyErr);
                        if (onFailure) onFailure(verifyErr.message || 'Verification failed');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        if (onFailure) onFailure('Payment cancelled by user');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            setIsProcessing(false);
            if (onFailure) onFailure(err.message || 'Could not initiate checkout');
        }
    }, []);

    const openLifetimeCheckout = useCallback(async (onSuccess, onFailure) => {
        setIsProcessing(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Are you offline?');
            }

            // 1. Create Razorpay Order in backend
            const { data } = await api.post('/subscription/lifetime');
            const { orderId, amount, currency, key } = data;

            // 2. Configure Razorpay options
            const options = {
                key: key || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: amount,
                currency: currency,
                name: 'Profilio',
                description: 'Lifetime Access Plan',
                image: '/src/assets/images/logo.png',
                order_id: orderId,
                theme: { color: '#06b6d4' },
                handler: async (response) => {
                    setIsProcessing(true);
                    try {
                        // Verify order payment on backend
                        const verificationRes = await api.post('/subscription/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            razorpay_order_id: response.razorpay_order_id,
                            type: 'lifetime'
                        });

                        if (verificationRes.data.success) {
                            if (onSuccess) onSuccess(verificationRes.data.plan);
                        } else {
                            throw new Error(verificationRes.data.error || 'Signature verification failed');
                        }
                    } catch (verifyErr) {
                        console.error('Signature verification failed:', verifyErr);
                        if (onFailure) onFailure(verifyErr.message || 'Verification failed');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        if (onFailure) onFailure('Payment cancelled by user');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            setIsProcessing(false);
            if (onFailure) onFailure(err.message || 'Could not initiate checkout');
        }
    }, []);

    const openStandardCheckout = useCallback(async (amount, plan, onSuccess, onFailure) => {
        setIsProcessing(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Are you offline?');
            }

            // 1. Create Razorpay Order via generic endpoint
            const { data } = await api.post('/create-order', {
                amount: Number(amount),
                currency: 'INR',
                plan
            });
            const { order_id, amount: orderAmount, currency } = data;

            // 2. Configure Razorpay options
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: orderAmount,
                currency: currency,
                name: 'Profilio',
                description: `${plan === 'pro' ? 'Pro Plan' : 'Lifetime Access'} Standard Checkout`,
                image: '/src/assets/images/logo.png',
                order_id: order_id,
                theme: { color: '#06b6d4' },
                handler: async (response) => {
                    setIsProcessing(true);
                    try {
                        // Verify order payment on generic verification endpoint
                        const verificationRes = await api.post('/verify-payment', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            razorpay_order_id: response.razorpay_order_id,
                            plan
                        });

                        if (verificationRes.data.success) {
                            if (onSuccess) onSuccess(verificationRes.data.plan);
                        } else {
                            throw new Error(verificationRes.data.error || 'Signature verification failed');
                        }
                    } catch (verifyErr) {
                        console.error('Signature verification failed:', verifyErr);
                        if (onFailure) onFailure(verifyErr.response?.data?.error || verifyErr.message || 'Verification failed');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsProcessing(false);
                        if (onFailure) onFailure('Payment cancelled by user');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Checkout error:', err);
            setIsProcessing(false);
            if (onFailure) onFailure(err.response?.data?.error || err.message || 'Could not initiate checkout');
        }
    }, []);

    return {
        openProCheckout,
        openLifetimeCheckout,
        openStandardCheckout,
        isProcessing
    };
};
