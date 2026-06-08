import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Loader, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import Notification from '../../components/common/Notification';

export const CheckoutTestPage = () => {
  const { user } = useAuth();
  const { plan: currentPlan, refreshSubscription } = useSubscription();
  const { openStandardCheckout, isProcessing } = useRazorpay();
  const [notification, setNotification] = useState(null);
  const [successDetails, setSuccessDetails] = useState(null);

  const showToast = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const handleCheckoutSuccess = async (newPlan) => {
    showToast(`Standard Checkout success! Plan updated to ${newPlan.toUpperCase()}`, 'success');
    await refreshSubscription();
  };

  const handleCheckoutFailure = (errMessage) => {
    showToast(errMessage, 'error');
  };

  const handleStandardPay = (planType, amountPaise) => {
    if (!user) {
      showToast('Please login to continue payment', 'error');
      return;
    }

    // Call standard checkout hook
    openStandardCheckout(
      amountPaise,
      planType,
      (verifiedPlan) => {
        setSuccessDetails({
          plan: planType,
          amount: amountPaise / 100,
          status: 'Successful & Verified'
        });
        handleCheckoutSuccess(verifiedPlan);
      },
      (err) => {
        handleCheckoutFailure(err);
      }
    );
  };

  const planOptions = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₹0',
      description: 'Test account starter tier',
      features: ['1 Active Portfolio', '7-Day Hosting Expiration'],
      ctaText: 'Current Active Plan',
      isFree: true
    },
    {
      id: 'pro',
      name: 'Pro Plan Addon',
      price: '₹199',
      amountPaise: 19900,
      description: 'Standard Checkout for Pro monthly upgrade',
      features: ['Up to 5 Active Portfolios', 'Unlimited Hosting', 'Export Source Code'],
      ctaText: 'Standard Pay ₹199',
      isFree: false,
      badge: 'Pro Upgrade'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access Addon',
      price: '₹999',
      amountPaise: 99900,
      description: 'Standard Checkout for lifetime ownership',
      features: ['Unlimited Portfolios', 'Permanent Lifetime Hosting', 'Export Source Code'],
      ctaText: 'Standard Pay ₹999',
      isFree: false,
      badge: 'Lifetime Upgrade'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-28 pb-20 px-4 md:px-8 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#06b6d4] bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full">
            Razorpay Integration
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-extrabold mt-4 mb-2 tracking-tight">
            Standard Checkout <span className="bg-gradient-to-r from-white via-[#2af7d1] to-[#00f2ff] bg-clip-text text-transparent">Test Portal</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Securely test order creation, Web Checkout overlay, and HMAC-SHA256 signature verification.
          </p>
        </div>

        {/* Current Status Box */}
        <div className="mb-10 p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/30 text-cyan-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Authenticated User Account</p>
              <h2 className="text-base font-bold">{user?.name || 'Guest User'} ({user?.email || 'N/A'})</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Current Plan:</span>
            <span className={`text-xs font-mono font-semibold uppercase px-3 py-1 rounded-full ${
              currentPlan === 'lifetime' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : currentPlan === 'pro' 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {currentPlan?.toUpperCase() || 'FREE'}
            </span>
          </div>
        </div>

        {/* Payment Success Details */}
        {successDetails && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-6 rounded-2xl bg-emerald-500/5 backdrop-blur-xl border border-emerald-500/25 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <CreditCard size={120} />
            </div>
            <h3 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
              <Check size={20} className="stroke-[3]" /> Transaction Verified Successfully
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mb-4">
              Razorpay standard payment signature was cryptographically matched on the backend using <code>HMAC-SHA256</code>.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-slate-500 block uppercase text-[10px]">Plan Awarded</span>
                <span className="text-white font-bold">{successDetails.plan.toUpperCase()}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-slate-500 block uppercase text-[10px]">Amount Charged</span>
                <span className="text-white font-bold">₹{successDetails.amount}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-slate-500 block uppercase text-[10px]">Payment Gateway</span>
                <span className="text-white font-bold">Razorpay v1</span>
              </div>
              <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="text-slate-500 block uppercase text-[10px]">Verification status</span>
                <span className="text-emerald-400 font-bold">{successDetails.status}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {planOptions.map((option) => {
            const isActive = currentPlan === option.id;
            return (
              <div
                key={option.id}
                className={`relative flex flex-col p-6 rounded-2xl border bg-white/5 backdrop-blur-xl transition-all duration-300 ${
                  isActive
                    ? 'border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.05)] scale-[1.02]'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {option.badge && (
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    {option.badge}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-bold">{option.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{option.description}</p>
                </div>

                <div className="flex items-baseline text-white mb-6">
                  <span className="text-3xl font-extrabold tracking-tight">{option.price}</span>
                  {!option.isFree && <span className="text-[10px] uppercase font-mono tracking-wider font-semibold bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded text-cyan-400 ml-2">One-Time Test</span>}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs">
                      <Check size={14} className="text-cyan-400 shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {option.isFree ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed"
                  >
                    {isActive ? 'Current Plan' : 'Free Default'}
                  </button>
                ) : (
                  <button
                    disabled={isProcessing}
                    onClick={() => handleStandardPay(option.id, option.amountPaise)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition duration-300 ${
                      isActive
                        ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700/50'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-400 hover:to-blue-400 font-semibold'
                    }`}
                  >
                    {isProcessing ? (
                      <Loader className="animate-spin" size={14} />
                    ) : (
                      <>
                        <CreditCard size={14} />
                        {option.ctaText}
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default CheckoutTestPage;
