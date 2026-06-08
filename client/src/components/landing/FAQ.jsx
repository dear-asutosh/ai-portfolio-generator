import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const faqs = [
    {
      q: "Do I need coding or design experience?",
      a: "No. You upload your resume PDF or fill out our developer form, and our template compiler generates the layout automatically."
    },
    {
      q: "Is my resume data safe?",
      a: "Yes. We process files on-the-fly and do not store your original PDF uploads once parsing completes."
    },
    {
      q: "Can I edit my portfolio after publishing?",
      a: "Yes. You can edit any details or styles from your dashboard. Updates hot-reload on your live subdomain instantly."
    },
    {
      q: "How does this compare to Wix or Squarespace?",
      a: "Wix requires manual drag-and-drop. Profilio compiles your profile programmatically, linking live GitHub and LeetCode APIs automatically."
    },
    {
      q: "Is edge hosting actually free?",
      a: "Yes. Our basic plan includes free CDN deployment with Profilio branding. Upgrade to add custom DNS domains."
    }
  ];

  const [open, setOpen] = useState(0);

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-16 max-w-7xl mx-auto border-t border-white/5 bg-transparent relative z-10 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Sticky Column */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col items-start">
          <div className="mono-label mb-4">[09 / SYSTEM FAQ]</div>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-6">
            Frequently <br />
            asked questions.
          </h2>
        </div>

        {/* Right Accordion */}
        <div className="lg:col-span-8 flex flex-col gap-0 border border-white/5 bg-[#08080a]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className={`border-b border-white/5 last:border-0 transition-colors ${open === i ? 'border-l-2 border-l-cyan-500' : 'border-l-2 border-l-transparent'}`}
            >
              <button 
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/[0.01] transition-colors"
              >
                <span className={`font-bold text-sm md:text-base ${open === i ? 'text-white' : 'text-slate-400 hover:text-white transition-colors'}`}>{faq.q}</span>
                <span className="font-mono text-base text-slate-500 select-none">{open === i ? '-' : '+'}</span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-slate-400 text-xs md:text-sm font-light leading-relaxed border-t border-white/5 pt-3">
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
