import React from 'react';

export default function InputMethods() {
  const methods = [
    {
      type: "Resume PDF",
      tag: "Most Popular",
      tagColor: "border-emerald-500/50 text-emerald-400",
      accent: "hover:border-emerald-500",
      title: "Upload Resume PDF",
      body: "Drop your existing PDF. We'll extract the structure automatically.",
      cta: "Upload Resume →",
      ctaBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
      code: (
        <>
          <span className="text-muted">{'>'}</span> Upload file{'\n'}
          <span className="text-muted">{'>'}</span> resume.pdf <span className="text-emerald-400">✓</span>{'\n'}
          <span className="text-muted">{'>'}</span> Parsing... done
        </>
      )
    },
    {
      type: "LinkedIn PDF",
      tag: "Quick Start",
      tagColor: "border-[#06b6d4]/50 text-[#06b6d4]",
      accent: "hover:border-[#06b6d4]",
      title: "Import LinkedIn PDF",
      body: "Export your profile to PDF from LinkedIn. We'll handle the rest.",
      cta: "Use LinkedIn PDF →",
      ctaBg: "bg-[#06b6d4]/10 border-[#06b6d4]/20 text-[#06b6d4] hover:bg-[#06b6d4]/20",
      code: (
        <>
          <span className="text-muted">{'>'}</span> LinkedIn → More{'\n'}
          <span className="text-muted">{'>'}</span> → Save to PDF{'\n'}
          <span className="text-muted">{'>'}</span> Import file <span className="text-emerald-400">✓</span>
        </>
      )
    },
    {
      type: "Smart Form",
      tag: "From Scratch",
      tagColor: "border-[#8b5cf6]/50 text-[#8b5cf6]",
      accent: "hover:border-[#8b5cf6]",
      title: "Fill Smart Form",
      body: "No resume ready? Answer a few guided questions to build your profile.",
      cta: "Start Smart Form →",
      ctaBg: "bg-[#8b5cf6]/10 border-[#8b5cf6]/20 text-[#8b5cf6] hover:bg-[#8b5cf6]/20",
      code: (
        <>
          <span className="text-[#6366f1]">skills:</span> [<span className="text-emerald-400">"React"</span>, <span className="text-emerald-400">"Node"</span>]{'\n'}
          <span className="text-[#6366f1]">projects:</span> [...]{'\n'}
          <span className="text-[#6366f1]">experience:</span> [...]
        </>
      )
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[rgba(255,255,255,0.08)]">
      <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-16 max-w-2xl text-balance">
        No Resume? No Problem.<br />Three Ways to Begin.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method, i) => (
          <div key={i} className={`cell p-8 flex flex-col group transition-all duration-300 ${method.accent}`}>
            {/* Mini Code Block */}
            <div className="bg-[#050505] border border-[rgba(255,255,255,0.08)] p-4 rounded-[6px] mb-8 font-mono text-xs leading-relaxed w-full min-h-[100px]">
              <pre><code>{method.code}</code></pre>
            </div>
            
            <div className="flex items-center mb-6">
              <span className={`text-[10px] uppercase tracking-widest font-mono border px-2 py-0.5 rounded-full ${method.tagColor}`}>
                {method.tag}
              </span>
            </div>
            
            <h3 className="text-lg font-bold tracking-tight mb-3">{method.title}</h3>
            <p className="text-muted font-light leading-relaxed mb-8">
              {method.body}
            </p>
            
            <button className={`mt-auto w-full py-3 rounded-[6px] border text-sm font-bold font-heading tracking-wide transition-colors ${method.ctaBg}`}>
              {method.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
