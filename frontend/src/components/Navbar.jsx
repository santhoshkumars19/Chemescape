import { motion } from 'framer-motion';
import { useState } from 'react';
import { Menu, X, FlaskConical, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const navLinks = [];

export default function Navbar({ user = null, onLogout }) {
  const [open, setOpen] = useState(false);
  const { navigateTo } = useNavigation();

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 w-full"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 pt-3 md:pt-4">
        <div className="glass border border-emerald-500/15 rounded-2xl px-4 md:px-6 h-16 flex items-center justify-between shadow-2xl backdrop-blur-xl">
          {/* LEFT: Logo */}
          <motion.button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-2.5 group flex-shrink-0 cursor-pointer bg-transparent border-0 text-left"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <span className="font-orbitron text-base md:text-lg font-black tracking-widest gradient-text-emerald select-none">
              EDU<span className="text-white">NOVA</span>
            </span>
          </motion.button>

          {/* CENTER: Navigation Links (Desktop lg+) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-space text-white/70 hover:text-emerald-400 font-medium tracking-wide transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* RIGHT: User Status / Auth CTA Buttons (Desktop lg+) */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => navigateTo('profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer"
                >
                  <span className="text-sm">{user.avatar || '⚡'}</span>
                  <span className="text-xs font-orbitron font-bold text-emerald-300 max-w-[120px] truncate">
                    {user.name || 'Guest Scholar'}
                  </span>
                </button>
                <motion.button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-rose-400 text-xs font-space transition-colors glass border border-white/10 hover:border-rose-500/30 cursor-pointer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  id="navbar-logout-btn"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-emerald-500/20">
                  <UserCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-orbitron font-bold text-emerald-300">Guest Scholar</span>
                </div>
                <button
                  onClick={() => navigateTo('login')}
                  id="navbar-login-link"
                  className="bg-transparent border-0 p-0 cursor-pointer"
                >
                  <motion.div
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-slate-300 hover:text-white text-xs font-space font-semibold transition-colors glass border border-white/10"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <LogIn size={14} /> Log in
                  </motion.div>
                </button>
                <button
                  onClick={() => navigateTo('register')}
                  id="navbar-register-link"
                  className="bg-transparent border-0 p-0 cursor-pointer"
                >
                  <motion.div
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-orbitron font-extrabold tracking-wider uppercase shadow-lg shadow-emerald-500/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Play Now
                  </motion.div>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE & TABLET: Hamburger Button (< lg) */}
          <button
            className="lg:hidden p-2 rounded-xl glass border border-white/10 text-white/80 hover:text-emerald-400 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle Navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* MOBILE & TABLET DRAWER (< lg) */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-2 p-4 rounded-2xl glass border border-white/10 backdrop-blur-2xl space-y-3 shadow-2xl"
          >
            <div className="flex flex-col gap-2 font-space text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-cyan-500/20">
                <UserCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-orbitron font-bold text-cyan-300">
                  {user ? user.name : 'Guest Scholar'}
                </span>
              </div>
              {user ? (
                <button
                  onClick={() => { onLogout(); setOpen(false); }}
                  className="w-full py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-space text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut size={14} /> Log out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => { navigateTo('login'); setOpen(false); }}
                    className="py-2 text-center rounded-xl glass border border-white/10 text-white font-space text-xs font-semibold cursor-pointer"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => { navigateTo('register'); setOpen(false); }}
                    className="py-2 text-center rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-orbitron font-bold text-xs uppercase cursor-pointer"
                  >
                    Play Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
