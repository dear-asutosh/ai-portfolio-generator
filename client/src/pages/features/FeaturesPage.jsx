import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Cpu, 
  Layout, 
  Globe, 
  MessageSquare, 
  Sparkles,
  Shield,
  Smartphone,
  Code
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="group p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.04] transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-cyan-400" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 leading-relaxed text-sm">
      {description}
    </p>
  </motion.div>
);

const FeaturesPage = () => {
  const mainFeatures = [
    {
      icon: Cpu,
      title: "AI Resume Parsing",
      description: "Our Groq-powered engine extracts work history, skills, and achievements from PDF, DOCX, or even LinkedIn exports with 99% accuracy.",
      delay: 0.1
    },
    {
      icon: MessageSquare,
      title: "AI Chat Modifier",
      description: "Don't like a section? Just tell the AI. 'Make my project descriptions more technical' or 'Add a dark theme with neon accents'.",
      delay: 0.2
    },
    {
      icon: Layout,
      title: "Premium Templates",
      description: "Hand-crafted, developer-focused templates designed to make you stand out. Fully responsive and SEO optimized out of the box.",
      delay: 0.3
    },
    {
      icon: Globe,
      title: "Instant Deployment",
      description: "Go live in seconds on a sub-domain like profil.io/yourname. One-click updates whenever you want to change your content.",
      delay: 0.4
    },
    {
      icon: Code,
      title: "IDE-Grade Editor",
      description: "For the control freaks: A full JSON editor with live preview. Change data structures directly and see updates instantly.",
      delay: 0.5
    },
    {
      icon: Sparkles,
      title: "Content Enhancement",
      description: "Our AI doesn't just copy; it improves. It fixes grammar, strengthens action verbs, and highlights your most impactful work.",
      delay: 0.6
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Zap className="w-3 h-3" />
            Core Capabilities
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6"
          >
            Built for the <span className="gradient-text">Modern Developer</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed"
          >
            Everything you need to build, customize, and deploy a world-class portfolio in minutes, not days.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Detailed Feature: AI Analysis */}
        <div className="mt-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Deep Context AI Analysis</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              We don't just use regex. Our integration with Llama 3 on Groq allows us to understand the *context* of your experience. 
            </p>
            <ul className="space-y-4">
              {[
                "Automatic project categorization",
                "Skills extraction from achievement bullets",
                "Grammar & professional tone optimization",
                "Semantic mapping to portfolio sections"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#111] border border-white/10 p-8 rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                <span className="ml-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest">AI Extraction.log</span>
              </div>
              <div className="space-y-4 font-mono text-sm leading-relaxed">
                <p className="text-emerald-400"># Initializing Groq-Llama-3-70b...</p>
                <p className="text-cyan-400"># Parsing "Fullstack_Dev_Resume.pdf"</p>
                <div className="pl-4 border-l border-white/5 space-y-2">
                  <p className="text-gray-400">{">"} Identifying experience: <span className="text-purple-400">Software Engineer @ Google</span></p>
                  <p className="text-gray-400">{">"} Extracting stack: <span className="text-amber-400">React, Go, K8s, GraphQL</span></p>
                  <p className="text-gray-400">{">"} Generating bio: <span className="text-white italic">"Experienced architect with a focus on..."</span></p>
                </div>
                <p className="text-cyan-400 animate-pulse"># Mapping to Template: Minimalist_Dark...</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tech Stack Bar */}
        <div className="mt-40 pt-20 border-t border-white/5">
          <p className="text-center text-gray-500 text-sm font-mono tracking-widest uppercase mb-12">Powered by Modern Tech</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {/* We can put logos or text here */}
             <span className="text-xl font-bold text-white">Groq AI</span>
             <span className="text-xl font-bold text-white">React 18</span>
             <span className="text-xl font-bold text-white">Cloudinary</span>
             <span className="text-xl font-bold text-white">TailwindCSS</span>
             <span className="text-xl font-bold text-white">Framer Motion</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
