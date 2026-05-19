import React from 'react';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      label: "step-01",
      num: "1",
      title: "Upload or Import",
      code: (
        <>
          <span className="text-[#6366f1]">input:</span> <span className="text-emerald-400">"resume.pdf"</span>{'\n'}
          <span className="text-[#6366f1]">source:</span> <span className="text-emerald-400">"linkedin-export"</span>{'\n'}
          <span className="text-[#06b6d4]">or:</span> fill_smart_form()
        </>
      ),
      body: "Drop your resume PDF, upload your LinkedIn PDF download, or fill the guided form. 60 seconds. No formatting needed."
    },
    {
      label: "step-02",
      num: "2",
      title: "AI Reads and Enhances",
      code: (
        <>
          groq.<span className="text-[#06b6d4]">extract</span>(resume){'\n'}
          groq.<span className="text-[#06b6d4]">enhance</span>(bio, projects){'\n'}
          groq.<span className="text-[#06b6d4]">structure</span>(portfolio)
        </>
      ),
      body: "Groq AI reads every line, rewrites your bio, improves your project descriptions, and organizes everything automatically."
    },
    {
      label: "step-03",
      num: "3",
      title: "Pick Template and Deploy",
      code: (
        <>
          <span className="text-[#6366f1]">template:</span> <span className="text-emerald-400">"developer-dark"</span>{'\n'}
          <span className="text-[#6366f1]">deploy:</span> <span className="text-amber-400">true</span>{'\n'}
          <span className="text-[#6366f1]">url:</span> <span className="text-emerald-400">"portfolioai.app/yourname"</span>{'\n'}
          <span className="text-[#6366f1]">status:</span> <span className="text-emerald-400">"● live"</span>
        </>
      ),
      body: "Choose a template, customize by chatting with the AI assistant, hit publish — your portfolio goes live in seconds."
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter max-w-2xl text-balance">
          Three Steps.<br />Five Minutes.<br />One Portfolio.
        </h2>
        <a href="/how-it-works" className="text-sm font-mono text-cyan-400 hover:text-white transition-colors flex items-center gap-2 group">
          SEE FULL PROCESS WALKTHROUGH 
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            key={i} 
            className={`cell p-8 lg:p-10 relative overflow-hidden flex flex-col h-full rounded-none ${i !== 0 ? '-mt-px md:mt-0 md:-ml-px' : ''}`}
          >
            <span className="font-mono text-[11px] text-[#94a3b8] mb-8 relative z-10">{step.label}</span>
            <span className="absolute top-4 right-6 text-9xl font-black text-[#6366f1] opacity-5 select-none pointer-events-none">{step.num}</span>
            
            <h3 className="text-xl font-bold tracking-tight mb-8 relative z-10">{step.title}</h3>
            
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.08)] p-4 rounded-[6px] mb-8 font-mono text-sm leading-relaxed w-full">
              <pre><code>{step.code}</code></pre>
            </div>
            
            <p className="text-[#94a3b8] font-light leading-relaxed mt-auto relative z-10">
              {step.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
