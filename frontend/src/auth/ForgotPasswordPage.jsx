import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, Check } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigation } from '../context/NavigationContext';
import AuthBackground from './AuthBackground';
import {
  AuthCard, AuthBrand, AuthInput, AuthButton, AuthToast,
} from './AuthComponents';

function validateEmail(v) {
  if (!v) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return '';
}

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { navigateTo } = useNavigation();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(null);

  const error = touched ? validateEmail(email) : '';
  const isValid = !validateEmail(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setLoading(true);
    setToast(null);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed inset-0 bg-[#040810]" />
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 30% 50%, rgba(236,72,153,0.08) 0%, transparent 60%)' }} />
      <AuthBackground />

      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        <AuthCard>
          <AuthBrand />

          <AnimatePresence mode="wait">
            {!sent ? (
              /* ── Step 1: Enter email ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
              >
                <div className="text-center mb-8">
                  <h2 className="font-space font-bold text-2xl text-white mb-1">Reset password</h2>
                  <p className="text-white/35 text-sm font-inter leading-relaxed">
                    Enter your email and we'll send a reset link to your inbox.
                  </p>
                </div>

                <AnimatePresence>
                  {toast && (
                    <div className="mb-5">
                      <AuthToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
                    </div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                  <AuthInput
                    id="forgot-email"
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    icon={Mail}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    error={error}
                    success={touched && !error && !!email}
                    hint="We'll send a secure reset link to this address"
                  />

                  <AuthButton
                    type="submit"
                    loading={loading}
                    id="forgot-submit-btn"
                    className="mt-2"
                  >
                    <Send size={15} /> Send Reset Link
                  </AuthButton>
                </form>

                <div className="flex items-center justify-center mt-6">
                  <button
                    onClick={() => navigateTo('login')}
                    id="back-to-login-link"
                    className="flex items-center gap-2 text-xs text-white/30 hover:text-cyan-400 font-space tracking-wide transition-colors group bg-transparent border-0 cursor-pointer"
                  >
                    <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                    Back to login
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Step 2: Success state ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="text-center py-4"
              >
                {/* Animated check circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    {/* Pulsing ring */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ border: '2px solid rgba(52,211,153,0.3)' }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-20 h-20 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(0,212,255,0.1))',
                        border: '2px solid rgba(52,211,153,0.4)',
                        boxShadow: '0 0 40px rgba(52,211,153,0.2)',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <Check size={32} className="text-emerald-400" strokeWidth={2.5} />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-space font-bold text-xl text-white mb-3">Check your inbox</h3>
                  <p className="text-white/40 text-sm font-inter leading-relaxed mb-2">
                    We've sent a password reset link to
                  </p>
                  <p className="font-orbitron text-sm text-cyan-400 mb-6 text-glow-cyan">{email}</p>
                  <p className="text-white/25 text-xs font-inter mb-8">
                    Didn't receive it? Check your spam folder or try again in a minute.
                  </p>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <AuthButton
                      variant="ghost"
                      onClick={() => { setSent(false); setEmail(''); setTouched(false); }}
                      id="forgot-try-again-btn"
                    >
                      Try a different email
                    </AuthButton>

                    <AuthButton
                      variant="primary"
                      onClick={() => navigateTo('login')}
                      id="forgot-login-btn"
                    >
                      <ArrowLeft size={15} /> Back to Login
                    </AuthButton>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </AuthCard>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <button
            onClick={() => navigateTo('landing')}
            id="back-to-landing-forgot"
            className="text-xs text-white/20 hover:text-white/50 font-space tracking-widest transition-colors bg-transparent border-0 cursor-pointer"
          >
            ← Back to EduNova
          </button>
        </motion.div>
      </div>
    </div>
  );
}
