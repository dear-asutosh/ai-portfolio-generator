import { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';

const FUNNY_MESSAGES = [
  "Resolving node_modules... Yes, all 4.2 million of them.",
  "Ingesting caffeine... Conversion to clean code in progress.",
  "Convincing bugs that they are actually features.",
  "Locating the missing semicolon that broke the staging build.",
  "Consulting Stack Overflow... (Please don't ask how it works).",
  "Compiling assets... Asking the CPU to think positive thoughts.",
  "Explaining to the AI assistant why we don't code in COBOL anymore.",
  "Slowing down the build slightly so it looks like we're doing hard work.",
  "Vertically centering three nested divs. Yes, this takes extra computational power.",
  "Teleporting assets into the sandbox... hopefully they land somewhere safe.",
  "Converting pizza slices into structured JSON nodes.",
  "Applying 'It works on my machine' verification layers.",
  "Generating responsive layout grids that actually align on mobile.",
  "Double-checking if we accidentally deleted the production database (we didn't!).",
  "Translating 'it works on my machine' to production-ready components."
];

/**
 * CinematicPreviewLoader
 * Redesigned as an ultra-modern, professional, minimalist, and funny loading screen.
 * Cycles through humorous developer statements to make waiting enjoyable.
 */
const CinematicPreviewLoader = ({ isGenerating, phase }) => {
  const [currentMessage, setCurrentMessage] = useState(FUNNY_MESSAGES[0]);
  const [fadeState, setFadeState] = useState('fade-in');

  useEffect(() => {
    if (!isGenerating) return;

    let index = 0;
    const interval = setInterval(() => {
      setFadeState('fade-out');
      setTimeout(() => {
        index = (index + 1) % FUNNY_MESSAGES.length;
        setCurrentMessage(FUNNY_MESSAGES[index]);
        setFadeState('fade-in');
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isGenerating && phase !== 'error') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 p-8 text-center bg-[#09090b] select-none">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800/80">
          <LayoutGrid className="text-zinc-500" size={24} />
        </div>
        <h3 className="text-lg font-bold text-zinc-200 mb-1">Portfolio Sandbox</h3>
        <p className="max-w-xs text-xs text-zinc-500 leading-relaxed">
          Your portfolio will appear here as soon as you analyze your credentials or make an edit.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-[#09090b] overflow-hidden select-none">
      <style>{`
        @keyframes progress-scroll {
          0% { left: -70%; }
          100% { left: 100%; }
        }
        @keyframes eye-blink {
          0%, 45%, 55%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.1);
          }
        }
        .fade-in {
          opacity: 1;
          transform: translateY(0);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        .fade-out {
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 0.3s ease-in, transform 0.3s ease-in;
        }
      `}</style>

      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Minimalist Winking Smiley Face */}
        <div className="flex flex-col items-center mb-8 relative">
          <div className="flex gap-7 mb-2.5 items-center">
            {/* Left Eye */}
            <div className="w-2.5 h-2.5 bg-zinc-300 rounded-full" />
            
            {/* Right Eye (Blinking) */}
            <div 
              className="w-2.5 h-2.5 bg-zinc-300 rounded-full origin-center"
              style={{
                animation: 'eye-blink 2.2s ease-in-out infinite'
              }}
            />
          </div>
          {/* Curved mouth */}
          <div className="w-6 h-3 border-b-2 border-zinc-400 rounded-b-full" />
        </div>

        <h3 className="text-xs font-semibold text-zinc-200 mb-3 tracking-wider uppercase font-mono">
          ⚡ Synthesizing Technical Authority
        </h3>

        {/* Sleek professional scrolling progress bar */}
        <div className="w-40 h-[2px] bg-zinc-900 rounded-full overflow-hidden mb-6 relative">
          <div 
            className="absolute h-full bg-zinc-500 rounded-full w-2/3"
            style={{
              animation: 'progress-scroll 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}
          />
        </div>

        {/* Humorous developer quote cycling block */}
        <div className="min-h-[40px] flex items-center justify-center text-center">
          <p className={`text-xs text-zinc-400 font-mono tracking-tight ${fadeState}`}>
            {currentMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CinematicPreviewLoader;
