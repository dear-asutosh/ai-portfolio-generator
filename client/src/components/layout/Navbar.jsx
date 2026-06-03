import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import routes from '../../routes';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';
import fallbackUser from '../../assets/images/fallback-user.png';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import PlanBadge from '../common/PlanBadge';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { plan } = useSubscription();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  return (
    <nav className="w-full fixed top-0 z-50 bg-[#000000ec] border-b border-[rgba(255,255,255,0.06)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left */}
        <Link to={routes.home} className="flex items-center gap-3">
          <img src={logo} alt="Profilio Logo" className="w-8 h-8 object-contain" />
          <span className="font-heading font-extrabold text-2xl gradient-text">
            Profilio
          </span>
          <span className="font-mono text-[10px] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-full text-gray-400">
            v1.0 ✦
          </span>
        </Link>

        {/* Center */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to={routes.features} className="text-gray-300 hover:text-white transition-colors">Features</Link>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <Link to={routes.howItWorks} className="text-gray-300 hover:text-white transition-colors">How It Works</Link>
          <div className="w-1 h-1 rounded-full bg-white/20"></div>
          <Link to={routes.pricing} className="text-gray-300 hover:text-white transition-colors">Pricing</Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-6">
          <a href="https://github.com/dear-asutosh/ai-portfolio-generator" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
          
          {user ? (
            <div className="relative" ref={dropdownRef}>
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
                    <div className="px-4 py-3 border-b border-white/5 flex flex-col gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-500 truncate max-w-[100px]">{user.email}</span>
                        <PlanBadge plan={plan} size="sm" />
                      </div>
                    </div>

                    <div className="p-1">
                      {user?.role === 'admin' && (
                        <Link 
                          to={routes.admin} 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-cyan-400 hover:text-white hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/10 mb-1"
                        >
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          Admin Panel
                        </Link>
                      )}
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
            <Link to={routes.auth.login} className="relative inline-flex items-center justify-center px-5 py-2 overflow-hidden font-semibold text-white transition-all bg-white/5 rounded-full border border-white/10 hover:bg-white/10 group">
              <span className="relative">Start Free →</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
