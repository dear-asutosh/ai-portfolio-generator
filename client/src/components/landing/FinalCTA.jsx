import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';


export default function FinalCTA() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    navigate(`/auth/signup?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <section className="py-24 px-6 sm:px-8 lg:px-16 max-w-7xl mx-auto bg-transparent border-t border-white/5 relative z-10 w-full">
      {/* Monospace Indicator */}
      <div className="mono-label mb-4">[05 / LAUNCH CHANNEL]</div>

        <div className="bg-[#08080a]/60 backdrop-blur-md border border-white/5 p-12 md:p-20 rounded-2xl text-center flex flex-col items-center hover:border-white/10 hover:scale-[1.005] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 w-full relative overflow-hidden">
          {/* Subtle Grid Accent */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
            <Globe className="w-56 h-56 text-white" />
          </div>

          <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white mb-6">
            Claim your developer domain.
          </h2>
          
          <p className="text-slate-400 text-sm md:text-base mb-12 max-w-lg leading-relaxed font-light">
            Deploy your portfolio to our high-speed global edge network. Claim your custom subdomain in seconds.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mb-8">
            <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 flex items-center gap-2 focus-within:border-cyan-500/50 transition-colors">
              <span className="text-slate-500 font-mono text-xs select-none">profilio.app/</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                placeholder="yourname"
                className="bg-transparent border-none outline-none text-white text-xs md:text-sm font-medium w-full p-0 focus:ring-0 placeholder-gray-700 font-mono"
              />
            </div>
            <button 
              type="submit"
              className="bg-white hover:bg-slate-100 text-black px-6 py-3.5 rounded-xl font-semibold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)] shrink-0"
            >
              <span>Claim & Compile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            // No credit card required. Free compiler access.
          </span>
        </div>
    </section>
  );
}
