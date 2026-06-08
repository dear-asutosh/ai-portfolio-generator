import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Code2, 
  Globe, 
  Bot, 
  ChevronDown, 
  Terminal, 
  Zap, 
  Link2 
} from 'lucide-react';
import routes from '../routes';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  
  // Animation DOM refs
  const docRef = useRef(null);
  const laserRef = useRef(null);
  const chip1Ref = useRef(null);
  const chip2Ref = useRef(null);
  const chip3Ref = useRef(null);
  const chip4Ref = useRef(null);
  const terminalRef = useRef(null);
  const browserRef = useRef(null);

  // Active step copy highlight (0, 1, 2)
  const [activeStep, setActiveStep] = useState(0);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Unified Pinned & Scrubbed Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: "+=2200",
          pin: true,
          scrub: 1, // smooth catch-up
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress < 0.35) {
              setActiveStep(0);
            } else if (progress < 0.70) {
              setActiveStep(1);
            } else {
              setActiveStep(2);
            }
          }
        }
      });

      // Initial layouts
      gsap.set(docRef.current, { opacity: 1, scale: 1, y: 0, rotate: 0 });
      gsap.set(laserRef.current, { y: -100, opacity: 0 });
      gsap.set([chip1Ref.current, chip2Ref.current, chip3Ref.current, chip4Ref.current], { opacity: 0, scale: 0, x: 0, y: 0 });
      gsap.set(terminalRef.current, { y: 250, opacity: 0, scale: 0.95 });
      gsap.set(browserRef.current, { x: 350, opacity: 0, scale: 0.95 });

      // Step 1: Scanning (0% - 25% scroll)
      tl.to(laserRef.current, { opacity: 1, y: 50, duration: 0.1 })
        .to(laserRef.current, { y: 220, duration: 0.3, ease: "power1.inOut" })
        .to(docRef.current, { scale: 1.04, duration: 0.2 }, "<")
        
      // Step 2: Deconstruction into floating chips (25% - 50% scroll)
      tl.to(laserRef.current, { opacity: 0, duration: 0.05 })
        .to(docRef.current, { opacity: 0, scale: 0.9, y: -30, duration: 0.25 })
        // Fly chips outward
        .to(chip1Ref.current, { opacity: 1, scale: 1, x: -100, y: -70, rotate: -15, duration: 0.2 }, "<")
        .to(chip2Ref.current, { opacity: 1, scale: 1, x: 100, y: -80, rotate: 15, duration: 0.2 }, "<")
        .to(chip3Ref.current, { opacity: 1, scale: 1, x: -90, y: 50, rotate: 10, duration: 0.2 }, "<")
        .to(chip4Ref.current, { opacity: 1, scale: 1, x: 90, y: 40, rotate: -10, duration: 0.2 }, "<")
        
      // Step 3: Terminal Console compiler (50% - 75% scroll)
      tl.to(terminalRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.3 })
        // Pull chips back into terminal console
        .to([chip1Ref.current, chip2Ref.current, chip3Ref.current, chip4Ref.current], { 
          opacity: 0, 
          scale: 0.3, 
          x: 0, 
          y: 0, 
          duration: 0.2 
        }, "<+=0.05")
        
      // Step 4: Edge Subdomain deployment (75% - 100% scroll)
      tl.to(terminalRef.current, { opacity: 0, scale: 0.92, y: -40, duration: 0.25 })
        .to(browserRef.current, { opacity: 1, x: 0, scale: 1, duration: 0.35 })

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const stepsData = [
    {
      num: "01",
      label: "SOURCE IMPORT",
      title: "Feed your profile data",
      desc: "Upload a PDF resume, connect LinkedIn, or import live GitHub repositories."
    },
    {
      num: "02",
      label: "AI COMPILER",
      title: "Refine and optimize",
      desc: "Our ATS parser optimizes key metrics and builds a custom recruiter chatbot widget."
    },
    {
      num: "03",
      label: "EDGE DEPLOY",
      title: "Deploy to custom domain",
      desc: "Publish instantly to our global CDN edge network under your personal subdomain."
    }
  ];

  return (
    <div ref={containerRef} className="bg-black text-white relative min-h-screen font-sans selection:bg-cyan-500/20 selection:text-white overflow-x-hidden">
      {/* Background Micro Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none opacity-40 z-0" />
      
      {/* Ambient Spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-indigo-500/5 via-cyan-500/3 to-transparent blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 text-center z-10 pt-20">
        <Link to={routes.auth.signup} className="inline-flex items-center gap-2 px-3 py-1 border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] rounded-full text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-8 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>V1.2 / ATS-READY BUILDER</span>
        </Link>
        
        <h1 className="text-5xl sm:text-7xl md:text-[88px] font-semibold tracking-tighter leading-[0.9] text-white max-w-4xl font-heading mb-6">
          Build your <br className="sm:hidden" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-400 to-indigo-500">developer</span> <br />
          identity.
        </h1>
        
        <p className="text-slate-400 text-sm md:text-base max-w-md mt-2 mb-10 leading-relaxed font-light font-sans">
          Import your resume, sync GitHub repositories, and publish a premium portfolio with an integrated recruiter chatbot.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button 
            onClick={() => navigate('/project/new')}
            className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full text-sm transition-all flex items-center gap-2.5 active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
          >
            <span>Start Compiling</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => {
              const el = triggerRef.current;
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-white font-semibold rounded-full text-sm transition-colors cursor-pointer"
          >
            See How it Works
          </button>
        </div>
      </section>

      {/* GSAP Pinned Storyboard Section */}
      <section ref={triggerRef} className="relative w-full min-h-screen bg-black z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto h-screen flex flex-col justify-center px-6 md:px-12 py-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full">
            {/* Left Column - Minimal Step Copy */}
            <div className="lg:col-span-5 flex flex-col justify-center h-full relative">
              <div className="space-y-12">
                {stepsData.map((step, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ 
                      opacity: activeStep === idx ? 1 : 0.15,
                      x: activeStep === idx ? 0 : -8
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative cursor-pointer"
                    onClick={() => {
                      const scrollY = triggerRef.current.offsetTop + (idx * 750);
                      window.scrollTo({ top: scrollY, behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-center gap-3 font-mono text-xs text-cyan-400 mb-2">
                      <span>[{step.num}]</span>
                      <span className="tracking-widest uppercase">{step.label}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white leading-none mb-3 font-heading">
                      {step.title}
                    </h2>
                    
                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-light font-sans">
                      {step.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Product Simulator Dashboard */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end items-center h-full">
              <div className="w-full max-w-xl aspect-[4/3] bg-[#050507] border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
                {/* Simulator Header */}
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 bg-[#09090b]/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 tracking-wider">
                    PROFILIO_ENGINE.IO
                  </div>
                </div>

                {/* Simulator Screen Content Area */}
                <div className="flex-1 p-6 relative overflow-hidden flex items-center justify-center">
                  
                  {/* Step 1 Graphic: Scanning Document */}
                  <div ref={docRef} className="absolute border border-white/5 bg-[#07070a] rounded-2xl w-full max-w-[280px] p-6 flex flex-col items-center group overflow-hidden pointer-events-none">
                    <UploadCloud className="w-10 h-10 text-cyan-400 mb-3" />
                    <div className="text-xs font-mono text-slate-300 font-semibold mb-1">resume_draft_v2.pdf</div>
                    <div className="text-[9px] font-mono text-slate-600 mb-4 font-sans">Size: 4.8MB</div>
                    
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-full" />
                    </div>
                  </div>

                  {/* Scanning Laser Line */}
                  <div ref={laserRef} className="absolute left-1/2 -translate-x-1/2 top-10 w-full max-w-[320px] h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.8)] z-10 pointer-events-none" />

                  {/* Step 2 Graphics: Floating Data Chips */}
                  <div ref={chip1Ref} className="absolute px-3.5 py-1.5 bg-[#0c0c0f] border border-white/5 text-[10px] font-mono text-slate-400 rounded-full flex items-center gap-1.5 shadow-2xl pointer-events-none">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>React</span>
                  </div>
                  <div ref={chip2Ref} className="absolute px-3.5 py-1.5 bg-[#0c0c0f] border border-white/5 text-[10px] font-mono text-slate-400 rounded-full flex items-center gap-1.5 shadow-2xl pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    <span>Llama-3</span>
                  </div>
                  <div ref={chip3Ref} className="absolute px-3.5 py-1.5 bg-[#0c0c0f] border border-white/5 text-[10px] font-mono text-slate-400 rounded-full flex items-center gap-1.5 shadow-2xl pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>API Sync</span>
                  </div>
                  <div ref={chip4Ref} className="absolute px-3.5 py-1.5 bg-[#0c0c0f] border border-white/5 text-[10px] font-mono text-slate-400 rounded-full flex items-center gap-1.5 shadow-2xl pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Edge CDN</span>
                  </div>

                  {/* Step 3 Graphic: Terminal Console compiler */}
                  <div ref={terminalRef} className="absolute inset-x-6 inset-y-6 bg-black/90 border border-white/5 rounded-2xl p-5 font-mono text-[10px] text-slate-400 leading-relaxed shadow-2xl flex flex-col justify-between overflow-hidden pointer-events-none">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2 text-slate-600">
                      <Terminal size={12} />
                      <span>terminal_compile.log</span>
                    </div>
                    <div className="flex-grow space-y-1.5 flex flex-col justify-center">
                      <p className="text-cyan-400"># Initializing ATS Engine v1.2...</p>
                      <p className="text-slate-300">✔ Loaded parsed details for "Alex Rivera"</p>
                      <p className="text-slate-500 font-sans">// Optimizing portfolio SEO & page score...</p>
                      <p className="text-emerald-400">✔ Layout compiled successfully [v1.0.8]</p>
                    </div>
                    <div className="mt-3 bg-[#0b0c10] border border-white/5 rounded-xl p-3 flex items-start gap-2 max-w-[260px] self-end shadow-md">
                      <Bot className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-[9px] text-white leading-normal font-sans">
                        "ATS score optimized. Chatbot compiled!"
                      </p>
                    </div>
                  </div>

                  {/* Step 4 Graphic: Deployed Browser Mockup */}
                  <div ref={browserRef} className="absolute border border-white/5 bg-[#07070a] rounded-2xl w-full max-w-[340px] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                    
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 border border-emerald-500/20">
                      <Globe className="w-5 h-5" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-white mb-1 font-heading">Deployment Live</h3>
                    <div className="font-mono text-[10px] text-slate-400 mb-4 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-1.5 select-all">
                      <Link2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>alex.portfolioai.app</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full border-t border-white/5 pt-4 text-center">
                      <div>
                        <div className="text-[8px] font-mono text-slate-500 uppercase">Edge Cache</div>
                        <div className="text-[10px] font-semibold text-emerald-400 font-sans">Active (100%)</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-mono text-slate-500 uppercase">Speed Index</div>
                        <div className="text-[10px] font-semibold text-white font-sans">100/100</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Minimal Bento Grid Features */}
      <section className="relative w-full py-24 bg-black z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="mono-label text-cyan-400 mb-2">[ PLATFORM SPECS ]</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white font-heading reveal-text">
              Engineered for developer visibility.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal-container">
            {[
              {
                icon: <Code2 className="text-cyan-400" size={20} />,
                title: "Volumetric AI Parsing",
                desc: "Scan and structure PDF profiles instantly with 99.8% semantic classification."
              },
              {
                icon: <Zap className="text-indigo-400" size={20} />,
                title: "Live API Integration",
                desc: "Automatically sync public repos, contribution matrices, and LeetCode ratings."
              },
              {
                icon: <Bot className="text-purple-400" size={20} />,
                title: "Interactive Recruiter Chatbot",
                desc: "A custom chatbot widget tuned to speak intelligently about your stack."
              },
              {
                icon: <Globe className="text-emerald-400" size={20} />,
                title: "Publish to CDN Domain",
                desc: "Host portfolio assets on a globally-distributed, low-latency Edge cache."
              }
            ].map((card, idx) => (
              <div key={idx} className="border border-white/5 hover:border-cyan-500/20 bg-[#050507] p-8 rounded-2xl transition-all duration-300 group hover:shadow-[0_0_20px_rgba(6,182,212,0.05)] reveal-card">
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 font-heading">{card.title}</h3>
                <p className="text-slate-400 text-xs font-light leading-relaxed font-sans">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classy Minimalist FAQ Section */}
      <section className="relative w-full py-24 bg-black z-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="mono-label text-cyan-400 mb-2">[ INQUIRIES ]</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-white font-heading reveal-text">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-4 reveal-container">
            {[
              {
                q: "How does the AI chatbot work?",
                a: "The chatbot processes your work experience, projects, and skills to act as a virtual assistant. It answers recruiter queries regarding your tech stack, career targets, and availability."
              },
              {
                q: "Can I use my own custom domain?",
                a: "Yes. In addition to our free personal subdomains (yourname.portfolioai.app), premium plans support binding custom top-level domains."
              },
              {
                q: "How does the live GitHub sync work?",
                a: "Once authorized, our background worker periodically updates your project list, repository stars, languages used, and contribution grids, keeping your page fresh automatically."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border-b border-white/5 reveal-card">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between py-6 text-left focus:outline-none cursor-pointer group"
                >
                  <span className="text-sm md:text-base font-medium text-white group-hover:text-cyan-400 transition-colors">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 group-hover:text-white transition-transform ${openFaq === idx ? 'rotate-180 text-cyan-400' : ''}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-xs md:text-sm text-slate-400 leading-relaxed font-light font-sans">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Classy Final CTA Section */}
      <section className="relative w-full py-32 bg-black z-10 border-t border-white/5 flex flex-col items-center justify-center text-center px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-lg flex flex-col items-center">
          <span className="mono-label text-cyan-400 mb-4">[ BUILD NOW ]</span>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white leading-none font-heading mb-6 reveal-text">
            Ready to compile?
          </h2>
          <p className="text-slate-400 text-sm font-light max-w-sm mb-10 leading-relaxed font-sans reveal-text">
            Construct your developer identity today. Free setup, instant CDN publication.
          </p>
          <button 
            onClick={() => navigate('/project/new')}
            className="px-8 py-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-full text-sm transition-all flex items-center gap-2.5 active:scale-[0.98] cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
          >
            <span>Launch Compiler</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
