import { motion } from 'framer-motion';
import {
  Lock, Unlock, Play, CheckCircle2, Trophy, Star,
  Zap, Coins, ChevronRight, RotateCcw, Sparkles, Shield,
} from 'lucide-react';

/**
 * ChapterCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Props:
 *   chapter      — Chapter object { id, chapterNumber, title, description, difficulty, xpReward, coinsReward, gameType }
 *   index        — number (0-based)
 *   statusInfo   — { status: 'LOCKED'|'UNLOCKED'|'IN_PROGRESS'|'COMPLETED'|'MASTERED', progress, stars, isUnlocked, isCompleted }
 *   isCurrent    — boolean (is this the next active mission)
 *   accentColor  — string hex/rgb for subject theme
 *   isDark       — boolean
 *   onSelect     — (chapter) => void
 */
export default function ChapterCard({
  chapter,
  index,
  statusInfo = {},
  isCurrent = false,
  accentColor = '#10B981',
  isDark = true,
  onSelect,
}) {
  if (!chapter) return null;

  const {
    status = 'LOCKED',
    progress = 0,
    stars = 0,
    isUnlocked = false,
    isCompleted = false,
  } = statusInfo;

  const isLocked = status === 'LOCKED';
  const isMastered = status === 'MASTERED';
  const isInProgress = status === 'IN_PROGRESS';

  // ── Color and style tokens ───────────────────────────────────────────────────
  const cardBorder = isMastered
    ? '2px solid rgba(245,158,11,0.5)'
    : isCurrent
      ? `2px solid ${accentColor}`
      : isCompleted
        ? '1.5px solid rgba(16,185,129,0.35)'
        : isUnlocked
          ? `1.5px solid ${accentColor}40`
          : isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid #DDE8E3';

  const cardBg = isDark
    ? isMastered
      ? 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(12,20,17,0.85))'
      : isCurrent
        ? `linear-gradient(135deg, ${accentColor}14, rgba(12,20,17,0.88))`
        : isCompleted
          ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(12,20,17,0.82))'
          : isUnlocked
            ? 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(12,20,17,0.80))'
            : 'linear-gradient(135deg, rgba(8,14,12,0.85), rgba(5,8,7,0.92))'
    : isMastered
      ? 'linear-gradient(135deg, #FEF3C7, #FFFFFF)'
      : isCurrent
        ? `linear-gradient(135deg, ${accentColor}10, #FFFFFF)`
        : isCompleted
          ? 'linear-gradient(135deg, #ECFDF5, #FFFFFF)'
          : isUnlocked
            ? '#FFFFFF'
            : '#F8FBFA';

  const cardShadow = isMastered
    ? '0 0 30px rgba(245,158,11,0.22), 0 4px 20px rgba(0,0,0,0.3)'
    : isCurrent
      ? `0 0 28px ${accentColor}25, 0 4px 20px rgba(0,0,0,0.25)`
      : isCompleted
        ? '0 4px 16px rgba(16,185,129,0.12)'
        : isUnlocked
          ? '0 4px 16px rgba(0,0,0,0.2)'
          : 'none';

  const textHead = isDark
    ? isLocked ? 'rgba(241,245,244,0.45)' : '#F1F5F4'
    : isLocked ? '#8A9691' : '#10201A';

  const textMuted = isDark
    ? isLocked ? 'rgba(241,245,244,0.30)' : 'rgba(241,245,244,0.55)'
    : isLocked ? '#A7B3AE' : '#5D6C66';

  const chapterNumLabel = `CHAPTER ${chapter.chapterNumber || index + 1}`;

  return (
    <motion.div
      id={`chapter-card-${chapter.id || index + 1}`}
      className={`relative rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col justify-between transition-all w-full max-w-2xl mx-auto ${
        isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'
      }`}
      style={{
        background: cardBg,
        border: cardBorder,
        boxShadow: cardShadow,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={isUnlocked ? { y: -3, scale: 1.01 } : {}}
      onClick={() => isUnlocked && onSelect && onSelect(chapter)}
    >
      {/* Current mission animated pulse highlight */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}30` }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div>
        {/* ── Top row: Chapter Number + Status Pill + Difficulty ─────────────── */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-orbitron font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : '#EEF5F2',
                color: isUnlocked ? (isDark ? '#F1F5F4' : '#10201A') : (isDark ? '#64748B' : '#8A9691'),
              }}
            >
              {chapterNumLabel}
            </span>

            {/* Difficulty */}
            {chapter.difficulty && (
              <span
                className="text-[10px] font-space px-2 py-0.5 rounded-full"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#F0F7F4',
                  color: isDark ? 'rgba(241,245,244,0.6)' : '#5D6C66',
                  border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #DDE8E3',
                }}
              >
                {chapter.difficulty}
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div>
            {isMastered ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-orbitron font-black bg-amber-500/15 border border-amber-500/35 text-amber-400">
                <Trophy size={11} className="text-amber-400" />
                MASTERED
              </span>
            ) : isCompleted ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-orbitron font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 size={11} className="text-emerald-400" />
                COMPLETED
              </span>
            ) : isInProgress ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-orbitron font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                <Sparkles size={11} className="text-cyan-400 animate-spin" />
                IN PROGRESS
              </span>
            ) : isUnlocked ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-orbitron font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Unlock size={11} className="text-emerald-400" />
                UNLOCKED
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-orbitron font-bold bg-slate-800/80 border border-slate-700/60 text-slate-400">
                <Lock size={11} className="text-amber-400" />
                LOCKED
              </span>
            )}
          </div>
        </div>

        {/* ── Title & Description ────────────────────────────────────────────── */}
        <div className="mb-4">
          <h3
            className="text-lg sm:text-xl font-orbitron font-black mb-1.5 leading-snug"
            style={{ color: textHead }}
          >
            {chapter.title}
          </h3>
          <p
            className="text-xs sm:text-sm font-inter leading-relaxed"
            style={{ color: textMuted }}
          >
            {chapter.description}
          </p>

          {/* Game Type Label */}
          {chapter.gameType && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-space" style={{ color: isUnlocked ? accentColor : textMuted }}>
              <Shield size={12} />
              <span>{chapter.gameType}</span>
            </div>
          )}
        </div>

        {/* ── Rewards + Stars Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 text-xs font-space">
          <div
            className="p-2 rounded-xl border flex items-center gap-1.5"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#DDE8E3',
              color: isUnlocked ? (isDark ? '#F1F5F4' : '#10201A') : textMuted,
            }}
          >
            <Zap size={14} style={{ color: isUnlocked ? accentColor : '#64748B' }} />
            <span>+{chapter.xpReward || 500} XP</span>
          </div>

          <div
            className="p-2 rounded-xl border flex items-center gap-1.5"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#DDE8E3',
              color: isUnlocked ? (isDark ? '#F1F5F4' : '#10201A') : textMuted,
            }}
          >
            <Coins size={14} className={isUnlocked ? 'text-amber-400' : 'text-slate-500'} />
            <span>+{chapter.coinsReward || 100} Coins</span>
          </div>

          {/* Stars */}
          <div
            className="p-2 rounded-xl border flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#DDE8E3',
            }}
          >
            {[1, 2, 3].map((starIdx) => (
              <Star
                key={starIdx}
                size={14}
                className={starIdx <= (stars || (isCompleted ? 3 : 0)) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
              />
            ))}
          </div>
        </div>

        {/* ── Progress Bar (if in progress or completed) ──────────────────────── */}
        {(isInProgress || isCompleted) && (
          <div className="mb-4">
            <div className="flex justify-between text-[11px] font-space mb-1" style={{ color: textMuted }}>
              <span>Chapter Progress</span>
              <span className="font-orbitron font-bold" style={{ color: isCompleted ? '#10B981' : '#22D3EE' }}>
                {progress}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden w-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#E5EFEA' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isMastered
                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)'
                    : isCompleted
                      ? 'linear-gradient(90deg, #10B981, #34D399)'
                      : `linear-gradient(90deg, ${accentColor}, #22D3EE)`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Action Button ──────────────────────────────────────────────────── */}
      <div>
        {isMastered ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(chapter);
            }}
            className="w-full py-3 rounded-xl font-orbitron font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-transform active:scale-98"
            style={{
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: '0 0 20px rgba(245,158,11,0.3)',
            }}
          >
            <Trophy size={14} className="fill-slate-950" />
            <span>Review Mastered Chapter</span>
            <ChevronRight size={15} />
          </button>
        ) : isCompleted ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(chapter);
            }}
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer border-0 transition-transform active:scale-98"
            style={{
              background: isDark ? 'rgba(16,185,129,0.18)' : '#D1FAE5',
              color: isDark ? '#34D399' : '#047857',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            <RotateCcw size={14} />
            <span>Replay Mission</span>
            <ChevronRight size={15} />
          </button>
        ) : isInProgress ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(chapter);
            }}
            className="w-full py-3 rounded-xl font-orbitron font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-transform active:scale-98"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              boxShadow: `0 0 24px ${accentColor}40`,
            }}
          >
            <Play size={14} className="fill-slate-950" />
            <span>Continue Mission</span>
            <ChevronRight size={15} />
          </button>
        ) : isUnlocked ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect && onSelect(chapter);
            }}
            className="w-full py-3 rounded-xl font-orbitron font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-transform active:scale-98"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
              boxShadow: `0 0 20px ${accentColor}35`,
            }}
          >
            <Play size={14} className="fill-slate-950" />
            <span>Start Mission</span>
            <ChevronRight size={15} />
          </button>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-not-allowed border"
            style={{
              background: isDark ? 'rgba(255,255,255,0.02)' : '#F0F7F4',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#DDE8E3',
              color: isDark ? '#64748B' : '#8A9691',
            }}
          >
            <Lock size={13} className="text-amber-400/80" />
            <span>Complete Chapter {index} to Unlock</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
