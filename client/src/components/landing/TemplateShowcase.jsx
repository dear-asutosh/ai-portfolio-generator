import React from 'react';

export default function TemplateShowcase() {
  const templates = [
    { name: "Developer Dark", colors: ["#080c18", "#10b981", "#64748b", "#ffffff"] },
    { name: "Neon Glow", colors: ["#060810", "#06b6d4", "#8b5cf6", "#f8fafc"] },
    { name: "Minimal Pro", colors: ["#f8fafc", "#e2e8f0", "#334155", "#0f172a"] },
    { name: "Tech Bold", colors: ["#1e3a8a", "#3b82f6", "#93c5fd", "#ffffff"] },
    { name: "Warm Brown", colors: ["#451a03", "#b45309", "#fcd34d", "#fffbeb"] }
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto border-b border-[rgba(255,255,255,0.08)] overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-balance">
          Templates Built to<br />Make Recruiters Stop.
        </h2>
      </div>

      <div className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 pb-8 snap-x">
        {templates.map((tpl, i) => (
          <div key={i} className="cell min-w-[320px] shrink-0 p-6 flex flex-col snap-start">
            <h3 className="font-heading font-bold text-xl mb-4">{tpl.name}</h3>
            
            {/* Color Dots */}
            <div className="flex items-center gap-2 mb-6">
              {tpl.colors.map((c, j) => (
                <div key={j} className="w-5 h-5 rounded-full border border-[rgba(255,255,255,0.2)]" style={{ backgroundColor: c }}></div>
              ))}
            </div>

            {/* Layout Sketch */}
            <div className="border border-[rgba(255,255,255,0.08)] bg-[#080c18] h-48 rounded-[6px] mb-6 p-4 flex flex-col gap-3">
              <div className="w-full h-8 bg-[rgba(255,255,255,0.05)] rounded-[4px]"></div>
              <div className="w-3/4 h-12 bg-[rgba(255,255,255,0.08)] rounded-[4px]"></div>
              <div className="flex gap-2">
                <div className="w-1/3 h-16 bg-[rgba(255,255,255,0.05)] rounded-[4px]"></div>
                <div className="w-2/3 h-16 bg-[rgba(255,255,255,0.05)] rounded-[4px]"></div>
              </div>
            </div>

            <div className="flex gap-2 mt-auto">
              <button className="flex-1 cell py-2 text-sm font-mono text-muted hover:text-white border-[rgba(255,255,255,0.1)]">Preview →</button>
              <button className="flex-1 cell py-2 text-sm font-mono text-indigo-400 border-[rgba(255,255,255,0.1)] hover:border-indigo-500/50">Use This →</button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="px-4 sm:px-6 lg:px-8 mt-4">
        <span className="font-mono text-xs text-muted">
          // Can't find your style?<br />
          // Just describe it to the AI assistant.
        </span>
      </div>
    </section>
  );
}
