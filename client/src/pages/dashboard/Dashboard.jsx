import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import routes from '../../routes';
import { LayoutGrid, Plus, ExternalLink, Clock, Loader2, Trash2, Edit2 } from 'lucide-react';
import Notification from '../../components/common/Notification';
import { useAuth } from '../../context/AuthContext';
import API from '../../apis/api';

const Dashboard = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Normalize username (handle @ prefix)
  const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
  const isOwner = user && cleanUsername === user?.username;

  // Check for success messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
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
  }, []);

  const handleCreateProject = () => {
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
    } catch (err) {
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
      setNotification({
        type: 'error',
        message: 'Failed to rename project.'
      });
    }
  };

  // If the username in URL doesn't match logged in user, maybe show a "View Only" mode later
  // For now, let's just show their own dashboard if they are authorized
  
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
            {projects.map((project) => (
              <div key={project._id} className="group relative">
                <Link
                  to={routes.project.index.replace(':id', project._id)}
                  className="bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer block"
                >
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
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors truncate pr-2">
                        {project.title}
                      </h3>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${
                        project.status === 'Live' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'
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
                      {project.status === 'Live' ? (
                        <a 
                          href={`/u/${user?.username}/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 hover:text-cyan-400 text-cyan-500 font-bold transition-colors"
                        >
                          <ExternalLink size={14} />
                          Live Site
                        </a>
                      ) : (
                        <div className="flex items-center gap-1 text-yellow-500/80 font-semibold text-xs">
                          Draft
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
