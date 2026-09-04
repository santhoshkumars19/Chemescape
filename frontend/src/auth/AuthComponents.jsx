import { motion, AnimatePresence } from 'framer-motion';
import { useState, forwardRef } from 'react';
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';

// ─── Reusable Input ───────────────────────────────────────────────────────────
export const AuthInput = forwardRef(function AuthInput(
  { label, id, type = 'text', placeholder, value, onChange, onBlur,
    error, success, icon: Icon, hint, className = '', ...rest },
  ref
) {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === 'password';
  const inputType = isPass ? (showPass ? 'text' : 'password') : type;

  const borderColor = error
    ? 'rgba(239,68,68,0.5)'
    : success
      ? 'rgba(52,211,153,0.5)'
      : 'rgba(255,255,255,0.1)';

  const focusShadow = error
    ? '0 0 0 3px rgba(239,68,68,0.15)'
    : success
      ? '0 0 0 3px rgba(52,211,153,0.15)'
      : '0 0 0 3px rgba(16,185,129,0.18)';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-space font-semibold text-emerald-400/60 tracking-widest uppercase"
        >
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Icon
              size={16}
              className="transition-colors duration-200"
              style={{ color: error ? '#ef4444' : success ? '#34d399' : 'rgba(167,243,208,0.4)' }}
            />
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="w-full bg-[#0B1210]/60 text-white placeholder-slate-500 rounded-xl py-3.5 pr-12 text-sm font-inter transition-all duration-200 outline-none"
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            border: `1px solid ${borderColor}`,
          }}
          onFocus={e => { e.currentTarget.style.boxShadow = focusShadow; e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.6)' : success ? 'rgba(52,211,153,0.6)' : 'rgba(16,185,129,0.4)'; }}
          onBlurCapture={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = borderColor; }}
          {...rest}
        />

        {/* Right: eye toggle or status icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isPass && (
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="text-white/30 hover:text-white/70 transition-colors p-0.5"
              tabIndex={-1}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              id={`${id}-toggle`}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
          <AnimatePresence mode="wait">
            {error && (
              <motion.span key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                <X size={14} className="text-red-400" />
              </motion.span>
            )}
            {success && !error && (
              <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
                <Check size={14} className="text-emerald-400" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="errmsg"
            className="flex items-center gap-1.5 text-xs text-red-400 font-inter"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            key="hint"
            className="text-xs text-white/25 font-inter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─── Password strength meter ───────────────────────────────────────────────────
export function PasswordStrength({ password }) {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#67e8f9', '#34d399'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="pt-2 flex flex-col gap-2">
        {/* Bars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: score >= i ? '100%' : '0%' }}
                style={{ background: colors[score] }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              />
            </div>
          ))}
          <span className="text-xs font-space ml-1" style={{ color: colors[score], minWidth: 40 }}>
            {labels[score]}
          </span>
        </div>

        {/* Requirements */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300"
                style={{ background: c.ok ? '#34d399' : 'rgba(255,255,255,0.15)' }}
              />
              <span className={`text-xs font-inter transition-colors duration-300 ${c.ok ? 'text-emerald-400' : 'text-white/25'}`}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Auth layout shell ────────────────────────────────────────────────────────
export function AuthCard({ children, className = '' }) {
  return (
    <motion.div
      className={`relative w-full max-w-md rounded-3xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(12, 20, 17, 0.85)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(167, 243, 208, 0.16)',
        boxShadow: `
          0 0 0 1px rgba(16,185,129,0.08),
          0 40px 80px rgba(0,0,0,0.6),
          0 0 80px rgba(16,185,129,0.12),
          inset 0 1px 0 rgba(167,243,208,0.1)
        `,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(103,232,249,0.4), transparent)' }} />
      {/* Inner glow top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.4) 0%, transparent 70%)' }} />

      <div className="relative z-10 p-8 sm:p-10">
        {children}
      </div>
    </motion.div>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
export function AuthButton({ children, loading = false, disabled = false, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 60%, #047857 100%)',
      color: '#050807',
      fontWeight: '800',
      boxShadow: loading ? 'none' : '0 0 30px rgba(16,185,129,0.3), 0 8px 32px rgba(16,185,129,0.25)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(167,243,208,0.15)',
      color: '#F1F5F4',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
      color: '#FFFFFF',
    },
  };

  return (
    <motion.button
      className={`relative w-full py-4 rounded-2xl font-orbitron font-extrabold text-xs tracking-wider uppercase overflow-hidden flex items-center justify-center gap-2 transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={variants[variant]}
      whileHover={!disabled && !loading ? { scale: 1.01, boxShadow: '0 0 50px rgba(16,185,129,0.45)' } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      disabled={disabled || loading}
      {...props}
    >
      {/* Shine sweep on primary */}
      {variant === 'primary' && !loading && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }}
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {loading ? (
        <>
          <motion.div
            className="w-4 h-4 rounded-full border-2 border-slate-950/30 border-t-slate-950"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
          <span>Please wait…</span>
        </>
      ) : children}
    </motion.button>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function AuthDivider({ label = 'or' }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-xs text-white/25 font-inter tracking-widest uppercase">{label}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}

// ─── Brand header ─────────────────────────────────────────────────────────────
export function AuthBrand() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      {/* Animated atom logo */}
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <div className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(103,232,249,0.15))', border: '1px solid rgba(167,243,208,0.2)' }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="3.5" fill="#10B981" />
            <ellipse cx="16" cy="16" rx="13" ry="6" stroke="#10B981" strokeWidth="1" fill="none" opacity="0.6" />
            <ellipse cx="16" cy="16" rx="13" ry="6" stroke="#34D399" strokeWidth="1" fill="none" opacity="0.5" transform="rotate(60 16 16)" />
            <ellipse cx="16" cy="16" rx="13" ry="6" stroke="#67E8F9" strokeWidth="1" fill="none" opacity="0.4" transform="rotate(120 16 16)" />
            <motion.circle cx="29" cy="16" r="2" fill="#10B981" />
            <motion.circle cx="23.5" cy="6.1" r="2" fill="#67E8F9" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <h1 className="font-orbitron font-black text-xl tracking-[0.15em] gradient-text-emerald">
          EDUNOVA
        </h1>
        <p className="text-xs text-emerald-400/50 font-space tracking-widest mt-0.5">GAMIFIED LEARNING PLATFORM</p>
      </div>
    </div>
  );
}

// ─── Toast notification ───────────────────────────────────────────────────────
export function AuthToast({ message, type = 'error', onClose }) {
  const colors = {
    error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5' },
    success: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.3)', text: '#6ee7b7' },
    info: { bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.25)', text: '#67e8f9' },
  };
  const c = colors[type];
  return (
    <motion.div
      className="flex items-start gap-3 p-4 rounded-2xl text-sm font-inter"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <AlertCircle size={15} style={{ color: c.text, flexShrink: 0, marginTop: 1 }} />
      <p style={{ color: c.text }} className="leading-relaxed">{message}</p>
      {onClose && (
        <button onClick={onClose} className="ml-auto text-white/20 hover:text-white/60 transition-colors">
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}
