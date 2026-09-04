import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FlaskConical, MessageCircle, Code2, PlayCircle, Mail,
  Shield, FileText, Info, Send, CheckCircle2, Atom, Sparkles
} from 'lucide-react';

const footerLinks = {
  COMPANY: [
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
  ],
  GAME: [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Leaderboard', href: '#leaderboard' },
    { label: 'Achievements', href: '#achievements' },
  ],
  SUPPORT: [
    { label: 'FAQ', href: '#faq' },
    { label: 'Bug Report', href: '#bugs' },
    { label: 'Community', href: '#community' },
    { label: 'Changelog', href: '#changelog' },
  ],
  'FOLLOW US': [
    { label: 'Discord', href: '#discord', icon: MessageCircle },
    { label: 'GitHub', href: '#github', icon: Code2 },
    { label: 'YouTube', href: '#youtube', icon: PlayCircle },
    { label: 'Email', href: '#email', icon: Mail },
  ]
};

const socials = [
  { icon: MessageCircle, href: '#discord', label: 'Discord' },
  { icon: Code2, href: '#github', label: 'GitHub' },
  { icon: PlayCircle, href: '#youtube', label: 'YouTube' },
  { icon: Mail, href: '#email', label: 'Email' },
];

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 4000);
    }
  };

  return (
    <footer id="about" className="relative z-10 border-t border-emerald-500/10 bg-[#050807]/95 backdrop-blur-2xl">
      {/* Top Glow Divider */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Main Container Standard */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-12 md:py-16">

        {/* ── TOP FOOTER SECTION (Section 7 Requirements) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pb-12 border-b border-emerald-500/10 items-center">
          
          {/* LEFT: Logo + Short Description + Social Icons */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FlaskConical size={20} className="text-white" />
              </div>
              <span className="font-orbitron text-xl font-black tracking-widest gradient-text-emerald">
                EDU<span className="text-white">NOVA</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs md:text-sm font-space leading-relaxed max-w-sm">
              The ultimate gamified learning platform. Solve interactive puzzles, master the curriculum, and conquer academic missions.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              {socials.map((soc) => {
                const Icon = soc.icon;
                return (
                  <motion.a
                    key={soc.label}
                    href={soc.href}
                    aria-label={soc.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl glass border border-emerald-500/15 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-all"
                  >
                    <Icon size={18} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* CENTER: Newsletter Subscription Form */}
          <div className="space-y-3 bg-[#0B1210] border border-emerald-500/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="font-orbitron font-bold text-sm text-white tracking-wider uppercase flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              Stay In The Lab
            </h3>
            <p className="text-slate-400 text-xs font-space">
              Subscribe for weekly chemistry challenges, release updates, and bonus XP codes.
            </p>

            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-[#050807] border border-emerald-500/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-space focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-orbitron font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all flex-shrink-0"
              >
                {subscribed ? (
                  <>
                    <CheckCircle2 size={14} className="text-slate-950" />
                    <span>Joined!</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Chemistry Laboratory Graphic Card */}
          <div className="bg-gradient-to-br from-[#0B1210] via-[#0F1916] to-[#050807] border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-orbitron text-emerald-400 font-bold uppercase tracking-widest block">AAA GAMING ENGINE</span>
              <h4 className="font-orbitron font-black text-sm text-white">Interactive Chemistry Lab</h4>
              <p className="text-slate-400 font-space text-xs">100% Client-side • Zero Latency</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Atom size={28} className="animate-spin-slow" />
            </div>
          </div>
        </div>

        {/* ── BOTTOM FOOTER SECTION: 4 EQUAL COLUMNS (Section 7 & 8 Requirements) ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-4">
              <h4 className="font-orbitron font-bold text-xs text-emerald-400 tracking-[0.2em] uppercase">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-xs font-space text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                      >
                        {LinkIcon && <LinkIcon size={14} className="text-slate-500" />}
                        <span>{link.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── COPYRIGHT & STATUS BAR ── */}
        <div className="pt-8 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-space text-slate-500">
          <p>© 2026 EduNova Gamified Learning Suite. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-emerald-400 font-semibold">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
