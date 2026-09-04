import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Database, Server, Activity, AlertCircle,
  Plus, Search, Edit3, Trash2, Key, RefreshCw, CheckCircle2,
  Lock, Unlock, Terminal, Cpu, HardDrive, Filter, X, Zap, FileSpreadsheet
} from 'lucide-react';
import { DashCard, SectionHeader, AnimatedCounter } from './DashComponents';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';

const initialUsers = [
  { id: 'usr-1', name: 'System Administrator', email: 'admin@edunova.com', role: 'ADMIN', status: 'ACTIVE', regDate: '2026-01-01', sessionsCount: 142 },
  { id: 'usr-2', name: 'Prof. Science Teacher', email: 'teacher@edunova.com', role: 'TEACHER', status: 'ACTIVE', regDate: '2026-01-05', sessionsCount: 88 },
  { id: 'usr-3', name: 'Student Agent', email: 'student@edunova.com', role: 'STUDENT', status: 'ACTIVE', regDate: '2026-01-10', sessionsCount: 24 },
];

const systemEngines = [
  { id: 'u1', code: 'CALCULATION_HEIST', name: 'Unit 1: Calculation Heist', type: 'Formula Calculator Engine', status: 'ONLINE', plays: 3420 },
  { id: 'u2', code: 'QUANTUM_ARCHITECT', name: 'Unit 2: Quantum Architect', type: 'Orbital Builder Engine', status: 'ONLINE', plays: 2980 },
  { id: 'u3', code: 'GRID_RECONSTRUCTION', name: 'Unit 3: Periodic Grid', type: 'Periodic Matrix Engine', status: 'ONLINE', plays: 2750 },
  { id: 'u4', code: 'HYDROGEN_REACTOR', name: 'Unit 4: Hydrogen Reactor', type: 'Equation Balance Engine', status: 'ONLINE', plays: 2410 },
  { id: 'u5', code: 'ELEMENT_SORTING', name: 'Unit 5: Metal Sorting', type: 'Factory Sorting Engine', status: 'ONLINE', plays: 2190 },
  { id: 'u6', code: 'GAS_SIMULATOR', name: 'Unit 6: Gas Chamber', type: '2D Canvas Kinetic Engine', status: 'ONLINE', plays: 1170 },
];

const auditLogs = [
  { id: 'log-1', event: 'USER_LOGIN', user: 'teacher@edunova.com', role: 'TEACHER', time: 'Just now', ip: '127.0.0.1', status: 'SUCCESS' },
  { id: 'log-2', event: 'GAME_SESSION_COMPLETE', user: 'student@edunova.com', role: 'STUDENT', time: '2 mins ago', ip: '127.0.0.1', status: 'SUCCESS' },
  { id: 'log-3', event: 'DATABASE_SEED', user: 'SYSTEM', role: 'SYSTEM', time: '15 mins ago', ip: '127.0.0.1', status: 'SUCCESS' },
  { id: 'log-4', event: 'ANTI_CHEAT_VERIFY', user: 'student@edunova.com', role: 'STUDENT', time: '1 hour ago', ip: '127.0.0.1', status: 'CLEARED' },
];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  const [usersList, setUsersList] = useState(initialUsers);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [addUserModal, setAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'STUDENT' });
  const [toast, setToast] = useState(null);

  const handleRoleChange = (userId, newRole) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    setToast(`Updated user role to ${newRole}!`);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusToggle = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        setToast(`User account set to ${nextStatus}`);
        setTimeout(() => setToast(null), 3000);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;
    const created = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      status: 'ACTIVE',
      regDate: new Date().toISOString().split('T')[0],
      sessionsCount: 0,
    };
    setUsersList([created, ...usersList]);
    setAddUserModal(false);
    setNewUserForm({ name: '', email: '', role: 'STUDENT' });
    setToast(`Created new ${newUserForm.role} user!`);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="relative min-h-screen bg-[#050807] text-white overflow-x-hidden w-full pb-16">
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

        {/* ── ADMIN HEADER ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(103,232,249,0.2))', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 25px rgba(16,185,129,0.2)' }}>
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  SYSTEM CONTROL CONSOLE
                </span>
                <span className="text-xs font-space text-slate-400">BUILD: v2.4.0-OBSIDIAN</span>
              </div>
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white leading-tight mt-1">
                {user?.name || 'System Administrator'}
              </h1>
              <p className="text-white/40 text-xs sm:text-sm font-inter">
                Platform control console, role assignments, database health & game engine configs.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigateTo('reports')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-orbitron font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer transition-all border-0"
            >
              <FileSpreadsheet size={15} />
              <span>Activity Reports & Excel</span>
            </button>

            <button
              onClick={() => {
                setToast('Database schema and seeds validated!');
                setTimeout(() => setToast(null), 3000);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-space font-bold text-xs cursor-pointer transition-all"
            >
              <RefreshCw size={14} />
              <span>Verify DB</span>
            </button>

            <button
              onClick={() => setAddUserModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Plus size={15} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* ── METRICS ROW ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-8">
          {[
            { label: 'Total Platform Users', value: usersList.length + 1240, icon: Users, color: '#fbbf24' },
            { label: 'Active Teachers', value: 28, icon: Shield, color: '#a855f7' },
            { label: 'Enrolled Students', value: 1220, icon: Zap, color: '#00d4ff' },
            { label: 'Sessions Completed', value: 14920, icon: Activity, color: '#34d399' },
            { label: 'Game Engines', value: 6, icon: Cpu, color: '#ec4899' },
            { label: 'Security Flags', value: 0, icon: CheckCircle2, color: '#10b981' },
          ].map((m) => (
            <DashCard key={m.label} className="p-4" glow={`${m.color}08`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                  <m.icon size={16} style={{ color: m.color }} />
                </div>
              </div>
              <p className="font-orbitron font-black text-xl text-white leading-none">
                <AnimatedCounter value={m.value} />
              </p>
              <p className="text-[11px] text-white/40 font-space mt-1">{m.label}</p>
            </DashCard>
          ))}
        </div>

        {/* ── MAIN ADMIN GRID ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLS: USER & ROLE MANAGEMENT */}
          <div className="lg:col-span-2 flex flex-col gap-6 min-w-0">

            <DashCard className="p-5 sm:p-6" id="user-management-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-orbitron font-bold text-lg text-white">User & Role Management</h3>
                  <p className="text-white/40 text-xs font-space mt-0.5">Control permissions, assign roles & monitor account status</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search user..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-xl bg-[#0a1628] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-amber-500/40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Role filter tabs */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {['ALL', 'STUDENT', 'TEACHER', 'ADMIN'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-space font-bold cursor-pointer transition-all border ${
                      roleFilter === role
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/5 text-white/40 border-white/5 hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-inter border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-white/40 font-space uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-3">User</th>
                      <th className="py-3 px-3">Role</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Reg Date</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-300">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-space font-bold text-white text-xs">{u.name}</p>
                              <p className="text-[10px] text-white/40 font-inter">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Interactive Role Switcher */}
                        <td className="py-3.5 px-3">
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="px-2.5 py-1 rounded-lg bg-[#0a1628] border border-white/10 text-xs font-orbitron font-bold outline-none cursor-pointer text-white"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="TEACHER">TEACHER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-space font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}>
                            {u.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-white/40 text-[11px]">
                          {u.regDate}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleStatusToggle(u.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              u.status === 'ACTIVE'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                            }`}
                            title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                          >
                            {u.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashCard>

            {/* Game Engines Registry */}
            <DashCard className="p-5 sm:p-6">
              <h3 className="font-orbitron font-bold text-lg text-white mb-1">Authoritative Game Engines</h3>
              <p className="text-white/40 text-xs font-space mb-5">Registered Academic room validation services (Units 1 - 6)</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {systemEngines.map(eng => (
                  <div key={eng.id} className="p-4 rounded-xl glass border border-white/10">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-orbitron font-bold text-xs text-white">{eng.name}</span>
                      <span className="text-[10px] font-space px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {eng.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40 font-inter mb-2">{eng.type}</p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/30 pt-2 border-t border-white/5">
                      <span>CODE: {eng.code}</span>
                      <span className="text-amber-400">{eng.plays.toLocaleString()} plays</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>
          </div>

          {/* RIGHT COL: AUDIT LOGS & SYSTEM HEALTH */}
          <div className="flex flex-col gap-6 min-w-0">

            {/* Real-time System Audit Feed */}
            <DashCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-base text-white">System Audit Log</h3>
                <Terminal size={16} className="text-amber-400" />
              </div>

              <div className="flex flex-col gap-3 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#0a1628] border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-amber-400 font-bold">{log.event}</span>
                      <span className="text-white/30 text-[9px]">{log.time}</span>
                    </div>
                    <p className="text-white/60 text-[10px]">{log.user}</p>
                    <div className="flex items-center justify-between text-[9px] text-white/30 mt-1">
                      <span>IP: {log.ip}</span>
                      <span className="text-emerald-400">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashCard>

            {/* Server Infrastructure Health */}
            <DashCard className="p-5">
              <h3 className="font-orbitron font-bold text-base text-white mb-3">Server Node Health</h3>
              <div className="flex flex-col gap-3 text-xs font-inter">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-cyan-400" />
                    <div>
                      <p className="font-space font-bold text-white">Express Node Server</p>
                      <p className="text-[10px] text-white/40">Port 5000 • JWT Auth Active</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">ONLINE</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-purple-400" />
                    <div>
                      <p className="font-space font-bold text-white">MySQL + Prisma 6.3</p>
                      <p className="text-[10px] text-white/40">Connection Pool Healthy</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">HEALTHY</span>
                </div>
              </div>
            </DashCard>

          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {addUserModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#0a1628] border border-amber-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-orbitron font-bold text-lg text-white">Create New Platform User</h3>
                <button onClick={() => setAddUserModal(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-space text-white/60 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="User Name"
                    value={newUserForm.name}
                    onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-space text-white/60 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="user@edunova.com"
                    value={newUserForm.email}
                    onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-amber-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-space text-white/60 mb-1">Assigned Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-orbitron font-bold outline-none cursor-pointer"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="TEACHER">TEACHER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setAddUserModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-white/60 text-xs font-space cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 text-white font-space font-bold text-xs uppercase cursor-pointer"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
