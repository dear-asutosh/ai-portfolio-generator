import { useState } from 'react';
import {
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Zap,
  Minimize2,
  TrendingUp,
  Feather,
  Layout,
  Star,
  Send,
  Loader2,
  User,
  Menu,
} from 'lucide-react';

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'nav',        label: 'Navbar',     icon: Menu },
  { id: 'hero',       label: 'Hero',       icon: Star },
  { id: 'about',      label: 'About Me',   icon: User },
  { id: 'skills',     label: 'Skills',     icon: TrendingUp },
  { id: 'projects',   label: 'Projects',   icon: Layout },
  { id: 'experience', label: 'Experience', icon: RefreshCw },
  { id: 'education',  label: 'Education',  icon: Feather },
  { id: 'contact',    label: 'Contact',    icon: Send },
];

// Quick-action chips — each maps to an instruction + optional blueprintMutations
const QUICK_ACTIONS = [
  {
    label: 'More Futuristic',
    icon: Zap,
    instruction: 'Make this section feel more futuristic, high-tech, and cutting-edge. Use bold gradients, glowing effects, and dynamic visual hierarchy.',
    blueprintMutations: { animationIntensity: 'immersive' },
    color: 'from-cyan-500/20 to-purple-500/20 border-cyan-500/30 text-cyan-300 hover:border-cyan-400/60',
  },
  {
    label: 'Simplify Design',
    icon: Minimize2,
    instruction: 'Simplify and clean up this section. Reduce visual noise, use more whitespace, and focus on clarity and readability.',
    blueprintMutations: { animationIntensity: 'minimal' },
    color: 'from-zinc-500/20 to-zinc-600/20 border-zinc-500/30 text-zinc-300 hover:border-zinc-400/60',
  },
  {
    label: 'More Bold',
    icon: TrendingUp,
    instruction: 'Make this section bolder and more impactful. Use larger text, stronger contrast, more prominent colors, and a commanding visual presence.',
    blueprintMutations: { animationIntensity: 'premium' },
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-300 hover:border-orange-400/60',
  },
  {
    label: 'Reduce Animations',
    icon: Feather,
    instruction: 'Reduce or remove animations in this section. Keep it calm, clean, and professional with minimal motion.',
    blueprintMutations: { animationIntensity: 'subtle' },
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300 hover:border-green-400/60',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SectionRegenerator — sidebar panel for blueprint-driven section-level regeneration.
 *
 * @param {string}   projectId     - Current project ID
 * @param {Function} onRegenerate  - Callback: (updatedCode) => void — receives { html, css, js, fullPreviewHtml }
 * @param {boolean}  disabled      - Disabled when another generation is in progress
 */
const SectionRegenerator = ({ projectId, onRegenerate, disabled }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [lastResult, setLastResult] = useState(null); // { section, success }
  const [isCoolingDown, setIsCoolingDown] = useState(false);

  const handleToggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
    setCustomInstruction('');
  };

  /**
   * Fires the section regeneration request.
   * @param {Object} section         - Section config object
   * @param {Object|null} quickAction - Quick action config (or null for custom)
   */
  const handleRegenerate = async (section, quickAction = null) => {
    if (!projectId || disabled || regeneratingSection || isCoolingDown) return;

    // Start 3 second debounce cooldown
    setIsCoolingDown(true);
    setTimeout(() => setIsCoolingDown(false), 3000);

    const instruction = quickAction
      ? quickAction.instruction
      : customInstruction.trim() || `Improve the ${section.label} section design.`;

    const blueprintMutations = quickAction?.blueprintMutations || null;

    setRegeneratingSection(section.id);
    setLastResult(null);

    try {
      const { default: API } = await import('../../apis/api');
      const res = await API.post('/ai/regenerate-section', {
        projectId,
        section: section.id,
        instruction,
        blueprintMutations,
      });

      if (res.data.success) {
        setLastResult({ section: section.id, success: true });
        if (onRegenerate) {
          onRegenerate(res.data.data);
        }
        setCustomInstruction('');
      } else {
        setLastResult({ section: section.id, success: false });
      }
    } catch (err) {
      console.error('[SectionRegenerator] Error:', err);
      setLastResult({ section: section.id, success: false });
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
            <RefreshCw size={10} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-widest">
            Regenerate Section
          </span>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
          Selectively improve any section with AI — faster than a full rebuild.
        </p>
      </div>

      {/* Section list */}
      <div className="px-2 py-1 space-y-0.5">
        {SECTIONS.map((section) => {
          const isExpanded = expandedSection === section.id;
          const isRegenerating = regeneratingSection === section.id;
          const wasLast = lastResult?.section === section.id;
          const Icon = section.icon;

          return (
            <div key={section.id} className="rounded-xl overflow-hidden">
              {/* Section row */}
              <button
                onClick={() => handleToggleSection(section.id)}
                disabled={disabled || !!regeneratingSection}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all rounded-xl group
                  ${isExpanded
                    ? 'bg-white/[0.06] border border-white/10'
                    : 'hover:bg-white/[0.04] border border-transparent'
                  }
                  ${disabled || regeneratingSection ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center gap-2.5">
                  {isRegenerating ? (
                    <Loader2 size={14} className="text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <Icon
                      size={14}
                      className={`shrink-0 transition-colors ${
                        isExpanded ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'
                      }`}
                    />
                  )}
                  <span className={`text-xs font-semibold transition-colors ${
                    isExpanded ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                  }`}>
                    {section.label}
                  </span>
                  {wasLast && lastResult.success && !isRegenerating && (
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                      Updated
                    </span>
                  )}
                </div>
                {isExpanded
                  ? <ChevronDown size={12} className="text-gray-500" />
                  : <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400" />
                }
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 space-y-2 bg-white/[0.02] border border-white/5 border-t-0 rounded-b-xl">
                  {/* Quick action chips */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleRegenerate(section, action)}
                          disabled={disabled || !!regeneratingSection}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border bg-gradient-to-r text-xs font-semibold transition-all duration-200
                            ${action.color}
                            ${disabled || regeneratingSection
                              ? 'opacity-40 cursor-not-allowed'
                              : 'hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                            }
                          `}
                        >
                          <ActionIcon size={10} className="shrink-0" />
                          <span className="leading-tight">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[9px] text-gray-600 uppercase tracking-wider font-bold">or custom</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>

                  {/* Custom instruction input */}
                  <div className="relative">
                    <textarea
                      value={customInstruction}
                      onChange={(e) => setCustomInstruction(e.target.value)}
                      placeholder={`Describe how to improve the ${section.label} section...`}
                      rows={2}
                      disabled={disabled || !!regeneratingSection}
                      className="w-full bg-[#111] border border-white/8 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cyan-500/40 resize-none transition-colors pr-10 leading-relaxed"
                    />
                    <button
                      onClick={() => handleRegenerate(section, null)}
                      disabled={disabled || !!regeneratingSection || !customInstruction.trim()}
                      className="absolute bottom-2 right-2 p-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-black rounded-md transition-all"
                      title="Regenerate with custom instruction"
                    >
                      {isRegenerating
                        ? <Loader2 size={10} className="animate-spin text-white" />
                        : <Send size={10} />
                      }
                    </button>
                  </div>

                  {/* Error state */}
                  {wasLast && !lastResult.success && !isRegenerating && (
                    <p className="text-[10px] text-red-400 text-center py-1">
                      Regeneration failed — try again or use a different prompt.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      {regeneratingSection && (
        <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-cyan-400/70 animate-pulse">
          <Loader2 size={10} className="animate-spin" />
          Regenerating {SECTIONS.find(s => s.id === regeneratingSection)?.label} section...
        </div>
      )}
    </div>
  );
};

export default SectionRegenerator;
