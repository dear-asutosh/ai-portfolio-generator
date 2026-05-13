import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import routes from '../../routes';
import { Sparkles, ArrowRight, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Notification from '../../components/common/Notification';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to where the user was trying to go, or dashboard
  const from = location.state?.from?.pathname || routes.dashboard;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // Humanized Client-Side Validation
    if (!email || !password) {
      return setError("We need both your email and password to get you in.");
    }

    if (password.length < 6) {
      return setError("That password seems a bit too short for our security standards.");
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true, state: { message: 'Successfully logged in ! WELCOME BACK 😊' } });
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong !');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#111] border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient background effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px]" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[100px]" />

          <div className="text-center mb-8 relative z-10">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 rounded-xl mb-4 border border-cyan-500/20 hover:scale-110 transition-transform">
              <Sparkles className="text-cyan-400" size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Sign in to continue building your AI portfolio.</p>
          </div>

          {error && (
            <Notification 
              type="error" 
              message={error} 
              onClose={() => setError(null)} 
              className="mb-6 relative z-10"
            />
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="asutosh@example.com"
                  className="w-full bg-[#161616] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-[#161616] border border-white/10 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] mt-6"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-gray-600 relative z-10">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] uppercase tracking-widest">Or continue with</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <a 
              href={`${import.meta.env.VITE_API_URL}/auth/github`}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-white/5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors text-gray-300"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHub
            </a>
            <a 
              href={`${import.meta.env.VITE_API_URL}/auth/google`}
              className="bg-[#1a1a1a] hover:bg-[#222] border border-white/5 py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors text-gray-300"
            >
               <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </a>
          </div>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Don't have an account? <Link to="/auth/signup" className="text-cyan-400 cursor-pointer hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
