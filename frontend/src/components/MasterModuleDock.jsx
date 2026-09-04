import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  LayoutDashboard, Compass, BookOpen, ScrollText, Gamepad2,
  Puzzle, Layers, Cpu, Swords, Trophy, User, Bot, Sparkles,
  ChevronUp, ChevronDown, Layers3, X
} from 'lucide-react';

const MODULES = [
  { id: 'landing', label: 'Landing Page', icon: Sparkles, color: '#10B981' },
  { id: 'login', label: 'Login', icon: User, color: '#34D399' },
  { id: 'register', label: 'Register', icon: User, color: '#67E8F9' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#10B981' },
  { id: 'standards', label: 'Standards', icon: Compass, color: '#67E8F9' },
  { id: 'chapters', label: 'Chapters', icon: BookOpen, color: '#F59E0B' },
  { id: 'mission', label: 'Mission Brief', icon: ScrollText, color: '#34D399' },
  { id: 'lab', label: '2D Lab Game', icon: Gamepad2, color: '#10B981' },
  { id: 'room1', label: 'Room 1 (Elements)', icon: Puzzle, color: '#10B981' },
  { id: 'room2', label: 'Room 2 (Sorting)', icon: Layers, color: '#67E8F9' },
  { id: 'room3', label: 'Room 3 (Computer)', icon: Cpu, color: '#34D399' },
  { id: 'boss', label: 'Boss Battle', icon: Swords, color: '#EF4444' },
  { id: 'mission-complete', label: 'Victory Celebration', icon: Trophy, color: '#F59E0B' },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: '#F59E0B' },
  { id: 'profile', label: 'Student Profile', icon: User, color: '#67E8F9' },
  { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, color: '#10B981' },
];

export default function MasterModuleDock() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentScreen, navigateTo } = useNavigation();

  const handleSelect = (modId) => {
    navigateTo(modId);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      {/* Expanded Dock */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 p-3 rounded-2xl glass-strong border border-emerald-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] max-w-[95vw] md:max-w-4xl overflow-x-auto no-scrollbar"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/10 px-2">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                <span className="font-orbitron font-extrabold text-xs text-white tracking-widest uppercase">
                  EduNova Single-URL Controller
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 py-1 px-1">
              {MODULES.map((mod) => {
                const Icon = mod.icon;
                const isActive = currentScreen === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleSelect(mod.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl font-orbitron font-bold text-xs whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg shadow-emerald-500/30 border border-emerald-400'
                        : 'bg-[#0B1210] border border-emerald-500/15 text-slate-300 hover:text-white hover:bg-[#0F1916]'
                    }`}
                  >
                    <Icon size={14} style={{ color: isActive ? '#050807' : mod.color }} />
                    <span>{mod.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#050807] via-[#0B1210] to-[#0F1916] border border-emerald-500/40 text-emerald-300 font-orbitron font-extrabold text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2.5 backdrop-blur-xl cursor-pointer"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <Layers3 size={15} className="text-emerald-400" />
        <span>Switch Screen ({MODULES.find(m => m.id === currentScreen)?.label || 'Landing Page'})</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </motion.button>
    </div>
  );
}
