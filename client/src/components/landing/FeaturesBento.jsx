import React from 'react';

export default function FeaturesBento() {
  return (
    <div className="border-b border-white/10 relative">
      <div className="py-24 px-4 sm:px-6 lg:px-12 max-w-6xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Code Block Card */}
        <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col relative z-10 w-full">
          <div className="border-b border-white/10 px-4 py-3 flex items-center gap-2 bg-[#0b1120]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
            </div>
          </div>
          <div className="p-6 font-mono text-[13px] leading-6 text-slate-300 overflow-x-auto bg-[#0b1120]/50">
            <div className="text-slate-500 mb-4">// Generate a portfolio in one click</div>
            <div className="mb-1"><span className="text-slate-600 mr-4">1</span><span className="text-pink-400">&lt;div</span> <span className="text-cyan-300">className</span>=<span className="text-yellow-300">"grid grid-cols-3 gap-4"</span><span className="text-pink-400">&gt;</span></div>
            <div className="mb-1"><span className="text-slate-600 mr-4">2</span>&nbsp;&nbsp;<span className="text-pink-400">&lt;Hero</span> <span className="text-cyan-300">name</span>=<span className="text-yellow-300">"John Doe"</span> <span className="text-pink-400">/&gt;</span></div>
            <div className="mb-1"><span className="text-slate-600 mr-4">3</span>&nbsp;&nbsp;<span className="text-pink-400">&lt;Projects</span> <span className="text-cyan-300">data</span>=<span className="text-yellow-300">&#123;githubRepos&#125;</span> <span className="text-pink-400">/&gt;</span></div>
            <div className="mb-1"><span className="text-slate-600 mr-4">4</span>&nbsp;&nbsp;<span className="text-pink-400">&lt;ContactForm</span> <span className="text-pink-400">/&gt;</span></div>
            <div className="mb-1"><span className="text-slate-600 mr-4">5</span><span className="text-pink-400">&lt;/div&gt;</span></div>
          </div>
        </div>

        {/* Info Area */}
        <div className="lg:pt-8">
          <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">Focus on content, not CSS.</h2>
          <p className="text-slate-400 leading-relaxed">
            PortfolioAI automatically translates your basic info into beautiful, utility-driven code. Choose from dozens of stunning templates without ever touching a stylesheet or worrying about responsiveness.
          </p>
        </div>

      </div>
    </div>
  );
}
