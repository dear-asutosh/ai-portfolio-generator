import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldAlert, Sparkles, Zap, Loader } from 'lucide-react';
import { useRazorpay } from '../../hooks/useRazorpay';
import { useSubscription } from '../../context/SubscriptionContext';
import Notification from './Notification';

export const UpgradeModal = ({ isOpen, onClose, title = "Upgrade Plan", message = "You've reached your plan's total portfolio limit." }) => {
  const { openStandardCheckout, isProcessing } = useRazorpay();
  const { plan, refreshSubscription } = useSubscription();
  const [notification, setNotification] = React.useState(null);

  const showToast = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const handleCheckoutSuccess = async (newPlan) => {
    showToast(`Successfully upgraded to ${newPlan.toUpperCase()}!`, 'success');
    await refreshSubscription();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleCheckoutFailure = (errMessage) => {
    showToast(errMessage, 'error');
  };

  const handleProUpgrade = () => {
    openStandardCheckout(19900, 'pro', handleCheckoutSuccess, handleCheckoutFailure);
  };

  const handleLifetimeUpgrade = () => {
    openStandardCheckout(99900, 'lifetime', handleCheckoutSuccess, handleCheckoutFailure);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md">
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={!isProcessing ? onClose : null}
              className="absolute inset-0 cursor-default"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f1322] p-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] md:p-8"
            >
              {/* Close Button */}
              <button
                disabled={isProcessing}
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transitiondisabled:opacity-50"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 mb-4 animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <h3 className="text-2xl md:text-3xl font-heading font-bold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm max-w-lg">{message}</p>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
                
                {/* PRO MONTHLY CARD */}
                <div className="relative flex flex-col p-6 rounded-xl border border-cyan-500/30 bg-white/5 backdrop-blur-xl shadow-[0_0_20px_rgba(6,182,212,0.05)] hover:border-cyan-400 transition-all duration-300">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-[10px] uppercase font-mono tracking-wider font-semibold text-black shadow-md">
                    Most Popular
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">Pro Plan</span>
                    <div className="flex items-baseline mt-1 text-white">
                      <span className="text-3xl font-bold font-heading">₹199</span>
                      <span className="text-sm text-slate-400 ml-1">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6 flex-grow">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                      <span><strong>Up to 5 Total Portfolios</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                      <span>Hosting while subscription remains active</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                      <span><strong>Source Code Export Access</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                      <span>Priority AI generation queue</span>
                    </li>
                  </ul>

                  <button
                    disabled={isProcessing || plan === 'pro'}
                    onClick={handleProUpgrade}
                    className="w-full py-2.5 rounded-lg font-semibold text-xs transition duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-[0_4px_20px_rgba(6,182,212,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader className="animate-spin" size={14} />
                    ) : plan === 'pro' ? (
                      'Current Plan'
                    ) : (
                      <>
                        <Zap size={14} /> Upgrade to Pro
                      </>
                    )}
                  </button>
                </div>

                {/* LIFETIME ACCESS CARD */}
                <div className="relative flex flex-col p-6 rounded-xl border border-amber-500/20 bg-white/5 backdrop-blur-xl shadow-md hover:border-amber-400 transition-all duration-300">
                  <div className="mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Lifetime Plan</span>
                    <div className="flex items-baseline mt-1 text-white">
                      <span className="text-3xl font-bold font-heading">₹999</span>
                      <span className="text-xs text-slate-400 ml-1.5 uppercase font-mono tracking-wider font-semibold px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded">One-Time</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 mb-6 flex-grow">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <span><strong>Unlimited Portfolios</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <span><strong>Permanent Lifetime Hosting</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <span>Source Code Export Access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-amber-400 mt-0.5 shrink-0" />
                      <span>Lifetime free features & updates</span>
                    </li>
                  </ul>

                  <button
                    disabled={isProcessing}
                    onClick={handleLifetimeUpgrade}
                    className="w-full py-2.5 rounded-lg font-semibold text-xs transition duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-[0_4px_20px_rgba(245,158,11,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <Loader className="animate-spin" size={14} />
                    ) : (
                      <>
                        <Sparkles size={14} /> Get Lifetime Access
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Security Badge */}
              <p className="text-[10px] text-center text-slate-500 font-mono">
                🛡️ Secure 256-bit SSL encrypted payments processed via Razorpay.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default UpgradeModal;
