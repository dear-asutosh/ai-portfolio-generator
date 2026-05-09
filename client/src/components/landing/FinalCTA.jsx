import React from 'react';

export default function FinalCTA() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex justify-center border-b border-[rgba(255,255,255,0.08)]">
      <div className="cell w-full max-w-4xl p-12 md:p-20 text-center flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 text-balance">
          You Are One Upload Away<br />From Standing Out.
        </h2>
        
        <p className="text-base text-muted font-light mb-12 max-w-xl text-balance">
          Join 12,000+ students who stopped sending plain resumes and started sharing portfolio links.
        </p>
        
        <button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white px-10 py-5 rounded-[6px] font-heading font-bold text-xl hover:opacity-90 transition-opacity mb-6">
          Generate My Portfolio — It's Free →
        </button>
        
        <span className="font-mono text-xs text-[#94a3b8]">
          // No credit card. No code. Under 5 minutes.
        </span>
      </div>
    </section>
  );
}
