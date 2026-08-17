import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  Trophy, Star, Zap, Coins, Award, Download, RotateCcw,
  Play, LayoutDashboard, Share2, Sparkles, CheckCircle2,
  ShieldCheck, Eye, X, ArrowRight, ExternalLink
} from 'lucide-react';

// ── Particle Canvas Component for Fireworks & Confetti ──
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

    const colors = ['#00d4ff', '#a855f7', '#34d399', '#fbbf24', '#f43f5e', '#60a5fa'];
    const particles = [];
    const particleCount = 120;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 5,
        opacity: Math.random() * 0.8 + 0.2,
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

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10"
    />
  );
}

// ── Certificate Modal Component ──
function CertificateModal({ isOpen, onClose, studentName, chapterName, dateStr, badgeTitle }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border-2 border-cyan-500/30 p-8 shadow-[0_0_80px_rgba(0,212,255,0.25)] text-center overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/30">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Trophy size={32} className="text-amber-400" />
              </div>
            </div>
          </div>

          <p className="font-orbitron text-xs font-bold text-cyan-400 tracking-widest uppercase mb-1">
            CHEMESCAPE OFFICIAL DIPLOMA
          </p>
          <h2 className="font-orbitron font-black text-3xl text-white mb-2">
            CERTIFICATE OF MASTERY
          </h2>
          <p className="text-slate-400 font-space text-xs max-w-lg mx-auto mb-8">
            This certifies that the undersigned student has successfully solved all chemical equations, escaped all lab chambers, and defeated the AEGIS-9000 Security AI.
          </p>

          <div className="my-6 p-6 rounded-2xl bg-slate-950/60 border border-white/10 relative">
            <p className="text-xs font-space text-slate-500 uppercase tracking-widest mb-1">Awarded To</p>
            <h3 className="font-space font-extrabold text-2xl text-cyan-300 mb-4">{studentName}</h3>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] font-space text-slate-500 uppercase">Chapter Completed</p>
                <p className="font-orbitron text-xs font-bold text-white">{chapterName}</p>
              </div>
              <div>
                <p className="text-[10px] font-space text-slate-500 uppercase">Title Earned</p>
                <p className="font-orbitron text-xs font-bold text-amber-400">{badgeTitle}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10 text-xs font-space text-slate-400">
            <div>Date Issued: {dateStr}</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Certificate downloaded successfully as PDF!")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-orbitron text-xs font-bold shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform"
              >
                <Download size={15} /> Download Certificate
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Main Mission Complete Page ──
export default function MissionCompletePage() {
  const { navigateTo } = useNavigation();

  const chapterName = "Periodic Table & Atomic Structure";
  const xpEarned = 750;
  const coinsEarned = 180;
  const badgeTitle = "Master Elementalist";
  const studentName = "Demo Chemist";

  const [stars, setStars] = useState(0);
  const [showCertModal, setShowCertModal] = useState(false);
  const [displayedXp, setDisplayedXp] = useState(0);
  const [displayedCoins, setDisplayedCoins] = useState(0);

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    const starTimer1 = setTimeout(() => setStars(1), 500);
    const starTimer2 = setTimeout(() => setStars(2), 1000);
    const starTimer3 = setTimeout(() => setStars(3), 1500);

    let xpStep = 0;
    const xpInterval = setInterval(() => {
      xpStep += Math.ceil(xpEarned / 20);
      if (xpStep >= xpEarned) {
        setDisplayedXp(xpEarned);
        clearInterval(xpInterval);
      } else {
        setDisplayedXp(xpStep);
      }
    }, 40);

    let coinStep = 0;
    const coinInterval = setInterval(() => {
      coinStep += Math.ceil(coinsEarned / 20);
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
  }, [xpEarned, coinsEarned]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white overflow-x-hidden flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      <CelebrationCanvas />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/15 via-purple-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between w-full box-border">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-cyan-400 font-orbitron text-xs font-bold tracking-wider hover:text-cyan-300 transition-colors bg-transparent border-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>ChemEscape HQ</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-orbitron font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>+750 XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 py-8 flex flex-col items-center justify-center text-center">
        {/* Animated Badge Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 border border-cyan-400/30 text-cyan-300 font-orbitron text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            <Trophy className="w-4 h-4 text-amber-400" />
            Mission Accomplished
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-orbitron font-black text-4xl sm:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-purple-300 uppercase tracking-tight mb-2"
        >
          MISSION COMPLETE!
        </motion.h1>

        <p className="text-slate-400 font-space text-sm max-w-md mx-auto mb-8">
          Chapter: <span className="text-cyan-400 font-semibold">{chapterName}</span>
        </p>

        {/* 3-Star Rating Row */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: stars >= starNum ? 1 : 0.6,
                rotate: stars >= starNum ? 0 : -45,
                opacity: stars >= starNum ? 1 : 0.2,
              }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="relative"
            >
              <Star
                size={48}
                className={
                  stars >= starNum
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]'
                    : 'text-slate-700 fill-slate-800'
                }
              />
            </motion.div>
          ))}
        </div>

        {/* Rewards Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10"
        >
          {/* XP Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-xl flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Zap size={20} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-widest mb-1">XP Earned</p>
            <p className="font-orbitron font-extrabold text-2xl text-cyan-300">+{displayedXp}</p>
          </div>

          {/* Coins Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/20 backdrop-blur-xl flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Coins size={20} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-widest mb-1">Coins Earned</p>
            <p className="font-orbitron font-extrabold text-2xl text-amber-300">+{displayedCoins}</p>
          </div>

          {/* Badge Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl flex flex-col items-center">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <Award size={20} />
            </div>
            <p className="text-[10px] font-space text-slate-400 uppercase tracking-widest mb-1">Badge Unlocked</p>
            <p className="font-orbitron font-bold text-xs text-purple-300 truncate w-full text-center">{badgeTitle}</p>
          </div>
        </motion.div>

        {/* Certificate Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-2xl p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-10"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-orbitron font-bold text-sm text-white">Certificate of Achievement</h4>
              <p className="text-xs text-slate-400 font-space">Official diploma generated for {chapterName}</p>
            </div>
          </div>

          <button
            onClick={() => setShowCertModal(true)}
            className="px-5 py-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 hover:bg-purple-500/30 text-purple-200 font-orbitron text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
          >
            <Eye size={14} />
            View Certificate
          </button>
        </motion.div>

        {/* Navigation Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl"
        >
          {/* Replay */}
          <button
            onClick={() => navigateTo('room1')}
            className="w-full sm:flex-1 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-orbitron font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
            Replay Mission
          </button>

          {/* Next Mission */}
          <button
            onClick={() => navigateTo('chapters')}
            className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-orbitron font-black text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <Play size={15} className="fill-white" />
            Next Mission
          </button>

          {/* Dashboard */}
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-full sm:flex-1 py-3.5 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300 font-orbitron font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center text-slate-600 font-orbitron text-[10px] tracking-widest uppercase">
        ChemEscape AAA Interactive Gaming Suite • All Puzzles Cleared
      </footer>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        studentName={studentName}
        chapterName={chapterName}
        dateStr={currentDate}
        badgeTitle={badgeTitle}
      />
    </div>
  );
}
