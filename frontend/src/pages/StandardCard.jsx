import { motion } from 'framer-motion';
import { Check, ChevronRight, FlaskConical, Atom, Zap, Beaker, Microscope } from 'lucide-react';

// ─── Icon map by grade range ──────────────────────────────────────────────────
const gradeIcon = (grade) => {
  if (grade <= 6)  return FlaskConical;
  if (grade <= 8)  return Atom;
  if (grade <= 10) return Zap;
  return Microscope;
};

/**
 * StandardCard — Premium card for one academic standard.
 *
 * Props:
 *  standard   — { id, grade, name, description, color, borderColor, glowColor, gradientFrom, gradientTo }
 *  isSelected — boolean
 *  onClick    — () => void
 *  index      — number (for staggered animation)
 *  isDark     — boolean (from ThemeContext)
 */
export default function StandardCard({ standard, isSelected, onClick, index = 0, isDark = true }) {
  const Icon = gradeIcon(standard.grade);

  // ── Color tokens ─────────────────────────────────────────────────────────────
  const accentColor    = standard.color       || '#10B981';
  const borderColor    = standard.borderColor || 'rgba(16,185,129,0.25)';
  const glowColor      = standard.glowColor   || 'rgba(16,185,129,0.28)';
  const gradFrom       = standard.gradientFrom || 'rgba(16,185,129,0.10)';
  const gradTo         = standard.gradientTo   || 'rgba(16,185,129,0.02)';

  // ── Dynamic styles ───────────────────────────────────────────────────────────
  const cardBg = isDark
    ? `linear-gradient(135deg, ${gradFrom}, ${gradTo})`
    : isSelected
      ? `linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.04))`
      : 'linear-gradient(135deg, #ffffff, #f8fbfa)';

  const cardBorder = isSelected
    ? `2px solid ${accentColor}`
    : isDark
      ? `1.5px solid ${borderColor}`
      : `1.5px solid ${isDark ? borderColor : '#C8D9D2'}`;

  const cardShadow = isSelected
    ? `0 0 28px ${glowColor}, 0 4px 20px rgba(0,0,0,0.25)`
    : isDark
      ? '0 4px 16px rgba(0,0,0,0.35)'
      : '0 2px 12px rgba(15,23,42,0.08)';

  const textPrimary   = isDark ? '#F1F5F4' : '#10201A';
  const textSecondary = isDark ? 'rgba(241,245,244,0.55)' : '#5D6C66';

  return (
    <motion.button
      id={`standard-card-grade-${standard.grade}`}
      type="button"
      onClick={onClick}
      className="relative w-full text-left rounded-2xl p-5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
        transition: 'box-shadow 0.25s, border-color 0.25s',
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Selected glow pulse overlay */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}40` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-center gap-4">
        {/* Icon badge */}
        <div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: isSelected ? `${accentColor}22` : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isSelected ? accentColor + '50' : (isDark ? 'rgba(255,255,255,0.08)' : '#DDE8E3')}`,
          }}
        >
          <Icon
            size={20}
            style={{ color: isSelected ? accentColor : (isDark ? 'rgba(241,245,244,0.45)' : '#5D6C66') }}
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div
            className="font-orbitron font-bold text-sm sm:text-base leading-tight mb-0.5"
            style={{ color: isSelected ? accentColor : textPrimary }}
          >
            {standard.name}
          </div>
          <div
            className="text-[11px] sm:text-xs font-inter leading-snug truncate"
            style={{ color: textSecondary }}
          >
            {standard.description}
          </div>
        </div>

        {/* Right indicator */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: accentColor }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <ChevronRight
              size={18}
              style={{ color: isDark ? 'rgba(241,245,244,0.25)' : '#8A9691' }}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}
