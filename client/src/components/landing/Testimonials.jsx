import React from 'react';

export default function Testimonials() {
  const reviews = [
    {
      quote: "I uploaded my resume on a Sunday night. By Monday morning I had a portfolio link in my job application. Got a callback the same week.",
      name: "Priya S.",
      role: "CSE Final Year, NIT Trichy",
      initials: "PS"
    },
    {
      quote: "I genuinely thought I needed to learn React first. PortfolioAI did everything for me in 4 minutes. I am not exaggerating.",
      name: "Karan M.",
      role: "Fresher, SWE Applicant",
      initials: "KM"
    },
    {
      quote: "The AI rewrote my project descriptions and made them sound so much more impressive. Recruiters actually read my portfolio now.",
      name: "Ananya R.",
      role: "UI/UX Designer, VIT",
      initials: "AR"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[rgba(255,255,255,0.08)]">
      <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-16 text-balance">
        They Stopped Sending Resumes.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {reviews.map((rev, i) => (
          <div key={i} className={`cell p-8 lg:p-10 flex flex-col justify-between rounded-none ${i !== 0 ? '-mt-px md:mt-0 md:-ml-px' : ''}`}>
            <div>
              <div className="flex gap-1 mb-8 text-[#6366f1] text-sm tracking-widest">
                ★★★★★
              </div>
              <p className="font-sans font-light text-white text-base md:text-lg leading-relaxed mb-10">
                "{rev.quote}"
              </p>
            </div>
            
            <div className="flex items-center gap-4 pt-6 border-t border-[rgba(255,255,255,0.08)]">
              <div className="w-10 h-10 rounded-full bg-[#080c18] border border-[rgba(255,255,255,0.1)] flex items-center justify-center font-mono text-xs text-muted shrink-0">
                {rev.initials}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white">{rev.name}</span>
                <span className="font-sans text-xs text-[#94a3b8]">{rev.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
