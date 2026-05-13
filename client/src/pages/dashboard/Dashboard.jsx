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
    // Strip leading @ if present for comparison
    const cleanUsername = username?.startsWith('@') ? username.slice(1) : username;
    
    if (user && cleanUsername && user.username !== cleanUsername) {
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-heading font-bold gradient-text mb-2">
            {username === user?.username ? 'My Projects' : `${username}'s Projects`}
          </h1>
          <p className="text-gray-400">Manage and iterate on your AI-generated portfolios.</p>
        </div>
        
        {username === user?.username && (
          <button 
            onClick={handleCreateProject}
            disabled={isCreating}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 text-black font-bold py-2.5 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            {isCreating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            Create New Project
          </button>
        )}
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
          <button 
            onClick={handleCreateProject}
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
          >
            <Plus size={20} />
            Get Started
          </button>
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
                  
                  {/* Actions overlay (only show on hover) */}
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
                    <div className="flex items-center gap-1 hover:text-white transition-colors">
                      <ExternalLink size={14} />
                      Preview
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
