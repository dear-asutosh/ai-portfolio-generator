import React from 'react';

export default function AIChatModifier() {
  const features = [
    "Change colors, fonts, layouts with words",
    "Rewrite or expand any section instantly",
    "Fine-tune styles and content just by talking",
    "Preview all changes in real time before going live",
    "Works like Figma — but you use simple sentences"
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-[rgba(255,255,255,0.08)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left */}
        <div className="flex flex-col">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-10 text-balance">
            Don't Like Something?<br />Just Tell the AI.
          </h2>
          
          <div className="flex flex-col gap-0 border border-[rgba(255,255,255,0.08)] rounded-[6px] overflow-hidden">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b border-[rgba(255,255,255,0.08)] last:border-0 bg-[#0a0a0a]">
                <span className="text-[#6366f1] font-mono">✦</span>
                <span className="text-[#94a3b8] font-sans text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chat Mockup */}
        <div className="cell p-6 md:p-8 bg-[#0a0a0a] flex flex-col justify-center min-h-[400px]">
          
          <div className="w-full flex justify-end mb-6">
            <div className="max-w-[85%] border border-[rgba(99,102,241,0.5)] bg-[#6366f1]/10 p-4 rounded-[6px] rounded-tr-none text-sm leading-relaxed text-[#e2e8f0]">
              "Make the background darker and use emerald as my accent color"
            </div>
          </div>
          
          <div className="w-full flex justify-start mb-6">
            <div className="max-w-[85%] cell p-4 rounded-[6px] rounded-tl-none text-sm leading-relaxed text-[#94a3b8]">
              "Done. Background updated to #0a0e1a, accent switched to emerald. Skill badges and CTA buttons are updated. Preview it now?"
            </div>
          </div>

          <div className="flex gap-3">
            <button className="cell px-4 py-2 text-xs font-mono text-[#06b6d4]">
              [Preview Changes]
            </button>
            <button className="cell px-4 py-2 text-xs font-mono text-muted hover:text-white">
              [Undo]
            </button>
          </div>
          
        </div>

      </div>
    </section>
  );
}
