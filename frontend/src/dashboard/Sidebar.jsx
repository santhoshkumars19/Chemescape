import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Swords, Trophy, Star, UserCircle,
  Settings, LogOut, FlaskConical, ChevronLeft, ChevronRight,
  Zap, Menu, X, Users, Shield, BookOpen, Terminal, FileText, GraduationCap
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { mockUser } from './mockData';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { currentScreen, navigateTo } = useNavigation();

  const role = user?.role || 'STUDENT';

  // Dynamic Navigation Items per Role
  let navItems = [
    { label: 'Dashboard',     icon: LayoutDashboard,  screen: 'dashboard' },
    { label: 'My Standard',   icon: GraduationCap,    screen: 'select-standard' },
    { label: 'My Subject',    icon: BookOpen,          screen: 'select-subject' },
    { label: 'Play Missions', icon: Swords,            screen: 'standards' },
    { label: 'AI Assistant',  icon: Zap,               screen: 'ai-assistant' },
    { label: 'Leaderboard',   icon: Trophy,            screen: 'leaderboard' },
    { label: 'Profile',       icon: UserCircle,        screen: 'profile' },
    { label: 'Settings',      icon: Settings,          screen: 'settings' },
  ];

  if (role === 'TEACHER') {
    navItems = [
      { label: 'Teacher Console', icon: LayoutDashboard, screen: 'dashboard' },
      { label: 'Question Bank',   icon: FileText,        screen: 'teacher-questions' },
      { label: 'Profile',         icon: UserCircle,      screen: 'profile' },
      { label: 'Settings',        icon: Settings,        screen: 'settings' },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { label: 'Admin Console',  icon: Shield,          screen: 'dashboard' },
      { label: 'User Management',icon: Users,           screen: 'dashboard' },
      { label: 'Game Engines',   icon: Swords,          screen: 'standards' },
      { label: 'Profile',        icon: UserCircle,      screen: 'profile' },
      { label: 'Settings',       icon: Settings,        screen: 'settings' },
    ];
  }

  const handleLogout = () => {
    logout();
    navigateTo('login');
  };

  const displayName = user?.name || (role === 'TEACHER' ? 'Prof. Chem Teacher' : role === 'ADMIN' ? 'System Admin' : mockUser.name);
  const displayAvatar = user?.avatar || (role === 'TEACHER' ? '👨‍🏫' : role === 'ADMIN' ? '🛡️' : mockUser.avatar);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-emerald-500/10 ${collapsed ? 'justify-center px-3' : ''}`}>
        <motion.button
          onClick={() => navigateTo('landing')}
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center relative bg-transparent border-0 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.2),rgba(103,232,249,0.15))', border: '1px solid rgba(167,243,208,0.25)' }}
          animate={{ boxShadow: ['0 0 10px rgba(16,185,129,0.2)', '0 0 25px rgba(16,185,129,0.4)', '0 0 10px rgba(16,185,129,0.2)'] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <FlaskConical size={18} style={{ color: '#10B981' }} />
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
              <p className="font-orbitron font-black text-sm tracking-widest gradient-text-emerald whitespace-nowrap">CHEM<span className="text-white">ESCAPE</span></p>
              <p className="text-[10px] text-emerald-400/50 font-space tracking-widest">
                {role === 'TEACHER' ? 'TEACHER PORTAL' : role === 'ADMIN' ? 'ADMIN CONSOLE' : 'STUDENT PORTAL'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User mini-card */}
      {!collapsed && (
        <div className="mx-3 mt-4 mb-2 p-3 rounded-xl cursor-pointer" style={{ background: 'rgba(12,20,17,0.6)', border: '1px solid rgba(167,243,208,0.12)' }} onClick={() => navigateTo('profile')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(103,232,249,0.12))', border: '1px solid rgba(167,243,208,0.2)' }}>
              {displayAvatar}
            </div>
            <div className="min-w-0">
              <p className="font-space font-semibold text-white text-sm truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full ${
                  role === 'TEACHER' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  role === 'ADMIN' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {role}
                </span>
              </div>
            </div>
          </div>
          {role === 'STUDENT' && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-emerald-400/40 font-inter mb-1">
                <span>{mockUser.xp.toLocaleString()} XP</span>
                <span>{mockUser.xpToNext.toLocaleString()} XP</span>
              </div>
              <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#10B981,#67E8F9)' }}
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
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        <p className={`text-[10px] text-emerald-400/30 font-space tracking-widest uppercase px-2 py-2 ${collapsed ? 'hidden' : ''}`}>Navigation</p>
        {navItems.map(item => {
          const isActive = currentScreen === item.screen;
          return (
            <button
              key={item.label}
              onClick={() => {
                navigateTo(item.screen);
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden text-left border-0 bg-transparent cursor-pointer ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'text-white font-bold'
                  : 'text-emerald-400/50 hover:text-emerald-300'
              }`}
              id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.18),rgba(103,232,249,0.12))', border: '1px solid rgba(167,243,208,0.25)' }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon
                size={18}
                className="relative z-10 flex-shrink-0 transition-colors duration-200"
                style={{ color: isActive ? '#10B981' : undefined }}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 font-space font-medium text-sm whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-space text-white bg-[#0B1210] border border-emerald-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Logout */}
      <div className="px-3 pb-4 flex flex-col gap-1 border-t border-emerald-500/10 pt-3">
        <button
          onClick={handleLogout}
          id="sidebar-logout-btn"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group border-0 bg-transparent cursor-pointer ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="font-space text-sm">Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 rounded-lg text-xs font-space text-white bg-[#0B1210] border border-emerald-500/20 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Logout
            </div>
          )}
        </button>
      </div>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setCollapsed(v => !v)}
        id="sidebar-collapse-btn"
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0B1210] border border-emerald-500/20 flex items-center justify-center text-emerald-400/60 hover:text-emerald-300 hover:border-emerald-500/40 transition-all z-20 hidden md:flex cursor-pointer"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className="hidden md:block relative h-screen flex-shrink-0 overflow-visible"
        animate={{ width: collapsed ? 70 : 256 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: 'rgba(5,8,7,0.92)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(167,243,208,0.12)',
        }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full w-64 z-50 md:hidden"
              style={{
                background: 'rgba(5,8,7,0.98)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(167,243,208,0.16)',
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
