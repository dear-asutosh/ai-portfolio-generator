import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileUp, 
  Search, 
  Edit3, 
  Rocket, 
  ArrowRight,
  MousePointer2,
  CheckCircle2
} from 'lucide-react';

const StepSection = ({ number, title, description, icon: Icon, image, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 py-24 border-b border-white/5 last:border-0`}>
    <div className="flex-1">
      <motion.div
        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)]">
            {number}
          </div>
          <span className="text-cyan-500 font-mono text-sm tracking-widest uppercase">The Process</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">
          {title}
        </h2>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          {description}
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Zero manual data entry required</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Optimized for ATS-friendly formatting</span>
          </div>
        </div>
      </motion.div>
    </div>
    
    <div className="flex-1 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative group aspect-video bg-[#111] rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-24 h-24 text-white/10 group-hover:text-cyan-400/20 group-hover:scale-110 transition-all duration-500" />
        </div>
        {/* Decorative elements to simulate UI */}
        <div className="absolute top-4 left-4 right-4 flex gap-2">
           <div className="h-1 flex-1 bg-white/5 rounded-full" />
           <div className="h-1 flex-1 bg-white/5 rounded-full" />
           <div className="h-1 flex-1 bg-white/5 rounded-full" />
        </div>
      </motion.div>
    </div>
  </div>
);

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-32">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8"
          >
            From PDF to Live <span className="gradient-text">in Minutes.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed"
          >
            We've automated the most painful parts of building a portfolio. No more fighting with CSS or copy-pasting your work history.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="space-y-0">
          <StepSection 
            number="01"
            title="Import Your Story"
            description="Upload your resume PDF or simply import your profile from LinkedIn. Our AI scans the document and extracts every relevant detail about your career."
            icon={FileUp}
          />
          <StepSection 
            number="02"
            title="AI Enhancement"
            description="The AI doesn't just read—it refines. It improves your project descriptions, fixes grammar, and structures your data into a premium portfolio format."
            icon={Search}
            reverse
          />
          <StepSection 
            number="03"
            title="Personalize and Tweak"
            description="Tailor the design to your brand. Use our AI Chat Modifier to tweak layouts, add custom sections, or adjust the entire aesthetic just by typing."
            icon={Edit3}
          />
          <StepSection 
            number="04"
            title="Launch to the World"
            description="Hit publish and your portfolio is live instantly. You get a unique URL and a high-performance site that looks great on any device."
            icon={Rocket}
            reverse
          />
        </div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 rounded-[2rem] bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-white/10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Rocket className="w-40 h-40" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to stop coding your portfolio?</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join 100+ developers who built their portfolios in under 5 minutes this week.
          </p>
          <button className="px-10 py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 mx-auto">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
