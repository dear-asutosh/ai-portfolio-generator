import React from 'react';
import { motion } from 'framer-motion';

export default function SocialProof() {
  const colleges = ["IIT Delhi", "NIT Trichy", "VIT", "BITS Pilani", "SRM", "Manipal", "DTU", "IIIT Hyderabad", "Amity"];

  return (
    <section className="w-full border-y border-[rgba(255,255,255,0.08)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center overflow-hidden">
        
        {/* Left Label */}
        <div className="w-full md:w-auto px-6 py-4 md:border-r border-[rgba(255,255,255,0.08)] shrink-0 bg-[#0f1322] md:bg-transparent">
          <span className="font-mono text-[11px] text-[#94a3b8] uppercase tracking-widest">
            trusted by students at
          </span>
        </div>

        {/* Marquee */}
        <div className="flex-1 overflow-hidden relative flex items-center py-4 md:py-0 whitespace-nowrap mask-image-edges">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
            className="flex items-center gap-8 px-8"
          >
            {[...colleges, ...colleges].map((college, i) => (
              <div key={i} className="flex items-center gap-8">
                <span className="font-heading font-bold text-lg text-[#94a3b8]">{college}</span>
                <span className="text-[rgba(255,255,255,0.08)]">|</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row">
        {[
          { num: "12,000+", label: "Portfolios Built" },
          { num: "4.9 ★", label: "Average Rating" },
          { num: "< 3 Min", label: "Average Build" }
        ].map((stat, i) => (
          <div key={i} className={`flex-1 p-8 md:p-12 cell rounded-none ${i === 0 ? 'sm:-ml-px' : ''} ${i !== 0 ? '-mt-px sm:mt-0 sm:-ml-px' : ''}`}>
            <div className="font-heading font-black text-4xl md:text-5xl mb-2">{stat.num}</div>
            <div className="font-sans text-[#94a3b8] text-sm uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
