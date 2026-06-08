import { useState } from 'react';
import { Check, X, Zap, Sparkles, Loader, ChevronDown, ChevronUp } from 'lucide-react';
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
        { text: '1 Active Deployed Portfolio', included: true },
        { text: 'Hosted for 7 Days Live', included: true },
        { text: 'Public Shareable Domain Link', included: true },
        { text: 'Responsive Dev Templates', included: true },
        { text: 'Source Code Export Access', included: false },
        { text: 'Custom DNS Domain Bind', included: false },
        { text: 'Priority Generation Queue', included: false }
      ],
      ctaText: user ? (currentPlan === 'free' ? 'Current Plan' : 'Go to Dashboard') : 'Start Free',
      ctaClass: 'bg-white/[0.02] border border-white/5 text-slate-300 hover:bg-white/5 hover:text-white',
      icon: <Zap size={18} className="text-slate-400" />
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '₹199',
      period: '/month',
      description: 'Perfect for active job seekers and freelancers.',
      features: [
        { text: 'Up to 5 Active Deployed Portfolios', included: true },
        { text: 'Permanent Active Edge Hosting', included: true },
        { text: 'Public Shareable Domain Link', included: true },
        { text: 'Responsive Dev Templates', included: true },
        { text: 'Source Code Export Access', included: true },
        { text: 'Priority Generation Queue', included: true },
        { text: 'Custom DNS Domain Bind', included: true }
      ],
      ctaText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      ctaClass: 'bg-white text-black hover:bg-slate-100 font-semibold shadow-[0_4px_15px_rgba(255,255,255,0.15)]',
      icon: <Zap size={18} className="text-cyan-400 animate-pulse" />,
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
        { text: 'Permanent Lifetime Edge Hosting', included: true },
        { text: 'Public Shareable Domain Link', included: true },
        { text: 'Responsive Dev Templates', included: true },
        { text: 'Source Code Export Access', included: true },
        { text: 'Priority Generation Queue', included: true },
        { text: 'Permanent Free updates & features', included: true }
      ],
      ctaText: currentPlan === 'lifetime' ? 'Current Plan' : 'Get Lifetime Access',
      ctaClass: 'bg-[#08080a] border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 font-semibold',
      icon: <Sparkles size={18} className="text-amber-400" />
    }
  ];

  const faqData = [
    {
      question: "What is an active portfolio?",
      answer: "An active portfolio is currently hosted and publicly accessible via your shareable URL. You can edit multiple drafts in private and toggle them live or draft depending on your plan limit."
    },
    {
      question: "What happens when the 7-day hosting expires on the Free plan?",
      answer: "Your portfolio status automatically changes from LIVE to ARCHIVED. Your content remains safely stored, but the public link is paused. You can reactivate hosting instantly by upgrading."
    },
    {
      question: "How does the Pro plan monthly subscription work?",
      answer: "The Pro plan is billed monthly. If your subscription is cancelled, we start a 7-day grace period where your portfolios remain live before archiving."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can easily cancel your monthly Pro subscription from your Account Settings. Your hosting will remain live until the end of your current billing cycle."
    },
    {
      question: "What are the benefits of the Lifetime plan?",
      answer: "The Lifetime plan is a one-time purchase of ₹999. It grants you unlimited portfolios, permanent edge hosting, full source code exports, and priority access to all future system features."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030304] text-white pt-32 pb-20 px-6 sm:px-8 lg:px-16 relative overflow-hidden">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-30" />

      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-24 relative z-10">
        <div className="mono-label mb-4">[PRICING MATRIX]</div>
        
        <h1 className="text-4xl md:text-6xl font-semibold mb-6 tracking-tighter text-white leading-none reveal-text">
          Select your <span className="gradient-text">tier</span>.
        </h1>
        
        <p className="text-slate-400 text-base md:text-lg max-w-md mx-auto font-light leading-relaxed font-sans reveal-text">
          Sleek, transparent pricing tiers for developers at any scale.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-28 items-stretch relative z-10 reveal-container">
        {planCards.map((planCard) => {
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
            <div
              key={planCard.id}
              className="h-full reveal-card"
            >
              <div className={`relative flex flex-col p-8 rounded-2xl border bg-[#08080a]/60 backdrop-blur-md hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 h-full justify-between ${
                planCard.popular
                  ? 'border-cyan-500/30 shadow-[0_4px_30px_rgba(6,182,212,0.08)] hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)]'
                  : 'border-white/5 hover:border-white/10'
              }`}>
                {planCard.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-[8px] font-mono tracking-widest font-bold text-cyan-400 uppercase shadow-sm">
                    Recommended
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    {planCard.icon}
                    <h3 className="text-base font-bold text-white">{planCard.name}</h3>
                  </div>

                  <p className="text-slate-400 text-xs mb-6 font-light leading-relaxed">{planCard.description}</p>

                  <div className="flex items-baseline text-white mb-6">
                    <span className="text-3xl font-extrabold font-sans tracking-tight">{planCard.price}</span>
                    {planCard.period && (
                      <span className="text-xs font-mono text-slate-500 ml-1.5 uppercase tracking-wide">
                        {planCard.period === 'one-time' ? (
                          <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-amber-400 font-bold">
                            One-Time
                          </span>
                        ) : (
                          planCard.period
                        )}
                      </span>
                    )}
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-8">
                    {planCard.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs">
                        {feature.included ? (
                          <Check size={13} className="text-cyan-400 mt-0.5 shrink-0" />
                        ) : (
                          <X size={13} className="text-slate-600 mt-0.5 shrink-0" />
                        )}
                        <span className={feature.included ? 'text-slate-200 font-light' : 'text-slate-500 line-through font-light'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isDisabled}
                  onClick={() => handleAction(planCard.id)}
                  className={`w-full py-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${planCard.ctaClass}`}
                >
                  {isProcessing && (planCard.id !== 'free' && currentPlan !== planCard.id) ? (
                    <Loader className="animate-spin" size={14} />
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className="max-w-4xl mx-auto mb-24 overflow-x-auto relative z-10 border border-white/5 bg-[#08080a]/60 backdrop-blur-md rounded-2xl p-6">
        <h2 className="text-xl font-bold text-center mb-8">Feature Comparison</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-left font-mono text-[9px] text-slate-500 uppercase tracking-widest">Plan Options</th>
              <th className="pb-4 text-center font-mono text-[9px] text-slate-300 uppercase tracking-widest">Free</th>
              <th className="pb-4 text-center font-mono text-[9px] text-cyan-400 uppercase tracking-widest">Pro</th>
              <th className="pb-4 text-center font-mono text-[9px] text-amber-400 uppercase tracking-widest">Lifetime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-slate-300 font-light">
            <tr>
              <td className="py-4 font-medium text-white">Active Deployed Portfolios</td>
              <td className="py-4 text-center">1</td>
              <td className="py-4 text-center">Up to 5</td>
              <td className="py-4 text-center font-semibold">Unlimited</td>
            </tr>
            <tr>
              <td className="py-4 font-medium text-white">Hosting Duration</td>
              <td className="py-4 text-center text-slate-500">7 Days</td>
              <td className="py-4 text-center">Subscription Active</td>
              <td className="py-4 text-center font-semibold text-amber-400">Permanent</td>
            </tr>
            <tr>
              <td className="py-4 font-medium text-white">Source Code Export</td>
              <td className="py-4 text-center"><X size={14} className="mx-auto text-slate-600" /></td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-amber-400" /></td>
            </tr>
            <tr>
              <td className="py-4 font-medium text-white">Public Shareable Link</td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
            </tr>
            <tr>
              <td className="py-4 font-medium text-white">Custom DNS Domain Bind</td>
              <td className="py-4 text-center"><X size={14} className="mx-auto text-slate-600" /></td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-cyan-400" /></td>
              <td className="py-4 text-center"><Check size={14} className="mx-auto text-amber-400" /></td>
            </tr>
            <tr>
              <td className="py-4 font-medium text-white">AI Generation Queue</td>
              <td className="py-4 text-center">Standard</td>
              <td className="py-4 text-center text-cyan-400 font-mono text-[10px]">PRIORITY</td>
              <td className="py-4 text-center text-amber-400 font-mono text-[10px]">PRIORITY</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="text-xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqData.map((faq, index) => (
            <div key={index} className="rounded-xl border border-white/5 bg-[#08080a]/60 backdrop-blur-md overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-5 text-left text-xs md:text-sm font-semibold hover:bg-white/[0.02] transition"
              >
                <span>{faq.question}</span>
                {activeFaq === index ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>
              {activeFaq === index && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3 font-light">
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
