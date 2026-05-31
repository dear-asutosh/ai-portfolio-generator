import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Globe, ArrowRight, Play } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-start z-10"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI-Powered Portfolio Builder</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl md:text-6xl font-semibold tracking-tight mb-8"
          >
            Build Your Developer <span className="gradient-text">Identity</span> With <span className="gradient-text">Profilio</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-400 max-w-xl mb-12 leading-relaxed"
          >
            Upload your resume, import your LinkedIn, or seed your GitHub profile. Profilio instantly compiles a premium, high-performance portfolio featuring live GitHub repo cards, dynamic LeetCode progress dashboards, and a custom conversational chatbot widget to act as your personal 24/7 assistant.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10"
          >
            <button 
              onClick={() => navigate('/project/new')}
              className="relative group overflow-hidden bg-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="relative z-10">Generate My Portfolio</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 850, behavior: 'smooth' })}
              className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>View Demo</span>
            </button>
          </motion.div>

          {/* Trust Text */}
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-6 text-slate-500 text-sm font-sans"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <span>No coding required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500"></div>
              <span>Live URL in minutes</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Premium Mockup */}
        <div className="relative h-[600px] w-full hidden lg:flex items-center justify-center">
          
          {/* Animated Connectors Overlay */}
          <div className="absolute inset-0 z-0 flex items-center justify-center">
             <svg className="w-full h-full opacity-20" viewBox="0 0 500 500">
               <motion.path 
                 d="M100 250 C 200 250, 300 150, 400 150" 
                 fill="none" 
                 stroke="url(#grad1)" 
                 strokeWidth="2"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               />
               <motion.path 
                 d="M100 250 C 200 250, 300 350, 400 350" 
                 fill="none" 
                 stroke="url(#grad1)" 
                 strokeWidth="2"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 3, delay: 1.5, repeat: Infinity, ease: "linear" }}
               />
               <defs>
                 <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                   <stop offset="0%" stopColor="#6366f1" />
                   <stop offset="100%" stopColor="#a855f7" />
                 </linearGradient>
               </defs>
             </svg>
          </div>

          {/* Resume Upload Card */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute -left-3  top-[37%] w-52 glass-card p-5 rounded-2xl z-20"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">resume.pdf</span>
                <span className="text-xs text-slate-500">2.4 MB • Uploaded</span>
              </div>
            </div>
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </motion.div>

          {/* AI Processing Card */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-6 rounded-full w-32 h-32 flex items-center justify-center z-30 shadow-[0_0_50px_rgba(168,85,247,0.3)]"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/30"
            ></motion.div>
            <div className="flex flex-col items-center">
              <Sparkles className="w-10 h-10 text-purple-400 mb-1" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Groq AI</span>
            </div>
          </motion.div>

          {/* Portfolio Preview Card */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="absolute right-0 top-[15%] w-[320px] glass-card rounded-2xl overflow-hidden z-20"
          >
            {/* Browser Header */}
            <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
              <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
            </div>
            {/* Portfolio Mock Content */}
            <div className="p-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 mb-4 mx-auto border border-indigo-500/20"></div>
              <div className="w-3/4 h-3 bg-white/10 rounded-full mx-auto mb-2"></div>
              <div className="w-1/2 h-2 bg-white/5 rounded-full mx-auto mb-6"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-white/5 rounded-xl"></div>
                <div className="h-20 bg-white/5 rounded-xl"></div>
              </div>
            </div>
          </motion.div>

          {/* Generated URL Card */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="absolute bottom-[20%] right-[10%] px-6 py-3 glass-card rounded-full flex items-center gap-3 z-40 border-indigo-500/30"
          >
            <Globe className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-white">portfolioai.app/asutosh</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
