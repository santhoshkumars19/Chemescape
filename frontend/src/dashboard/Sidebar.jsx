import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Swords, Trophy, Star, UserCircle,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Zap, Menu, X, Users, Shield, BookOpen, FileText, GraduationCap,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { mockUser } from './mockData';
import ThemeToggle from '../components/ThemeToggle';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { currentScreen, navigateTo } = useNavigation();

  const role = user?.role || 'STUDENT';

  // Dynamic Navigation Items per Role
  let navItems = [
    { label: 'Dashboard',     icon: LayoutDashboard,  screen: 'dashboard' },
    { label: 'My Standard',   icon: GraduationCap,    screen: 'select-standard' },
    { label: 'My Subject',    icon: BookOpen,         screen: 'select-subject' },
    { label: 'Chapter Map',   icon: Swords,           screen: 'chapters' },
    { label: 'Leaderboard',   icon: Trophy,           screen: 'leaderboard' },
    { label: 'Profile',       icon: UserCircle,       screen: 'profile' },
    { label: 'Settings',      icon: Settings,         screen: 'settings' },
  ];

  if (role === 'TEACHER') {
    navItems = [
      { label: 'Teacher Console',  icon: LayoutDashboard, screen: 'dashboard' },
      { label: 'Question Bank',    icon: FileText,        screen: 'teacher-questions' },
      { label: 'Activity Reports', icon: FileSpreadsheet, screen: 'reports' },
      { label: 'Profile',          icon: UserCircle,      screen: 'profile' },
      { label: 'Settings',         icon: Settings,        screen: 'settings' },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { label: 'Admin Console',    icon: Shield,          screen: 'dashboard' },
      { label: 'User Management',  icon: Users,           screen: 'dashboard' },
      { label: 'Game Engines',     icon: Swords,          screen: 'standards' },
      { label: 'Activity Reports', icon: FileSpreadsheet, screen: 'reports' },
      { label: 'Profile',          icon: UserCircle,      screen: 'profile' },
      { label: 'Settings',         icon: Settings,        screen: 'settings' },
    ];
  }

  const handleLogout = () => {
    logout();
    navigateTo('login');
  };

  const rawName = user?.name || mockUser.name;
  const displayName = (rawName === 'Student Chemist' || rawName === 'Student Agent') ? 'Student Scholar' : (role === 'TEACHER' ? 'Prof. Teacher' : role === 'ADMIN' ? 'System Admin' : rawName);
  const rawAvatar = user?.avatar || mockUser.avatar;
  const displayAvatar = (rawAvatar === '🧪') ? '🎓' : (role === 'TEACHER' ? '👨‍🏫' : role === 'ADMIN' ? '🛡️' : rawAvatar);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-5 py-5 border-b border-secondary ${collapsed ? 'justify-center px-3' : ''}`}>
        <motion.button
          onClick={() => navigateTo('landing')}
          className="w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-[#0C3B2E] to-[#10B981] text-white border-0 cursor-pointer shadow-md shadow-emerald-500/20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <GraduationCap size={20} className="text-white" />
        </motion.button>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden cursor-pointer"
              onClick={() => navigateTo('landing')}
            >
              <p className="font-heading font-black text-base tracking-tight leading-tight">
                Edu<span className="text-emerald-500">Nova</span>
              </p>
              <p className="text-[10px] text-muted font-sans font-semibold tracking-wider uppercase">
                {role === 'TEACHER' ? 'Teacher Portal' : role === 'ADMIN' ? 'Admin Console' : 'Student Portal'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User mini-card */}
      {!collapsed && (
        <div
          className="mx-3 mt-4 mb-2 p-3 rounded-2xl cursor-pointer border border-primary bg-card transition-all hover:border-emerald-500/40 shadow-sm"
          onClick={() => navigateTo('profile')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-emerald-500/10 border border-emerald-500/20">
              {displayAvatar}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-main text-sm truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wide">
                  {role}
                </span>
              </div>
            </div>
          </div>
          {role === 'STUDENT' && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-muted font-sans mb-1">
                <span>{mockUser.xp.toLocaleString()} XP</span>
                <span>{mockUser.xpToNext.toLocaleString()} XP</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(mockUser.xp / mockUser.xpToNext) * 100}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-1.5 overflow-y-auto">
        <p className={`text-[10px] text-muted font-sans font-bold tracking-wider uppercase px-3 py-1 ${collapsed ? 'hidden' : ''}`}>
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-left border-0 cursor-pointer ${
                collapsed ? 'justify-center px-2' : ''
              } ${
                isActive
                  ? 'bg-[#0C3B2E] text-white font-bold shadow-md shadow-emerald-900/20'
                  : 'text-secondary hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-300 bg-transparent'
              }`}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon
                size={18}
                className={`relative z-10 flex-shrink-0 transition-colors ${isActive ? 'text-[#34D399]' : ''}`}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 font-sans font-medium text-sm whitespace-nowrap overflow-hidden"
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
      <div className="px-3 pb-4 flex flex-col gap-2 border-t border-secondary pt-3">
        {/* Theme Switcher */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2 py-1'}`}>
          {!collapsed && <span className="text-xs font-sans text-muted">Theme</span>}
          <ThemeToggle variant={collapsed ? 'compact' : 'pill'} />
        </div>

        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 group border-0 bg-transparent cursor-pointer ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span className="font-sans text-sm font-medium">Logout</span>}
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
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-primary flex items-center justify-center text-muted hover:text-emerald-500 hover:border-emerald-500/40 transition-all z-20 hidden md:flex cursor-pointer shadow-md"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:block relative h-screen flex-shrink-0 overflow-visible z-20"
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRight: '1px solid var(--border-primary)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
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
              className="fixed left-0 top-0 h-full w-64 z-50 md:hidden shadow-2xl"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRight: '1px solid var(--border-primary)',
              }}
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
