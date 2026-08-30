import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, BookOpen, ChevronRight, ArrowLeft,
  Sparkles, RefreshCw, AlertTriangle, RotateCcw,
} from 'lucide-react';
import { useAuth }       from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useTheme }      from '../context/ThemeContext';
import SubjectCard       from './SubjectCard';
import { curriculumService, getSubjectsForStandard } from '../config/curriculumConfig';

// ─── User-scoped localStorage helpers (same pattern as NavigationContext) ─────
const PREF_KEY = 'preferences';
const scopedKey    = (uid, k) => uid ? `chemescape:user:${uid}:${k}` : null;
const scopedGetJSON = (uid, k) => {
  const key = scopedKey(uid, k);
  if (!key) return null;
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
};
const scopedSetJSON = (uid, k, v) => {
  const key = scopedKey(uid, k);
  if (!key) return;
  try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* non-fatal */ }
};

// ─── STANDARDS list used for "Selected Standard" banner (must match StandardSelectionPage) ─
const STANDARDS_META = {
  'grade-4':  { grade: 4,  name: '4th Standard',  color: '#34D399' },
  'grade-5':  { grade: 5,  name: '5th Standard',  color: '#6EE7B7' },
  'grade-6':  { grade: 6,  name: '6th Standard',  color: '#10B981' },
  'grade-7':  { grade: 7,  name: '7th Standard',  color: '#22D3EE' },
  'grade-8':  { grade: 8,  name: '8th Standard',  color: '#67E8F9' },
  'grade-9':  { grade: 9,  name: '9th Standard',  color: '#818CF8' },
  'grade-10': { grade: 10, name: '10th Standard', color: '#A78BFA' },
  'grade-11': { grade: 11, name: '11th Standard', color: '#F59E0B' },
  'grade-12': { grade: 12, name: '12th Standard', color: '#F97316' },
};

// ─── SubjectSelectionPage ─────────────────────────────────────────────────────
export default function SubjectSelectionPage() {
  const { user }       = useAuth();
  const {
    navigateTo,
    selectedStandardId,
    selectedStandard,
    setSelectedSubjectId,
    setSelectedSubject,
  } = useNavigation();
  const { isDark } = useTheme();

  // ── Resolve the active standard ID ──────────────────────────────────────────
  // Priority: NavigationContext → user prefs → null
  const resolvedStandardId = selectedStandardId || (() => {
    if (!user?.id) return null;
    const prefs = scopedGetJSON(user.id, PREF_KEY);
    return prefs?.selectedStandardId || null;
  })();

  const standardMeta = STANDARDS_META[resolvedStandardId] || null;
  const standardDisplayName = selectedStandard || standardMeta?.name || 'Unknown Standard';
  const standardColor = standardMeta?.color || '#10B981';

  // ── Subject list state (async-ready) ────────────────────────────────────────
  const [subjects, setSubjects]     = useState([]);
  const [loading,  setLoading]      = useState(true);
  const [loadError, setLoadError]   = useState(null);

  // ── Restore saved subject for this user (scoped) ─────────────────────────────
  const [selectedId, setSelectedId] = useState(() => {
    if (!user?.id || !resolvedStandardId) return null;
    const prefs = scopedGetJSON(user.id, PREF_KEY);
    const savedSubjectId    = prefs?.selectedSubjectId;
    const savedSubjectStdId = prefs?.selectedStandardId;
    // Only restore if the saved subject belongs to the currently selected standard
    if (savedSubjectId && savedSubjectStdId === resolvedStandardId) {
      const validSubjects = getSubjectsForStandard(resolvedStandardId);
      const isValid = validSubjects.some(s => s.id === savedSubjectId);
      return isValid ? savedSubjectId : null;
    }
    return null;
  });

  const [confirming, setConfirming] = useState(false);

  // ── Load subjects for selected standard ─────────────────────────────────────
  const loadSubjects = useCallback(async () => {
    if (!resolvedStandardId) {
      setSubjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const data = await curriculumService.getSubjects(resolvedStandardId);
      setSubjects(data);

      // Validate saved subject against newly loaded list
      if (selectedId) {
        const valid = data.some(s => s.id === selectedId);
        if (!valid) setSelectedId(null);
      }
    } catch (err) {
      console.warn('[SubjectSelection] Failed to load subjects:', err.message);
      setLoadError('Unable to load subjects. Please try again.');
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedStandardId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load on mount and whenever standard changes
  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  // ── Selected subject object ──────────────────────────────────────────────────
  const selectedSubjectObj = subjects.find(s => s.id === selectedId) || null;

  // ── Handle card selection ────────────────────────────────────────────────────
  const handleSelect = useCallback((subj) => {
    setSelectedId(subj.id);
  }, []);

  // ── Confirm selection and proceed ────────────────────────────────────────────
  const handleConfirm = useCallback(() => {
    if (!selectedSubjectObj) return;
    setConfirming(true);

    // 1. Persist user-scoped preferences (add to existing prefs, don't wipe them)
    if (user?.id) {
      const existing = scopedGetJSON(user.id, PREF_KEY) || {};
      scopedSetJSON(user.id, PREF_KEY, {
        ...existing,
        selectedSubjectId:   selectedSubjectObj.id,
        selectedSubjectName: selectedSubjectObj.name,
      });
    }

    // 2. Push into NavigationContext (for downstream screens like SyllabusPage / games)
    setSelectedSubjectId(selectedSubjectObj.id);
    setSelectedSubject(selectedSubjectObj.name);

    // 3. Navigate to dashboard (Subject Dashboard is the next module — not built yet)
    setTimeout(() => navigateTo('dashboard'), 320);
  }, [selectedSubjectObj, user, setSelectedSubjectId, setSelectedSubject, navigateTo]);

  // ── Change standard (go back, clear subject) ─────────────────────────────────
  const handleChangeStandard = useCallback(() => {
    // Clear subject selection in prefs
    if (user?.id) {
      const existing = scopedGetJSON(user.id, PREF_KEY) || {};
      scopedSetJSON(user.id, PREF_KEY, {
        ...existing,
        selectedSubjectId:   null,
        selectedSubjectName: null,
      });
    }
    setSelectedSubjectId(null);
    setSelectedSubject('');
    navigateTo('select-standard');
  }, [user, setSelectedSubjectId, setSelectedSubject, navigateTo]);

  // ── Redirect if no standard selected ─────────────────────────────────────────
  useEffect(() => {
    if (!loading && !resolvedStandardId) {
      navigateTo('select-standard');
    }
  }, [loading, resolvedStandardId, navigateTo]);

  // ── Theme tokens ─────────────────────────────────────────────────────────────
  const pageBg       = isDark ? '#040810'              : '#F6FAF8';
  const headingColor = isDark ? '#F1F5F4'              : '#10201A';
  const subColor     = isDark ? 'rgba(241,245,244,0.50)' : '#5D6C66';
  const chipBg       = isDark ? 'rgba(16,185,129,0.10)' : '#D1FAE5';
  const chipColor    = isDark ? '#34D399'              : '#047857';
  const panelBg      = isDark ? 'rgba(12,20,17,0.82)'  : '#FFFFFF';
  const panelBorder  = isDark ? 'rgba(167,243,208,0.14)' : '#DDE8E3';
  const dividerColor = isDark ? 'rgba(167,243,208,0.08)' : '#DDE8E3';
  const stdBannerBg  = isDark ? `${standardColor}12`   : `${standardColor}18`;
  const mutedText    = isDark ? 'rgba(241,245,244,0.25)' : '#8A9691';

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: pageBg }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.10) 0%, transparent 65%)'
            : 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(4,120,87,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* ── Back button ────────────────────────────────────────────────────── */}
        <motion.button
          type="button"
          onClick={() => navigateTo('dashboard')}
          id="subject-selection-back-btn"
          className="flex items-center gap-2 mb-8 text-xs font-space tracking-wide cursor-pointer bg-transparent border-0 outline-none focus-visible:underline"
          style={{ color: isDark ? 'rgba(241,245,244,0.35)' : '#8A9691' }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.08 }}
          whileHover={{ color: isDark ? '#F1F5F4' : '#10201A' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* ── Selected Standard banner ────────────────────────────────────────── */}
        <motion.div
          className="flex items-center justify-between mb-8 px-4 py-3 rounded-2xl"
          style={{
            background: stdBannerBg,
            border: `1px solid ${standardColor}30`,
          }}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <GraduationCap size={18} style={{ color: standardColor }} />
            <div>
              <p className="text-[10px] font-orbitron tracking-widest uppercase" style={{ color: standardColor + 'AA' }}>
                Selected Standard
              </p>
              <p className="font-orbitron font-bold text-sm" style={{ color: standardColor }}>
                {standardDisplayName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleChangeStandard}
            id="change-standard-btn"
            className="flex items-center gap-1.5 text-[11px] font-space font-semibold px-3 py-1.5 rounded-xl cursor-pointer bg-transparent border outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-500"
            style={{
              color: standardColor,
              borderColor: `${standardColor}40`,
              background: `${standardColor}0A`,
            }}
          >
            <RotateCcw size={12} />
            Change Standard
          </button>
        </motion.div>

        {/* ── Hero heading ────────────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center mb-4">
            <span
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-orbitron font-bold tracking-widest uppercase"
              style={{ background: chipBg, color: chipColor }}
            >
              <Sparkles size={12} />
              Choose Your Subject
            </span>
          </div>

          <h1
            className="font-orbitron font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4"
            style={{ color: headingColor }}
          >
            Choose Your{' '}
            <span style={{ color: '#10B981' }}>Subject</span>
          </h1>

          <p
            className="font-inter text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
            style={{ color: subColor }}
          >
            Select a subject to continue your learning journey in{' '}
            <strong style={{ color: standardColor, fontWeight: 700 }}>{standardDisplayName}</strong>.
          </p>
        </motion.div>

        {/* ── Main grid + confirm panel ──────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start justify-center">

          {/* ── Subject card grid ──────────────────────────────────────────── */}
          <div className="w-full lg:max-w-2xl xl:max-w-3xl">

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <motion.div
                  className="w-10 h-10 rounded-full border-2 border-emerald-500/30 border-t-emerald-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-sm font-inter" style={{ color: subColor }}>
                  Loading subjects…
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && loadError && (
              <div
                className="flex flex-col items-center gap-4 py-16 px-6 rounded-2xl text-center"
                style={{
                  background: isDark ? 'rgba(239,68,68,0.06)' : '#FEF2F2',
                  border: isDark ? '1px solid rgba(239,68,68,0.18)' : '1px solid #FECACA',
                }}
              >
                <AlertTriangle size={32} className="text-red-400" />
                <p className="text-sm font-inter" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>
                  {loadError}
                </p>
                <button
                  type="button"
                  onClick={loadSubjects}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-space text-xs font-semibold cursor-pointer border outline-none"
                  style={{
                    background: isDark ? 'rgba(239,68,68,0.12)' : '#FEE2E2',
                    borderColor: isDark ? 'rgba(239,68,68,0.30)' : '#FECACA',
                    color: isDark ? '#F87171' : '#B91C1C',
                  }}
                >
                  <RefreshCw size={13} />
                  Retry
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !loadError && subjects.length === 0 && (
              <div
                className="flex flex-col items-center gap-4 py-16 px-6 rounded-2xl text-center"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.02)' : '#F0F7F4',
                  border: isDark ? '1px solid rgba(167,243,208,0.08)' : '1px solid #DDE8E3',
                }}
              >
                <BookOpen size={32} style={{ color: subColor }} />
                <p className="text-sm font-inter" style={{ color: subColor }}>
                  No subjects available for this standard yet.
                </p>
              </div>
            )}

            {/* Cards */}
            {!loading && !loadError && subjects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <AnimatePresence mode="popLayout">
                  {subjects.map((subj, i) => (
                    <SubjectCard
                      key={subj.id}
                      subject={subj}
                      isSelected={selectedId === subj.id}
                      onClick={() => handleSelect(subj)}
                      index={i}
                      isDark={isDark}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Confirm panel (sticky on desktop) ───────────────────────────── */}
          <div className="w-full lg:w-72 xl:w-80 lg:sticky lg:top-10">
            <motion.div
              className="rounded-2xl p-6"
              style={{
                background: panelBg,
                border: `1px solid ${panelBorder}`,
                boxShadow: isDark
                  ? '0 8px 32px rgba(0,0,0,0.45)'
                  : '0 4px 20px rgba(15,23,42,0.08)',
              }}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark ? 'rgba(16,185,129,0.12)' : '#D1FAE5',
                    border: '1px solid rgba(16,185,129,0.25)',
                  }}
                >
                  <BookOpen size={17} style={{ color: '#10B981' }} />
                </div>
                <div>
                  <div className="font-orbitron font-bold text-sm" style={{ color: headingColor }}>
                    Your Selection
                  </div>
                  <div className="text-[11px] font-inter mt-0.5" style={{ color: subColor }}>
                    Pick a subject to continue
                  </div>
                </div>
              </div>

              <div className="h-px mb-5" style={{ background: dividerColor }} />

              {/* Selection preview */}
              <AnimatePresence mode="wait">
                {selectedSubjectObj ? (
                  <motion.div
                    key={selectedSubjectObj.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mb-5"
                  >
                    <div
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: `${selectedSubjectObj.color}12`,
                        border: `1px solid ${selectedSubjectObj.color}30`,
                      }}
                    >
                      <div
                        className="font-orbitron font-black text-lg mb-1"
                        style={{ color: selectedSubjectObj.color }}
                      >
                        {selectedSubjectObj.name}
                      </div>
                      <div
                        className="text-xs font-inter"
                        style={{ color: subColor }}
                      >
                        {selectedSubjectObj.description}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 text-center py-5"
                  >
                    <div className="text-3xl mb-2" style={{ opacity: 0.3 }}>📚</div>
                    <div className="text-xs font-inter" style={{ color: subColor }}>
                      No subject selected yet
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Confirm button */}
              <motion.button
                type="button"
                id="confirm-subject-btn"
                onClick={handleConfirm}
                disabled={!selectedSubjectObj || confirming}
                className="w-full py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider flex items-center justify-center gap-2 border-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                style={{
                  background: selectedSubjectObj
                    ? `linear-gradient(135deg, #10B981, #059669)`
                    : isDark ? 'rgba(255,255,255,0.05)' : '#E5EFEA',
                  color: selectedSubjectObj ? '#fff' : isDark ? 'rgba(241,245,244,0.25)' : '#8A9691',
                  boxShadow: selectedSubjectObj ? '0 0 24px rgba(16,185,129,0.35)' : 'none',
                  cursor: selectedSubjectObj ? 'pointer' : 'not-allowed',
                  transition: 'all 0.22s',
                }}
                whileHover={selectedSubjectObj ? { scale: 1.03, boxShadow: '0 0 36px rgba(16,185,129,0.5)' } : {}}
                whileTap={selectedSubjectObj ? { scale: 0.97 } : {}}
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
                  id="skip-subject-btn"
                  onClick={() => navigateTo('dashboard')}
                  className="text-[11px] font-inter cursor-pointer bg-transparent border-0 outline-none transition-colors focus-visible:underline"
                  style={{ color: mutedText }}
                >
                  Skip for now
                </button>
              </div>
            </motion.div>

            {/* Footnote */}
            <motion.p
              className="text-center text-[11px] font-inter mt-4 leading-relaxed"
              style={{ color: mutedText }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              You can change your subject at any time from your profile.
            </motion.p>
          </div>

        </div>
      </div>
    </div>
  );
}
