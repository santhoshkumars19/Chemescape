import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import PageContainer from '../components/PageContainer';
import chapterService from '../services/chapterService';
import standardService from '../services/standardService';
import {
  ArrowLeft, Lock, Zap, RefreshCw, ChevronRight, Coins,
} from 'lucide-react';

const CHAPTER_METADATA_PRESETS = [
  { accentColor: '#22d3ee', glowColor: 'rgba(34,211,238,0.35)', difficulty: 'Beginner', timeEst: '3h', xp: 500, coins: 120 },
  { accentColor: '#00d4ff', glowColor: 'rgba(0,212,255,0.35)', difficulty: 'Beginner', timeEst: '4h', xp: 650, coins: 160 },
  { accentColor: '#a78bfa', glowColor: 'rgba(167,139,250,0.35)', difficulty: 'Intermediate', timeEst: '4.5h', xp: 700, coins: 180 },
  { accentColor: '#7c3aed', glowColor: 'rgba(124,58,237,0.35)', difficulty: 'Intermediate', timeEst: '5h', xp: 800, coins: 200 },
  { accentColor: '#f97316', glowColor: 'rgba(249,115,22,0.35)', difficulty: 'Intermediate', timeEst: '4h', xp: 750, coins: 190 },
  { accentColor: '#ec4899', glowColor: 'rgba(236,72,153,0.35)', difficulty: 'Advanced', timeEst: '6h', xp: 900, coins: 240 },
  { accentColor: '#f59e0b', glowColor: 'rgba(245,158,11,0.35)', difficulty: 'Advanced', timeEst: '6.5h', xp: 950, coins: 260 },
  { accentColor: '#f43f5e', glowColor: 'rgba(244,63,94,0.35)', difficulty: 'Expert', timeEst: '8h', xp: 1200, coins: 320 },
];

const DEFAULT_CHAPTERS = [
  { id: 'chap-1', title: 'Some Basic Concepts of Chemistry', description: 'Mole concept, stoichiometry, and empirical calculations.', xpReward: 500, coinsReward: 120 },
  { id: 'chap-2', title: 'Structure of Atom', description: 'Quantum mechanical model, orbitals, Hund’s rule, and electron configuration.', xpReward: 650, coinsReward: 160 },
  { id: 'chap-3', title: 'Classification of Elements and Periodicity', description: 'Periodic table reconstruction, groups, periods, and periodic trends.', xpReward: 700, coinsReward: 180 },
  { id: 'chap-4', title: 'Hydrogen', description: 'Isotopes, heavy water, and hydrogen fuel cell reactor control.', xpReward: 800, coinsReward: 200 },
  { id: 'chap-5', title: 's-Block Elements (Alkali & Alkaline Earth Metals)', description: 'Group 1 & 2 metals, flame test identification, and factory sorting.', xpReward: 900, coinsReward: 240 },
  { id: 'chap-6', title: 'States of Matter: Gaseous State', description: 'Gas chamber simulator, Boyle’s Law, Charles’s Law, Combined Gas Law, and Ideal Gas equations.', xpReward: 950, coinsReward: 250 },
];

function ChapterCard({ chapter, index, isUnlocked, onSelect }) {
  if (!chapter) return null;

  const meta = CHAPTER_METADATA_PRESETS[index % CHAPTER_METADATA_PRESETS.length];
  const accent = meta.accentColor;
  const glow = meta.glowColor;

  return (
    <motion.div
      className={`relative rounded-3xl p-6 overflow-hidden flex flex-col justify-between border transition-all ${
        isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-85'
      }`}
      style={{
        background: isUnlocked
          ? 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.55))'
          : 'linear-gradient(135deg, rgba(10,15,30,0.92), rgba(15,23,42,0.75))',
        borderColor: isUnlocked ? `${accent}40` : 'rgba(51,65,85,0.4)',
        boxShadow: isUnlocked ? `0 4px 20px rgba(0,0,0,0.4)` : 'none',
      }}
      whileHover={isUnlocked ? { y: -4, borderColor: accent, boxShadow: `0 0 30px ${glow}` } : {}}
      onClick={() => isUnlocked && onSelect(chapter)}
      id={`chapter-card-${chapter.id}`}
    >
      {/* Lock Status Badge */}
      {!isUnlocked && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 text-slate-400 text-[10px] font-orbitron font-bold">
          <Lock size={12} className="text-amber-400" />
          <span>LOCKED</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-orbitron font-bold ${isUnlocked ? 'text-slate-400' : 'text-slate-500'}`}>
          UNIT {index + 1}
        </span>
        {isUnlocked && (
          <span
            className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold"
            style={{ background: `${accent}20`, color: accent }}
          >
            {chapter.difficulty || meta.difficulty}
          </span>
        )}
      </div>

      <div className="mb-4">
        <h3 className={`text-xl font-orbitron font-black mb-2 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
          {chapter.title || 'Chemistry Unit'}
        </h3>
        <p className="text-xs text-slate-400 font-inter line-clamp-2">
          {chapter.description || 'Master key chemistry concepts in this interactive unit.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
        <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${isUnlocked ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-950/60 border-slate-900 text-slate-500'}`}>
          <Zap size={14} style={{ color: isUnlocked ? accent : '#64748b' }} />
          <span>+{chapter.xpReward || meta.xp} XP</span>
        </div>
        <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${isUnlocked ? 'bg-slate-900/60 border-slate-800 text-white' : 'bg-slate-950/60 border-slate-900 text-slate-500'}`}>
          <Coins size={14} className={isUnlocked ? 'text-amber-400' : 'text-slate-500'} />
          <span>+{chapter.coinsReward || chapter.coinReward || meta.coins} 🪙</span>
        </div>
      </div>

      {isUnlocked ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(chapter);
          }}
          className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-white cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}
        >
          <span>Start Mission</span>
          <ChevronRight size={16} />
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 bg-slate-900/80 border border-slate-800 text-slate-400 cursor-not-allowed"
        >
          <Lock size={14} className="text-slate-400" />
          <span>Complete Unit {index} to Unlock</span>
        </button>
      )}
    </motion.div>
  );
}

export default function ChaptersPage() {
  const { navigateTo, selectedStandardId, selectedStandard, userProgressList, completedRooms } = useNavigation();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChapters();
  }, [selectedStandardId]);

  const loadChapters = async () => {
    setLoading(true);
    setError(null);
    try {
      let stdId = selectedStandardId;

      if (!stdId) {
        const stdList = await standardService.getAllStandards();
        const stds = Array.isArray(stdList) ? stdList : stdList?.standards || [];
        if (stds.length > 0) stdId = stds[0].id;
      }

      if (stdId && stdId !== 'std-11' && stdId !== 'std-12') {
        const data = await chapterService.getChaptersByStandard(stdId);
        let loaded = [];
        if (Array.isArray(data)) {
          loaded = data;
        } else if (data && Array.isArray(data.chapters)) {
          loaded = data.chapters;
        } else if (data && data.data && Array.isArray(data.data.chapters)) {
          loaded = data.data.chapters;
        }

        if (loaded.length > 0) {
          if (loaded.length < DEFAULT_CHAPTERS.length) {
            const mergedMap = new Map();
            DEFAULT_CHAPTERS.forEach(ch => mergedMap.set(ch.id, ch));
            loaded.forEach(ch => {
              if (ch && ch.id) mergedMap.set(ch.id, ch);
            });
            setChapters(Array.from(mergedMap.values()));
          } else {
            setChapters(loaded);
          }
          setLoading(false);
          return;
        }
      }

      setChapters(DEFAULT_CHAPTERS);
    } catch (err) {
      console.warn('Backend connection/auth notice for chapters:', err.message);
      setChapters(DEFAULT_CHAPTERS);
    } finally {
      setLoading(false);
    }
  };

  const isUnitCompleted = (unitIndex) => {
    const ch = (chapters || [])[unitIndex] || DEFAULT_CHAPTERS[unitIndex];
    if (!ch) return false;

    const possibleIds = [
      ch.id,
      `chap-${unitIndex + 1}`,
      `chap_${unitIndex + 1}`,
      `room${unitIndex + 1}`,
      `room-${unitIndex + 1}`,
      `unit${unitIndex + 1}`,
      `unit-${unitIndex + 1}`,
      `${unitIndex + 1}`,
    ];

    // Check local completedRooms state
    const localMatch = possibleIds.some((id) => completedRooms?.includes(id));
    if (localMatch) return true;

    // Check backend userProgressList
    if (Array.isArray(userProgressList)) {
      const backendMatch = userProgressList.some((p) => {
        if (!p.isCompleted) return false;
        const roomId = p.roomId || p.room?.id;
        const chapterId = p.chapterId || p.chapter?.id;
        const roomNum = p.room?.roomNumber;
        return (
          possibleIds.includes(roomId) ||
          possibleIds.includes(chapterId) ||
          roomNum === unitIndex + 1
        );
      });
      if (backendMatch) return true;
    }

    return false;
  };

  const isUnitUnlocked = (unitIndex) => {
    if (unitIndex === 0) return true; // Unit 1 is always unlocked
    return isUnitCompleted(unitIndex - 1); // Unit N unlocks only if Unit N-1 is completed
  };

  const handleSelectChapter = (chapter) => {
    navigateTo('mission', { chapterId: chapter.id, chapter });
  };

  return (
    <div className="relative min-h-screen bg-[#040810] text-white overflow-x-hidden w-full">
      <PageContainer className="relative z-10 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigateTo('syllabus')}
            className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 font-space text-sm transition-colors bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft size={15} /> Back to Standards
          </button>
          <span className="text-xs font-orbitron text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full">
            {selectedStandard || '11th Standard'}
          </span>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 mb-3">
            CHEMISTRY UNITS & MISSIONS
          </h1>
          <p className="text-sm font-inter text-slate-400">Choose a unit to view topics, room objectives, and launch game engines:</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 font-orbitron text-cyan-400">
            <RefreshCw size={36} className="animate-spin mb-3" />
            <p className="text-xs tracking-widest uppercase">LOADING CHAPTERS FROM BACKEND...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <p className="text-sm text-red-300 font-mono mb-4">{error}</p>
            <button onClick={loadChapters} className="px-5 py-2 bg-red-900 hover:bg-red-800 rounded-xl text-xs font-orbitron text-white cursor-pointer">
              RETRY BACKEND CONNECTION
            </button>
          </div>
        ) : (chapters || []).length === 0 ? (
          <div className="text-center py-16 font-orbitron text-slate-400">
            <p>No chapters available yet for this standard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(chapters || []).map((chapter, index) => (
              <ChapterCard
                key={chapter?.id || `ch-idx-${index}`}
                chapter={chapter}
                index={index}
                isUnlocked={isUnitUnlocked(index)}
                onSelect={handleSelectChapter}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
