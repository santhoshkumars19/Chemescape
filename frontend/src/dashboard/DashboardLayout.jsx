import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, X, CheckCheck, Trash2, Info, Trophy, Zap, Lock, Star, AlertTriangle, Heart, Clock, Timer, GraduationCap } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import LifeTimerDisplay from '../components/LifeTimerDisplay';

// ─── Notification data per role ───────────────────────────────────────────────
const ROLE_NOTIFICATIONS = {
  STUDENT: [],
  TEACHER: [],
  ADMIN: [],
};

// ─── Notification Panel ───────────────────────────────────────────────────────
function NotificationPanel({ onClose }) {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const [notifications, setNotifications] = useState(ROLE_NOTIFICATIONS[role] || ROLE_NOTIFICATIONS.STUDENT);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50"
      style={{
        background: 'rgba(6,12,26,0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.06)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <Bell size={14} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="font-orbitron font-bold text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] text-white/40 font-space">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-space text-cyan-400 hover:bg-cyan-400/10 transition-colors cursor-pointer"
            >
              <CheckCheck size={12} />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
              title="Clear all"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[360px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 gap-2"
            >
              <Bell size={28} className="text-white/10" />
              <p className="text-white/40 text-xs font-space">No notifications yet.</p>
            </motion.div>
          ) : (
            notifications.map((n, i) => (
              <motion.button
                key={n.id}
                layout
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => markRead(n.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all cursor-pointer border-b border-white/[0.03] last:border-0 ${
                  n.read ? 'opacity-50 hover:opacity-70' : 'hover:bg-white/[0.03]'
                }`}
              >
                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${n.color}15`, border: `1px solid ${n.color}25` }}
                >
                  <n.icon size={14} style={{ color: n.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-space font-semibold leading-snug ${n.read ? 'text-white/50' : 'text-white'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-white/35 font-inter mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-white/20 font-space mt-1">{n.time}</p>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-white/5 text-center">
          <p className="text-[11px] text-white/20 font-space">
            Tap a notification to mark it as read
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────────
function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const { lives, nextLifeRegenTime } = useNavigation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(
    () => (ROLE_NOTIFICATIONS[role] || ROLE_NOTIFICATIONS.STUDENT).filter(n => !n.read).length
  );
  const bellRef = useRef(null);
  const panelRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (
        bellRef.current && !bellRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  const handleBellClick = () => {
    setNotifOpen(v => !v);
    if (!notifOpen) setUnread(0); // clear dot when panel opens
  };

  // Page title per role
  const pageTitle = role === 'TEACHER' ? 'TEACHER PORTAL' : role === 'ADMIN' ? 'ADMIN CONSOLE' : 'DASHBOARD';

  return (
    <div
      className="sticky top-0 z-30 w-full flex-shrink-0"
      style={{
        background: 'rgba(5,8,7,0.88)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(167,243,208,0.12)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 w-full box-border">
        {/* Mobile hamburger */}
        <button
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="flex-1 flex items-center gap-4">
          <h2 className="font-orbitron font-bold text-sm tracking-widest text-emerald-400/80 hidden sm:block">
            {pageTitle}
          </h2>


        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="absolute left-0 right-0 top-0 h-16 flex items-center gap-3 px-4 sm:px-6 z-10"
              style={{ background: 'rgba(5,8,7,0.98)', backdropFilter: 'blur(20px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Search size={16} className="text-white/40 flex-shrink-0" />
              <input
                autoFocus
                placeholder="Search topics, rooms, achievements…"
                id="dashboard-search-input"
                className="flex-1 bg-transparent text-white placeholder-white/25 text-sm font-inter outline-none"
              />
              <button onClick={() => setSearchOpen(false)} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            id="topbar-search-btn"
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-all cursor-pointer"
          >
            <Search size={17} />
          </button>

          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              id="topbar-bell-btn"
              onClick={handleBellClick}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                notifOpen
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <motion.div
                animate={unread > 0 ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <Bell size={17} />
              </motion.div>
              {/* Unread dot */}
              <AnimatePresence>
                {unread > 0 && (
                  <motion.span
                    key="dot"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#050807] flex items-center justify-center"
                  />
                )}
              </AnimatePresence>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
              {notifOpen && (
                <div ref={panelRef}>
                  <NotificationPanel onClose={() => setNotifOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { gameOverModalOpen, setGameOverModalOpen, nextLifeRegenTime, navigateTo } = useNavigation();

  return (
    <div className="flex h-screen overflow-hidden bg-[#040810] w-full">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full min-w-0"
          >
            {children}
          </motion.div>
        </main>

        {/* Game Over / Out of Lives Modal */}
        <AnimatePresence>
          {gameOverModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative max-w-md w-full bg-[#0b1329] border-2 border-red-500/50 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(239,68,68,0.3)] font-sans"
              >
                <button
                  onClick={() => setGameOverModalOpen(false)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>

                <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500/60 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Heart size={32} className="text-red-500 fill-red-500" />
                </div>

                <h3 className="text-xl font-orbitron font-extrabold text-white mb-2 tracking-wider">
                  OUT OF LIVES!
                </h3>
                <p className="text-xs text-slate-300 font-space mb-6 leading-relaxed">
                  You lost all 3 lives during your last mission. 1 life regenerates automatically every 10 minutes!
                </p>

                {/* Timer display box */}
                <div className="bg-slate-950 border border-red-500/40 rounded-xl p-4 mb-6 font-mono">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Next Life Regenerates In</p>
                  <LifeTimerDisplay nextLifeRegenTime={nextLifeRegenTime} variant="large" />
                  <p className="text-[10px] text-slate-500 mt-2">1 life restored every 10 mins (Max 3 lives)</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setGameOverModalOpen(false);
                      navigateTo('syllabus');
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-900 border border-cyan-500/30 font-orbitron text-xs font-bold text-cyan-300 hover:bg-cyan-950 transition-all"
                  >
                    Study Syllabus
                  </button>
                  <button
                    onClick={() => setGameOverModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 font-orbitron text-xs font-bold text-white hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  >
                    Return to Hub
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
