import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, FlaskConical, UserCircle2 } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigation } from '../context/NavigationContext';
import AuthBackground from './AuthBackground';
import {
  AuthCard, AuthBrand, AuthInput, AuthButton,
  AuthDivider, AuthToast, PasswordStrength,
} from './AuthComponents';

function validateName(v) {
  if (!v.trim()) return 'Name is required';
  if (v.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
}
function validateEmail(v) {
  if (!v) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return '';
}
function validatePassword(v) {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter';
  if (!/\d/.test(v)) return 'Include at least one number';
  return '';
}
function validateConfirm(v, pw) {
  if (!v) return 'Please confirm your password';
  if (v !== pw) return 'Passwords do not match';
  return '';
}

export default function RegisterPage() {
  const { navigateTo } = useNavigation();
  const { register, continueAsGuest } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const errors = {
    name: touched.name ? validateName(form.name) : '',
    email: touched.email ? validateEmail(form.email) : '',
    password: touched.password ? validatePassword(form.password) : '',
    confirm: touched.confirm ? validateConfirm(form.confirm, form.password) : '',
  };

  const isValid =
    !validateName(form.name) &&
    !validateEmail(form.email) &&
    !validatePassword(form.password) &&
    !validateConfirm(form.confirm, form.password) &&
    agreed;

  const set = useCallback((key, val) => setForm(f => ({ ...f, [key]: val })), []);
  const blur = useCallback(key => setTouched(t => ({ ...t, [key]: true })), []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;
    setLoading(true);
    setToast(null);
    try {
      await register(form.name, form.email, form.password);
      navigateTo('dashboard');
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
    navigateTo('dashboard');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 py-12 overflow-hidden">
      <div className="fixed inset-0 bg-[#040810]" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 120%, rgba(0,212,255,0.1) 0%, transparent 60%)' }} />
      <AuthBackground />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <AuthCard>
          <AuthBrand />

          <div className="text-center mb-8">
            <h2 className="font-space font-bold text-2xl text-white mb-1">Create your account</h2>
            <p className="text-white/35 text-sm font-inter">Join 50,000+ chemists on the leaderboard</p>
          </div>

          <AnimatePresence>
            {toast && (
              <div className="mb-5">
                <AuthToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
              </div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegister} className="flex flex-col gap-4" noValidate>
            {/* Name */}
            <AuthInput
              id="reg-name"
              label="Display Name"
              type="text"
              placeholder="Your lab name"
              icon={User}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              onBlur={() => blur('name')}
              error={errors.name}
              success={touched.name && !errors.name && !!form.name}
            />

            {/* Email */}
            <AuthInput
              id="reg-email"
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

            {/* Password */}
            <div>
              <AuthInput
                id="reg-password"
                label="Password"
                type="password"
                placeholder="Create a strong password"
                icon={Lock}
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onBlur={() => blur('password')}
                error={errors.password}
                success={touched.password && !errors.password && !!form.password}
              />
              <AnimatePresence>
                {form.password && <PasswordStrength password={form.password} />}
              </AnimatePresence>
            </div>

            {/* Confirm password */}
            <AuthInput
              id="reg-confirm"
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password"
              icon={Lock}
              value={form.confirm}
              onChange={e => set('confirm', e.target.value)}
              onBlur={() => blur('confirm')}
              error={errors.confirm}
              success={touched.confirm && !errors.confirm && !!form.confirm}
            />

            {/* Terms checkbox */}
            <label
              htmlFor="terms-check"
              className="flex items-start gap-3 cursor-pointer group"
            >
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  id="terms-check"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="sr-only"
                />
                <motion.div
                  className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200"
                  style={{
                    background: agreed ? 'linear-gradient(135deg,#06b6d4,#7c3aed)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${agreed ? 'transparent' : 'rgba(255,255,255,0.15)'}`,
                  }}
                  animate={{ scale: agreed ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {agreed && (
                    <motion.svg width="10" height="8" viewBox="0 0 10 8" fill="none"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.2 }}>
                      <motion.path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </motion.div>
              </div>
              <span className="text-xs text-white/35 font-inter leading-relaxed group-hover:text-white/50 transition-colors">
                I agree to the{' '}
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms of Service</span>
                {' '}and{' '}
                <span className="text-cyan-400 hover:text-cyan-300 transition-colors">Privacy Policy</span>
              </span>
            </label>

            <AuthButton
              type="submit"
              loading={loading}
              disabled={loading || guestLoading}
              id="register-submit-btn"
              className="mt-1"
            >
              <FlaskConical size={15} /> Create Account
            </AuthButton>
          </form>

          <AuthDivider />

          <AuthButton
            variant="ghost"
            onClick={handleGuest}
            loading={guestLoading}
            disabled={loading || guestLoading}
            id="register-guest-btn"
          >
            <UserCircle2 size={15} className="text-white/50" /> Continue as Guest
          </AuthButton>

          <p className="text-center text-xs text-white/30 font-inter mt-6">
            Already have an account?{' '}
            <button
              onClick={() => navigateTo('login')}
              id="go-to-login-link"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors bg-transparent border-0 cursor-pointer"
            >
              Log in
            </button>
          </p>
        </AuthCard>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => navigateTo('landing')}
            id="back-to-landing-register"
            className="text-xs text-white/20 hover:text-white/50 font-space tracking-widest transition-colors bg-transparent border-0 cursor-pointer"
          >
            ← Back to ChemEscape
          </button>
        </motion.div>
      </div>
    </div>
  );
}
