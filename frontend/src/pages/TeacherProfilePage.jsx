import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Award, BookOpen, Edit3, Save, X, ArrowLeft,
  Mail, Phone, MapPin, Calendar, CheckCircle2, Zap,
  FileText, Users, Lock, Unlock, BarChart2, Star,
  Shield, Clock, GraduationCap, MessageSquare, Settings
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { DashCard } from '../dashboard/DashComponents';
import { ThemeSettingsCard } from '../components/ThemeToggle';

// Small reusable toggle row for settings tab
function PrefToggle({ label, desc }) {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="font-space font-semibold text-white text-xs">{label}</p>
        <p className="text-white/40 text-[11px] font-inter mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setOn(v => !v)}
        className={`relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ${on ? 'bg-purple-500' : 'bg-white/10'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${on ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}

const TEACHER_PROFILE_INIT = {
  name: 'Prof. Chemistry Teacher',
  subject: 'Chemistry',
  qualification: 'M.Sc. Chemistry, B.Ed.',
  institution: 'EduNova Academy',
  email: 'teacher@edunova.com',
  phone: '+91 98765 43210',
  location: 'Chennai, Tamil Nadu',
  joined: 'August 2025',
  bio: 'Passionate Chemistry educator with 8+ years of experience teaching 11th & 12th standard students. Specialized in Physical and Organic Chemistry.',
  avatar: '👨‍🏫',
  specialization: 'Physical Chemistry & Thermodynamics',
  experience: '8 Years',
};

const AVATARS = ['👨‍🏫', '👩‍🏫', '🧑‍🏫', '👨‍🔬', '👩‍🔬', '🧑‍🔬'];

const TEACHER_STATS = [
  { label: 'Students Taught', value: '34', icon: Users, color: '#00d4ff' },
  { label: 'Rooms Managed', value: '6', icon: Lock, color: '#a855f7' },
  { label: 'Questions Created', value: '24', icon: FileText, color: '#ec4899' },
  { label: 'Avg Class Score', value: '92%', icon: Star, color: '#fbbf24' },
  { label: 'Active Sessions', value: '12', icon: Zap, color: '#34d399' },
  { label: 'Yrs Experience', value: '8', icon: GraduationCap, color: '#fb923c' },
];

const CERTIFICATIONS = [
  { title: 'Certified Chemistry Educator', issuer: 'Central Board of Secondary Education', year: '2018', icon: '🎓' },
  { title: 'Advanced Pedagogy in STEM', issuer: 'National Council of Educational Research', year: '2020', icon: '📘' },
  { title: 'Digital Learning Facilitator', issuer: 'EduNova Academy', year: '2025', icon: '💻' },
];

const RECENT_ACTIVITY = [
  { action: 'Unlocked Unit 6 Gas Chamber for all students', time: '2 hours ago', icon: Unlock, color: '#34d399' },
  { action: 'Added 3 new questions to Calculation Heist', time: '5 hours ago', icon: FileText, color: '#00d4ff' },
  { action: 'Sent class announcement for Unit 2 review', time: '1 day ago', icon: MessageSquare, color: '#a855f7' },
  { action: 'Reviewed Priya Sundaram student report', time: '2 days ago', icon: BarChart2, color: '#fbbf24' },
];

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const { navigateTo, currentScreen } = useNavigation();

  const [activeTab, setActiveTab] = useState(
    currentScreen === 'settings' ? 'settings' : 'overview'
  );
  const [profile, setProfile] = useState({
    ...TEACHER_PROFILE_INIT,
    name: user?.name || TEACHER_PROFILE_INIT.name,
    email: user?.email || TEACHER_PROFILE_INIT.email,
    avatar: user?.avatar || TEACHER_PROFILE_INIT.avatar,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    subject: profile.subject,
    qualification: profile.qualification,
    institution: profile.institution,
    phone: profile.phone,
    location: profile.location,
    bio: profile.bio,
    specialization: profile.specialization,
  });
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = () => {
    setProfile(prev => ({ ...prev, ...editForm, avatar: selectedAvatar }));
    setIsEditing(false);
    showToast('Teacher profile updated successfully!');
  };

  const tabs = [
    { id: 'overview',        label: 'Overview',       icon: User },
    { id: 'certifications',  label: 'Certifications', icon: Award },
    { id: 'activity',        label: 'Recent Activity',icon: Clock },
    { id: 'settings',        label: 'Settings',       icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-[#040810] text-white overflow-x-hidden w-full pb-16">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(168,85,247,0.12) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-6 w-full box-border">

        {/* ── BACK BUTTON ─────────────────────────────────────────────── */}
        <div className="mb-5">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/40 text-white/60 hover:text-purple-300 font-space font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </motion.button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-purple-600/90 text-white font-space text-xs border border-purple-400/30 shadow-xl flex items-center gap-2"
            >
              <CheckCircle2 size={14} className="text-cyan-400" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROFILE HERO CARD ───────────────────────────────────────── */}
        <DashCard className="p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(0,212,255,0.15))', border: '2px solid rgba(168,85,247,0.4)', boxShadow: '0 0 30px rgba(168,85,247,0.2)' }}>
                {profile.avatar}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center text-xs border-2 border-[#040810]">
                👨‍🏫
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-orbitron font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                      TEACHER PORTAL
                    </span>
                    <span className="text-xs font-space text-white/40">ID: TCH-2026-88</span>
                  </div>
                  <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white">{profile.name}</h1>
                  <p className="text-purple-300 text-sm font-space font-bold mt-0.5">{profile.subject} — {profile.specialization}</p>
                  <p className="text-white/50 text-xs font-inter mt-1">{profile.qualification} · {profile.institution}</p>
                </div>

                <button
                  onClick={() => {
                    setEditForm({ name: profile.name, subject: profile.subject, qualification: profile.qualification, institution: profile.institution, phone: profile.phone, location: profile.location, bio: profile.bio, specialization: profile.specialization });
                    setSelectedAvatar(profile.avatar);
                    setIsEditing(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-space font-bold text-xs cursor-pointer transition-all flex-shrink-0"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Contact Row */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs font-inter text-white/50">
                <span className="flex items-center gap-1.5"><Mail size={12} className="text-cyan-400" /> {profile.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={12} className="text-purple-400" /> {profile.phone}</span>
                <span className="flex items-center gap-1.5"><MapPin size={12} className="text-pink-400" /> {profile.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12} className="text-amber-400" /> Joined {profile.joined}</span>
              </div>

              {/* Bio */}
              <p className="text-white/60 text-xs font-inter mt-3 leading-relaxed max-w-2xl">{profile.bio}</p>
            </div>
          </div>
        </DashCard>

        {/* ── STATS ROW ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
          {TEACHER_STATS.map(m => (
            <DashCard key={m.label} className="p-4" glow={`${m.color}08`}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                <m.icon size={16} style={{ color: m.color }} />
              </div>
              <p className="font-orbitron font-black text-xl text-white leading-none">{m.value}</p>
              <p className="text-[11px] text-white/40 font-space mt-1">{m.label}</p>
            </DashCard>
          ))}
        </div>

        {/* ── TABS ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                  : 'bg-white/5 text-white/40 hover:text-white border border-white/5'
              }`}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ───────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <DashCard className="p-5">
              <h3 className="font-orbitron font-bold text-base text-white mb-4 flex items-center gap-2">
                <GraduationCap size={16} className="text-purple-400" /> Professional Details
              </h3>
              <div className="flex flex-col gap-3 text-sm">
                {[
                  { label: 'Full Name', value: profile.name },
                  { label: 'Subject', value: profile.subject },
                  { label: 'Specialization', value: profile.specialization },
                  { label: 'Qualification', value: profile.qualification },
                  { label: 'Institution', value: profile.institution },
                  { label: 'Experience', value: profile.experience },
                  { label: 'Location', value: profile.location },
                  { label: 'Contact', value: profile.phone },
                ].map(row => (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/40 font-space text-xs">{row.label}</span>
                    <span className="text-white font-inter text-xs text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </DashCard>

            <DashCard className="p-5">
              <h3 className="font-orbitron font-bold text-base text-white mb-4 flex items-center gap-2">
                <BarChart2 size={16} className="text-cyan-400" /> Teaching Performance
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Student Completion Rate', value: 88 },
                  { label: 'Average Class Score', value: 92 },
                  { label: 'Question Bank Utilization', value: 76 },
                  { label: 'Student Engagement', value: 95 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-space mb-1">
                      <span className="text-white/60">{item.label}</span>
                      <span className="font-orbitron font-bold text-cyan-400">{item.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>
        )}

        {/* ── TAB: CERTIFICATIONS ─────────────────────────────────────── */}
        {activeTab === 'certifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {CERTIFICATIONS.map((cert, i) => (
              <DashCard key={i} className="p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {cert.icon}
                </div>
                <div>
                  <h4 className="font-space font-bold text-white text-sm mb-0.5">{cert.title}</h4>
                  <p className="text-white/50 text-xs font-inter">{cert.issuer}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      Verified ✓
                    </span>
                    <span className="text-[10px] text-white/30 font-space">{cert.year}</span>
                  </div>
                </div>
              </DashCard>
            ))}
          </div>
        )}

        {/* ── TAB: RECENT ACTIVITY ────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <DashCard className="p-5">
            <h3 className="font-orbitron font-bold text-base text-white mb-4">Teaching Activity Log</h3>
            <div className="flex flex-col gap-1">
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                    <item.icon size={15} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-inter">{item.action}</p>
                    <p className="text-white/30 text-[10px] font-space mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashCard>
        )}

        {/* ── TAB: SETTINGS ───────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-xl space-y-5">
            <ThemeSettingsCard />

            {/* Notification preferences */}
            <DashCard className="p-5">
              <h3 className="font-orbitron font-bold text-base text-white mb-4 flex items-center gap-2">
                <Settings size={16} className="text-purple-400" /> Preferences
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive class & student alerts by email' },
                  { label: 'Sound Effects', desc: 'UI interaction sounds' },
                  { label: 'Student Progress Alerts', desc: 'Notify when a student completes a unit' },
                ].map(item => (
                  <PrefToggle key={item.label} label={item.label} desc={item.desc} />
                ))}
              </div>
            </DashCard>
          </div>
        )}
      </div>


      {/* ── EDIT PROFILE MODAL ──────────────────────────────────────── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <div className="w-full max-w-xl p-6 rounded-2xl bg-[#0a1628] border border-purple-500/30 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Edit3 size={16} className="text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-base text-white">Edit Teacher Profile</h3>
                    <p className="text-xs text-white/40 font-space">Update your professional information</p>
                  </div>
                </div>
                <button onClick={() => setIsEditing(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              {/* Avatar Picker */}
              <div className="mb-4">
                <label className="block text-xs font-space text-white/70 mb-2">Choose Avatar</label>
                <div className="flex gap-3 flex-wrap">
                  {AVATARS.map(av => (
                    <button
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2 cursor-pointer transition-all ${
                        selectedAvatar === av
                          ? 'border-purple-400 bg-purple-500/20 scale-110'
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', placeholder: 'Your full name' },
                  { label: 'Subject', key: 'subject', placeholder: 'e.g. Chemistry' },
                  { label: 'Specialization', key: 'specialization', placeholder: 'e.g. Physical Chemistry' },
                  { label: 'Qualification', key: 'qualification', placeholder: 'e.g. M.Sc, B.Ed.' },
                  { label: 'Institution', key: 'institution', placeholder: 'Your institution name' },
                  { label: 'Phone', key: 'phone', placeholder: '+91 ...' },
                  { label: 'Location', key: 'location', placeholder: 'City, State' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'specialization' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-space text-white/70 mb-1">{field.label}</label>
                    <input
                      type="text"
                      value={editForm[field.key]}
                      onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-purple-500/40"
                    />
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-space text-white/70 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Short professional bio..."
                    className="w-full p-3 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-white/10">
                <button onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 text-xs font-space cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-space font-bold text-xs uppercase cursor-pointer shadow-lg">
                  <Save size={14} />
                  <span>Save Profile</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
