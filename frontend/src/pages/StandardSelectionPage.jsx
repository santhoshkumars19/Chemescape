import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth }       from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useTheme }      from '../context/ThemeContext';
import StandardCard      from './StandardCard';

// ─── Isolated frontend configuration for grades 4–12 ─────────────────────────
// Single source of truth for this screen.
// When the backend expands standards, this list can be replaced by an API call
// without touching any other component.
const STANDARDS_CONFIG = [
  {
    id:          'grade-4',
    grade:       4,
    name:        '4th Standard',
    description: 'Introduction to elements, matter & basic reactions',
    color:       '#34D399',
    borderColor: 'rgba(52,211,153,0.25)',
    glowColor:   'rgba(52,211,153,0.30)',
    gradientFrom:'rgba(52,211,153,0.10)',
    gradientTo:  'rgba(52,211,153,0.02)',
  },
  {
    id:          'grade-5',
    grade:       5,
    name:        '5th Standard',
    description: 'States of matter, mixtures & simple compounds',
    color:       '#6EE7B7',
    borderColor: 'rgba(110,231,183,0.25)',
    glowColor:   'rgba(110,231,183,0.30)',
    gradientFrom:'rgba(110,231,183,0.10)',
    gradientTo:  'rgba(110,231,183,0.02)',
  },
  {
    id:          'grade-6',
    grade:       6,
    name:        '6th Standard',
    description: 'Periodic table basics, acids, bases & salts',
    color:       '#10B981',
    borderColor: 'rgba(16,185,129,0.25)',
    glowColor:   'rgba(16,185,129,0.30)',
    gradientFrom:'rgba(16,185,129,0.10)',
    gradientTo:  'rgba(16,185,129,0.02)',
  },
  {
    id:          'grade-7',
    grade:       7,
    name:        '7th Standard',
    description: 'Chemical changes, heat, metals & non-metals',
    color:       '#22D3EE',
    borderColor: 'rgba(34,211,238,0.25)',
    glowColor:   'rgba(34,211,238,0.30)',
    gradientFrom:'rgba(34,211,238,0.10)',
    gradientTo:  'rgba(34,211,238,0.02)',
  },
  {
    id:          'grade-8',
    grade:       8,
    name:        '8th Standard',
    description: 'Atoms, molecules, chemical reactions & combustion',
    color:       '#67E8F9',
    borderColor: 'rgba(103,232,249,0.25)',
    glowColor:   'rgba(103,232,249,0.30)',
    gradientFrom:'rgba(103,232,249,0.10)',
    gradientTo:  'rgba(103,232,249,0.02)',
  },
  {
    id:          'grade-9',
    grade:       9,
    name:        '9th Standard',
    description: 'Structure of atom, bonding & stoichiometry',
    color:       '#818CF8',
    borderColor: 'rgba(129,140,248,0.25)',
    glowColor:   'rgba(129,140,248,0.30)',
    gradientFrom:'rgba(129,140,248,0.10)',
    gradientTo:  'rgba(129,140,248,0.02)',
  },
  {
    id:          'grade-10',
    grade:       10,
    name:        '10th Standard',
    description: 'Periodic properties, chemical equilibrium & carbon',
    color:       '#A78BFA',
    borderColor: 'rgba(167,139,250,0.25)',
    glowColor:   'rgba(167,139,250,0.30)',
    gradientFrom:'rgba(167,139,250,0.10)',
    gradientTo:  'rgba(167,139,250,0.02)',
  },
  {
    id:          'grade-11',
    grade:       11,
    name:        '11th Standard',
    description: 'Thermodynamics, organic chemistry & electrochemistry',
    color:       '#F59E0B',
    borderColor: 'rgba(245,158,11,0.25)',
    glowColor:   'rgba(245,158,11,0.30)',
    gradientFrom:'rgba(245,158,11,0.10)',
    gradientTo:  'rgba(245,158,11,0.02)',
  },
  {
    id:          'grade-12',
    grade:       12,
    name:        '12th Standard',
    description: 'Advanced organics, biomolecules & coordination chemistry',
    color:       '#F97316',
    borderColor: 'rgba(249,115,22,0.25)',
    glowColor:   'rgba(249,115,22,0.30)',
    gradientFrom:'rgba(249,115,22,0.10)',
    gradientTo:  'rgba(249,115,22,0.02)',
  },
];

// ─── User-scoped localStorage helpers (mirrors NavigationContext pattern) ─────
const PREF_KEY = 'preferences';
const scopedKey = (userId, key) =>
  userId ? `chemescape:user:${userId}:${key}` : null;

const scopedGetJSON = (userId, key) => {
  const k = scopedKey(userId, key);
  if (!k) return null;
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const scopedSetJSON = (userId, key, value) => {
  const k = scopedKey(userId, key);
  if (!k) return;
  try { localStorage.setItem(k, JSON.stringify(value)); } catch { /* non-fatal */ }
};

// ─── StandardSelectionPage ────────────────────────────────────────────────────
export default function StandardSelectionPage() {
  const { user }    = useAuth();
  const { navigateTo, setSelectedStandardId, setSelectedStandard } = useNavigation();
  const { isDark }  = useTheme();

  // ── Restore persisted standard for this user ────────────────────────────────
  const [selectedId, setSelectedId] = useState(() => {
    if (!user?.id) return null;
    const prefs = scopedGetJSON(user.id, PREF_KEY);
    return prefs?.selectedStandardId || null;
  });

  const [confirming, setConfirming] = useState(false);

  // ── Selected standard object ─────────────────────────────────────────────────
  const selectedStd = STANDARDS_CONFIG.find(s => s.id === selectedId) || null;

  // ── Handle card click ────────────────────────────────────────────────────────
  const handleSelect = useCallback((std) => {
    setSelectedId(std.id);
  }, []);

  // ── Confirm and proceed ──────────────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!selectedStd) return;
    setConfirming(true);

    // 1. Persist user-scoped preference
    if (user?.id) {
      const existingPrefs = scopedGetJSON(user.id, PREF_KEY) || {};
      scopedSetJSON(user.id, PREF_KEY, {
        ...existingPrefs,
        selectedStandardId:   selectedStd.id,
        selectedStandardGrade: selectedStd.grade,
        selectedStandardName:  selectedStd.name,
      });
    }

    // 2. Push into NavigationContext (used by SyllabusPage + game routing)
    setSelectedStandardId(selectedStd.id);
    setSelectedStandard(selectedStd.name);

    // 3. Navigate to dashboard (subject selection will come later)
    setTimeout(() => navigateTo('dashboard'), 320);
  }, [selectedStd, user, setSelectedStandardId, setSelectedStandard, navigateTo]);

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const pageBg        = isDark ? '#040810' : '#F6FAF8';
  const headingColor  = isDark ? '#F1F5F4' : '#10201A';
  const subColor      = isDark ? 'rgba(241,245,244,0.50)' : '#5D6C66';
  const chipBg        = isDark ? 'rgba(16,185,129,0.10)' : '#D1FAE5';
  const chipColor     = isDark ? '#34D399'                : '#047857';
  const cardBg        = isDark ? 'rgba(12,20,17,0.82)'   : '#FFFFFF';
  const cardBorder    = isDark ? 'rgba(167,243,208,0.14)' : '#DDE8E3';
  const dividerColor  = isDark ? 'rgba(167,243,208,0.08)' : '#DDE8E3';

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: pageBg }}
    >
      {/* Background ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 65%)'
            : 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(4,120,87,0.07) 0%, transparent 65%)',
        }}
      />

      {/* ── Content scroll area ─────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Back to dashboard link */}
        <motion.button
          type="button"
          onClick={() => navigateTo('dashboard')}
          className="flex items-center gap-2 mb-10 text-xs font-space tracking-wide cursor-pointer bg-transparent border-0 outline-none"
          style={{ color: isDark ? 'rgba(241,245,244,0.35)' : '#8A9691' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ color: isDark ? '#F1F5F4' : '#10201A' }}
          id="standard-selection-back-btn"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* ── Hero heading ──────────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Label chip */}
          <div className="flex items-center justify-center mb-4">
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-orbitron font-bold tracking-widest uppercase"
              style={{ background: chipBg, color: chipColor }}
            >
              <Sparkles size={12} />
              Choose Your Standard
            </span>
          </div>

          <h1
            className="font-orbitron font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4"
            style={{ color: headingColor }}
          >
            Choose Your{' '}
            <span style={{ color: '#10B981' }}>Standard</span>
          </h1>

          <p
            className="font-inter text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: subColor }}
          >
            Select your current academic standard to unlock a personalised chemistry curriculum with escape room challenges built for your grade.
          </p>
        </motion.div>

        {/* ── Main layout — card grid + confirm panel ───────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start justify-center">

          {/* ── Card grid (scrollable on mobile) ────────────────────────────── */}
          <div className="w-full lg:max-w-2xl xl:max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {STANDARDS_CONFIG.map((std, i) => (
                <StandardCard
                  key={std.id}
                  standard={std}
                  isSelected={selectedId === std.id}
                  onClick={() => handleSelect(std)}
                  index={i}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>

          {/* ── Confirm panel (sticky on desktop) ───────────────────────────── */}
          <div className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-10">
            <motion.div
              className="rounded-2xl p-6"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                boxShadow: isDark
                  ? '0 8px 32px rgba(0,0,0,0.45)'
                  : '0 4px 20px rgba(15,23,42,0.08)',
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5',
                    border: '1px solid rgba(16,185,129,0.25)',
                  }}
                >
                  <GraduationCap size={18} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <div
                    className="font-orbitron font-bold text-sm"
                    style={{ color: headingColor }}
                  >
                    Your Selection
                  </div>
                  <div
                    className="text-[11px] font-inter mt-0.5"
                    style={{ color: subColor }}
                  >
                    Pick a grade to continue
                  </div>
                </div>
              </div>

              <div
                className="h-px mb-5"
                style={{ background: dividerColor }}
              />

              {/* Selection preview */}
              <AnimatePresence mode="wait">
                {selectedStd ? (
                  <motion.div
                    key={selectedStd.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="mb-5"
                  >
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: `${selectedStd.color}12`,
                        border: `1px solid ${selectedStd.color}30`,
                      }}
                    >
                      <div
                        className="font-orbitron font-black text-xl mb-1"
                        style={{ color: selectedStd.color }}
                      >
                        {selectedStd.name}
                      </div>
                      <div
                        className="text-xs font-inter"
                        style={{ color: subColor }}
                      >
                        {selectedStd.description}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 text-center py-6"
                  >
                    <div
                      className="text-3xl mb-2"
                      style={{ opacity: 0.3 }}
                    >
                      🎓
                    </div>
                    <div
                      className="text-xs font-inter"
                      style={{ color: subColor }}
                    >
                      No standard selected yet
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm button */}
              <motion.button
                type="button"
                id="confirm-standard-btn"
                onClick={handleConfirm}
                disabled={!selectedStd || confirming}
                className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer border-0 outline-none"
                style={{
                  background: selectedStd
                    ? `linear-gradient(135deg, #10B981, #059669)`
                    : isDark ? 'rgba(255,255,255,0.05)' : '#E5EFEA',
                  color: selectedStd
                    ? '#ffffff'
                    : isDark ? 'rgba(241,245,244,0.25)' : '#8A9691',
                  boxShadow: selectedStd
                    ? '0 0 24px rgba(16,185,129,0.35)'
                    : 'none',
                  cursor: selectedStd ? 'pointer' : 'not-allowed',
                  transition: 'all 0.25s',
                }}
                whileHover={selectedStd ? { scale: 1.03, boxShadow: '0 0 36px rgba(16,185,129,0.5)' } : {}}
                whileTap={selectedStd ? { scale: 0.97 } : {}}
              >
                {confirming ? (
                  <motion.div
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Skip hint */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigateTo('dashboard')}
                  className="text-[11px] font-inter cursor-pointer bg-transparent border-0 outline-none transition-colors"
                  style={{ color: isDark ? 'rgba(241,245,244,0.22)' : '#8A9691' }}
                  id="skip-standard-selection-btn"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>

            {/* Info note */}
            <motion.p
              className="text-center text-[11px] font-inter mt-4 leading-relaxed"
              style={{ color: isDark ? 'rgba(241,245,244,0.25)' : '#8A9691' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              You can change your standard at any time from your profile settings.
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
}
