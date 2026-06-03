import React from 'react';
import { motion } from 'framer-motion';
import { Hourglass, ArrowRight, Sparkles, Home, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExpiredPortfolioPage = ({ ownerUsername = '' }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl text-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-12 shadow-[0_0_50px_rgba(6,182,212,0.05)] relative z-10"
      >
        {/* Hourglass Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 mx-auto mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <Hourglass size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
        </div>

        {/* Content */}
        <h1 className="text-3xl font-heading font-bold text-white mb-3">Portfolio Hosting Expired</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          {ownerUsername ? (
            <>This portfolio belongs to <strong>@{ownerUsername}</strong> and is currently inactive because its hosting period has expired.</>
          ) : (
            <>This portfolio's hosting period has expired.</>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 max-w-xs mx-auto mb-8">
          
          <button
            onClick={() => navigate('/pricing')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs transition duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
          >
            <CreditCard size={14} /> Renew Hosting / View Pricing
          </button>

          <button
            onClick={() => navigate('/auth/signup')}
            className="w-full py-3 px-4 rounded-xl font-semibold text-xs transition duration-300 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200"
          >
            <Sparkles size={14} className="text-cyan-400" /> Create Your Own Portfolio <ArrowRight size={12} />
          </button>

        </div>

        {/* Branded Footer */}
        <div className="border-t border-white/5 pt-6 flex items-center justify-center gap-2 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
          <span>Powered by</span>
          <span className="bg-gradient-to-r from-white via-[#2af7d1] to-[#00f2ff] bg-clip-text text-transparent font-bold font-heading text-xs">Profilio</span>
        </div>
      </motion.div>

      {/* Floating back home link */}
      <button
        onClick={() => navigate('/')}
        className="mt-6 flex items-center gap-2 text-slate-500 hover:text-white transition text-xs font-mono"
      >
        <Home size={12} /> Back to Homepage
      </button>
    </div>
  );
};

export default ExpiredPortfolioPage;
