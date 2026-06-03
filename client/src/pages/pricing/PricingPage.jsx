import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ShieldCheck, Sparkles, Zap, Infinity, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import Notification from '../../components/common/Notification';

export const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan: currentPlan, refreshSubscription } = useSubscription();
  const { openStandardCheckout, isProcessing } = useRazorpay();
  const [notification, setNotification] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const showToast = (message, type = 'error') => {
    setNotification({ message, type });
  };

  const handleCheckoutSuccess = async (newPlan) => {
    showToast(`Successfully upgraded to ${newPlan.toUpperCase()}!`, 'success');
    await refreshSubscription();
  };

  const handleCheckoutFailure = (errMessage) => {
    showToast(errMessage, 'error');
  };

  const handleAction = (planType) => {
    if (!user) {
      navigate('/auth/signup?redirect=pricing');
      return;
    }

    if (planType === 'free') {
      navigate(`/${user.username || 'user'}/dashboard`);
    } else if (planType === 'pro') {
      openStandardCheckout(19900, 'pro', handleCheckoutSuccess, handleCheckoutFailure);
    } else if (planType === 'lifetime') {
      openStandardCheckout(99900, 'lifetime', handleCheckoutSuccess, handleCheckoutFailure);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const planCards = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '₹0',
      period: '',
      description: 'Ideal for students and developers testing the platform.',
      features: [
        { text: '1 Active Portfolio', included: true },
        { text: 'Hosted for 7 Days', included: true },
        { text: 'Public Shareable Link', included: true },
        { text: 'Mobile Responsive Designs', included: true },
        { text: 'Source Code Export', included: false },
        { text: 'Custom Domain Connection', included: false },
        { text: 'Priority Generation Queue', included: false }
      ],
      ctaText: user ? (currentPlan === 'free' ? 'Current Plan' : 'Go to Dashboard') : 'Start Free',
      ctaClass: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
      icon: <Zap size={22} className="text-slate-400" />
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '₹199',
      period: '/month',
      description: 'Perfect for active job seekers and freelancers.',
      features: [
        { text: 'Up to 5 Active Portfolios', included: true },
        { text: 'Hosting active while subscribed', included: true },
        { text: 'Public Shareable Link', included: true },
        { text: 'Mobile Responsive Designs', included: true },
        { text: 'Source Code Export Access', included: true },
        { text: 'Priority Generation Queue', included: true },
        { text: 'Custom Domain (Coming Soon)', included: true }
      ],
      ctaText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaClass: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-400 hover:to-blue-400 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.25)]',
      icon: <Zap size={22} className="text-cyan-400" />,
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: '₹999',
      period: 'one-time',
      description: 'Best choice for serious long-term career branding.',
      features: [
        { text: 'Unlimited Active Portfolios', included: true },
        { text: 'Permanent Lifetime Hosting', included: true },
        { text: 'Public Shareable Link', included: true },
        { text: 'Mobile Responsive Designs', included: true },
        { text: 'Source Code Export Access', included: true },
        { text: 'Priority Generation Queue', included: true },
        { text: 'Lifetime free updates & features', included: true }
      ],
      ctaText: currentPlan === 'lifetime' ? 'Current Plan' : 'Get Lifetime Access',
      ctaClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400 font-semibold shadow-[0_0_20px_rgba(245,158,11,0.25)]',
      icon: <Sparkles size={22} className="text-amber-400" />
    }
  ];

  const faqData = [
    {
      question: "What is an active portfolio?",
      answer: "An active portfolio is currently hosted and publicly accessible via your shareable URL. You can have multiple draft portfolios that you edit in private, and turn them live or draft whenever you want, depending on your plan limit."
    },
    {
      question: "What happens when the 7-day hosting expires on the Free plan?",
      answer: "Once the 7 days are up, your portfolio status automatically changes from LIVE to ARCHIVED. Your content is safely stored in our system, but the public link will display a conversion page. You can reactivate hosting at any time by upgrading to a paid plan."
    },
    {
      question: "How does the Pro plan monthly subscription work?",
      answer: "The Pro plan is billed monthly. Your portfolios remain live as long as the subscription is active. If your subscription fails or is cancelled, we start a 7-day grace period where your portfolios remain live. If payment isn't received within the 7 days, your portfolios are archived."
    },
    {
      question: "What is the 30-day grace period for existing users?",
      answer: "We appreciate our early adopters! All portfolios generated before our pricing launch are granted a 30-day grace period. They will remain live for 30 days, after which the hosting limit is evaluated according to your plan (e.g. Free users will have their extra portfolios archived, keeping only the most recently updated active)."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can easily cancel your monthly Pro subscription from your Account Settings. Your hosting will remain live until the end of your current billing cycle, after which you have a 7-day grace period before archival."
    },
    {
      question: "What are the benefits of the Lifetime plan?",
      answer: "The Lifetime plan is a one-time purchase of ₹999. It grants you unlimited portfolios, permanent hosting that never expires, full source code export access, and priority access to all future updates and premium features."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-16 px-4 md:px-8">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-16 relative">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 tracking-tight leading-none"
        >
          Build a Portfolio That{' '}
          <span className="bg-gradient-to-r from-white via-[#2af7d1] to-[#00f2ff] bg-clip-text text-transparent">
            Opens Doors
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 text-base md:text-lg max-w-xl mx-auto mb-8"
        >
          Generate, host, and share a professional portfolio in minutes using AI.
        </motion.p>
        {!user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/auth/signup')}
            className="px-6 py-3 rounded-full bg-[#06b6d4] text-black font-semibold hover:bg-[#08c5e6] shadow-[0_4px_25px_rgba(6,182,212,0.3)] transition"
          >
            Generate Free Portfolio
          </motion.button>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-stretch">
        {planCards.map((planCard, index) => {
          let buttonText = planCard.ctaText;
          let isDisabled = isProcessing || currentPlan === planCard.id;

          if (user) {
            if (planCard.id === 'free') {
              if (currentPlan === 'pro' || currentPlan === 'lifetime') {
                buttonText = 'Included';
                isDisabled = true;
              } else {
                buttonText = 'Current Plan';
                isDisabled = true;
              }
            } else if (planCard.id === 'pro') {
              if (currentPlan === 'lifetime') {
                buttonText = 'Included';
                isDisabled = true;
              } else if (currentPlan === 'pro') {
                buttonText = 'Current Plan';
                isDisabled = true;
              }
            } else if (planCard.id === 'lifetime') {
              if (currentPlan === 'lifetime') {
                buttonText = 'Current Plan';
                isDisabled = true;
              }
            }
          }

          return (
            <motion.div
              key={planCard.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`relative flex flex-col p-8 rounded-2xl border bg-white/5 backdrop-blur-xl transition-all duration-300 ${
                planCard.popular
                  ? 'border-cyan-500/40 ring-1 ring-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.1)] scale-105 md:-translate-y-2'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {planCard.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-xs font-mono tracking-widest font-semibold text-black uppercase shadow-md">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {planCard.icon}
                <h3 className="text-xl font-heading font-bold">{planCard.name}</h3>
              </div>

              <p className="text-slate-400 text-xs mb-6 flex-grow-0">{planCard.description}</p>

              <div className="flex items-baseline text-white mb-6">
                <span className="text-4xl font-extrabold font-heading">{planCard.price}</span>
                {planCard.period && (
                  <span className="text-sm font-medium text-slate-400 ml-1">
                    {planCard.period === 'one-time' ? (
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400">
                        One-Time
                      </span>
                    ) : (
                      planCard.period
                    )}
                  </span>
                )}
              </div>

              {/* Feature List */}
              <ul className="space-y-3.5 mb-8 flex-grow">
                {planCard.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs">
                    {feature.included ? (
                      <Check size={14} className="text-cyan-400 mt-0.5 shrink-0" />
                    ) : (
                      <X size={14} className="text-slate-600 mt-0.5 shrink-0" />
                    )}
                    <span className={feature.included ? 'text-slate-200' : 'text-slate-500 line-through'}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isDisabled}
                onClick={() => handleAction(planCard.id)}
                className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${planCard.ctaClass}`}
              >
                {isProcessing && (planCard.id !== 'free' && currentPlan !== planCard.id) ? (
                  <Loader className="animate-spin" size={14} />
                ) : (
                  buttonText
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className="max-w-4xl mx-auto mb-24 overflow-x-auto">
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Compare All Plans</h2>
        <table className="w-full border-collapse border border-white/5 bg-white/5 rounded-xl backdrop-blur-xl">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-4 text-left font-heading text-sm text-slate-400">Features</th>
              <th className="p-4 text-center font-heading text-sm text-slate-200">Free</th>
              <th className="p-4 text-center font-heading text-sm text-cyan-400">Pro</th>
              <th className="p-4 text-center font-heading text-sm text-amber-400">Lifetime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-slate-300">
            <tr>
              <td className="p-4 font-medium text-white">Active Portfolios</td>
              <td className="p-4 text-center">1</td>
              <td className="p-4 text-center">Up to 5</td>
              <td className="p-4 text-center font-semibold">Unlimited</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-white">Hosting Duration</td>
              <td className="p-4 text-center">7 Days</td>
              <td className="p-4 text-center">While Subscribed</td>
              <td className="p-4 text-center font-semibold text-amber-400">Permanent</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-white">Source Code Export</td>
              <td className="p-4 text-center"><X size={14} className="mx-auto text-slate-600" /></td>
              <td className="p-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="p-4 text-center"><Check size={14} className="mx-auto text-amber-400" /></td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-white">Public Shareable Link</td>
              <td className="p-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="p-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="p-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-white">AI Generation Queue</td>
              <td className="p-4 text-center">Standard</td>
              <td className="p-4 text-center font-semibold text-cyan-400">Priority</td>
              <td className="p-4 text-center font-semibold text-amber-400">Priority</td>
            </tr>
            <tr>
              <td className="p-4 font-medium text-white">Future System Updates</td>
              <td className="p-4 text-center"><X size={14} className="mx-auto text-slate-600" /></td>
              <td className="p-4 text-center">During subscription</td>
              <td className="p-4 text-center font-semibold text-amber-400">Lifetime access</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-heading font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div key={index} className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold hover:bg-white/5 transition"
              >
                <span>{faq.question}</span>
                {activeFaq === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toast Notification */}
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

export default PricingPage;
