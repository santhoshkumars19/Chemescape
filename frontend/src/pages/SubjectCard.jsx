import { motion } from 'framer-motion';
import { Check, ChevronRight, BookOpen } from 'lucide-react';
import {
  FlaskConical, Zap, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
} from 'lucide-react';

// ─── Icon resolver — maps icon name string from curriculumConfig ──────────────
const ICON_MAP = {
  FlaskConical, Zap, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
};

const resolveIcon = (name) => ICON_MAP[name] || FlaskConical;

/**
 * SubjectCard
 *
 * Props:
 *   subject    — SubjectConfig from curriculumConfig.js
 *   isSelected — boolean
 *   onClick    — () => void
 *   index      — number  (staggered entrance animation)
 *   isDark     — boolean (from ThemeContext)
 */
export default function SubjectCard({ subject, isSelected, onClick, index = 0, isDark = true }) {
  const Icon = resolveIcon(subject.icon);

  const accentColor  = subject.color       || '#10B981';
  const borderColor  = subject.borderColor || 'rgba(16,185,129,0.25)';
  const glowColor    = subject.glowColor   || 'rgba(16,185,129,0.28)';
  const gradFrom     = subject.gradientFrom || 'rgba(16,185,129,0.10)';
  const gradTo       = subject.gradientTo   || 'rgba(16,185,129,0.02)';

  // ── Background ───────────────────────────────────────────────────────────────
  const cardBg = isDark
    ? isSelected
      ? `linear-gradient(135deg, ${gradFrom}, ${gradTo})`
      : 'linear-gradient(135deg, rgba(12,20,17,0.82), rgba(8,14,12,0.60))'
    : isSelected
      ? `linear-gradient(135deg, ${gradFrom}, ${gradTo})`
      : 'linear-gradient(135deg, #ffffff, #f8fbfa)';

  const cardBorder = isSelected
    ? `2px solid ${accentColor}`
    : isDark
      ? `1.5px solid rgba(167,243,208,0.10)`
      : `1.5px solid #DDE8E3`;

  const cardShadow = isSelected
    ? `0 0 30px ${glowColor}, 0 4px 20px rgba(0,0,0,0.22)`
    : isDark
      ? '0 4px 16px rgba(0,0,0,0.35)'
      : '0 2px 12px rgba(15,23,42,0.07)';

  const textPrimary   = isDark ? '#F1F5F4' : '#10201A';
  const textSecondary = isDark ? 'rgba(241,245,244,0.50)' : '#5D6C66';
  const textMeta      = isDark ? 'rgba(241,245,244,0.30)' : '#8A9691';

  return (
    <motion.button
      id={`subject-card-${subject.id}`}
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`Select ${subject.name}${isSelected ? ' (selected)' : ''}`}
      className="relative w-full text-left rounded-2xl p-5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
        transition: 'box-shadow 0.22s, border-color 0.22s',
        focusRingOffset: isDark ? '#040810' : '#F6FAF8',
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.055, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, scale: 1.018 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Selected glow pulse */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `${accentColor}0D`, border: `1px solid ${accentColor}35` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative flex items-center gap-4">
        {/* Icon badge */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: isSelected
              ? `${accentColor}20`
              : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isSelected ? accentColor + '45' : (isDark ? 'rgba(255,255,255,0.07)' : '#DDE8E3')}`,
            transition: 'background 0.22s, border-color 0.22s',
          }}
        >
          <motion.div
            animate={isSelected ? { rotate: [0, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Icon
              size={22}
              style={{
                color: isSelected ? accentColor : (isDark ? 'rgba(241,245,244,0.40)' : '#8A9691'),
                transition: 'color 0.22s',
              }}
            />
          </motion.div>
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div
            className="font-orbitron font-bold text-sm sm:text-[15px] leading-tight mb-1"
            style={{
              color: isSelected ? accentColor : textPrimary,
              transition: 'color 0.22s',
            }}
          >
            {subject.name}
          </div>
          <div
            className="text-[11px] sm:text-xs font-inter leading-snug"
            style={{ color: textSecondary }}
          >
            {subject.description}
          </div>
          {subject.chapterCount !== undefined && (
            <div
              className="flex items-center gap-1 mt-1.5 text-[10px] font-space"
              style={{ color: isSelected ? accentColor + 'CC' : textMeta }}
            >
              <BookOpen size={10} />
              {subject.chapterCount} Chapters
            </div>
          )}
        </div>

        {/* Right indicator */}
        <div className="flex-shrink-0 ml-1">
          {isSelected ? (
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: accentColor }}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              aria-hidden="true"
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          ) : (
            <ChevronRight
              size={17}
              style={{ color: isDark ? 'rgba(241,245,244,0.22)' : '#C8D9D2' }}
            />
          )}
        </div>
      </div>
    </motion.button>
  );
}
