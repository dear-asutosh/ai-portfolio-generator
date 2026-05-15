import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import API from '../../apis/api';
import Notification from '../../components/common/Notification';

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

  const handleInitialGeneration = useCallback(async (projectData) => {
    setIsGenerating(true);
    setChatMessages([{
      role: 'assistant',
      content: `Hello ${projectData.content?.personalInfo?.name || 'there'}! I'm analyzing your profile and starting to build your portfolio right now. Hang tight...`
    }]);

    try {
      const res = await API.post('/ai/initialize-portfolio', {
        userData: projectData.content,
        targetRole: projectData.description
      });

      if (res.data.success) {
        const { html, css, js } = res.data.data;
        
        // Save the generated code to the project
        await API.put(`/projects/${id}`, {
          generatedCode: { html, css, js }
        });

        setProject(prev => ({
          ...prev,
          generatedCode: { html, css, js }
        }));

        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: "I've finished the first version of your portfolio! You can see it in the preview section. How does it look?"
        }]);

        setNotification({
          type: 'success',
          message: 'Portfolio initialized successfully!'
        });
      }
    } catch (err) {
      console.error('Generation Error:', err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: "I ran into a bit of trouble generating your portfolio. Could you try refreshing or sending me a message?"
      }]);
    } finally {
      setIsGenerating(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await API.get(`/projects/${id}`);
        if (res.data.success) {
          const projectData = res.data.data;
          setProject(projectData);

          // If project has content but no code yet, trigger initial generation
          if (projectData.content && Object.keys(projectData.content).length > 0 && 
              (!projectData.generatedCode || !projectData.generatedCode.html)) {
            handleInitialGeneration(projectData);
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
    const { html, css, js } = project.generatedCode;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: sans-serif; }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsGenerating(true);

    try {
      const res = await API.post('/ai/suggest', {
        currentData: project.content,
        prompt: chatInput
      });

      if (res.data.success) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.suggestion
        }]);
      }
    } catch {
      setNotification({ type: 'error', message: 'AI failed to respond.' });
    } finally {
      setIsGenerating(false);
    }
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
        
        {/* Left Sidebar: AI Chat */}
        <aside 
          style={{ width: `${sidebarWidth}px` }} 
          className="border-r border-white/5 flex flex-col bg-[#0a0a0a] shrink-0"
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Sparkles size={16} className="text-cyan-400" />
              AI Assistant
            </div>
            <PanelLeftClose size={18} className="text-gray-500 cursor-pointer hover:text-white" />
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-xl text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  msg.role === 'assistant' 
                    ? 'bg-[#111] border border-white/5 text-gray-300' 
                    : 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-100 ml-4'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse px-2">
                <Loader2 size={12} className="animate-spin" />
                AI is working...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="relative">
              <textarea 
                className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 pt-4 text-sm focus:outline-none focus:border-cyan-500/50 min-h-[100px] resize-none transition-colors"
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
                className="absolute bottom-3 right-3 p-2 bg-cyan-500 rounded-lg text-black hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:bg-gray-800 disabled:text-gray-500"
              >
                <Sparkles size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar Resizer Divider */}
        <div 
          onMouseDown={() => setIsResizingSidebar(true)}
          className={`w-1 hover:w-1.5 bg-transparent hover:bg-cyan-500/50 cursor-col-resize transition-all z-20 flex items-center justify-center group ${isResizingSidebar ? 'bg-cyan-500/50 w-1.5' : ''}`}
        >
          <div className="hidden group-hover:block text-cyan-400/50"><GripVertical size={12} /></div>
        </div>

        {/* Center: Editor Pane (Hidden in Visual Mode) */}
        {viewMode === 'developer' && (
          <>
            <main 
              style={{ width: `${editorWidth}px` }} 
              className="flex flex-col border-r border-white/5 shrink-0 animate-in fade-in slide-in-from-left-4 duration-300 bg-[#0a0a0a]"
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
            <div 
              onMouseDown={() => setIsResizingEditor(true)}
              className={`w-1 hover:w-1.5 bg-transparent hover:bg-cyan-500/50 cursor-col-resize transition-all z-20 flex items-center justify-center group ${isResizingEditor ? 'bg-cyan-500/50 w-1.5' : ''}`}
            >
              <div className="hidden group-hover:block text-cyan-400/50"><GripVertical size={12} /></div>
            </div>
          </>
        )}

        {/* Right: Live Preview */}
        <section className="flex-1 bg-white flex flex-col min-w-[200px]">
          <div className="h-10 bg-[#0f0f0f] border-b border-white/5 flex items-center justify-between px-4">
             <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
               <Eye size={14} /> {viewMode === 'visual' ? 'Your Live Portfolio' : 'Preview'}
             </div>
             <div className="flex items-center gap-3">
               <PanelRightClose size={16} className="text-gray-500 cursor-pointer hover:text-white" />
             </div>
          </div>
          <div className="flex-1 relative overflow-hidden bg-white">
              {project?.generatedCode?.html ? (
                <iframe 
                  key={JSON.stringify(project.generatedCode)}
                  title="Portfolio Preview"
                  srcDoc={getCombinedCode()}
                  className={`w-full h-full border-none bg-white ${(isResizingSidebar || isResizingEditor) ? 'pointer-events-none' : ''}`}
                  sandbox="allow-scripts"
                />
              ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-[#0a0a0a]">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 shadow-2xl">
                    {isGenerating ? <Loader2 className="animate-spin text-cyan-400" size={32} /> : <LayoutGrid className="text-gray-600" size={32} />}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {isGenerating ? 'Building your portfolio...' : 'Portfolio Preview'}
                  </h3>
                  <p className="max-w-xs text-sm text-gray-500 leading-relaxed">
                    {isGenerating ? 'Our AI is analyzing your profile and writing modern HTML/CSS/JS for your professional portfolio.' : 'Your portfolio will appear here as soon as you analyze your resume.'}
                  </p>
                  {isGenerating && (
                    <div className="mt-8 w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 animate-[progress_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
                    </div>
                  )}
               </div>
             )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Editor;
