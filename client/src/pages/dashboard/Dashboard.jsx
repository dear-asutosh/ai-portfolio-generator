import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../../routes';
import { LayoutGrid, Plus, ExternalLink, Clock } from 'lucide-react';
import Notification from '../../components/common/Notification';

const Dashboard = () => {
  const location = useLocation();
  const [notification, setNotification] = useState(null);

  // Check for success messages from navigation state (e.g. from signup/login)
  useEffect(() => {
    if (location.state?.message) {
      setNotification({
        type: location.state.type || 'success',
        message: location.state.message
      });
      
      // Clear the state to prevent notification from reappearing on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Mock data for projects
  const projects = [
    { id: '1', title: 'Creative Developer Portfolio', lastModified: '2 hours ago', status: 'Live' },
    { id: '2', title: 'Minimalist Photography Site', lastModified: '1 day ago', status: 'Draft' },
    { id: '3', title: 'AI Engineer Resume', lastModified: '3 days ago', status: 'Live' },
  ];

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

      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-heading font-bold gradient-text mb-2">My Projects</h1>
          <p className="text-gray-400">Manage and iterate on your AI-generated portfolios.</p>
        </div>
        <Link to={routes.project.new} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-2.5 px-6 rounded-lg transition-all transform hover:scale-105">
          <Plus size={20} />
          Create New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link
            to={routes.project.index.replace(':id', project.id)}
            key={project.id}
            className="group relative bg-[#111] border border-white/5 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer block"
          >
            <div className="aspect-video bg-[#1a1a1a] flex items-center justify-center border-b border-white/5">
              <LayoutGrid className="text-white/10 w-12 h-12 group-hover:text-cyan-500/20 transition-colors" />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${project.status === 'Live' ? 'border-green-500/50 text-green-400' : 'border-yellow-500/50 text-yellow-400'
                  }`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {project.lastModified}
                </div>
                <div className="flex items-center gap-1 hover:text-white transition-colors">
                  <ExternalLink size={14} />
                  Preview
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
