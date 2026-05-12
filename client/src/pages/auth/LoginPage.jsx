import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import routes from '../../routes';
import { Sparkles, ArrowRight, Mail } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where the user was trying to go, or dashboard
  const from = location.state?.from?.pathname || routes.dashboard;

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    login({ email, name: email.split('@')[0] });
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient background effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px]" />

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-xl mb-4 border border-cyan-500/20">
              <Sparkles className="text-cyan-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue building your AI portfolio.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="asutosh@example.com"
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-gray-600 relative z-10">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] uppercase tracking-widest">Or continue with</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <button className="bg-[#1a1a1a] hover:bg-[#222] border border-white/5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </button>
            <button className="bg-[#1a1a1a] hover:bg-[#222] border border-white/5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors">
              <Mail size={18} /> Google
            </button>
          </div>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account? <span className="text-cyan-400 cursor-pointer hover:underline">Sign up for free</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
