import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, GraduationCap, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ user = null, onLogout }) {
  const [open, setOpen] = useState(false);
  const { navigateTo } = useNavigation();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 w-full"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-3 md:pt-4">
        <div className="card-modern px-4 md:px-6 h-16 flex items-center justify-between shadow-lg backdrop-blur-xl">
          {/* LEFT: Logo */}
          <motion.button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2.5 group flex-shrink-0 cursor-pointer bg-transparent border-0 text-left"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0C3B2E] to-[#10B981] text-white shadow-md shadow-emerald-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading text-lg md:text-xl font-extrabold tracking-tight select-none">
                Edu<span className="text-emerald-500">Nova</span>
              </span>
              <span className="text-[10px] font-sans font-semibold tracking-wider uppercase text-muted -mt-0.5">
                Educational Platform
              </span>
            </div>
          </motion.button>

          {/* RIGHT: Actions + ThemeToggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dedicated Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigateTo('profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary hover:border-emerald-500 transition-colors cursor-pointer bg-surface"
                >
                  <span className="text-sm">{user.avatar || '🎓'}</span>
                  <span className="text-xs font-heading font-bold text-main max-w-[120px] truncate">
                    {user.name || 'Scholar'}
                  </span>
                </button>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="pill-btn-forest text-xs py-1.5 px-3.5"
                >
                  Dashboard
                </button>
                <button
                  onClick={onLogout}
                  id="navbar-logout-btn"
                  className="pill-btn-outline text-xs py-1.5 px-3 hover:text-red-500"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigateTo('login')}
                  id="navbar-login-link"
                  className="pill-btn-outline text-xs py-1.5 px-4"
                >
                  <LogIn size={14} />
                  <span>Log In</span>
                </button>
                <button
                  onClick={() => navigateTo('register')}
                  id="navbar-register-link"
                  className="pill-btn-forest text-xs py-1.5 px-4 shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger & ThemeToggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen(v => !v)}
              className="p-2 rounded-xl border border-primary bg-surface cursor-pointer text-current"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-2 p-4 card-modern flex flex-col gap-3 shadow-2xl"
            >
              {user ? (
                <>
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/10">
                    <span className="text-2xl">{user.avatar || '🎓'}</span>
                    <div>
                      <p className="font-heading font-bold text-sm text-main">{user.name}</p>
                      <p className="text-xs text-muted font-sans">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setOpen(false); navigateTo('dashboard'); }}
                    className="pill-btn-forest w-full text-center py-2"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => { setOpen(false); navigateTo('profile'); }}
                    className="pill-btn-outline w-full text-center py-2"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => { setOpen(false); onLogout(); }}
                    className="pill-btn-outline w-full text-center py-2 text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setOpen(false); navigateTo('login'); }}
                    className="pill-btn-outline w-full text-center py-2"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setOpen(false); navigateTo('register'); }}
                    className="pill-btn-forest w-full text-center py-2"
                  >
                    Create Account
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
