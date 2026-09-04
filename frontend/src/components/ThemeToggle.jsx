import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ variant = 'compact', className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer ${
          isDark
            ? 'bg-[#112820] border-[#10B981]/25 text-[#E8F5EE] hover:border-[#10B981]/40'
            : 'bg-white border-[#D1E0D7] text-[#0C3B2E] hover:border-[#10B981] shadow-sm'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme"
      >
        <motion.div
          animate={{ rotate: isDark ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon size={15} className="text-[#34D399]" />
          ) : (
            <Sun size={15} className="text-[#F59E0B]" />
          )}
        </motion.div>
        <span className="text-xs font-semibold select-none font-sans">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    );
  }

  // Default compact icon button
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.92 }}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer overflow-hidden ${
        isDark
          ? 'bg-[#112820] border-[#10B981]/20 text-[#A7F3D0] hover:bg-[#16382C] hover:border-[#10B981]/40'
          : 'bg-white border-[#D1E0D7] text-[#0C3B2E] hover:bg-[#F2F7F4] hover:border-[#10B981] shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle color theme"
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ y: -12, opacity: 0, rotate: -30 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        exit={{ y: 12, opacity: 0, rotate: 30 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon size={17} className="text-[#34D399]" />
        ) : (
          <Sun size={17} className="text-[#F59E0B]" />
        )}
      </motion.div>
    </motion.button>
  );
}

// ─── ThemeSettingsCard for Profile / Settings Pages ─────────────────────────
export function ThemeSettingsCard() {
  const { theme, setLight, setDark, isDark } = useTheme();

  return (
    <div className="card-modern p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-current">Appearance & Theme</h3>
            <p className="text-xs text-muted font-sans mt-0.5">
              Customize your learning interface with modern Light or Deep Dark themes.
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase font-sans">
          {isDark ? 'Deep Dark' : 'Modern Light'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {/* Light Mode Option */}
        <div
          onClick={setLight}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-3 ${
            !isDark
              ? 'border-emerald-600 bg-white shadow-lg ring-2 ring-emerald-500/20'
              : 'border-white/10 bg-[#0c1e18] hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Sun size={15} className="text-amber-500" />
              </div>
              <span className="font-heading font-bold text-sm text-slate-900">Modern Light</span>
            </div>
            {!isDark && (
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="h-14 rounded-xl bg-[#F7F9F7] border border-[#D6E3DC] p-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0C3B2E]" />
              <div className="h-2 w-16 rounded bg-[#D6E3DC]" />
            </div>
            <div className="h-2 w-24 rounded bg-emerald-500/30" />
          </div>

          <p className="text-[11px] text-slate-600">
            Clean white background with deep forest green accents for daytime learning.
          </p>
        </div>

        {/* Dark Mode Option */}
        <div
          onClick={setDark}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-3 ${
            isDark
              ? 'border-emerald-400 bg-[#112820] shadow-lg ring-2 ring-emerald-500/20'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Moon size={15} className="text-emerald-400" />
              </div>
              <span className="font-heading font-bold text-sm text-white">Deep Forest Dark</span>
            </div>
            {isDark && (
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="h-14 rounded-xl bg-[#071510] border border-[#10B981]/20 p-2 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#34D399]" />
              <div className="h-2 w-16 rounded bg-white/20" />
            </div>
            <div className="h-2 w-24 rounded bg-emerald-400/40" />
          </div>

          <p className="text-[11px] text-slate-400">
            Deep pine charcoal with soft mint glow, optimal for night study and low eye strain.
          </p>
        </div>
      </div>
    </div>
  );
}
