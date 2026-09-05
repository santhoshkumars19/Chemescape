import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Trophy, User, Settings,
  LogOut, ChevronLeft, ChevronRight, GraduationCap,
  BookOpen, Sparkles, Shield, Award, FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const NAV_BY_ROLE = {
  STUDENT: [
    { label: 'Dashboard', icon: LayoutDashboard, screen: 'dashboard' },
    { label: 'My Standard', icon: GraduationCap, screen: 'select-standard' },
    { label: 'My Subject', icon: BookOpen, screen: 'select-subject' },
    { label: 'Chapter Map', icon: Map, screen: 'chapters' },
    { label: 'Leaderboard', icon: Trophy, screen: 'leaderboard' },
    { label: 'Profile', icon: User, screen: 'profile' },
    { label: 'Settings', icon: Settings, screen: 'settings' },
  ],
  TEACHER: [
    { label: 'Teacher Portal', icon: LayoutDashboard, screen: 'dashboard' },
    { label: 'Activity Reports', icon: FileSpreadsheet, screen: 'reports' },
    { label: 'Question Bank', icon: BookOpen, screen: 'teacher-questions' },
    { label: 'Leaderboard', icon: Trophy, screen: 'leaderboard' },
    { label: 'Profile', icon: User, screen: 'profile' },
  ],
  ADMIN: [
    { label: 'Admin Console', icon: Shield, screen: 'dashboard' },
    { label: 'User Reports', icon: FileSpreadsheet, screen: 'reports' },
    { label: 'Leaderboard', icon: Trophy, screen: 'leaderboard' },
    { label: 'Settings', icon: Settings, screen: 'settings' },
  ],
};

export default function Sidebar({ mobileOpen = false, setMobileOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const { currentScreen, navigateTo, xp, level } = useNavigation();
  const { isDark } = useTheme();

  const role = user?.role || 'STUDENT';
  const navItems = NAV_BY_ROLE[role] || NAV_BY_ROLE.STUDENT;

  const handleLogout = () => {
    logout();
    navigateTo('landing');
  };

  const displayName = user?.name || (role === 'TEACHER' ? 'Teacher' : role === 'ADMIN' ? 'Admin' : 'Guest Scholar');
  const displayAvatar = user?.avatar || (role === 'TEACHER' ? '👨‍🏫' : role === 'ADMIN' ? '🛡️' : '🎓');

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 gap-3 border-b border-[var(--border-primary)] flex-shrink-0">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 cursor-pointer shadow-sm"
          style={{ background: '#0C3B2E' }}
          onClick={() => navigateTo('landing')}
        >
          <GraduationCap size={22} className="text-[#34D399]" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => navigateTo('landing')}
            >
              <p className="font-heading font-extrabold text-base tracking-tight leading-tight text-[var(--text-main)]">
                Edu<span className="text-emerald-600 dark:text-emerald-400">Nova</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-semibold tracking-wider uppercase">
                {role === 'TEACHER' ? 'Teacher Portal' : role === 'ADMIN' ? 'Admin Console' : 'Student Portal'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User mini-card */}
      {!collapsed && (
        <div
          className="mx-3 mt-4 mb-2 p-3.5 rounded-2xl cursor-pointer border border-[var(--border-primary)] bg-[var(--bg-card)] transition-all hover:border-emerald-500 shadow-sm"
          onClick={() => navigateTo('profile')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-emerald-500/15 border border-emerald-500/25">
              {displayAvatar}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-extrabold text-[var(--text-main)] text-sm truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-sans font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                  {role}
                </span>
              </div>
            </div>
          </div>
          {role === 'STUDENT' && (() => {
            const currentXp = xp || 0;
            const currentLevel = level || 1;
            const xpToNext = Math.max(1000, currentLevel * 1000);
            const progressPct = Math.min(100, Math.max(4, Math.round((currentXp / xpToNext) * 100)));

            return (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-sans font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  <span>{currentXp} XP</span>
                  <span>{xpToNext.toLocaleString()} XP</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-1.5 overflow-y-auto">
        <p className={`text-[10px] font-sans font-extrabold tracking-wider uppercase px-3 py-1 text-slate-700 dark:text-slate-400 ${collapsed ? 'hidden' : ''}`}>
          Main Menu
        </p>
        {navItems.map(item => {
          const isActive = currentScreen === item.screen;
          return (
            <button
              key={item.label}
              onClick={() => {
                navigateTo(item.screen);
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`sidebar-nav-item ${
                isActive ? 'sidebar-nav-active' : 'sidebar-nav-inactive'
              } flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-left border-0 cursor-pointer ${
                collapsed ? 'justify-center px-2' : ''
              }`}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon
                size={18}
                className={`sidebar-nav-icon flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#34D399]' : ''
                }`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="sidebar-nav-label font-sans text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-sans text-white bg-[#0C3B2E] border border-emerald-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions: Theme Toggle & Logout */}
      <div className="px-3 pb-4 flex flex-col gap-2 border-t border-[var(--border-primary)] pt-3">
        {/* Theme Switcher */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2 py-1'}`}>
          {!collapsed && <span className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Theme</span>}
          <ThemeToggle variant={collapsed ? 'compact' : 'pill'} />
        </div>

        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200 group border-0 bg-transparent cursor-pointer font-semibold ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span className="font-sans text-sm">Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-sans text-white bg-[#0B1210] border border-red-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(v => !v)}
        id="sidebar-collapse-btn"
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg-card)] border border-[var(--border-primary)] flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500 transition-all z-20 hidden md:flex cursor-pointer shadow-md"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:block relative h-screen flex-shrink-0 overflow-visible z-20 border-r border-[var(--border-primary)] bg-[var(--bg-card)]"
        animate={{ width: collapsed ? 76 : 240 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-72 bg-[var(--bg-card)] border-r border-[var(--border-primary)] z-50 md:hidden shadow-2xl overflow-y-auto"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
