import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Layout,
  Code2,
  Monitor,
  Smartphone
} from 'lucide-react';

// Import images
import tplDark from '../../assets/images/tpl-dark.png';
import tplMinimal from '../../assets/images/tpl-minimal.png';
import tplTerminal from '../../assets/images/tpl-terminal.png';
import tplNeon from '../../assets/images/tpl-neon.png';
import tplAcademic from '../../assets/images/tpl-academic.png';
import tplBrutalist from '../../assets/images/tpl-brutalist.png';
import tplStartup from '../../assets/images/tpl-startup.png';
import tplRetro from '../../assets/images/tpl-retro.png';

const templates = [
  {
    id: 'dev-dark',
    name: 'Developer Dark',
    category: 'Engineering',
    image: tplDark,
    description: 'High-contrast dark theme with glassmorphism and syntax highlighting for projects.',
    tags: ['Next.js', 'Tailwind', 'Dark Mode'],
    features: ['Code Blocks', 'GitHub Integration', 'Timeline View']
  },
  {
    id: 'minimal-pro',
    name: 'Minimal Pro',
    category: 'Design',
    image: tplMinimal,
    description: 'Sophisticated minimalist design with refined typography and generous whitespace.',
    tags: ['Clean', 'Photography', 'Art Focus'],
    features: ['Large Images', 'Custom Fonts', 'Bento Grid']
  },
  {
    id: 'terminal-tech',
    name: 'Terminal Tech',
    category: 'Engineering',
    image: tplTerminal,
    description: 'A retro hacker-style interface for the true CLI enthusiast. Monospaced and unique.',
    tags: ['Retro', 'Mono', 'Interactive'],
    features: ['Command Simulation', 'Low Latency', 'ASCII Art']
  },
  {
    id: 'neon-glass',
    name: 'Neon Glass',
    category: 'Creative',
    image: tplNeon,
    description: 'Vibrant neon gradients and highly transparent glassmorphism for a high-energy look.',
    tags: ['Neon', 'Glow', 'Modern'],
    features: ['Interactive Waves', 'RGB Accents', 'Parallax Scrolling']
  },
  {
    id: 'academic-pro',
    name: 'Academic Pro',
    category: 'Minimalist',
    image: tplAcademic,
    description: 'A serious, refined layout focused on research, publications, and professional trust.',
    tags: ['Serif', 'Trust', 'Clean'],
    features: ['BibTeX Support', 'Research Grid', 'CV Export']
  },
  {
    id: 'brutalist-modern',
    name: 'Brutalist Modern',
    category: 'Creative',
    image: tplBrutalist,
    description: 'Bold black outlines and raw primary colors for a trendy, "unfinished" aesthetic.',
    tags: ['Raw', 'Bold', 'Modern'],
    features: ['Oversized Type', 'Raw CSS Feel', 'Dynamic Grids']
  },
  {
    id: 'startup-sleek',
    name: 'Startup Sleek',
    category: 'Design',
    image: tplStartup,
    description: 'Professional startup-style landing page for your personal brand and features.',
    tags: ['SaaS', 'Professional', 'Indigo'],
    features: ['Feature Blocks', 'Testimonials', 'Pricing Grid']
  },
  {
    id: 'retro-game',
    name: 'Retro Game',
    category: 'Creative',
    image: tplRetro,
    description: '8-bit pixel art and retro console UI for a fun, interactive portfolio experience.',
    tags: ['Pixel', '8-Bit', 'Gaming'],
    features: ['Interactive Character', 'Sound Effects', 'Inventory Stats']
  }
];

const CategoryTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
      active 
        ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
        : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
    }`}
  >
    {label}
  </button>
);

const TemplatesPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Engineering', 'Design', 'Minimalist', 'Creative'];

  const filteredTemplates = activeCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Sparkles className="w-3 h-3" />
            Pick Your Vibe
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8"
          >
            World Class <span className="gradient-text">Design Shells.</span>
          </motion.h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto font-light">
            Professionally designed templates that are fully customizable by AI. Choose one and start building.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 border-b border-white/5 pb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(cat => (
              <CategoryTab 
                key={cat} 
                label={cat} 
                active={activeCategory === cat} 
                onClick={() => setActiveCategory(cat)} 
              />
            ))}
          </div>
          <div className="relative group w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all w-full md:min-w-[300px]"
            />
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, idx) => (
              <motion.div
                layout
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group flex flex-col bg-[#111] border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-500/30 transition-all duration-500"
              >
                {/* Preview Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-cyan-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30">
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                      {template.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{template.name}</h3>
                    <div className="flex gap-2">
                       <Monitor className="w-3 h-3 text-gray-500" />
                       <Smartphone className="w-3 h-3 text-gray-500" />
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                    {template.description}
                  </p>
                  
                  {/* Features List */}
                  <div className="space-y-2 mb-8">
                    {template.features.slice(0, 2).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-[12px] text-gray-500">
                        <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                        {feat}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex -space-x-2">
                      {template.tags.slice(0, 2).map((tag, i) => (
                        <div key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-mono text-gray-400 uppercase">
                          {tag}
                        </div>
                      ))}
                    </div>
                    <button className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                      Use Template <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State if no results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-40">
            <Layout className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Custom Template Section */}
        <div className="mt-40 p-12 rounded-3xl bg-gradient-to-r from-[#0d0d0d] to-[#161616] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Can't find what you need?</h2>
            <p className="text-gray-400 leading-relaxed">
              Our AI Assistant can generate a custom design based on your description. Just tell it the vibe, colors, and layout you're looking for.
            </p>
          </div>
          <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 whitespace-nowrap">
            Describe Your Custom Template <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
