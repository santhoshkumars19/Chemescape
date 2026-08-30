import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, UserCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigation } from '../context/NavigationContext';
import AuthBackground from './AuthBackground';
import {
  AuthCard, AuthBrand, AuthInput, AuthButton,
  AuthDivider, AuthToast,
} from './AuthComponents';

// Validation helpers
function validateEmail(v) {
  if (!v) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return '';
}
function validatePassword(v) {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  return '';
}

export default function LoginPage() {
  const { navigateTo } = useNavigation();
  const { login, continueAsGuest } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const errors = {
    email: touched.email ? validateEmail(form.email) : '',
    password: touched.password ? validatePassword(form.password) : '',
  };
  const isValid = !validateEmail(form.email) && !validatePassword(form.password);

  const set = useCallback((key, val) => {
    setForm(f => ({ ...f, [key]: val }));
  }, []);

  const blur = useCallback(key => {
    setTouched(t => ({ ...t, [key]: true }));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;
    setLoading(true);
    setToast(null);
    try {
      const loggedInUser = await login(form.email, form.password);
      // STUDENT → standard selection; Teacher/Admin → dashboard directly
      const role = loggedInUser?.role || 'STUDENT';
      if (role === 'STUDENT') {
        navigateTo('select-standard');
      } else {
        navigateTo('dashboard');
      }
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    await new Promise(r => setTimeout(r, 800));
    continueAsGuest();
    navigateTo('dashboard'); // guests skip standard selection
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Layered background */}
      <div className="fixed inset-0 bg-[#040810]" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.18) 0%, transparent 60%)' }} />
      <AuthBackground />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <AuthCard>
          <AuthBrand />

          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="font-space font-bold text-2xl text-white mb-1">Welcome back</h2>
            <p className="text-white/35 text-sm font-inter">Log in to continue your experiments</p>
          </div>

          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <div className="mb-5">
                <AuthToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
              </div>
            )}
          </AnimatePresence>

          {/* Mock credentials hint */}
          <motion.div
            className="mb-5 p-3.5 rounded-xl text-xs font-inter text-white/50 leading-relaxed"
            style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="text-cyan-400 font-semibold mb-1">Demo Accounts (Password123):</div>
            <div className="flex flex-col gap-0.5 text-[11px] font-space text-white/70">
              <div>🧪 <span className="text-cyan-300 font-bold">Student:</span> student@chemescape.com</div>
              <div>👨‍🏫 <span className="text-purple-300 font-bold">Teacher:</span> teacher@chemescape.com</div>
              <div>🛡️ <span className="text-amber-300 font-bold">Admin:</span> admin@chemescape.com</div>
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4" noValidate>
            <AuthInput
              id="login-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={e => set('email', e.target.value)}
              onBlur={() => blur('email')}
              error={errors.email}
              success={touched.email && !errors.email && !!form.email}
            />
            <AuthInput
              id="login-password"
              label="Password"
              type="password"
              placeholder="Your password"
              icon={Lock}
              value={form.password}
              onChange={e => set('password', e.target.value)}
              onBlur={() => blur('password')}
              error={errors.password}
              success={touched.password && !errors.password && !!form.password}
            />

            {/* Forgot link */}
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => navigateTo('forgot-password')}
                id="forgot-password-link"
                className="text-xs text-cyan-400/70 hover:text-cyan-300 font-inter transition-colors bg-transparent border-0 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <AuthButton
              type="submit"
              loading={loading}
              disabled={loading || guestLoading}
              id="login-submit-btn"
              className="mt-1"
            >
              <Lock size={15} /> Log In
            </AuthButton>
          </form>

          <AuthDivider label="or" />

          {/* Guest */}
          <AuthButton
            variant="ghost"
            onClick={handleGuest}
            loading={guestLoading}
            disabled={loading || guestLoading}
            id="guest-btn"
          >
            <UserCircle2 size={15} className="text-white/50" /> Continue as Guest
          </AuthButton>

          {/* Register */}
          <p className="text-center text-xs text-white/30 font-inter mt-6">
            New to the lab?{' '}
            <button
              type="button"
              onClick={() => navigateTo('register')}
              id="go-to-register-link"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors bg-transparent border-0 cursor-pointer"
            >
              Create an account
            </button>
          </p>
        </AuthCard>

        {/* Back to landing */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => navigateTo('landing')}
            id="back-to-landing-login"
            className="text-xs text-white/20 hover:text-white/50 font-space tracking-widest transition-colors bg-transparent border-0 cursor-pointer"
          >
            ← Back to ChemEscape
          </button>
        </motion.div>
      </div>
    </div>
  );
}
