
import { Sparkles, Crown } from 'lucide-react';

export const PlanBadge = ({ plan = 'free', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-4 py-1.5 gap-2'
  };

  const planConfigs = {
    free: {
      text: 'Free',
      styles: 'bg-white/10 text-slate-300 border border-white/5',
      icon: null
    },
    pro: {
      text: 'Pro',
      styles: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]',
      icon: <ZapIcon size={size} />
    },
    lifetime: {
      text: 'Lifetime',
      styles: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border border-amber-500/30 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.15)]',
      icon: <SparklesIcon size={size} />
    }
  };

  const config = planConfigs[plan.toLowerCase()] || planConfigs.free;

  return (
    <span className={`inline-flex items-center rounded-full font-mono uppercase tracking-wider ${sizeClasses[size] || sizeClasses.md} ${config.styles}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

const ZapIcon = ({ size }) => {
  const s = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  return <Crown className={`text-cyan-400 animate-pulse`} size={s} />;
};

const SparklesIcon = ({ size }) => {
  const s = size === 'sm' ? 10 : size === 'lg' ? 14 : 12;
  return <Sparkles className="text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} size={s} />;
};

export default PlanBadge;
