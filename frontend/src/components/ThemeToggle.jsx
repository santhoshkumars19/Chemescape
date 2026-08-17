import { motion } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — can be used in any settings page.
 * Shows a Sun / Moon pill toggle with animated knob.
 * Variant 'pill'  → animated sliding pill (default, for settings pages)
 * Variant 'icon'  → just icon button (for topbar if needed)
 */
export function ThemeToggle({ variant = 'pill' }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all cursor-pointer border border-emerald-500/15"
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-emerald-600" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Sun size={15} className={isDark ? 'text-slate-500' : 'text-amber-500'} />
      <button
        onClick={toggleTheme}
        className="relative w-14 h-7 rounded-full transition-all cursor-pointer flex-shrink-0"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0B1210, #10B981)'
            : 'linear-gradient(135deg, #F59E0B, #F97316)',
          border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(245,158,11,0.4)',
          boxShadow: isDark
            ? '0 0 12px rgba(16,185,129,0.2)'
            : '0 0 12px rgba(245,158,11,0.2)',
        }}
        aria-label="Toggle theme"
      >
        <motion.div
          animate={{ x: isDark ? 29 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
          style={{ background: '#ffffff' }}
        >
          {isDark
            ? <Moon size={11} style={{ color: '#050807' }} />
            : <Sun size={11} style={{ color: '#f59e0b' }} />
          }
        </motion.div>
      </button>
      <Moon size={15} className={isDark ? 'text-emerald-400' : 'text-slate-400'} />
    </div>
  );
}

/**
 * ThemeSettingsCard — full-featured appearance settings block.
 * Drop it into any settings tab.
 */
export function ThemeSettingsCard() {
  const { theme, isDark, setDark, setLight } = useTheme();

  const options = [
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Deep space obsidian aesthetic — easier on eyes at night.',
      icon: Moon,
      color: '#10B981',
      preview: 'bg-[#050807]',
      previewBorder: '#10B981',
    },
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Bright clean laboratory interface — great for daytime study.',
      icon: Sun,
      color: '#047857',
      preview: 'bg-[#F6FAF8]',
      previewBorder: '#047857',
    },
  ];

  const select = (id) => {
    if (id === 'dark') setDark();
    else setLight();
  };

  return (
    <div className="rounded-2xl overflow-hidden glass p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-emerald-500/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Monitor size={17} className="text-emerald-400" />
          </div>
          <div>
            <p className="font-space font-bold text-sm text-white">Appearance</p>
            <p className="text-xs text-slate-400 font-inter">Choose your preferred color scheme</p>
          </div>
        </div>
        <ThemeToggle variant="pill" />
      </div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {options.map(opt => {
          const active = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => select(opt.id)}
              className={`relative rounded-xl p-4 text-left cursor-pointer transition-all border ${
                active
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg'
                  : 'bg-transparent border-emerald-500/10 hover:border-emerald-500/30'
              }`}
            >
              {/* Preview thumbnail */}
              <div className="w-full h-14 rounded-lg mb-3 overflow-hidden relative border border-emerald-500/20"
                style={{
                  background: opt.id === 'dark' ? '#050807' : '#F6FAF8',
                }}>
                <div className="absolute top-2 left-2 right-8 h-1.5 rounded-full"
                  style={{ background: opt.id === 'dark' ? '#10B981' : '#047857' }} />
                <div className="absolute top-5 left-2 right-4 h-1 rounded-full opacity-60"
                  style={{ background: opt.id === 'dark' ? '#A7B3AE' : '#33453E' }} />
                <div className="absolute top-8 left-2 w-10 h-1 rounded-full opacity-40"
                  style={{ background: opt.id === 'dark' ? '#A7B3AE' : '#5D6C66' }} />
                {active && (
                  <motion.div
                    layoutId="theme-active-ring"
                    className="absolute inset-0 rounded-lg border-2 border-emerald-500"
                    transition={{ type: 'spring', bounce: 0.2 }}
                  />
                )}
              </div>

              {/* Label row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <opt.icon size={14} className={active ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className="font-space font-bold text-xs text-white">
                    {opt.label}
                  </span>
                </div>
                {active && (
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                  </div>
                )}
              </div>
              <p className="text-[11px] font-inter mt-1 text-slate-400">
                {opt.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
