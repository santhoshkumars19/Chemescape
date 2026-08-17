import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import PageContainer from '../components/PageContainer';
import standardService from '../services/standardService';
import {
  BookOpen, Clock, Layers, Zap, ChevronRight,
  Rocket, Shield, Star, ArrowLeft, FlaskConical,
  Atom, Sparkles, Trophy, Lock, RefreshCw
} from 'lucide-react';

// ─── SVG Illustration — Grade 11 (foundational lab scene) ────────────────────
function Illustration11({ hovered, color }) {
  return (
    <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="glow11" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beaker11" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="liquid11" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <ellipse cx="160" cy="110" rx="120" ry="90" fill="url(#glow11)" />
      <g>
        <path d="M120 60 L100 160 Q100 170 110 170 L210 170 Q220 170 220 160 L200 60 Z"
          fill="url(#beaker11)" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
        <rect x="116" y="56" width="88" height="12" rx="4"
          fill="rgba(255,255,255,0.06)" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" />
        <path d="M118 120 L104 160 Q104 167 110 167 L210 167 Q216 167 216 160 L202 120 Z"
          fill="url(#liquid11)" />
      </g>
    </svg>
  );
}

function SyllabusCard({ syllabus, onSelect }) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    background: `linear-gradient(135deg, ${syllabus.gradientFrom || 'rgba(0,212,255,0.12)'}, ${syllabus.gradientTo || 'rgba(34,211,238,0.03)'})`,
    border: `1.5px solid ${hovered ? syllabus.color || '#00d4ff' : syllabus.borderColor || 'rgba(0,212,255,0.2)'}`,
    boxShadow: hovered ? `0 0 40px ${syllabus.glowColor || 'rgba(0,212,255,0.3)'}` : '0 4px 20px rgba(0,0,0,0.4)',
  };

  return (
    <motion.div
      className="relative rounded-3xl p-6 sm:p-8 overflow-hidden cursor-pointer flex flex-col justify-between"
      style={cardStyle}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onSelect(syllabus)}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      id={`standard-card-${syllabus.grade?.toLowerCase() || '11th'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-orbitron font-bold tracking-wider"
          style={{ background: syllabus.difficultyBg || 'rgba(34,211,238,0.1)', color: syllabus.difficultyColor || '#22d3ee' }}>
          {syllabus.grade || 'Standard'}
        </span>
        <span className="text-xs font-space text-slate-400 flex items-center gap-1">
          <BookOpen size={14} /> {syllabus.chapterCount || 14} Chapters
        </span>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl sm:text-3xl font-orbitron font-black text-white mb-2">{syllabus.displayName || syllabus.fullLabel || syllabus.name}</h3>
        <p className="text-sm text-slate-300 font-inter leading-relaxed">{syllabus.description || syllabus.subtitle}</p>
      </div>

      <div className="h-44 w-full mb-6 rounded-2xl overflow-hidden relative">
        <Illustration11 hovered={hovered} color={syllabus.color || '#00d4ff'} />
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(syllabus);
        }}
        className="w-full py-4 rounded-xl font-orbitron font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 text-white cursor-pointer"
        style={{ background: `linear-gradient(135deg, ${syllabus.color || '#00d4ff'}, ${syllabus.color || '#00d4ff'}aa)` }}
      >
        <span>Explore Syllabus</span>
        <ChevronRight size={18} />
      </button>
    </motion.div>
  );
}

export default function SyllabusPage() {
  const { navigateTo } = useNavigation();
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandards();
  }, []);

  const fetchStandards = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await standardService.getAllStandards();
      const loaded = Array.isArray(data) ? data : data?.standards || [];

      if (loaded.length === 0) throw new Error('No standards returned');

      // Format standards with clean visual styling and labels
      const formatted = loaded.map((std, idx) => {
        const rawName = String(std.displayName || std.name || `Standard ${idx + 11}`);
        const is12 = rawName.includes('12');
        const displayTitle = std.displayName || (is12 ? '12th Standard Chemistry' : '11th Standard Chemistry');

        return {
          ...std,
          name: displayTitle,
          displayName: displayTitle,
          grade: is12 ? '12th' : '11th',
          fullLabel: displayTitle,
          subtitle: std.description || (idx === 0 ? 'Foundational Physical, Inorganic & Organic Chemistry' : 'Advanced Chemical Kinetics & Electrochemistry'),
          chapterCount: std._count?.chapters || (idx === 0 ? 14 : 16),
          color: idx === 0 ? '#00d4ff' : '#a855f7',
          difficultyColor: idx === 0 ? '#22d3ee' : '#a855f7',
          gradientFrom: idx === 0 ? 'rgba(0,212,255,0.12)' : 'rgba(168,85,247,0.12)',
          borderColor: idx === 0 ? 'rgba(0,212,255,0.2)' : 'rgba(168,85,247,0.2)',
        };
      });

      setStandards(formatted);
    } catch (err) {
      console.warn('Backend connection/auth notice for standards:', err.message);

      // Fallback default standards for guest/offline playback
      setStandards([
        {
          id: 'std-11',
          name: '11th Standard Chemistry',
          displayName: '11th Standard Chemistry',
          grade: '11th',
          fullLabel: '11th Standard Chemistry',
          subtitle: 'Foundational Physical, Inorganic & Organic Chemistry',
          chapterCount: 14,
          color: '#00d4ff',
          difficultyColor: '#22d3ee',
          gradientFrom: 'rgba(0,212,255,0.12)',
          borderColor: 'rgba(0,212,255,0.2)',
        },
        {
          id: 'std-12',
          name: '12th Standard Chemistry',
          displayName: '12th Standard Chemistry',
          grade: '12th',
          fullLabel: '12th Standard Chemistry',
          subtitle: 'Advanced Chemical Kinetics & Electrochemistry',
          chapterCount: 16,
          color: '#a855f7',
          difficultyColor: '#a855f7',
          gradientFrom: 'rgba(168,85,247,0.12)',
          borderColor: 'rgba(168,85,247,0.2)',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (syllabus) => {
    navigateTo('chapters', { standardId: syllabus.id, standard: syllabus.displayName || syllabus.fullLabel || syllabus.name });
  };

  return (
    <div className="relative min-h-screen bg-[#040810] text-white overflow-x-hidden w-full">
      <PageContainer className="relative z-10 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigateTo('dashboard')}
            className="inline-flex items-center gap-2 text-white/40 hover:text-cyan-400 font-space text-sm transition-colors bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 mb-3">
            CHEMISTRY SYLLABUS ARCHIVE
          </h1>
          <p className="text-sm font-inter text-slate-400">Select your academic standard to launch into gamified Chemistry units:</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 font-orbitron text-cyan-400">
            <RefreshCw size={36} className="animate-spin mb-3" />
            <p className="text-xs tracking-widest uppercase">LOADING SYLLABUS STANDARDS FROM BACKEND...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-6 text-center max-w-md mx-auto my-12">
            <p className="text-sm text-red-300 font-mono mb-4">{error}</p>
            <button onClick={fetchStandards} className="px-5 py-2 bg-red-900 hover:bg-red-800 rounded-xl text-xs font-orbitron text-white cursor-pointer">
              RETRY BACKEND CONNECTION
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full">
            {(standards || []).map((syllabus) => (
              <SyllabusCard
                key={syllabus.id}
                syllabus={syllabus}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
