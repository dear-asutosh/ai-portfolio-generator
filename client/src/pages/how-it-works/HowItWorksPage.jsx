import { 
  FileUp, 
  Cpu, 
  SlidersHorizontal, 
  Rocket, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';


const StepSection = ({ number, title, description, icon: Icon, reverse, details }) => (
  <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 py-20 border-b border-white/5 last:border-0 reveal-container`}>
    {/* Text info */}
    <div className="flex-grow lg:w-1/2 reveal-card">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shadow-md">
            {number}
          </span>
          <span className="text-slate-500 font-mono text-[10px] tracking-widest uppercase">The Pipeline</span>
        </div>
        
        <h2 className="text-2xl md:text-4xl font-semibold text-white mb-4 tracking-tighter">
          {title}
        </h2>
        
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-6 font-light">
          {description}
        </p>
        
        <div className="space-y-2.5">
          {details.map((detail, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    {/* Visual Card */}
    <div className="flex-grow lg:w-1/2 w-full reveal-card">
      <div className="relative aspect-video bg-[#08080a]/60 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center p-8 group hover:border-white/10 hover:scale-[1.005] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/[0.03] to-transparent pointer-events-none" />
        <Icon className="w-16 h-16 text-slate-600 group-hover:text-cyan-400 group-hover:scale-105 transition-all duration-300" />
      </div>
    </div>
  </div>
);

const HowItWorksPage = () => {
  const stepsData = [
    {
      number: "01",
      title: "Feed Your Profile Details",
      description: "Provide your background. You can upload a PDF resume, import a PDF download of your LinkedIn profile, or complete our guided markdown form. No manual formatting, alignment, or design styling is required.",
      icon: FileUp,
      details: [
        "Parses PDF, DOCX, and JPG resume structures",
        "LinkedIn export guide provided inline",
        "Saves draft instantly to begin AI processing"
      ]
    },
    {
      number: "02",
      title: "ATS-Optimized AI Synthesis",
      description: "Our Llama-3 context engine parses the imported details. It converts raw experience bullet points into metrics-focused accomplishments, fixes grammatical errors, optimizes key terms for ATS algorithms, and structures your profile biography.",
      icon: Cpu,
      reverse: true,
      details: [
        "Advanced Llama-3-70b semantic parsing",
        "Automatic target-role keyword alignment",
        "Generates cohesive professional summaries"
      ]
    },
    {
      number: "03",
      title: "Configure Integrations & Chatbot",
      description: "Fine-tune your layout. Sync your GitHub and LeetCode usernames to automatically populate live repository cards and status badges. Train your custom conversational recruiter chatbot widget to reply to visitor questions.",
      icon: SlidersHorizontal,
      details: [
        "Live GitHub repository language cards",
        "LeetCode competitive coding progress badges",
        "Customizable AI chatbot answering visitor FAQs"
      ]
    },
    {
      number: "04",
      title: "Launch Globally in One Click",
      description: "Publish your portfolio instantly. Claim a unique profilio.app subdomain or connect your own DNS values. Your portfolio compiles to static React assets hosted on our high-speed global CDN edge locations.",
      icon: Rocket,
      reverse: true,
      details: [
        "Static page assets hosted on global edge CDN",
        "Automatic SEO meta header configuration",
        "Instant hot-reload editor updates"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030304] pt-32 pb-20 px-6 sm:px-8 lg:px-16 relative overflow-hidden">

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-28">
          <div className="mono-label mb-4">[SYSTEM WALKTHROUGH]</div>
          
          <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tighter mb-6 leading-none reveal-text">
            How it <span className="gradient-text">works</span>.
          </h1>
          
          <p className="text-slate-400 text-base md:text-lg max-w-xl mx-auto font-light leading-relaxed font-sans reveal-text">
            We have automated the design, integration, and hosting pipelines of developer portfolios.
          </p>
        </div>

        {/* Timeline Steps */}
        <div className="space-y-4">
          {stepsData.map((step, index) => (
            <StepSection key={index} {...step} />
          ))}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-32 reveal-container">
          <div className="reveal-card">
            <div className="p-12 md:p-20 rounded-2xl bg-[#08080a]/60 border border-white/5 text-center relative overflow-hidden hover:border-white/10 hover:scale-[1.005] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300">
              <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 tracking-tighter">
                Ready to compile your profile?
              </h2>
              
              <p className="text-slate-400 text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed font-light font-sans">
                Join developers who built and hosted their professional portfolios in under five minutes.
              </p>
              
              <a 
                href="/project/new" 
                className="px-8 py-3.5 bg-white text-black font-semibold text-xs md:text-sm rounded-xl hover:bg-slate-100 transition-colors inline-flex items-center gap-2 mx-auto cursor-pointer shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
              >
                <span>Compile My Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
