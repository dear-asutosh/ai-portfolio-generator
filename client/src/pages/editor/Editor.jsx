import React, { useState } from 'react';
import { 
  Play, 
  Save, 
  Share2, 
  ChevronLeft, 
  MessageSquare, 
  Code2, 
  Eye, 
  Settings,
  PanelLeftClose,
  PanelRightClose,
  Terminal,
  Sparkles
} from 'lucide-react';

const Editor = () => {
  const [activeTab, setActiveTab] = useState('html');
  const [chatInput, setChatInput] = useState('');

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] text-white overflow-hidden">
      {/* Editor Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold flex items-center gap-2">
              Creative Developer Portfolio
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">V1.2</span>
            </span>
            <span className="text-[11px] text-gray-500">Auto-saved at 12:45 PM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md text-sm border border-white/5 transition-colors">
            <Share2 size={16} /> Share
          </button>
          <button className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-md text-sm transition-all transform hover:scale-105">
            <Play size={16} fill="currentColor" /> Deploy Live
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: AI Chat (Lovable/Bolt Style) */}
        <aside className="w-[350px] border-r border-white/5 flex flex-col bg-[#0a0a0a]">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles size={16} className="text-cyan-400" />
              AI Assistant
            </div>
            <PanelLeftClose size={18} className="text-gray-500 cursor-pointer hover:text-white" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-[#111] border border-white/5 p-3 rounded-lg text-sm text-gray-300">
              Hello! I've generated the initial structure. Want to change the theme to glassmorphism or add a 3D contact section?
            </div>
            {/* Mock messages could go here */}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="relative">
              <textarea 
                className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 pt-4 text-sm focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none"
                placeholder="Ask AI to change something... (e.g., 'Make the header dark mode')"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="absolute bottom-3 right-3 p-1.5 bg-cyan-500 rounded-md text-black">
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* Center: Editor Pane */}
        <main className="flex-1 flex flex-col border-r border-white/5">
          <div className="h-10 bg-[#0f0f0f] border-b border-white/5 flex items-center px-2 gap-1">
            {['html', 'css', 'js'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1 text-xs font-mono uppercase tracking-widest rounded transition-colors ${
                  activeTab === tab ? 'bg-white/10 text-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 font-mono text-sm p-4 overflow-auto bg-[#0d0d0d]">
             {/* Mock Code Content */}
             <pre className="text-cyan-400/80">
               {`// Iterating on your portfolio...\n\nfunction Portfolio() {\n  return (\n    <div className="hero">\n      <h1>Hello World</h1>\n    </div>\n  );\n}`}
             </pre>
          </div>
          <div className="h-8 bg-[#0a0a0a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-gray-500 uppercase tracking-widest">
            <span>Ln 1, Col 1</span>
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>Javascript (React)</span>
            </div>
          </div>
        </main>

        {/* Right: Live Preview */}
        <section className="flex-1 bg-white flex flex-col">
          <div className="h-10 bg-[#0f0f0f] border-b border-white/5 flex items-center justify-between px-4">
             <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
               <Eye size={14} /> Preview
             </div>
             <div className="flex items-center gap-3">
               <PanelRightClose size={16} className="text-gray-500 cursor-pointer hover:text-white" />
             </div>
          </div>
          <div className="flex-1 bg-white overflow-auto relative">
             <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
                {/* This will be our Iframe */}
                Interactive Preview Content
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Editor;
