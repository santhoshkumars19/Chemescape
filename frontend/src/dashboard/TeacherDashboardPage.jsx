import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, CheckCircle2, Clock, Award,
  Plus, Search, Lock, Unlock, Download, Send,
  TrendingUp, AlertTriangle, ChevronRight, Eye, Shield,
  FlaskConical, Zap, BarChart2, Filter, X, FileText, ArrowRight, FileSpreadsheet, Megaphone
} from 'lucide-react';
import { DashCard, SectionHeader, AnimatedCounter } from './DashComponents';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { apiClient } from '../services/apiClient';

const CURRICULUM_UNITS = [
  { id: 1, name: 'Unit 1: Calculation Quest', topic: 'Core Concepts' },
  { id: 2, name: 'Unit 2: Quantum Orbital Architect', topic: 'Quantum Mechanical Model of Atom' },
  { id: 3, name: 'Unit 3: Periodic Grid Reconstruction', topic: 'Periodic Classification of Elements' },
  { id: 4, name: 'Unit 4: Hydrogen Reactor', topic: 'Hydrogen & Hydrides' },
  { id: 5, name: 'Unit 5: Element Sorting Factory', topic: 'Alkali & Alkaline Earth Metals' },
  { id: 6, name: 'Unit 6: Gas Chamber Simulator', topic: 'States of Matter: Gaseous State' },
];

export default function TeacherDashboardPage() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalReports: 0, avgScore: 0, passRate: 0, completedRooms: 0, totalTimeMinutes: 0 });
  const [loading, setLoading] = useState(true);

  const [selectedClass, setSelectedClass] = useState('8th Grade - Sec A');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [roomLocks, setRoomLocks] = useState({
    1: true, 2: true, 3: true, 4: true, 5: true, 6: true,
  });
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const raw = localStorage.getItem('chemescape_teacher_announcements');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadTeacherData() {
      try {
        const [usersRes, reportsRes] = await Promise.allSettled([
          apiClient.get('/auth/users', { params: { role: 'STUDENT' } }),
          apiClient.get('/reports')
        ]);

        if (isMounted) {
          const recs = reportsRes.status === 'fulfilled' && reportsRes.value?.records ? reportsRes.value.records : [];
          setReports(recs);

          if (reportsRes.status === 'fulfilled' && reportsRes.value?.stats) {
            setStats(reportsRes.value.stats);
          }

          const rawUsers = usersRes.status === 'fulfilled' ? (usersRes.value?.data?.users || usersRes.value?.users || []) : [];
          if (usersRes.status === 'fulfilled') {
            const enriched = rawUsers.map(u => {
              const studentRecs = recs.filter(r => r.userId === u.id || r.userEmail === u.email);
              const count = studentRecs.length;
              const avg = count > 0
                ? Math.round(studentRecs.reduce((acc, r) => acc + (r.score || 0), 0) / count)
                : 0;
              const completedUnits = Array.from(new Set(studentRecs.filter(r => r.passed).map(r => {
                const topic = (r.topic || '').toLowerCase();
                if (topic.includes('core') || topic.includes('calc')) return 1;
                if (topic.includes('quantum') || topic.includes('orbital') || topic.includes('atom')) return 2;
                if (topic.includes('periodic')) return 3;
                if (topic.includes('hydrogen')) return 4;
                if (topic.includes('metal') || topic.includes('alkali')) return 5;
                if (topic.includes('gas') || topic.includes('matter')) return 6;
                return 1;
              })));

              return {
                id: u.id,
                name: u.name || 'Scholar',
                email: u.email || '',
                level: Math.max(1, Math.floor(avg / 20)),
                xp: studentRecs.reduce((acc, r) => acc + (r.score || 0) * 10, 0),
                completedUnits,
                avgScore: count > 0 ? `${avg}%` : '0%',
                numericAvg: avg,
                status: avg >= 80 ? 'TOP_PERFORMER' : avg >= 50 ? 'ON_TRACK' : 'NEEDS_SUPPORT'
              };
            });
            setStudents(enriched);
          }
        }
      } catch (err) {
        console.warn('Failed to load teacher data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTeacherData();
    return () => { isMounted = false; };
  }, []);

  const toggleRoomLock = (unitId) => {
    setRoomLocks(prev => {
      const nextState = !prev[unitId];
      setToast(`Unit ${unitId} access ${nextState ? 'unlocked' : 'locked'} for class!`);
      setTimeout(() => setToast(null), 3000);
      return { ...prev, [unitId]: nextState };
    });
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unitStats = CURRICULUM_UNITS.map(unit => {
    const unitRecs = reports.filter(r => {
      const t = (r.topic || '').toLowerCase();
      if (unit.id === 1 && (t.includes('core') || t.includes('calc'))) return true;
      if (unit.id === 2 && (t.includes('quantum') || t.includes('orbital') || t.includes('atom'))) return true;
      if (unit.id === 3 && t.includes('periodic')) return true;
      if (unit.id === 4 && t.includes('hydrogen')) return true;
      if (unit.id === 5 && (t.includes('metal') || t.includes('alkali'))) return true;
      if (unit.id === 6 && (t.includes('gas') || t.includes('matter'))) return true;
      return false;
    });
    const passCount = unitRecs.filter(r => r.passed).length;
    const passRate = unitRecs.length > 0 ? Math.round((passCount / unitRecs.length) * 100) : 0;
    const avgSec = unitRecs.length > 0
      ? Math.round(unitRecs.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0) / unitRecs.length)
      : 0;
    const mins = Math.floor(avgSec / 60);
    const secs = avgSec % 60;
    const avgTime = unitRecs.length > 0 ? `${mins}m ${secs}s` : '--';

    return {
      ...unit,
      passRate,
      avgTime,
      attempts: unitRecs.length
    };
  });

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-x-hidden w-full pb-16 transition-colors duration-200">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 60%)' }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(103,232,249,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">

        {/* Toast alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600/90 text-slate-950 font-orbitron font-extrabold text-xs border border-emerald-400/40 shadow-xl flex items-center gap-2"
            >
              <Zap size={14} className="text-slate-950" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TEACHER HEADER ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(103,232,249,0.2))', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}>
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  TEACHER DASHBOARD
                </span>
                <span className="text-xs font-space text-slate-400">
                  {user?.id ? `ID: ${String(user.id).slice(-8).toUpperCase()}` : 'Faculty Instructor'}
                </span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text-main)] leading-tight mt-1">
                {user?.name || 'Prof. Teacher'}
              </h1>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm font-medium">
                Class roster management, room locks & curriculum analytics.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigateTo('reports')}
              className="px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 border-0 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
            >
              <FileSpreadsheet size={16} />
              <span>Activity Reports & Excel</span>
            </button>
            <button
              onClick={() => navigateTo('teacher-questions')}
              className="px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs bg-[#0B1512] hover:bg-[#12221c] text-emerald-300 border border-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileText size={16} />
              <span>Question Bank</span>
            </button>
          </div>
        </div>

        {/* ── METRICS ROW ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          {[
            { label: 'Enrolled Students', value: students.length, icon: Users, color: '#00d4ff', suffix: '' },
            { label: 'Assigned Rooms', value: 6, icon: FlaskConical, color: '#a855f7', suffix: '/6' },
            { label: 'Class Completion', value: stats.completedRooms || 0, icon: CheckCircle2, color: '#34d399', suffix: ' Rooms' },
            { label: 'Avg Class Score', value: stats.avgScore || 0, icon: Award, color: '#fbbf24', suffix: '%' },
            { label: 'Active Lab Sessions', value: stats.totalReports || 0, icon: Zap, color: '#ec4899', suffix: '' },
            { label: 'Needs Support', value: students.filter(s => s.status === 'NEEDS_SUPPORT').length, icon: AlertTriangle, color: '#fb923c', suffix: ' Students' },
          ].map((m) => (
            <DashCard key={m.label} className="p-4" glow={`${m.color}08`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                  <m.icon size={16} style={{ color: m.color }} />
                </div>
              </div>
              <p className="font-orbitron font-black text-xl text-white leading-none">
                <AnimatedCounter value={m.value} />{m.suffix}
              </p>
              <p className="text-[11px] text-white/40 font-space mt-1">{m.label}</p>
            </DashCard>
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLS: STUDENT ROSTER & PROGRESS */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">

            {/* Student Roster Table */}
            <DashCard className="p-5 sm:p-6" id="student-roster-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-white">Student Roster & Escape Progress</h3>
                  <p className="text-white/40 text-xs font-space mt-0.5">Real-time room completions & performance grades</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search student..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl bg-[#0a1628] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-cyan-500/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto">
                {filteredStudents.length === 0 ? (
                  <div className="py-12 px-4 text-center font-space">
                    <Users className="mx-auto mb-3 text-emerald-400 opacity-50" size={36} />
                    <p className="text-sm font-semibold text-white">No registered students found</p>
                    <p className="text-xs text-white/40 mt-1">Enrolled students will appear here once they register on EduNova.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-inter border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-space uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">Student</th>
                      <th className="py-3 px-3">Level & XP</th>
                      <th className="py-3 px-3">Completed Units</th>
                      <th className="py-3 px-3">Avg Score</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300">
                              {student.name[0]}
                            </div>
                            <div>
                              <p className="font-space font-bold text-white text-xs">{student.name}</p>
                              <p className="text-[10px] text-white/40 font-inter">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-space">
                          <span className="text-cyan-400 font-bold">Lvl {student.level}</span>
                          <span className="text-white/40 text-[10px] block">{student.xp.toLocaleString()} XP</span>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {[1, 2, 3, 4, 5, 6].map(u => (
                              <span
                                key={u}
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-orbitron font-bold ${
                                  student.completedUnits.includes(u)
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                                    : 'bg-white/5 text-white/20 border border-white/5'
                                }`}
                                title={`Unit ${u}`}
                              >
                                U{u}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-orbitron font-bold text-emerald-400">
                          {student.avgScore}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-space font-bold ${
                            student.status === 'TOP_PERFORMER' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                            student.status === 'ON_TRACK' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                            'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                          }`}>
                            {student.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/50 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/30 transition-all cursor-pointer"
                            title="View Detailed Student Report"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </DashCard>

            {/* Escape Room Controls & Lock Management */}
            <DashCard className="p-5 sm:p-6">
              <h3 className="font-orbitron font-bold text-lg text-white mb-1">Escape Room Class Controls</h3>
              <p className="text-white/40 text-xs font-space mb-5">Toggle room availability and instant lock status for students</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {unitStats.map(unit => {
                  const isUnlocked = roomLocks[unit.id];
                  return (
                    <div
                      key={unit.id}
                      className="p-4 rounded-xl glass border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-orbitron font-bold text-xs text-white">{unit.name}</span>
                        </div>
                        <p className="text-[11px] text-white/40 font-inter">{unit.topic}</p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-space">
                          <span className="text-emerald-400 font-bold">{unit.passRate}% Pass Rate</span>
                          <span className="text-white/30">•</span>
                          <span className="text-white/40">Avg Time: {unit.avgTime}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleRoomLock(unit.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-space font-bold text-xs border cursor-pointer transition-all flex-shrink-0 ${
                          isUnlocked
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                        }`}
                      >
                        {isUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                        <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </DashCard>
          </div>

          {/* RIGHT COL: UNIT ANALYTICS & RECENT CLASS LOGS */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Unit Performance Breakdown */}
            <DashCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-base text-white">Unit Completion Stats</h3>
                <BarChart2 size={16} className="text-purple-400" />
              </div>

              <div className="flex flex-col gap-4">
                {unitStats.map(unit => (
                  <div key={unit.id}>
                    <div className="flex justify-between text-xs font-space mb-1">
                      <span className="text-white/70">{unit.name.split(':')[0]}</span>
                      <span className="font-orbitron font-bold text-cyan-400">{unit.passRate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600"
                        style={{ width: `${unit.passRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>

            {/* Class Announcements Widget */}
            <DashCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-orbitron font-bold text-base text-white">Class Announcements</h3>
                <button
                  onClick={() => setAnnouncementModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-orbitron text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30 cursor-pointer"
                >
                  <Plus size={12} /> Post
                </button>
              </div>
              {announcements.length === 0 ? (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                  <p className="text-xs text-white/40 font-space">No class announcements posted yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 text-xs font-inter">
                  {announcements.map((ann, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <p className="font-space font-bold text-emerald-300 mb-0.5">{ann.title}</p>
                      <p className="text-white/60 text-[11px]">{ann.text}</p>
                      <span className="text-[9px] text-white/30 font-mono mt-1 block">{ann.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </DashCard>
          </div>
        </div>
      </div>

      {/* ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {announcementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0a1628] border border-emerald-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-lg text-white">Broadcast Class Announcement</h3>
                <button onClick={() => setAnnouncementModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <input
                type="text"
                placeholder="Announcement Title..."
                value={announcementTitle}
                onChange={e => setAnnouncementTitle(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#040810] border border-white/10 text-white placeholder-white/30 text-xs font-space outline-none focus:border-emerald-500/40 mb-3"
              />

              <textarea
                rows={4}
                placeholder="Write message to students..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#040810] border border-white/10 text-white placeholder-white/30 text-xs font-inter outline-none focus:border-emerald-500/40 mb-4"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setAnnouncementModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-xs font-space cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (announcementText.trim()) {
                      const newAnn = {
                        title: announcementTitle.trim() || 'Class Announcement',
                        text: announcementText.trim(),
                        date: new Date().toLocaleDateString()
                      };
                      const next = [newAnn, ...announcements];
                      setAnnouncements(next);
                      try { localStorage.setItem('chemescape_teacher_announcements', JSON.stringify(next)); } catch {}
                      setToast('Announcement broadcasted to class!');
                      setAnnouncementModal(false);
                      setAnnouncementText('');
                      setAnnouncementTitle('');
                      setTimeout(() => setToast(null), 3000);
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-space font-bold text-xs uppercase cursor-pointer hover:bg-emerald-400 transition-colors"
                >
                  Send Announcement
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STUDENT DETAIL MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#0a1628] border border-cyan-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-lg">
                    {selectedStudent.name[0]}
                  </div>
                  <div>
                    <h3 className="font-space font-bold text-base text-white">{selectedStudent.name}</h3>
                    <p className="text-xs text-white/40 font-inter">{selectedStudent.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedStudent(null)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-space">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/40 text-[10px] block">Level & XP</span>
                  <span className="text-cyan-400 font-bold text-sm">Lvl {selectedStudent.level}</span>
                  <span className="text-white/60 text-[10px] block">{selectedStudent.xp} Total XP</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-white/40 text-[10px] block">Average Accuracy</span>
                  <span className="text-emerald-400 font-bold text-sm">{selectedStudent.avgScore}</span>
                  <span className="text-white/60 text-[10px] block">6 Units Attempted</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-space font-bold text-white/70 mb-2">Completed Escape Units:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(u => (
                    <div
                      key={u}
                      className={`p-2 rounded-lg text-center text-xs font-space font-bold border ${
                        selectedStudent.completedUnits.includes(u)
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-white/5 text-white/20 border-white/5'
                      }`}
                    >
                      Unit {u} {selectedStudent.completedUnits.includes(u) ? '✓' : '🔒'}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-space text-xs font-bold cursor-pointer transition-all"
              >
                Close Report
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
