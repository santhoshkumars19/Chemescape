import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// ─── Animated counter ─────────────────────────────────────────────────────────
export function AnimatedCounter({ value, duration = 1.5, prefix = '', suffix = '', className = '' }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const start = performance.now();
    startRef.current = start;

    const tick = (now) => {
      const elapsed = (now - start) / (duration * 1000);
      const eased = 1 - Math.pow(1 - Math.min(elapsed, 1), 3); // ease-out-cubic
      setDisplay(Math.floor(eased * target));
      if (elapsed < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const formatted = typeof value === 'string' && value.includes(',')
    ? display.toLocaleString()
    : display;

  return (
    <span className={className}>{prefix}{formatted}{suffix}</span>
  );
}

// ─── Glass card wrapper ───────────────────────────────────────────────────────
export function DashCard({ children, className = '', glow = '', style = {}, delay = 0, id }) {
  return (
    <motion.div
      id={id}
      className={`relative rounded-2xl overflow-hidden min-w-0 max-w-full box-border glass ${className}`}
      style={{
        boxShadow: glow ? `0 0 40px ${glow}` : 'none',
        ...style,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(167,243,208,0.14), transparent)' }} />
      {children}
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, icon: Icon, color = '#10B981' }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Icon size={16} className="text-emerald-400" />
          </div>
        )}
        <div>
          <h3 className="font-space font-bold text-white text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-inter mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button className="text-xs text-slate-400 hover:text-emerald-400 font-space transition-colors border-0 bg-transparent cursor-pointer">
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Stat mini card ───────────────────────────────────────────────────────────
export function StatBadge({ label, value, icon, color, trend, delay = 0 }) {
  return (
    <DashCard className="p-5" glow={`${color}10`} delay={delay}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20">
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-space px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-orbitron font-black text-2xl text-white mb-1">
        <AnimatedCounter value={typeof value === 'number' ? value : 0} />
        {typeof value === 'string' && !/^\d/.test(value) ? value : ''}
      </p>
      <p className="text-xs text-slate-400 font-space tracking-wide">{label}</p>
    </DashCard>
  );
}

// ─── Rarity pill ─────────────────────────────────────────────────────────────
const rarityColors = {
  Common:   { bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)',  text: '#0891b2' },
  Uncommon: { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  text: '#047857' },
  Rare:     { bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.25)',  text: '#7c3aed' },
  Epic:     { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)',  text: '#b45309' },
  Legendary:{ bg: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.35)', text: '#be185d' },
};

export function RarityPill({ rarity }) {
  const c = rarityColors[rarity] || rarityColors.Common;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-space font-semibold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {rarity}
    </span>
  );
}
