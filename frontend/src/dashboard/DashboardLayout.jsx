import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, Search, X, CheckCheck, Trash2, Heart } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import LifeTimerDisplay from '../components/LifeTimerDisplay';
import ThemeToggle from '../components/ThemeToggle';

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
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50 card-modern shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-secondary">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
            <Bell size={15} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-main text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-[10px] text-muted font-sans">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-sans text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer border-0 bg-transparent"
            >
              <CheckCheck size={12} />
              <span>Mark read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-0 bg-transparent"
              title="Clear all"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-main transition-colors cursor-pointer border-0 bg-transparent"
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
              <Bell size={28} className="text-muted/30" />
              <p className="text-muted text-xs font-sans">No notifications yet.</p>
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
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all cursor-pointer border-b border-secondary last:border-0 ${
                  n.read ? 'opacity-50 hover:opacity-75' : 'hover:bg-muted/5'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${n.color}15`, border: `1px solid ${n.color}25` }}
                >
                  <n.icon size={14} style={{ color: n.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-sans font-semibold leading-snug ${n.read ? 'text-muted' : 'text-main'}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted font-sans mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-muted/60 font-sans mt-1">{n.time}</p>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-secondary text-center">
          <p className="text-[11px] text-muted font-sans">
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
    if (!notifOpen) setUnread(0);
  };

  const pageTitle = role === 'TEACHER' ? 'Teacher Portal' : role === 'ADMIN' ? 'Admin Console' : 'Student Dashboard';

  return (
    <div
      className="sticky top-0 z-30 w-full flex-shrink-0"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-primary)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 w-full box-border">
        {/* Mobile hamburger */}
        <button
          id="mobile-menu-btn"
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-main hover:bg-muted/10 transition-all cursor-pointer border-0 bg-transparent"
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <div className="flex-1 flex items-center gap-3">
          <h2 className="font-heading font-extrabold text-base tracking-tight text-main hidden sm:block">
            {pageTitle}
          </h2>
          <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 uppercase tracking-wide hidden md:inline-block">
            EduNova Platform
          </span>
        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="absolute left-0 right-0 top-0 h-16 flex items-center gap-3 px-4 sm:px-6 z-10 card-modern rounded-none border-x-0 border-t-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Search size={16} className="text-muted flex-shrink-0" />
              <input
                autoFocus
                placeholder="Search subjects, chapters, quizzes, achievements…"
                id="dashboard-search-input"
                className="flex-1 bg-transparent text-main placeholder-muted text-sm font-sans outline-none border-0"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-muted hover:text-main transition-colors cursor-pointer border-0 bg-transparent"
              >
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right actions: ThemeToggle + Search + Notifications */}
        <div className="flex items-center gap-2.5">
          {/* Theme Switcher in Topbar */}
          <ThemeToggle />

          <button
            id="topbar-search-btn"
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-main hover:bg-muted/10 transition-all cursor-pointer border-0 bg-transparent"
            title="Search"
          >
            <Search size={17} />
          </button>

          {/* Notification bell */}
          <div className="relative" ref={bellRef}>
            <button
              id="topbar-bell-btn"
              onClick={handleBellClick}
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border-0 bg-transparent ${
                notifOpen
                  ? 'bg-emerald-500/15 text-emerald-500'
                  : 'text-muted hover:text-main hover:bg-muted/10'
              }`}
              title="Notifications"
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
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"
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
    <div
      className="flex h-screen overflow-hidden w-full"
      style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
    >
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
            transition={{ duration: 0.3 }}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative max-w-md w-full card-modern p-6 text-center shadow-2xl border-red-500/40"
              >
                <button
                  onClick={() => setGameOverModalOpen(false)}
                  className="absolute top-4 right-4 text-muted hover:text-main border-0 bg-transparent cursor-pointer"
                >
                  <X size={20} />
                </button>

                <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Heart size={32} className="text-red-500 fill-red-500" />
                </div>

                <h3 className="text-xl font-heading font-extrabold text-main mb-2 tracking-tight">
                  Out of Lives!
                </h3>
                <p className="text-xs text-muted font-sans mb-6 leading-relaxed">
                  You used all your attempts. 1 life regenerates automatically every 10 minutes!
                </p>

                {/* Timer display box */}
                <div className="card-modern p-4 mb-6">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-1 font-sans font-bold">Next Life Regenerates In</p>
                  <LifeTimerDisplay nextLifeRegenTime={nextLifeRegenTime} variant="large" />
                  <p className="text-[10px] text-muted/70 mt-2 font-sans">1 life restored every 10 mins (Max 3 lives)</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setGameOverModalOpen(false);
                      navigateTo('chapters');
                    }}
                    className="pill-btn-outline flex-1 text-xs py-2.5"
                  >
                    Chapter Map
                  </button>
                  <button
                    onClick={() => setGameOverModalOpen(false)}
                    className="pill-btn-forest flex-1 text-xs py-2.5"
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
