import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, 
  Share2, 
  ChevronLeft, 
  Code2, 
  Eye, 
  Settings,
  PanelLeftClose,
  PanelRightClose,
  Sparkles,
  Edit2,
  Loader2,
  LayoutGrid,
  GripVertical,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  Check,
  Copy,
  X,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Lock } from 'lucide-react';
import API from '../../apis/api';
import Notification from '../../components/common/Notification';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradeModal from '../../components/common/UpgradeModal';
import PlanBadge from '../../components/common/PlanBadge';
import routes from '../../routes';
import fallbackUser from '../../assets/images/fallback-user.png';
import SectionRegenerator from '../../components/editor/SectionRegenerator';
import CinematicPreviewLoader from '../../components/editor/CinematicPreviewLoader';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('visual'); // 'visual' or 'developer'
  const [activeTab, setActiveTab] = useState('html');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('chat'); // 'chat' | 'sections'
  const phasePollingRef = useRef(null);
  const generationTriggeredRef = useRef(false);

  const { user, logout } = useAuth();
  const { plan, canCreatePortfolio, refreshSubscription } = useSubscription();
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop', 'tablet', 'mobile'
  const [isPreviewCollapsed, setIsPreviewCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [copiedType, setCopiedType] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate(routes.home);
  };

  const handleCopyLink = (url, type) => {
    navigator.clipboard.writeText(url);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDeployLive = async () => {
    if (!canCreatePortfolio && project?.status !== 'Live') {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsDeploying(true);
    try {
      const res = await API.put(`/projects/${id}`, {
        status: 'Live'
      });
      if (res.data.success) {
        setProject(prev => ({
          ...prev,
          status: 'Live'
        }));
        setShowDeployModal(true);
        setNotification({
          type: 'success',
          message: 'Portfolio successfully deployed live!'
        });
        await refreshSubscription();
      }
    } catch (err) {
      console.error('Error deploying project:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to deploy live. Please try again.'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const downloadFile = (content, filename, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCode = async (e, projectId, title) => {
    e.preventDefault();
    e.stopPropagation();

    if (plan === 'free') {
      setIsUpgradeModalOpen(true);
      return;
    }

    setExportingId(projectId);
    try {
      const res = await API.get(`/projects/${projectId}/export`);
      if (res.data.success) {
        const { html, css, js } = res.data.data;
        const normalizedTitle = title.toLowerCase().replace(/\s+/g, '-');
        downloadFile(html, `${normalizedTitle}.html`, 'text/html');
        downloadFile(css, 'styles.css', 'text/css');
        downloadFile(js, 'script.js', 'text/javascript');
        setNotification({
          type: 'success',
          message: 'Source code files downloaded successfully!'
        });
      }
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to export source code.'
      });
    } finally {
      setExportingId(null);
    }
  };

  const handleShare = () => {
    if (project?.status !== 'Live') {
      if (window.confirm('Your project must be deployed live before you can share it. Deploy now?')) {
        handleDeployLive();
      }
      return;
    }
    setShowShareModal(true);
  };

  // Resizing state
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [editorWidth, setEditorWidth] = useState(500);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingSidebar) {
        const newWidth = e.clientX;
        if (newWidth > 250 && newWidth < 600) {
          setSidebarWidth(newWidth);
        }
      }
      if (isResizingEditor) {
        const newWidth = e.clientX - sidebarWidth;
        if (newWidth > 300 && newWidth < window.innerWidth - sidebarWidth - 300) {
          setEditorWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingEditor(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingSidebar || isResizingEditor) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingEditor, sidebarWidth]);

  // ─── Generation Phase Polling ─────────────────────────────────────────────
  // Polls GET /api/projects/:id/phase every 1.5s while generating.
  // Updates the cinematic preview loading UI phases.
  const startPhasePolling = useCallback(() => {
    if (phasePollingRef.current) clearInterval(phasePollingRef.current);
    phasePollingRef.current = setInterval(async () => {
      try {
        const res = await API.get(`/projects/${id}/phase`);
        if (res.data.success) {
          const phase = res.data.generationPhase;
          const code = res.data.generatedCode;
          
          setGenerationPhase(phase);

          // Update the intermediate code in the editor preview so the user sees it build in real-time
          if (code && (code.html || code.css || code.js)) {
            setProject(prev => {
              // Only update if something actually changed to avoid unnecessary iframe flickers
              if (
                prev?.generatedCode?.html !== code.html || 
                prev?.generatedCode?.css !== code.css || 
                prev?.generatedCode?.js !== code.js
              ) {
                return {
                  ...prev,
                  generatedCode: {
                    html: code.html || '',
                    css: code.css || '',
                    js: code.js || '',
                  }
                };
              }
              return prev;
            });
          }

          if (phase === 'done' || phase === 'error' || phase === null) {
            clearInterval(phasePollingRef.current);
            phasePollingRef.current = null;
          }
        }
      } catch {
        // Non-critical — silently ignore polling errors
      }
    }, 2000); // Poll every 2 seconds for a smoother phase transition without overloading the server
  }, [id]);

  const stopPhasePolling = useCallback(() => {
    if (phasePollingRef.current) {
      clearInterval(phasePollingRef.current);
      phasePollingRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopPhasePolling(), [stopPhasePolling]);

  const handleInitialGeneration = useCallback(async (projectData) => {
    setIsGenerating(true);
    setGenerationPhase('blueprint');
    setChatMessages([{
      role: 'assistant',
      content: `Hello ${projectData.content?.personalInfo?.name || 'there'}! I'm analyzing your profile and starting to build your portfolio right now. Hang tight...`
    }]);

    // Start polling the phase endpoint
    startPhasePolling();

    try {
      const res = await API.post('/ai/initialize-portfolio', {
        userData: projectData.content,
        targetRole: projectData.description,
        projectId: id,  // ← send projectId so server can write phases
      });

      if (res.data.success) {
        const { html, css, js, fullPreviewHtml } = res.data.data;

        setProject(prev => ({
          ...prev,
          generatedCode: { html, css, js },
          fullPreviewHtml: fullPreviewHtml || null,
          blueprint: res.data.blueprint || prev?.blueprint,
        }));

        setGenerationPhase('done');
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: "I've finished the first version of your portfolio! You can see it in the preview section. Use the \"Regenerate Section\" panel to fine-tune any section — or just chat with me for changes!"
        }]);

        setNotification({
          type: 'success',
          message: 'Portfolio generated successfully!'
        });
      }
    } catch (err) {
      console.error('Generation Error:', err);
      setGenerationPhase('error');
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to initialize portfolio. Please try again.';
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I ran into a bit of trouble generating your portfolio: ${errMsg}`
      }]);
      setNotification({
        type: 'error',
        message: errMsg
      });
    } finally {
      setIsGenerating(false);
      stopPhasePolling();
    }
  }, [id, startPhasePolling, stopPhasePolling]);


  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await API.get(`/projects/${id}`);
        if (res.data.success) {
          const projectData = res.data.data;
          setProject(projectData);

          // If project has no generated code yet, trigger initial generation (guard against React Strict Mode double-fire)
          if (!projectData.generatedCode || !projectData.generatedCode.html) {
            if (!generationTriggeredRef.current) {
              generationTriggeredRef.current = true;
              handleInitialGeneration(projectData);
            }
          } else {
            // Add initial welcome message
            setChatMessages([{
              role: 'assistant',
              content: `Welcome back, ${projectData.content?.personalInfo?.name || 'there'}! I've loaded your portfolio. What would you like to tweak today?`
            }]);
          }
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setNotification({
          type: 'error',
          message: 'Failed to load project details.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, handleInitialGeneration]);


  const getCombinedCode = () => {
    if (!project?.generatedCode?.html) return '';
    
    const getOrdinalSuffix = (num) => {
      const j = num % 10, k = num % 100;
      if (j === 1 && k !== 11) return 'st';
      if (j === 2 && k !== 12) return 'nd';
      if (j === 3 && k !== 13) return 'rd';
      return 'th';
    };

    let rawCode = '';
    // Prefer fullPreviewHtml from assembler (includes proper CDN injection)
    if (project.fullPreviewHtml) {
      rawCode = project.fullPreviewHtml;
    } else {
      // Fallback: manual assembly (legacy / modify-portfolio path)
      const { html, css, js } = project.generatedCode;
      rawCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <base href="/" target="_self" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@v2.15.1/devicon.min.css" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; padding: 0; }

    /* Custom Sleek Scrollbar */
    ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    ::-webkit-scrollbar-track {
      background: #0a0a0c;
    }
    ::-webkit-scrollbar-thumb {
      background: #2a2a2e;
      border-radius: 9999px;
      border: 2px solid #0a0a0c;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3e3e44;
    }
    /* Firefox Support */
    * {
      scrollbar-width: thin;
      scrollbar-color: #2a2a2e #0a0a0c;
    }

    ${css}
  </style>
</head>
<body>
  ${html}
  <script>(function(){'use strict'; ${js} })();<\/script>
</body>
</html>`;
    }

    // Inject dynamic real-time visitor counter
    if (project.views !== undefined) {
      const formattedViews = Number(project.views).toLocaleString();
      rawCode = rawCode.replace(
        /You are the <span class="font-bold text-zinc-100">30,037th<\/span> visitor/g,
        `You are the <span class="font-bold text-zinc-100">${formattedViews}${getOrdinalSuffix(project.views)}</span> visitor`
      );
    }

    // Dynamic absolute URL guarantee for social platforms (ensures https://www. prefix and standard slash endings)
    rawCode = rawCode.replace(/href=["'](?:https?:\/\/)?(?:www\.)?linkedin\.com\/([^\s"'<>]+)["']/gi, (match, path) => {
      const cleanPath = path.endsWith('/') ? path : path + '/';
      return `href="https://www.linkedin.com/${cleanPath}"`;
    });

    rawCode = rawCode.replace(/href=["'](?:https?:\/\/)?(?:www\.)?github\.com\/([^\s"'<>]+)["']/gi, (match, path) => {
      const cleanPath = path.replace(/\/$/, '');
      return `href="https://www.github.com/${cleanPath}"`;
    });

    rawCode = rawCode.replace(/href=["'](?:https?:\/\/)?(?:www\.)?leetcode\.com\/([^\s"'<>]+)["']/gi, (match, path) => {
      const cleanPath = path.replace(/\/$/, '');
      return `href="https://leetcode.com/${cleanPath}"`;
    });

    return rawCode;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);

    try {
      const res = await API.post('/ai/modify-portfolio', {
        projectId: id,
        prompt: chatInput,
        currentCode: project.generatedCode || { html: '', css: '', js: '' }
      });

      if (res.data.success) {
        const { explanation, code } = res.data.data;
        
        setProject(prev => ({
          ...prev,
          generatedCode: code,
          fullPreviewHtml: null, // Force fallback assembly until next full generation
        }));

        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: explanation
        }]);

        setNotification({
          type: 'success',
          message: 'Portfolio updated successfully!'
        });
      }
    } catch (err) {
      console.error('Error modifying portfolio:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update portfolio. Please try again.';
      setNotification({ type: 'error', message: errMsg });
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I couldn't complete the modification request because of this error: ${errMsg}`
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Called by SectionRegenerator when a section is successfully regenerated.
   * Updates the project state with the new code and fullPreviewHtml.
   */
  const handleSectionRegenerate = (updatedCode) => {
    setProject(prev => ({
      ...prev,
      generatedCode: {
        html: updatedCode.html || prev?.generatedCode?.html || '',
        css: updatedCode.css || prev?.generatedCode?.css || '',
        js: updatedCode.js || prev?.generatedCode?.js || '',
      },
      fullPreviewHtml: updatedCode.fullPreviewHtml || null,
    }));
    setNotification({ type: 'success', message: 'Section regenerated successfully!' });
  };

  const handleRename = async () => {
    const newTitle = window.prompt('Enter new project title:', project?.title);
    if (!newTitle || newTitle === project?.title) return;

    try {
      const res = await API.put(`/projects/${id}`, { title: newTitle });
      if (res.data.success) {
        setProject({ ...project, title: newTitle });
        setNotification({
          type: 'success',
          message: 'Project renamed successfully.'
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Failed to rename project.'
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
        <p className="text-gray-400 animate-pulse">Initializing workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0d] text-white overflow-hidden select-none">
      {notification && (
        <div className="fixed top-20 right-6 z-50">
          <Notification 
            type={notification.type} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        </div>
      )}

      {/* Editor Header */}
      <header className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold flex items-center gap-2 group">
              {project?.title || 'Untitled Project'}
              <button 
                onClick={handleRename}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-cyan-400 transition-all"
                title="Rename Project"
              >
                <Edit2 size={12} />
              </button>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">V1.2</span>
              <PlanBadge plan={plan} size="sm" />
            </span>
            <span className="text-[11px] text-gray-500">Auto-saved at {new Date(project?.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="hidden md:flex bg-[#111] p-1 rounded-lg border border-white/5">
          <button 
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'visual' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye size={14} /> Visual
          </button>
          <button 
            onClick={() => setViewMode('developer')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              viewMode === 'developer' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code2 size={14} /> Developer
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md text-sm border border-white/5 transition-colors"
          >
            <Share2 size={16} /> Share
          </button>
          <button 
            disabled={exportingId === id || isGenerating}
            onClick={(e) => handleExportCode(e, id, project?.title || 'portfolio')}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] rounded-md text-sm border border-white/5 transition-colors disabled:opacity-50"
            title={plan === 'free' ? 'Upgrade to Pro or Lifetime to export code' : 'Export HTML/CSS/JS source code'}
          >
            {exportingId === id ? (
              <Loader2 className="animate-spin" size={16} />
            ) : plan === 'free' ? (
              <>
                <Lock size={16} className="text-slate-400" /> Export Code
              </>
            ) : (
              <>
                <Download size={16} /> Export Code
              </>
            )}
          </button>
          <button 
            onClick={handleDeployLive}
            disabled={isDeploying || isGenerating}
            className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold rounded-md text-sm transition-all transform hover:scale-105"
          >
            {isDeploying ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Deploying...
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" /> Deploy Live
              </>
            )}
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          {user ? (
            <div className="relative font-sans" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 group p-1.5 pr-4 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-cyan-500/30"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 bg-gradient-to-br from-cyan-500 to-purple-600 flex-shrink-0">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => e.target.src = fallbackUser}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-[13px] font-semibold text-white group-hover:text-cyan-400 transition-colors">Profile</span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 group-hover:text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 mt-2 w-56 bg-[#0f0f0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 z-[60]"
                  >
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-1">
                      <Link 
                        to={routes.dashboard.replace(':username', `@${user?.username || 'user'}`)} 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link 
                        to={routes.settings} 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>

                    <div className="p-1 border-t border-white/5">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400">
              <Settings size={20} />
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: AI Chat + Section Regenerator */}
        <aside 
          style={(isPreviewCollapsed && viewMode === 'visual') ? {} : { width: `${sidebarWidth}px` }} 
          className={`border-r border-white/5 flex flex-col bg-[#0a0a0a] ${(isPreviewCollapsed && viewMode === 'visual') ? 'flex-1 w-full animate-in slide-in-from-right-4 duration-300' : 'shrink-0'}`}
        >
          {/* Sidebar Tab Bar */}
          <div className="p-3 border-b border-white/5">
            <div className={`flex items-center justify-between w-full ${isPreviewCollapsed ? 'max-w-4xl mx-auto px-4 md:px-8' : ''}`}>
              <div className="flex-1 flex bg-[#111] p-0.5 rounded-lg border border-white/5 gap-0.5 max-w-xs sm:max-w-md">
                <button
                  onClick={() => setSidebarTab('chat')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    sidebarTab === 'chat'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={11} /> AI Chat
                </button>
                <button
                  onClick={() => setSidebarTab('sections')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    sidebarTab === 'sections'
                      ? 'bg-violet-500 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <RefreshCw size={11} /> Sections
                </button>
              </div>
              {isPreviewCollapsed && (
                <button
                  onClick={() => setIsPreviewCollapsed(false)}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-black rounded-lg transition-colors flex items-center gap-1.5 text-[11px] font-bold shrink-0 shadow-lg shadow-cyan-500/20"
                  title="Show Preview Panel"
                >
                  <Eye size={12} /> Show Preview
                </button>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          {sidebarTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div className={`space-y-4 ${isPreviewCollapsed ? 'max-w-4xl mx-auto w-full px-4 md:px-8' : ''}`}>
                  {chatMessages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div 
                        className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] border shadow-sm transition-all duration-300 ${
                          msg.role === 'assistant' 
                            ? 'bg-[#141416]/50 border-white/5 text-gray-200 rounded-tl-sm' 
                            : 'bg-cyan-500 text-black border-cyan-400 font-medium rounded-tr-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse px-2">
                      <Loader2 size={12} className="animate-spin" />
                      AI is working...
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
                <div className={`w-full ${isPreviewCollapsed ? 'max-w-4xl mx-auto px-4 md:px-8' : ''}`}>
                  <div className="relative">
                    <textarea 
                      className="w-full bg-[#161618] border border-white/10 rounded-2xl p-4 pr-16 text-sm focus:outline-none focus:border-cyan-500/50 min-h-[80px] max-h-[200px] resize-none transition-all shadow-inner placeholder:text-gray-500"
                      placeholder={viewMode === 'visual' ? "Describe your vision..." : "Technical request..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={isGenerating || !chatInput.trim()}
                      className="absolute bottom-4 right-4 p-2.5 bg-cyan-500 rounded-xl text-black hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:bg-gray-800 disabled:text-gray-500 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 duration-200"
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Section Regenerator Panel */}
          {sidebarTab === 'sections' && (
            <div className={`flex-1 overflow-y-auto p-4 ${isPreviewCollapsed ? 'max-w-4xl mx-auto w-full px-4 md:px-8' : ''}`}>
              <SectionRegenerator
                projectId={id}
                onRegenerate={handleSectionRegenerate}
                disabled={isGenerating}
              />
            </div>
          )}
        </aside>

        {/* Sidebar Resizer Divider */}
        {(!isPreviewCollapsed || viewMode === 'developer') && (
          <div 
            onMouseDown={() => setIsResizingSidebar(true)}
            className={`w-1 hover:w-1.5 bg-transparent hover:bg-cyan-500/50 cursor-col-resize transition-all z-20 flex items-center justify-center group ${isResizingSidebar ? 'bg-cyan-500/50 w-1.5' : ''}`}
          >
            <div className="hidden group-hover:block text-cyan-400/50"><GripVertical size={12} /></div>
          </div>
        )}

        {/* Center: Editor Pane (Hidden in Visual Mode or when Preview is Collapsed) */}
        {viewMode === 'developer' && (
          <>
            <main 
              style={isPreviewCollapsed ? {} : { width: `${editorWidth}px` }} 
              className={`flex flex-col border-r border-white/5 bg-[#0a0a0a] animate-in fade-in slide-in-from-left-4 duration-300 ${isPreviewCollapsed ? 'flex-1 w-full' : 'shrink-0'}`}
            >
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
              <div className="flex-1 font-mono text-sm p-4 overflow-auto bg-[#0d0d0d] custom-scrollbar">
                  <pre className="text-cyan-400/80 whitespace-pre-wrap selection:bg-cyan-500/20">
                    {project?.generatedCode?.[activeTab] || `// No ${activeTab.toUpperCase()} code yet.`}
                  </pre>
              </div>
              <div className="h-8 bg-[#0a0a0a] border-t border-white/5 flex items-center px-4 justify-between text-[10px] text-gray-500 uppercase tracking-widest">
                <span>Ln 1, Col 1</span>
                <div className="flex items-center gap-4">
                  <span>UTF-8</span>
                  <span>{activeTab === 'js' ? 'Javascript' : activeTab.toUpperCase()}</span>
                </div>
              </div>
            </main>

            {/* Editor Resizer Divider */}
            {!isPreviewCollapsed && (
              <div 
                onMouseDown={() => setIsResizingEditor(true)}
                className={`w-1 hover:w-1.5 bg-transparent hover:bg-cyan-500/50 cursor-col-resize transition-all z-20 flex items-center justify-center group ${isResizingEditor ? 'bg-cyan-500/50 w-1.5' : ''}`}
              >
                <div className="hidden group-hover:block text-cyan-400/50"><GripVertical size={12} /></div>
              </div>
            )}
          </>
        )}

        {/* Right: Live Preview */}
        {!isPreviewCollapsed && (
          <section className="flex-1 bg-white flex flex-col min-w-[200px]">
            <div className="h-10 bg-[#0f0f0f] border-b border-white/5 flex items-center justify-between px-4">
               <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                 <Eye size={14} /> Preview
               </div>
               
               {/* Device controls bar */}
               <div className="flex items-center bg-[#161618] px-2 py-0.5 rounded-lg border border-white/5 gap-1">
                 <button 
                   onClick={() => setDeviceMode('desktop')}
                   className={`p-1.5 rounded transition-all ${deviceMode === 'desktop' ? 'bg-cyan-500 text-black shadow' : 'text-gray-500 hover:text-white'}`}
                   title="Desktop View"
                 >
                   <Monitor size={14} />
                 </button>
                 <button 
                   onClick={() => setDeviceMode('tablet')}
                   className={`p-1.5 rounded transition-all ${deviceMode === 'tablet' ? 'bg-cyan-500 text-black shadow' : 'text-gray-500 hover:text-white'}`}
                   title="Tablet View"
                 >
                   <Tablet size={14} />
                 </button>
                 <button 
                   onClick={() => setDeviceMode('mobile')}
                   className={`p-1.5 rounded transition-all ${deviceMode === 'mobile' ? 'bg-cyan-500 text-black shadow' : 'text-gray-500 hover:text-white'}`}
                   title="Mobile View"
                 >
                   <Smartphone size={14} />
                 </button>
                 <div className="w-px h-4 bg-white/10 mx-1" />
                 <a 
                   href={user?.username && project?.slug ? `/u/${user.username}/${project.slug}` : `/portfolio/${project?._id}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="p-1.5 rounded text-gray-500 hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter"
                   title="View Full Screen Site"
                 >
                   <Maximize2 size={12} /> Live Site
                 </a>
               </div>

               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setIsPreviewCollapsed(true)}
                   className="p-1 hover:bg-white/5 rounded transition-colors text-gray-400 hover:text-white"
                   title="Collapse Preview Panel"
                 >
                   <PanelRightClose size={16} />
                 </button>
               </div>
            </div>
            <div className="flex-1 relative overflow-auto bg-[#141416] flex items-center justify-center">
                {project?.generatedCode?.html ? (
                  <>
                    {deviceMode === 'desktop' ? (
                      <iframe 
                        key={JSON.stringify(project.generatedCode)}
                        title="Portfolio Preview"
                        srcDoc={getCombinedCode()}
                        className={`w-full h-full border-none bg-white ${(isResizingSidebar || isResizingEditor) ? 'pointer-events-none' : ''}`}
                        sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                      />
                    ) : deviceMode === 'tablet' ? (
                      /* Tablet Mockup Container */
                      <div className="w-[768px] h-[95%] max-h-[800px] border-[12px] border-[#2a2a2c] rounded-[32px] bg-white shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300 transform scale-95 md:scale-100 origin-center animate-in zoom-in-95">
                        {/* Tablet speaker mockup */}
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-1 bg-[#444] rounded-full z-30" />
                        <iframe 
                          key={JSON.stringify(project.generatedCode)}
                          title="Portfolio Preview"
                          srcDoc={getCombinedCode()}
                          className={`w-full h-full border-none bg-white ${(isResizingSidebar || isResizingEditor) ? 'pointer-events-none' : ''}`}
                          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                      </div>
                    ) : (
                      /* Mobile Mockup Container */
                      <div className="w-[375px] h-[667px] border-[14px] border-[#2a2a2c] border-t-[24px] border-b-[24px] rounded-[44px] bg-white shadow-2xl flex flex-col relative overflow-hidden transition-all duration-300 animate-in zoom-in-95">
                        {/* Mobile speaker and camera mockup */}
                        <div className="absolute top-[-14px] left-1/2 -translate-x-1/2 w-28 h-4 bg-[#2a2a2c] rounded-b-xl z-30 flex items-center justify-center">
                          <div className="w-12 h-1 bg-[#111] rounded-full" />
                          <div className="w-2.5 h-2.5 bg-[#1a1a1a] rounded-full ml-3 border border-gray-800" />
                        </div>
                        {/* Mobile home indicator mockup */}
                        <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-28 h-1 bg-[#444] rounded-full z-30" />
                        <iframe 
                          key={JSON.stringify(project.generatedCode)}
                          title="Portfolio Preview"
                          srcDoc={getCombinedCode()}
                          className={`w-full h-full border-none bg-white ${(isResizingSidebar || isResizingEditor) ? 'pointer-events-none' : ''}`}
                          sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                      </div>
                    )}

                    {/* Progressive Build HUD HUD Overlay */}
                    {isGenerating && (
                      <div className="absolute bottom-6 right-6 bg-[#0f0f11]/90 backdrop-blur-md border border-cyan-500/20 text-cyan-400 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 font-bold font-mono tracking-wide animate-pulse z-30 select-none">
                        <Loader2 size={12} className="animate-spin text-cyan-500" />
                        <span className="uppercase text-[10px] tracking-widest">
                          {generationPhase === 'blueprint' ? '🧠 Structuring Profile Blueprint...' : 
                           generationPhase === 'design-interactions' ? '⚙️ Compiling Developer Assets...' : 
                           generationPhase === 'assembling' ? '📦 Final Assembly...' : 
                           '⚙️ Compiling Portfolio...'}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                 <CinematicPreviewLoader isGenerating={isGenerating} phase={generationPhase} />
               )}
            </div>
          </section>
        )}

      </div>

      {/* Deploy Success Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#0c0c0f] border border-white/10 p-8 rounded-3xl max-w-xl w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-white">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <button 
              onClick={() => setShowDeployModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Sparkles size={32} className="animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold font-heading mb-2">Your Portfolio is Live!</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Congratulations! Your AI-customized professional portfolio has been successfully published. It is now accessible globally.
            </p>

            <div className="space-y-4 mb-8">
              {/* Absolute project URL */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Project Live URL</span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-cyan-400 text-sm font-mono truncate select-all">{`${window.location.origin}/u/${user?.username}/${project?.slug}`}</span>
                  <button 
                    onClick={() => handleCopyLink(`${window.location.origin}/u/${user?.username}/${project?.slug}`, 'live')}
                    className="p-2 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-lg transition-all flex items-center gap-1.5 text-xs text-white"
                  >
                    {copiedType === 'live' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedType === 'live' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Short Username default URL */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Short Profile URL (Points to latest live project)</span>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-purple-400 text-sm font-mono truncate select-all">{`${window.location.origin}/u/${user?.username}`}</span>
                  <button 
                    onClick={() => handleCopyLink(`${window.location.origin}/u/${user?.username}`, 'short')}
                    className="p-2 bg-white/5 hover:bg-purple-500 hover:text-black rounded-lg transition-all flex items-center gap-1.5 text-xs text-white"
                  >
                    {copiedType === 'short' ? <Check size={14} /> : <Copy size={14} />}
                    {copiedType === 'short' ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeployModal(false)}
                className="flex-1 px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Done
              </button>
              <a 
                href={user?.username && project?.slug ? `/u/${user.username}/${project.slug}` : `/portfolio/${project?._id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-all text-center flex items-center justify-center gap-2"
              >
                Visit Live Site <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-[#0c0c0f] border border-white/10 p-8 rounded-3xl max-w-md w-full relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 text-white">
            
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold font-heading mb-4 text-white">Share Portfolio</h2>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">
              Your portfolio is deployed live. Copy the link below to share your modern, responsive resume on LinkedIn, GitHub, or emails.
            </p>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-left mb-6">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Live URL</span>
              <div className="flex items-center justify-between gap-3">
                <span className="text-cyan-400 text-sm font-mono truncate select-all">{`${window.location.origin}/u/${user?.username}/${project?.slug}`}</span>
                <button 
                  onClick={() => handleCopyLink(`${window.location.origin}/u/${user?.username}/${project?.slug}`, 'live')}
                  className="p-2 bg-white/5 hover:bg-cyan-500 hover:text-black rounded-lg transition-all flex items-center gap-1.5 text-xs text-white"
                >
                  {copiedType === 'live' ? <Check size={14} /> : <Copy size={14} />}
                  {copiedType === 'live' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowShareModal(false)}
              className="w-full px-6 py-3 bg-white text-black font-bold rounded-xl text-sm hover:bg-cyan-400 hover:text-white transition-all text-center"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade to Publish"
        message="To publish this portfolio live, please upgrade to a paid plan. The Free plan only supports 1 live portfolio."
      />
    </div>
  );
};

export default Editor;
