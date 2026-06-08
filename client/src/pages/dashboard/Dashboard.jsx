import { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import routes from '../../routes';
import { LayoutGrid, Plus, ExternalLink, Clock, Loader2, Trash2, Edit2, Download, Lock, RefreshCw } from 'lucide-react';
import Notification from '../../components/common/Notification';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import PlanBadge from '../../components/common/PlanBadge';
import UpgradeModal from '../../components/common/UpgradeModal';
import API from '../../apis/api';

const Dashboard = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { plan, limits, usage, canCreatePortfolio, refreshSubscription } = useSubscription();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [reactivatingId, setReactivatingId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  // Normalize username (handle @ prefix)
  const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
  const isOwner = user && cleanUsername === user?.username;

  // Check for success messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotification({
        type: location.state.type || 'success',
        message: location.state.message
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Fetch projects and validate username
  useEffect(() => {
    if (user && cleanUsername && !isOwner) {
      navigate(routes.dashboard.replace(':username', `@${user.username}`), { replace: true });
      return;
    }

    const fetchProjects = async () => {
      try {
        const res = await API.get('/projects');
        if (res.data.success) {
          setProjects(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setNotification({
          type: 'error',
          message: 'Failed to load your projects. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    refreshSubscription();
  }, [cleanUsername, user, isOwner, navigate, refreshSubscription]);

  const handleCreateProject = () => {
    if (!canCreatePortfolio) {
      setIsUpgradeModalOpen(true);
      return;
    }
    navigate(routes.project.new);
  };

  const handleDeleteProject = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
      setNotification({
        type: 'success',
        message: 'Project deleted successfully.'
      });
      refreshSubscription();
    } catch (err) {
      console.error('[deleteProject] Error:', err);
      setNotification({
        type: 'error',
        message: 'Failed to delete project.'
      });
    }
  };

  const handleRenameProject = async (e, id, currentTitle) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newTitle = window.prompt('Enter new project title:', currentTitle);
    if (!newTitle || newTitle === currentTitle) return;

    try {
      const res = await API.put(`/projects/${id}`, { title: newTitle });
      if (res.data.success) {
        setProjects(projects.map(p => p._id === id ? { ...p, title: newTitle } : p));
        setNotification({
          type: 'success',
          message: 'Project renamed successfully.'
        });
      }
    } catch (err) {
      console.error('[renameProject] Error:', err);
      setNotification({
        type: 'error',
        message: 'Failed to rename project.'
      });
    }
  };

  const handleReactivateProject = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canCreatePortfolio) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setReactivatingId(id);
    try {
      const res = await API.put(`/projects/${id}`, { status: 'Live' });
      if (res.data.success) {
        setProjects(projects.map(p => p._id === id ? { ...p, status: 'Live', archivedReason: null, archivedAt: null } : p));
        setNotification({
          type: 'success',
          message: 'Portfolio reactivated successfully!'
        });
        await refreshSubscription();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to reactivate portfolio.'
      });
    } finally {
      setReactivatingId(null);
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
      setExportingId(false);
    }
  };

  const getRemainingDays = (expiryDate) => {
    if (!expiryDate) return null;
    const diffTime = new Date(expiryDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Compute total/max for progress bar
  // Use Math.max to prevent desync if subscription endpoint fails while projects endpoint succeeds
  const totalCount = Math.max(usage?.totalPortfolios || 0, projects.length);
  const maxAllowed = limits?.maxPortfolios || 1;
  const percentage = maxAllowed === Infinity ? 0 : Math.min(100, (totalCount / maxAllowed) * 100);

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto min-h-screen bg-[#0a0a0a] text-white">
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
          className="mb-8"
        />
      )}

      {/* Subscription / Plan Banner */}
      {isOwner && (
        <div className="mb-8 p-5 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-500">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-slate-300">Your Current Plan:</span>
              <PlanBadge plan={plan} size="sm" />
            </div>
            
            {plan === 'free' && (
              <p className="text-slate-400 text-xs">
                Free plan is limited to 1 portfolio in total, hosted for 7 days. Upgrade to Pro or Lifetime to build more and export source code!
              </p>
            )}
            {plan === 'pro' && (
              <p className="text-slate-400 text-xs">
                Pro subscription allows up to 5 portfolios in total, with hosting active while subscribed.
              </p>
            )}
            {plan === 'lifetime' && (
              <p className="text-slate-400 text-xs">
                Lifetime Plan grants you unlimited portfolios, permanent hosting, and source code export forever!
              </p>
            )}

            {/* Progress bar */}
            {plan !== 'lifetime' && maxAllowed !== Infinity && (
              <div className="mt-4 max-w-md">
                <div className="flex justify-between text-[10px] font-mono uppercase text-slate-500 mb-1">
                  <span>Usage Limits</span>
                  <span>{totalCount} / {maxAllowed} Portfolios Created</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )}

            {plan === 'lifetime' && (
              <div className="mt-3 max-w-md flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
                <span>✨ Enjoy your Lifetime plan with absolutely no constraints!</span>
              </div>
            )}
          </div>

          {plan !== 'lifetime' && (
            <button
              onClick={() => setIsUpgradeModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:from-cyan-400 hover:to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] shrink-0 transition"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      )}

      <div className="mb-10">
        <h1 className="text-3xl font-heading font-bold gradient-text mb-2">
          {isOwner ? 'My Workspace' : `${cleanUsername}'s Workspace`}
        </h1>
        <p className="text-gray-400">Manage and iterate on your AI-generated portfolios.</p>
      </div>

      {/* Top Creation Section */}
      {isOwner && (
        <section className="mb-16">
          <button 
            onClick={handleCreateProject}
            className="w-full bg-[#0c0c0c] border border-dashed border-white/10 rounded-2xl p-10 group hover:border-cyan-500/50 hover:bg-[#111] transition-all flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-cyan-500/10 transition-all group-hover:rotate-6">
                <Plus className="text-gray-500 group-hover:text-cyan-400 transition-colors" size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">Create a New Portfolio</h2>
                <p className="text-gray-500 max-w-md">Start a fresh project and let our AI generate a stunning professional portfolio for you in seconds.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-20px] group-hover:translate-x-0 pr-8">
              Get Started <ExternalLink size={18} />
            </div>
          </button>
        </section>
      )}

      {/* Existing Projects Section */}
      <section>
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-xl font-bold text-white/80">Your Past Creations</h2>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-[#111] border border-dashed border-white/10 rounded-2xl">
            <LayoutGrid className="mx-auto text-gray-700 mb-4" size={48} />
            <h2 className="text-xl font-bold mb-2">No projects found</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              It looks like you haven't created any portfolios yet. Let's start with a fresh one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const remainingDays = getRemainingDays(project.hostingExpiresAt);
              return (
                <div key={project._id} className="group relative">
                  <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer block">
                    <Link to={routes.project.index.replace(':id', project._id)}>
                      <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center border-b border-white/5 relative">
                        {project.thumbnail ? (
                          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
                        ) : (
                          <LayoutGrid className="text-white/10 w-12 h-12 group-hover:text-cyan-500/20 transition-colors" />
                        )}
                        
                        {/* Actions overlay */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleRenameProject(e, project._id, project.title)}
                            className="p-2 bg-black/60 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                            title="Rename Project"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteProject(e, project._id)}
                            className="p-2 bg-black/60 hover:bg-red-500 text-white rounded-lg transition-colors"
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Export Code overlay (for Live portfolios) */}
                        {project.status === 'Live' && (
                          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              disabled={exportingId === project._id}
                              onClick={(e) => handleExportCode(e, project._id, project.title)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/75 hover:bg-cyan-500 text-white hover:text-black text-xs font-mono rounded-lg transition-colors border border-white/10 font-bold"
                              title={plan === 'free' ? 'Upgrade to export source code' : 'Export Source Code'}
                            >
                              {exportingId === project._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : plan === 'free' ? (
                                <>
                                  <Lock size={12} className="text-slate-400" /> Code Export
                                </>
                              ) : (
                                <>
                                  <Download size={12} /> Export Code
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </Link>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <Link to={routes.project.index.replace(':id', project._id)} className="flex-1 min-w-0 pr-2">
                          <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors truncate">
                            {project.title}
                          </h3>
                        </Link>
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                          project.status === 'Live' 
                            ? 'border-green-500/50 text-green-400' 
                            : project.status === 'Archived'
                              ? 'border-red-500/50 text-red-400 bg-red-950/20'
                              : 'border-yellow-500/50 text-yellow-400'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(project.updatedAt).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        
                        {project.status === 'Live' && (
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <a 
                              href={`/u/${user?.username}/${project.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-cyan-400 text-cyan-500 font-bold transition-colors"
                            >
                              <ExternalLink size={14} />
                              Live Site
                            </a>
                            {remainingDays !== null && (
                              <span className={`text-[10px] font-semibold font-mono ${remainingDays <= 2 ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                                Expires in {remainingDays} day{remainingDays !== 1 && 's'}
                              </span>
                            )}
                          </div>
                        )}

                        {project.status === 'Archived' && (
                          <button
                            disabled={reactivatingId === project._id}
                            onClick={(e) => handleReactivateProject(e, project._id)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black font-semibold text-xs text-cyan-400 rounded-lg transition-all"
                          >
                            {reactivatingId === project._id ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : (
                              <>
                                <RefreshCw size={12} /> Reactivate
                              </>
                            )}
                          </button>
                        )}

                        {project.status === 'Draft' && (
                          <div className="flex items-center gap-1 text-yellow-500/80 font-semibold text-xs">
                            Draft
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Upgrade Modal Dialog */}
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Upgrade Your Plan"
        message="To build more active portfolios, keep hosting permanently, and unlock full source code export, choose one of our paid plans below."
      />
    </div>
  );
};

export default Dashboard;
