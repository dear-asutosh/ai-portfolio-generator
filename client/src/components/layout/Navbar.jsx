import { Link } from 'react-router-dom';
import routes from '../../routes';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="w-full fixed top-0 z-50 bg-[#000000ec] border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left */}
        <Link to={routes.home} className="flex items-center gap-3">
          <img src={logo} alt="Profilio Logo" className="w-8 h-8 object-contain" />
          <span className="font-heading font-extrabold text-2xl gradient-text">
            Profilio
          </span>
          <span className="font-mono text-[12px] border border-[rgba(255,255,255,0.08)] px-2 py-0.5 rounded-full">
            v1.0 ✦
          </span>
        </Link>

        {/* Center */}
        <div className="hidden md:flex items-center gap-8 text-md ">
          <Link to="/#features" className="hover:text-cyan-400 transition-colors">Features</Link>
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <Link to={routes.templates} className="hover:text-cyan-400 transition-colors">Templates</Link>
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <Link to="/#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link>
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <Link to={routes.pricing} className="hover:text-cyan-400 transition-colors">Pricing</Link>
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <Link to={routes.docs} className="hover:text-cyan-400 transition-colors">Docs</Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted hover:text-white transition-colors">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
          
          {user ? (
            <div className="flex items-center gap-4">
              <Link to={routes.dashboard} className="text-white hover:text-cyan-400 transition-colors font-medium">Dashboard</Link>
              <button 
                onClick={logout}
                className="text-gray-400 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to={routes.auth.login} className="text-white px-4 py-1.5 rounded-[6px] text-md tracking-wide font-semibold border border-white border-dashed hover:scale-105  transition-transform">
              Start Free →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
