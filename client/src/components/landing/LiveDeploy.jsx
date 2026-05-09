import React from 'react';
import { motion } from 'framer-motion';

export default function LiveDeploy() {
  const features = [
    "Instant deploy — live in 10 seconds",
    "Your own unique URL with your name",
    "Auto QR code for your resume printout",
    "Share to LinkedIn, WhatsApp, or email",
    "Edit anytime — changes reflect live",
    "Mobile responsive out of the box"
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[rgba(255,255,255,0.08)] flex flex-col items-center">
      <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-16 text-center">
        One Click.<br />Live on the Internet.
      </h2>

      {/* URL Display */}
      <div className="cell w-full max-w-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: "auto" }}
          viewport={{ once: true }}
          className="font-mono text-base md:text-xl text-white overflow-hidden whitespace-nowrap border-r-2 border-white pr-2"
        >
          portfolioai.app/yourname
        </motion.div>
        <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-full">
          <span>●</span> Live ✓
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-4xl border border-[rgba(255,255,255,0.08)] bg-[#0f1322] rounded-[6px] overflow-hidden mb-12">
        {features.map((feat, i) => (
          <div key={i} className={`p-5 flex items-center gap-3 border-[rgba(255,255,255,0.08)] ${i < 4 ? 'border-b' : ''} ${i % 2 === 0 ? 'md:border-r' : ''}`}>
            <span className="text-[#8b5cf6] font-mono text-xs">✦</span>
            <span className="text-[#94a3b8] text-sm">{feat}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-4 w-full sm:w-auto flex-col sm:flex-row">
        <button className="cell bg-[#080c18] px-8 py-4 font-heading font-bold text-[#6366f1] hover:bg-[#6366f1]/10">
          [Generate My Portfolio →]
        </button>
        <button className="cell bg-[#080c18] px-8 py-4 font-heading font-bold text-muted hover:text-white">
          [See a Live Example]
        </button>
      </div>
    </section>
  );
}
