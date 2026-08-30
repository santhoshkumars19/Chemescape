import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getChaptersForStandardAndSubject,
  getSubjectsForStandard,
} from '../config/curriculumConfig';
import {
  Trophy, Star, Zap, Coins, Award, Download, RotateCcw,
  Play, LayoutDashboard, Share2, Sparkles, CheckCircle2,
  ShieldCheck, Eye, X, ArrowRight, Clock, Target,
  GraduationCap, BookOpen, Flag, Lock, Unlock,
} from 'lucide-react';

// ── Particle Canvas Component for Fireworks & Confetti ────────────────────────
function CelebrationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const colors = ['#10b981', '#00d4ff', '#a855f7', '#34d399', '#fbbf24', '#f43f5e', '#60a5fa'];
    const particles = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 2.5,
        vy: Math.random() * 2.5 + 1.5,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 4,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.y > height) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />;
}

// ── Certificate Modal Component ───────────────────────────────────────────────
function CertificateModal({ isOpen, onClose, studentName, chapterName, standardName, subjectName, dateStr, badgeTitle, isDark }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-center overflow-hidden border"
          style={{
            background: isDark ? '#0B1329' : '#FFFFFF',
            borderColor: isDark ? 'rgba(0,212,255,0.3)' : '#DDE8E3',
            boxShadow: isDark ? '0 0 80px rgba(0,212,255,0.25)' : '0 10px 40px rgba(15,23,42,0.12)',
            color: isDark ? '#F1F5F4' : '#10201A',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer border-0"
            style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#EEF5F2', color: isDark ? '#FFF' : '#333' }}
          >
            <X size={18} />
          </button>

          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30">
              <div
                className="w-full h-full rounded-[14px] flex items-center justify-center"
                style={{ background: isDark ? '#0B1329' : '#FFFFFF' }}
              >
                <Trophy size={28} className="text-amber-400" />
              </div>
            </div>
          </div>

          <p className="font-orbitron text-[10px] sm:text-xs font-bold text-emerald-400 tracking-widest uppercase mb-1">
            CHEMESCAPE OFFICIAL DIPLOMA
          </p>
          <h2 className="font-orbitron font-black text-2xl sm:text-3xl mb-2">
            CERTIFICATE OF MASTERY
          </h2>
          <p className="text-xs sm:text-sm font-space max-w-lg mx-auto mb-6" style={{ color: isDark ? '#94A3B8' : '#5D6C66' }}>
            This certifies that the undersigned student has successfully conquered all challenges, escaped the security chambers, and mastered the required unit syllabus.
          </p>

          <div
            className="my-5 p-5 rounded-2xl border relative text-left"
            style={{
              background: isDark ? 'rgba(0,0,0,0.45)' : '#F6FAF8',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#DDE8E3',
            }}
          >
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-widest mb-0.5">Awarded To</p>
            <h3 className="font-space font-extrabold text-xl sm:text-2xl text-emerald-400 mb-3">{studentName}</h3>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5 text-xs font-space">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Curriculum</p>
                <p className="font-orbitron font-bold text-white mt-0.5">{standardName} · {subjectName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Chapter Solved</p>
                <p className="font-orbitron font-bold text-amber-400 mt-0.5">{chapterName}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10 text-xs font-space" style={{ color: isDark ? '#64748B' : '#8A9691' }}>
            <div>Date Issued: {dateStr}</div>
            <button
              onClick={() => alert("Certificate downloaded successfully as PDF!")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-950 font-orbitron text-xs font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform cursor-pointer border-0"
            >
              <Download size={14} /> Download Certificate
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MISSION COMPLETE PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MissionCompletePage() {
  const {
    navigateTo,
    selectedStandardId, selectedStandard,
    selectedSubjectId, selectedSubject,
    selectedChapterId, selectedChapter,
    completedRooms, userProgressList, xp, coins,
    markRoomCompleted, refreshUserStats,
  } = useNavigation();

  const { user } = useAuth();
  const { isDark } = useTheme();

  // ── 1. Resolve Context ───────────────────────────────────────────────────────
  const resolvedStdId = selectedStandardId || 'grade-11';
  const resolvedSubjId = selectedSubjectId || 'chemistry';
  const standardName = selectedStandard || (resolvedStdId === 'grade-4' ? '4th Standard' : '11th Standard');
  const subjectName = selectedSubject || (resolvedSubjId.charAt(0).toUpperCase() + resolvedSubjId.slice(1));
  const studentName = user?.name || user?.username || 'Student Agent';

  const subjects = getSubjectsForStandard(resolvedStdId);
  const subjConfig = subjects.find(s => s.id === resolvedSubjId);
  const accentColor = subjConfig?.color || '#10B981';

  // ── 2. Resolve Chapter Data ──────────────────────────────────────────────────
  const chaptersList = useMemo(() => {
    return getChaptersForStandardAndSubject(resolvedStdId, resolvedSubjId);
  }, [resolvedStdId, resolvedSubjId]);

  const activeChapter = useMemo(() => {
    if (typeof selectedChapter === 'object' && selectedChapter?.title) {
      return selectedChapter;
    }
    if (selectedChapterId) {
      const found = chaptersList.find(c => c.id === selectedChapterId);
      if (found) return found;
    }
    return chaptersList[0] || { id: 'chap-1', chapterNumber: 1, title: 'Chapter 1', xpReward: 500, coinsReward: 100 };
  }, [selectedChapter, selectedChapterId, chaptersList]);

  const chapterIndex = useMemo(() => {
    const idx = chaptersList.findIndex(c => c.id === activeChapter.id);
    return idx >= 0 ? idx : 0;
  }, [chaptersList, activeChapter]);

  const chapterName = activeChapter.title || `Chapter ${activeChapter.chapterNumber || chapterIndex + 1}`;
  const isFinalChapter = chapterIndex === chaptersList.length - 1;
  const nextChapter = !isFinalChapter ? chaptersList[chapterIndex + 1] : null;

  // ── 3. Rewards & Performance Stats ──────────────────────────────────────────
  const xpEarned = activeChapter.xpReward || 500;
  const coinsEarned = activeChapter.coinsReward || 100;
  const badgeTitle = activeChapter.badgeName || `${subjectName} Explorer`;
  const badgeIcon = activeChapter.badgeIcon || '🏅';

  // ── 4. UI States & Counter Animations ────────────────────────────────────────
  const [stars, setStars] = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);
  const [displayedXp, setDisplayedXp] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // ── 5. Auto-mark Completion & Refresh on Mount ───────────────────────────────
  useEffect(() => {
    // Mark room/chapter completed and refresh stats
    if (activeChapter?.id) {
      markRoomCompleted(activeChapter.id, activeChapter.id);
    }

    // Sequence star rating animations
    const starTimer1 = setTimeout(() => setStars(1), 400);
    const starTimer2 = setTimeout(() => setStars(2), 800);
    const starTimer3 = setTimeout(() => setStars(3), 1200);

    // XP counter animation
    let xpStep = 0;
    const xpInterval = setInterval(() => {
      xpStep += Math.ceil(xpEarned / 18);
      if (xpStep >= xpEarned) {
        setDisplayedXp(xpEarned);
        clearInterval(xpInterval);
      } else {
        setDisplayedXp(xpStep);
      }
    }, 40);

    // Coins counter animation
    let coinStep = 0;
    const coinInterval = setInterval(() => {
      coinStep += Math.ceil(coinsEarned / 18);
      if (coinStep >= coinsEarned) {
        setDisplayedCoins(coinsEarned);
        clearInterval(coinInterval);
      } else {
        setDisplayedCoins(coinStep);
      }
    }, 40);

    return () => {
      clearTimeout(starTimer1);
      clearTimeout(starTimer2);
      clearTimeout(starTimer3);
      clearInterval(xpInterval);
      clearInterval(coinInterval);
    };
  }, [activeChapter, xpEarned, coinsEarned, markRoomCompleted]);

  // ── 6. Safe Navigation Handlers (Prevents Double-Click) ──────────────────────
  const handleContinueLearning = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    try {
      if (user?.id) await refreshUserStats(user.id);
      else await refreshUserStats();
    } catch {
      /* non-fatal */
    }

    navigateTo('chapters');
  }, [isTransitioning, user, refreshUserStats, navigateTo]);

  const handleBackToDashboard = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    try {
      if (user?.id) await refreshUserStats(user.id);
      else await refreshUserStats();
    } catch {
      /* non-fatal */
    }

    navigateTo('dashboard');
  }, [isTransitioning, user, refreshUserStats, navigateTo]);

  const handleReplayMission = useCallback(() => {
    if (isTransitioning) return;
    navigateTo('mission', { chapterId: activeChapter.id, chapter: activeChapter });
  }, [isTransitioning, activeChapter, navigateTo]);

  // ── Styles ───────────────────────────────────────────────────────────────────
  const pageBg = isDark ? '#040810' : '#F6FAF8';
  const cardBg = isDark ? 'rgba(12,20,17,0.85)' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(167,243,208,0.14)' : '#DDE8E3';
  const textHead = isDark ? '#F1F5F4' : '#10201A';
  const textMuted = isDark ? 'rgba(241,245,244,0.55)' : '#5D6C66';

  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden flex flex-col justify-between"
      style={{ background: pageBg, color: textHead }}
    >
      <CelebrationCanvas />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${accentColor}18 0%, transparent 70%)` }}
        />
        {isDark && <div className="absolute inset-0 lab-grid opacity-10" />}
      </div>

      {/* Top Header */}
      <header
        className="relative z-20 w-full border-b"
        style={{
          background: isDark ? 'rgba(4,8,16,0.75)' : 'rgba(255,255,255,0.85)',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#DDE8E3',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 font-orbitron text-xs font-bold tracking-wider hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
            style={{ color: accentColor }}
          >
            <Sparkles className="w-4 h-4" />
            <span>ChemEscape HQ</span>
          </button>

          {/* Standard & Subject chip */}
          <div className="flex items-center gap-2">
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-space font-semibold"
              style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}
            >
              <GraduationCap size={12} />
              {standardName} › {subjectName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Victory Console */}
      <main className="relative z-20 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center justify-center text-center">

        {/* Victory Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 14 }}
          className="mb-4"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-orbitron text-xs font-bold uppercase tracking-widest shadow-lg"
            style={{
              background: isFinalChapter
                ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))'
                : 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(34,211,238,0.15))',
              border: isFinalChapter ? '1px solid #F59E0B' : `1px solid ${accentColor}50`,
              color: isFinalChapter ? '#F59E0B' : '#34D399',
            }}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            {isFinalChapter ? 'SUBJECT MASTERED!' : 'MISSION ACCOMPLISHED!'}
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-orbitron font-black text-3xl sm:text-5xl uppercase tracking-tight mb-2"
          style={{ color: textHead }}
        >
          {isFinalChapter ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400">
              {subjectName} Conquered!
            </span>
          ) : (
            <span>MISSION COMPLETE!</span>
          )}
        </motion.h1>

        <p className="font-space text-xs sm:text-sm max-w-md mx-auto mb-6" style={{ color: textMuted }}>
          Unit Solved: <span className="font-semibold" style={{ color: accentColor }}>{chapterName}</span>
        </p>

        {/* 3-Star Rating Row */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-8">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: stars >= starNum ? 1 : 0.6,
                rotate: stars >= starNum ? 0 : -35,
                opacity: stars >= starNum ? 1 : 0.25,
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 220 }}
            >
              <Star
                size={40}
                className={
                  stars >= starNum
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_18px_rgba(251,191,36,0.6)]'
                    : 'text-slate-600 fill-slate-800'
                }
              />
            </motion.div>
          ))}
        </div>

        {/* Rewards Summary Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl mb-6"
        >
          {/* XP Card */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: `${accentColor}15`, color: accentColor }}>
              <Zap size={18} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-wider">XP Earned</p>
            <p className="font-orbitron font-extrabold text-xl mt-0.5" style={{ color: accentColor }}>+{displayedXp}</p>
          </div>

          {/* Coins Card */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
              <Coins size={18} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-wider">Coins Earned</p>
            <p className="font-orbitron font-extrabold text-xl text-amber-400 mt-0.5">+{displayedCoins}</p>
          </div>

          {/* Accuracy Card */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Target size={18} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-wider">Accuracy</p>
            <p className="font-orbitron font-extrabold text-xl text-emerald-400 mt-0.5">100%</p>
          </div>

          {/* Badge Card */}
          <div
            className="p-4 rounded-2xl flex flex-col items-center border"
            style={{ background: cardBg, borderColor: cardBorder }}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
              <Award size={18} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-wider">Badge</p>
            <p className="font-orbitron font-bold text-xs text-purple-300 mt-1 truncate w-full text-center">{badgeTitle}</p>
          </div>
        </motion.div>

        {/* ── Next Chapter Unlock Banner (if not final) ── */}
        {!isFinalChapter && nextChapter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-2xl p-4 rounded-2xl border mb-6 flex items-center justify-between gap-3 text-left"
            style={{
              background: isDark ? 'rgba(16,185,129,0.08)' : '#ECFDF5',
              borderColor: isDark ? 'rgba(16,185,129,0.30)' : '#A7F3D0',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Unlock size={20} />
              </div>
              <div>
                <span className="text-[10px] font-orbitron font-bold uppercase tracking-wider text-emerald-400 block">
                  NEXT CHAPTER UNLOCKED!
                </span>
                <p className="font-orbitron font-black text-sm text-white truncate">
                  Chapter {nextChapter.chapterNumber || chapterIndex + 2}: {nextChapter.title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinueLearning}
              disabled={isTransitioning}
              className="px-4 py-2 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase text-slate-950 flex items-center gap-1.5 cursor-pointer border-0 whitespace-nowrap shadow-md"
              style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}
            >
              <span>Play Next</span>
              <ChevronRight size={14} />
            </button>
          </motion.div>
        )}

        {/* Certificate Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-2xl p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
          style={{
            background: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF',
            borderColor: cardBorder,
          }}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 flex-shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-sm text-white">Certificate of Achievement</h4>
              <p className="text-xs font-space" style={{ color: textMuted }}>
                Official diploma issued to {studentName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCertModal(true)}
            className="px-4 py-2.5 rounded-xl border text-xs font-orbitron font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            style={{
              background: isDark ? 'rgba(168,85,247,0.15)' : '#F3E8FF',
              borderColor: 'rgba(168,85,247,0.35)',
              color: isDark ? '#D8B4FE' : '#7E22CE',
            }}
          >
            <Eye size={14} />
            View Certificate
          </button>
        </motion.div>

        {/* Action Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-2xl"
        >
          {/* Replay */}
          <button
            type="button"
            onClick={handleReplayMission}
            disabled={isTransitioning}
            className="w-full sm:flex-1 py-3.5 rounded-xl border font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : '#EEF5F2',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#DDE8E3',
              color: isDark ? '#CBD5E1' : '#334155',
            }}
          >
            <RotateCcw size={14} />
            Replay Mission
          </button>

          {/* Primary CTA: Continue Learning */}
          <button
            type="button"
            id="mission-complete-continue-btn"
            onClick={handleContinueLearning}
            disabled={isTransitioning}
            className="w-full sm:flex-1 py-3.5 rounded-xl font-orbitron font-black text-xs uppercase tracking-widest text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 cursor-pointer border-0"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, #34D399)`,
              boxShadow: `0 0 24px ${accentColor}40`,
            }}
          >
            <Play size={14} className="fill-slate-950" />
            <span>Continue Learning</span>
          </button>

          {/* Back to Dashboard */}
          <button
            type="button"
            onClick={handleBackToDashboard}
            disabled={isTransitioning}
            className="w-full sm:flex-1 py-3.5 rounded-xl border font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{
              background: isDark ? 'rgba(168,85,247,0.15)' : '#F3E8FF',
              borderColor: 'rgba(168,85,247,0.3)',
              color: isDark ? '#D8B4FE' : '#7E22CE',
            }}
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center font-orbitron text-[10px] tracking-widest uppercase opacity-40">
        ChemEscape Educational Adventure Suite • Mission Synchronized
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        studentName={studentName}
        chapterName={chapterName}
        standardName={standardName}
        subjectName={subjectName}
        dateStr={currentDate}
        badgeTitle={badgeTitle}
        isDark={isDark}
      />
    </div>
  );
}
