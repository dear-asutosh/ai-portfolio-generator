import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import routes from '../../routes';
import { Sparkles, ArrowRight, Mail, Lock, User, Loader2, Eye, EyeOff, Check } from 'lucide-react';
import Notification from '../../components/common/Notification';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill username if coming from LandingPage subdomain generator
  const [name, setName] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('username') || '';
  });

  // Password strength checker states
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-zinc-800' });
  const [criteria, setCriteria] = useState({ length: false, upper: false, number: false, symbol: false });

  const checkStrength = (pass) => {
    const checks = {
      length: pass.length >= 6,
      upper: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      symbol: /[^A-Za-z0-9]/.test(pass)
    };
    setCriteria(checks);
    let score = Object.values(checks).filter(Boolean).length;
    const labels = ['Short', 'Weak', 'Good', 'Strong', 'Very Strong'];
    const colors = ['bg-red-500', 'bg-red-500/80', 'bg-yellow-500/80', 'bg-cyan-500/80', 'bg-cyan-400'];
    setPasswordStrength({ score, label: labels[score], color: colors[score] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      return setError("Please provide your name.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setError("Please double-check your email formatting.");
    }
    if (password.length < 6) {
      return setError("Passwords must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      const result = await signup(name, email, password);
      if (result.success) {
        const dashboardUrl = routes.dashboard.replace(':username', `@${result.user.username}`);
        navigate(dashboardUrl, { state: { message: 'Account created successfully! Welcome.' } });
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex flex-col justify-center items-center px-4 py-12 relative overflow-y-auto select-none">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
      
      {/* Soft central ambient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main centered container (no card box, items sit flat on page) */}
      <div className="w-full max-w-sm z-10 flex flex-col animate-fade-in-down">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <Link to="/" className="inline-flex items-center justify-center w-10 h-10 bg-white/[0.02] rounded-xl mb-6 border border-white/5 hover:border-cyan-500/20 transition-all text-cyan-400">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
          </Link>
          
          <h1 className="text-3xl font-semibold text-white tracking-tight leading-none mb-2 font-heading">
            Create account
          </h1>
          <p className="text-slate-400 text-sm font-normal leading-relaxed font-sans">
            Start building your developer presence in minutes
          </p>
        </div>

        {/* Notifications */}
        {error && (
          <Notification 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
            className="mb-6 animate-fade-in-down"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={15} />
              <input 
                type="text"
                required
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Alex Rivera"
                className="w-full bg-[#0c0c0e]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={15} />
              <input 
                type="email"
                required
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="alex@dev.io"
                className="w-full bg-[#0c0c0e]/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={15} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                name="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  checkStrength(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full bg-[#0c0c0e]/80 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Password Strength Checklist */}
            {password && (
              <div className="mt-3 px-1 animate-fade-in-down">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-mono">Strength</span>
                  <span className={`text-[8px] font-bold uppercase font-mono ${passwordStrength.color.replace('bg-', 'text-')}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
                {/* Checklist */}
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1">
                  {[
                    { test: criteria.length, label: "6+ Chars" },
                    { test: criteria.upper, label: "Uppercase" },
                    { test: criteria.number, label: "Number" },
                    { test: criteria.symbol, label: "Symbol" }
                  ].map((crit, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[8px] font-mono">
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center border ${crit.test ? 'bg-cyan-500/10 border-cyan-500/25' : 'border-white/5'}`}>
                        {crit.test && <Check size={7} className="text-cyan-400" />}
                      </div>
                      <span className={crit.test ? 'text-slate-300' : 'text-slate-600'}>{crit.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={15} />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full bg-[#0c0c0e]/80 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all placeholder:text-zinc-500 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-white hover:bg-zinc-200 disabled:bg-zinc-600 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] mt-6 cursor-pointer text-sm shadow-md"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <>Create Account <ArrowRight size={15} /></>}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4 text-slate-700">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[8px] font-mono uppercase tracking-widest shrink-0 select-none">Or signup with</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-4">
          <a 
            href={`${import.meta.env.VITE_API_URL}/auth/github`}
            className="bg-[#0c0c0e] hover:bg-[#141417] border border-white/5 hover:border-white/10 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors text-slate-400 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            GitHub
          </a>
          <a 
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            className="bg-[#0c0c0e] hover:bg-[#141417] border border-white/5 hover:border-white/10 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors text-slate-400 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </a>
        </div>

        {/* Footer Link */}
        <p className="mt-8 text-center text-slate-400 text-sm font-normal font-sans">
          Already have an account?{' '}
          <Link 
            to={routes.auth.login} 
            className="text-cyan-400 cursor-pointer hover:underline font-semibold"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
