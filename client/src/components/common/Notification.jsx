import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Sparkles } from 'lucide-react';

const Notification = ({ 
  type = 'info', 
  message, 
  onClose, 
  className = '', 
  autoClose = type === 'success' || type === 'info', 
  duration = 5000 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!message) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsExiting(false);

    if (autoClose) {
      // Trigger exit animation 300ms before the actual unmount
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, Math.max(100, duration - 300));

      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // Modern design settings per type
  const config = {
    success: {
      bg: 'bg-neutral-950/85 md:bg-[#070e0b]/90',
      border: 'border-emerald-500/30',
      shadow: 'shadow-[0_0_30px_rgba(16,185,129,0.18)]',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      progressBar: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400',
      title: 'Success',
      icon: CheckCircle2
    },
    error: {
      bg: 'bg-neutral-950/85 md:bg-[#100608]/90',
      border: 'border-rose-500/30',
      shadow: 'shadow-[0_0_30px_rgba(239,68,68,0.18)]',
      text: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
      progressBar: 'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500',
      title: 'Error',
      icon: AlertCircle
    },
    warning: {
      bg: 'bg-neutral-950/85 md:bg-[#100b05]/90',
      border: 'border-amber-500/30',
      shadow: 'shadow-[0_0_30px_rgba(245,158,11,0.18)]',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      progressBar: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      title: 'Warning',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-neutral-950/85 md:bg-[#050c10]/90',
      border: 'border-cyan-500/30',
      shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.18)]',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      progressBar: 'bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500',
      title: 'Information',
      icon: Info
    }
  };

  const current = config[type] || config.info;
  const StatusIcon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={isExiting ? { opacity: 0, y: -15, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden w-full md:w-[440px] rounded-2xl border backdrop-blur-xl ${current.bg} ${current.border} ${current.shadow} p-4 flex gap-4 ${className} select-none`}
      style={{
        fontFamily: "'Lexend', sans-serif"
      }}
    >
      {/* Visual Accent glow line */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : type === 'warning' ? 'bg-amber-500' : 'bg-cyan-500'}`} />

      {/* Left Icon Panel */}
      <div className="flex-shrink-0 flex items-start mt-0.5 ml-1">
        <div className={`p-2.5 rounded-xl border flex items-center justify-center ${current.iconBg} ${current.text}`}>
          <StatusIcon size={20} className="animate-pulse" />
        </div>
      </div>

      {/* Main content body */}
      <div className="flex-grow flex flex-col justify-center min-w-0 pr-6 pl-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[15px] font-bold tracking-tight uppercase font-mono ${current.text}`}>
            {current.title}
          </span>
          {type === 'success' && (
            <Sparkles size={14} className="text-yellow-400 animate-bounce" style={{ animationDuration: '2s' }} />
          )}
        </div>
        <p className="text-gray-200 text-sm leading-relaxed font-light">
          {message}
        </p>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={handleManualClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}

      {/* Animated timer progress bar */}
      {autoClose && !isExiting && (
        <motion.div 
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-[3px] ${current.progressBar}`}
        />
      )}
    </motion.div>
  );
};

export default Notification;
