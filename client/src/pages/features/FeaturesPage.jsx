import { 
  Zap, 
  Cpu, 
  Layout, 
  Globe, 
  MessageSquareCode, 
  Braces,
  Database
} from 'lucide-react';


const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="reveal-card h-full">
    <div className="group p-8 rounded-2xl bg-[#08080a]/60 backdrop-blur-md border border-white/5 hover:border-white/10 hover:bg-[#0c0c0e]/80 hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 group-hover:text-cyan-400 group-hover:bg-cyan-500/5 group-hover:border-cyan-500/10 transition-all duration-300 text-slate-400">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-light">
          {description}
        </p>
      </div>
      
      <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] text-cyan-400 uppercase tracking-widest">
        <span>Active integration</span>
        <span>→</span>
      </div>
    </div>
  </div>
);

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: Cpu,
      title: "ATS-Optimized Parsing",
      description: "Our Llama-3 extraction pipeline parses PDFs, Word docs, and LinkedIn profiles, automatically organizing your accomplishments and project metrics."
    },
    {
      icon: MessageSquareCode,
      title: "Interactive Recruiter Chatbot",
      description: "A customized chatbot widget integrated directly on your site, pre-loaded with your background, to answer recruiter questions about your projects and availability 24/7."
    },
    {
      icon: Layout,
      title: "Volumetric Design System",
      description: "Compiles your data into a premium responsive portfolio structure. Features live project cards, smooth animations, and high-end modern layout tokens."
    },
    {
      icon: Globe,
      title: "Instant Edge Deployment",
      description: "Go live instantly to a high-speed CDN global subdomain (e.g. profilio.app/username). Features automatic SSL configuration and search index optimizations."
    },
    {
      icon: Braces,
      title: "IDE-Grade JSON Editor",
      description: "Direct read-write access to your portfolio's underlying JSON data schema. Change properties and see hot-reloaded visual updates in real-time."
    },
    {
      icon: Database,
      title: "GitHub & LeetCode Sync",
      description: "Connect your profiles to automatically pull live repository languages, commit graphs, open source details, and competitive programming progress grids."
    }
  ];

  return (
    <div className="min-h-screen bg-[#030304] pt-32 pb-20 px-6 sm:px-8 lg:px-16 relative overflow-hidden">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.02] border border-white/5 text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-6">
            <Zap className="w-3 h-3" />
            <span>Capability Index</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tighter mb-6 leading-none reveal-text">
            Engineered for the <span className="gradient-text">modern developer</span>.
          </h1>
          
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed font-sans reveal-text">
            A high-performance pipeline automating portfolio synthesis, API syncing, and deployment.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-36 reveal-container">
          {mainFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Deep Dive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-20 border-t border-white/5 reveal-container">
          <div className="flex flex-col reveal-card">
            <div className="mono-label mb-4">[DEEP DIVE / DATA COMPILATION]</div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6 tracking-tighter">
              Context-Aware Parsing
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 font-light">
              Rather than generic text splitting, our Groq-Llama-3 pipeline evaluates the semantic context of your projects and job history, restructuring descriptions into high-impact, ATS-optimized bullet points.
            </p>
            <ul className="space-y-4">
              {[
                "Automatic skill-to-project semantic mapping",
                "Action verb enhancement for job descriptions",
                "ATS-friendly keyword optimization",
                "Self-adjusting typography layouts based on content density"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-xs md:text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative group reveal-card">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
            <div className="relative bg-[#08080a] border border-white/5 p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                <span className="ml-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest">parsing_logger.log</span>
              </div>
              <div className="space-y-4 font-mono text-[11px] md:text-xs leading-relaxed">
                <p className="text-cyan-400"># Initializing Groq-Llama-3-70b...</p>
                <p className="text-slate-500"># Scanning source "resume.pdf"</p>
                <div className="pl-4 border-l border-white/5 space-y-2">
                  <p className="text-slate-400">{">"} Job found: <span className="text-indigo-400">Software Engineer @ TechFlow</span></p>
                  <p className="text-slate-400">{">"} Stack mapping: <span className="text-cyan-400">React, Node.js, TypeScript</span></p>
                  <p className="text-slate-400">{">"} Optimizing bullets: <span className="text-emerald-400">Replaced passive verbs with metrics-driven statements</span></p>
                </div>
                <p className="text-emerald-400"># Compiled profile schema v1.2 successfully</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeaturesPage;
