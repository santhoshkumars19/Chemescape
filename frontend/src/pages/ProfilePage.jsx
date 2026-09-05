import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import { ThemeSettingsCard } from '../components/ThemeToggle';
import { generateCertificatePDF } from '../utils/certificateGenerator';
import {
  User, Award, Trophy, Zap, Coins, Clock, Target, Edit3, Settings,
  CheckCircle2, Lock, Download, Eye, Sparkles, ShieldCheck, Volume2,
  VolumeX, Bell, Monitor, ArrowLeft, LayoutDashboard, Compass, LogOut,
  X, Check, Save, Share2, Flame, BookOpen, Loader2
} from 'lucide-react';

const ACHIEVEMENTS_DEF = [
  { id: 1, title: 'Periodic Pioneer', desc: 'Cleared Room 1 with high accuracy', icon: '⚗️', rarity: 'Epic', check: (rooms) => rooms.some(r => String(r).includes('room1')) },
  { id: 2, title: 'Reaction Master', desc: 'Completed 5 chemistry missions', icon: '🔥', rarity: 'Legendary', check: (rooms) => rooms.length >= 5 },
  { id: 3, title: 'Speed Chemist', desc: 'Escaped 3 challenge rooms', icon: '⏱️', rarity: 'Rare', check: (rooms) => rooms.length >= 3 },
  { id: 4, title: 'AEGIS Slayer', desc: 'Conquered the Boss Room AI', icon: '👑', rarity: 'Mythic', check: (rooms) => rooms.some(r => String(r).includes('boss')) },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const {
    navigateTo,
    currentScreen,
    xp = 0,
    coins = 0,
    streak = 0,
    level = 1,
    completedRooms = [],
    userBadges = [],
    userProgressList = []
  } = useNavigation();

  const [activeTab, setActiveTab] = useState(
    currentScreen === 'settings' ? 'settings' : 'overview'
  );

  const [profile, setProfile] = useState({
    name: user?.name || 'Scholar',
    email: user?.email || '',
    title: user?.role === 'TEACHER' ? 'Faculty Educator' : user?.role === 'ADMIN' ? 'Platform Administrator' : 'Level 1 Chemist',
    bio: user?.role === 'TEACHER' ? 'Empowering students to master chemistry through interactive simulations.' : 'Exploring the fascinating world of chemistry through escape challenges.',
    avatar: user?.avatar || '⚡',
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatar: user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: profile.name, title: profile.title, bio: profile.bio });
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);

  // Dynamic calculations from real activity
  const accuracy = userProgressList && userProgressList.length > 0
    ? Math.round(userProgressList.reduce((acc, p) => acc + (p.score || 0), 0) / userProgressList.length)
    : 0;

  const earnedAchievements = ACHIEVEMENTS_DEF.filter(a => a.check(completedRooms));

  const certificates = completedRooms.map((roomId, idx) => ({
    id: `cert-${idx + 1}`,
    chapter: String(roomId).replace(/[-_]/g, ' ').toUpperCase(),
    date: new Date().toLocaleDateString(),
    code: `CHEM-${2026 + idx}-${String(roomId).slice(0, 3).toUpperCase()}`,
    grade: '100%'
  }));

  // Settings & PDF states
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  const handleDownloadCert = async (cert) => {
    try {
      setDownloadingCertId(cert.id);
      await generateCertificatePDF(cert, profile);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setDownloadingCertId(null);
    }
  };

  const handleSaveProfile = () => {
    setProfile(prev => ({
      ...prev,
      name: editForm.name,
      title: editForm.title,
      bio: editForm.bio,
      avatar: selectedAvatar,
    }));
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-[#050807] text-white flex selection:bg-emerald-500 selection:text-black">
      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-emerald-500/15 bg-[#050807]/90 backdrop-blur-xl p-5 justify-between select-none">
        <div>
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-3 mb-8 px-2 border-0 bg-transparent cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-orbitron font-extrabold text-base tracking-wider gradient-text-emerald">
                EduNova
              </span>
              <span className="block text-[9px] font-space text-slate-400 tracking-widest uppercase">
                AAA Gaming Suite
              </span>
            </div>
          </button>

          <nav className="space-y-1.5 font-space text-xs">
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigateTo('standards')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Compass size={18} />
              <span>Play Missions</span>
            </button>
            <button
              onClick={() => navigateTo('leaderboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => navigateTo('profile')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold shadow-lg shadow-emerald-500/10 cursor-pointer text-left"
            >
              <User size={18} />
              <span>Student Profile</span>
            </button>
          </nav>
        </div>

        <button
          onClick={() => {
            logout();
            navigateTo('login');
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-space text-xs font-semibold border-0 bg-transparent cursor-pointer"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative overflow-x-hidden">
        {/* Ambient Lighting */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 via-teal-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* ── HEADER COVER BANNER ── */}
        <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-[#050807] via-[#0B1210] to-[#0F1916] border-b border-emerald-500/15 overflow-hidden flex items-end p-6 md:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
          
          <button onClick={() => navigateTo('dashboard')} className="lg:hidden absolute top-4 left-4 flex items-center gap-1.5 text-xs text-emerald-400 font-orbitron font-bold bg-[#0B1210]/90 px-3 py-1.5 rounded-xl border border-emerald-500/20 cursor-pointer">
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Profile Card Header Info */}
        <div className="relative max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 -mt-16 md:-mt-20 mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 z-10 box-border">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-[#050807] border-4 border-emerald-500/50 p-2 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center text-5xl md:text-6xl flex-shrink-0">
              {profile.avatar}
              <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-orbitron font-black text-xs border-2 border-[#050807]">
                Lv {level}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <h1 className="font-space font-extrabold text-2xl md:text-3xl text-white">{profile.name}</h1>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-orbitron text-[10px] font-bold uppercase tracking-wider">
                  Pro Chemist
                </span>
              </div>
              <p className="font-orbitron font-semibold text-xs text-emerald-400 mb-2">{profile.title}</p>
              <p className="font-space text-xs text-slate-400 max-w-lg leading-relaxed">{profile.bio}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-center md:self-end">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-orbitron text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Edit3 size={15} />
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Inline Profile Edit Drawer */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-6 md:mx-12 mb-8 p-6 rounded-2xl bg-[#0B1210]/90 border border-emerald-500/30 backdrop-blur-xl space-y-4"
            >
              <h3 className="font-orbitron font-bold text-sm text-emerald-300 uppercase tracking-widest">Update Chemist Dossier</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-space text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl bg-[#050807] border border-emerald-500/20 text-white text-xs font-space outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-space text-slate-400 mb-1">Alchemist Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 py-2 rounded-xl bg-[#050807] border border-emerald-500/20 text-white text-xs font-space outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-space text-slate-400 mb-1">Bio / Status</label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl bg-[#050807] border border-emerald-500/20 text-white text-xs font-space outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-orbitron font-black text-xs uppercase flex items-center gap-2 cursor-pointer"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 mb-8 border-b border-emerald-500/15 flex items-center gap-2 overflow-x-auto no-scrollbar box-border">
          {[
            { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
            { id: 'achievements', label: 'Achievements', icon: Award },
            { id: 'certificates', label: 'Certificates', icon: ShieldCheck },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 font-orbitron font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 md:px-8 pb-12 flex-1 box-border min-w-0">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0B1210]/60 border border-emerald-500/15 backdrop-blur-xl">
                  <Zap className="text-emerald-400 mb-2" size={20} />
                  <p className="text-[10px] font-space text-slate-400 uppercase">Total XP</p>
                  <p className="font-orbitron font-extrabold text-xl text-white">{xp}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1210]/60 border border-emerald-500/15 backdrop-blur-xl">
                  <Coins className="text-amber-400 mb-2" size={20} />
                  <p className="text-[10px] font-space text-slate-400 uppercase">Coins</p>
                  <p className="font-orbitron font-extrabold text-xl text-amber-300">{coins}</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1210]/60 border border-emerald-500/15 backdrop-blur-xl">
                  <Flame className="text-orange-400 mb-2" size={20} />
                  <p className="text-[10px] font-space text-slate-400 uppercase">Day Streak</p>
                  <p className="font-orbitron font-extrabold text-xl text-orange-400">{streak} Days</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#0B1210]/60 border border-emerald-500/15 backdrop-blur-xl">
                  <Target className="text-emerald-400 mb-2" size={20} />
                  <p className="text-[10px] font-space text-slate-400 uppercase">Accuracy</p>
                  <p className="font-orbitron font-extrabold text-xl text-emerald-400">{accuracy}%</p>
                </div>
              </div>

              {/* Badges Collection */}
              <div>
                <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-widest mb-4">Equipped Badges</h3>
                {userBadges.length === 0 ? (
                  <p className="text-xs font-space text-slate-400">No badges earned yet. Complete challenges to earn badges.</p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {userBadges.map((badge, idx) => (
                      <div
                        key={badge.id || idx}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#0B1210]/80 border border-emerald-500/15"
                      >
                        <span className="text-xl">{badge.emoji || '🏅'}</span>
                        <span className="font-orbitron text-xs font-bold text-white">{badge.name || badge.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedAchievements.length === 0 ? (
                <div className="col-span-2 p-8 text-center glass rounded-2xl">
                  <Trophy className="mx-auto mb-2 text-emerald-400/50" size={32} />
                  <p className="text-sm font-space font-semibold text-white">No achievements unlocked yet.</p>
                  <p className="text-xs font-space text-slate-400 mt-1">Play escape rooms and complete challenges to unlock badges.</p>
                </div>
              ) : (
                earnedAchievements.map(ach => (
                  <div
                    key={ach.id}
                    className="p-5 rounded-2xl border backdrop-blur-xl flex items-center gap-4 bg-[#0B1210]/70 border-emerald-500/30"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#050807] border border-emerald-500/15 flex items-center justify-center text-2xl flex-shrink-0">
                      {ach.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-orbitron font-bold text-sm text-white">{ach.title}</h4>
                        <span className="text-[9px] font-orbitron font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {ach.rarity}
                        </span>
                      </div>
                      <p className="text-xs font-space text-slate-400 mt-1">{ach.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'certificates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.length === 0 ? (
                <div className="col-span-2 p-8 text-center glass rounded-2xl">
                  <Award className="mx-auto mb-2 text-emerald-400/50" size={32} />
                  <p className="text-sm font-space font-semibold text-white">No certificates available.</p>
                  <p className="text-xs font-space text-slate-400 mt-1">Complete chapter escape rooms to earn official certificates.</p>
                </div>
              ) : (
                certificates.map(cert => (
                  <div key={cert.id} className="p-6 rounded-2xl bg-[#0B1210]/80 border border-emerald-500/30 backdrop-blur-xl flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[10px] font-space text-emerald-400 uppercase tracking-widest">OFFICIAL CERTIFICATE</span>
                      <h4 className="font-orbitron font-bold text-base text-white mt-1">{cert.chapter}</h4>
                      <p className="text-xs text-slate-400 font-space mt-1">Grade: {cert.grade} · Date: {cert.date}</p>
                    </div>

                    <button
                      onClick={() => handleDownloadCert(cert)}
                      disabled={downloadingCertId === cert.id}
                      className="self-start px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-orbitron text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/30 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {downloadingCertId === cert.id ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-emerald-400" /> Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download size={14} /> Download PDF
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-6">
              {/* ── Appearance / Theme ── */}
              <ThemeSettingsCard />

              {/* ── Audio & Preferences ── */}
              <div className="bg-[#0B1210]/60 p-6 rounded-2xl border border-emerald-500/15 backdrop-blur-xl space-y-4">
                <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-widest">Audio & Preferences</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-space text-sm font-semibold text-white">Sound Effects</p>
                      <p className="text-xs text-slate-400">UI click and reaction sound effects</p>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-emerald-500/10">
                    <div>
                      <p className="font-space text-sm font-semibold text-white">Lab Ambient Music</p>
                      <p className="text-xs text-slate-400">Sci-fi background synth music</p>
                    </div>
                    <button
                      onClick={() => setMusicEnabled(!musicEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${musicEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-transform ${musicEnabled ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
