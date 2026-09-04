import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// ─── Animated counter ─────────────────────────────────────────────────────────
export function AnimatedCounter({ value, duration = 1.2, prefix = '', suffix = '', className = '' }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const target = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0;
    const start = performance.now();
    startRef.current = start;

    const tick = (now) => {
      const elapsed = (now - start) / (duration * 1000);
      const eased = 1 - Math.pow(1 - Math.min(elapsed, 1), 3);
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

// ─── Modern Card wrapper ──────────────────────────────────────────────────────
export function DashCard({ children, className = '', style = {}, delay = 0, id }) {
  return (
    <motion.div
      id={id}
      className={`relative rounded-2xl overflow-hidden min-w-0 max-w-full box-border card-modern ${className}`}
      style={style}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, onAction, icon: Icon, color = '#10B981' }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Icon size={16} />
          </div>
        )}
        <div>
          <h3 className="font-heading font-bold text-main text-base sm:text-lg tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted font-sans mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="text-xs text-emerald-600 dark:text-emerald-400 font-sans font-semibold hover:underline border-0 bg-transparent cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ─── Stat mini card ───────────────────────────────────────────────────────────
export function StatBadge({ label, value, icon, color = '#10B981', trend, delay = 0 }) {
  return (
    <DashCard className="p-5" delay={delay}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20">
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-sans font-bold px-2 py-0.5 rounded-full ${
            trend >= 0
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : 'text-red-500 bg-red-500/10 border border-red-500/20'
          }`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="font-heading font-extrabold text-2xl sm:text-3xl text-main mb-1">
        <AnimatedCounter value={typeof value === 'number' ? value : 0} />
        {typeof value === 'string' && !/^\d/.test(value) ? value : ''}
      </p>
      <p className="text-xs text-muted font-sans font-medium">{label}</p>
    </DashCard>
  );
}

// ─── Rarity pill ─────────────────────────────────────────────────────────────
const rarityColors = {
  Common:    { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)', text: '#059669' },
  Uncommon:  { bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)', text: '#10B981' },
  Rare:      { bg: 'rgba(14, 165, 233, 0.1)', border: 'rgba(14, 165, 233, 0.25)', text: '#0284C7' },
  Epic:      { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)', text: '#D97706' },
  Legendary: { bg: 'rgba(12, 59, 46, 0.12)', border: 'rgba(12, 59, 46, 0.35)', text: '#0C3B2E' },
};

export function RarityPill({ rarity }) {
  const c = rarityColors[rarity] || rarityColors.Common;
  return (
    <span
      className="text-[10px] px-2.5 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      {rarity}
    </span>
  );
}
