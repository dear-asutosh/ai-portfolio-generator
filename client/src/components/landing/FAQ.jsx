import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const faqs = [
    {
      q: "Do I need to know coding or design?",
      a: "Absolutely not. You upload a file or fill a form. The AI and the templates handle everything else."
    },
    {
      q: "Is my data safe when I upload my resume?",
      a: "Yes. We do not store your original files after processing. Your data is used only to generate your portfolio."
    },
    {
      q: "Can I edit my portfolio after publishing?",
      a: "Yes. Edit anytime from your dashboard. Changes reflect on your live URL instantly."
    },
    {
      q: "What is different from Wix or Squarespace?",
      a: "You build nothing. AI builds it from your existing resume data in minutes, not hours. Zero design decisions required."
    },
    {
      q: "Is it actually free?",
      a: "Free to generate and preview. Publishing includes a free plan with PortfolioAI branding. Upgrade to remove branding and connect a custom domain."
    }
  ];

  const [open, setOpen] = useState(0);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[rgba(255,255,255,0.08)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Sticky Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 cell p-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-balance">
            Questions<br />We Always<br />Get Asked.
          </h2>
        </div>

        {/* Right Accordion */}
        <div className="lg:col-span-8 flex flex-col gap-0 border border-[rgba(255,255,255,0.08)] bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`border-b border-[rgba(255,255,255,0.08)] last:border-0 transition-colors ${open === i ? 'border-l-2 border-l-[#6366f1]' : 'border-l-2 border-l-transparent'}`}
            >
              <button 
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-[rgba(255,255,255,0.02)]"
              >
                <span className={`font-bold text-base md:text-lg ${open === i ? 'text-white' : 'text-[#94a3b8]'}`}>{faq.q}</span>
                <span className="font-mono text-xl text-muted">{open === i ? '-' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-[#94a3b8] font-light leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
