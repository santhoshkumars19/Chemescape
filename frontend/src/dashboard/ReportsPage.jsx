import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, Download, Search, Filter, RefreshCw,
  Users, Award, CheckCircle2, XCircle, Clock, Calendar,
  ChevronLeft, ChevronRight, Eye, Shield, BarChart3,
  Sparkles, BookOpen, Layers, Target, Check, X, AlertTriangle,
  FileText, ArrowUpDown, ExternalLink
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { DashCard, AnimatedCounter } from './DashComponents';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function ReportsPage() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  // State
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  // User History Drawer Modal
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeUserHistory, setActiveUserHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [downloadingUserExcel, setDownloadingUserExcel] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper to fetch auth token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('chemescape_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Fetch Reports and Stats
  const fetchReportsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedStandard !== 'ALL') params.append('standard', selectedStandard);
      if (selectedSubject !== 'ALL') params.append('subject', selectedSubject);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedType !== 'ALL') params.append('gameOrQuiz', selectedType);
      if (selectedDate) params.append('date', selectedDate);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const res = await fetch(`${API_BASE}/reports?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 403) {
        throw new Error('Access Denied: Only Teachers and Admins can view activity reports.');
      }

      if (!res.ok) {
        throw new Error(`Failed to load reports (Status: ${res.status})`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setReports(json.data.reports || []);
        setTotalItems(json.data.total || 0);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error('[ReportsPage] Fetch error:', err);
      setError(err.message || 'Unable to retrieve reports data.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStandard, selectedSubject, selectedStatus, selectedType, selectedDate, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchReportsData();
  }, [fetchReportsData]);

  // Handle Full or Filtered Excel Download
  const handleDownloadExcel = async (filteredOnly = false) => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (filteredOnly) {
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (selectedStandard !== 'ALL') params.append('standard', selectedStandard);
        if (selectedSubject !== 'ALL') params.append('subject', selectedSubject);
        if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
        if (selectedType !== 'ALL') params.append('gameOrQuiz', selectedType);
        if (selectedDate) params.append('date', selectedDate);
      }

      const token = localStorage.getItem('chemescape_token');
      const res = await fetch(`${API_BASE}/reports/excel?${params.toString()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to download Excel report.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filteredOnly
        ? `EduNova_Filtered_Activity_Report_${Date.now()}.xlsx`
        : `EduNova_User_Activity_Report_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast('Excel activity report downloaded successfully!');
    } catch (err) {
      console.error('[ReportsPage] Excel download error:', err);
      showToast(err.message || 'Failed to download report', 'error');
    } finally {
      setDownloading(false);
    }
  };

  // Open Individual User History Modal
  const handleOpenUserHistory = async (userId, studentName) => {
    setLoadingHistory(true);
    setHistoryModalOpen(true);
    try {
      const res = await fetch(`${API_BASE}/reports/user/${encodeURIComponent(userId)}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load user history');
      const json = await res.json();
      if (json.success && json.data) {
        setActiveUserHistory(json.data.userHistory);
      }
    } catch (err) {
      console.error('[ReportsPage] User history error:', err);
      showToast('Failed to fetch individual student history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Download Single User's Excel History
  const handleDownloadSingleUserExcel = async (userId) => {
    if (!userId) return;
    setDownloadingUserExcel(true);
    try {
      const token = localStorage.getItem('chemescape_token');
      const res = await fetch(`${API_BASE}/reports/excel?userId=${encodeURIComponent(userId)}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to export user history');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EduNova_User_${userId}_Activity_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showToast(`User ${userId} activity report exported!`);
    } catch (err) {
      console.error('[ReportsPage] Single user export error:', err);
      showToast('Failed to download user history report', 'error');
    } finally {
      setDownloadingUserExcel(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStandard('ALL');
    setSelectedSubject('ALL');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setSelectedDate('');
    setCurrentPage(1);
    showToast('Filters reset to default.');
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] overflow-x-hidden w-full pb-20 transition-colors duration-200">
      {/* Ambient background glows */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 60%)' }}
      />
      <div
        className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(103,232,249,0.05) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">

        {/* ── Toast Notification ────────────────────────────────────────── */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl font-space font-medium text-xs shadow-2xl flex items-center gap-2 border ${
                toast.type === 'error'
                  ? 'bg-red-950/90 text-red-200 border-red-500/50'
                  : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
              }`}
            >
              {toast.type === 'error' ? <AlertTriangle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(103,232,249,0.2))',
                border: '1px solid rgba(16,185,129,0.35)',
                boxShadow: '0 0 25px rgba(16,185,129,0.2)',
              }}
            >
              📊
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  OFFICIAL EXCEL REPORTING
                </span>
                <span className="text-xs font-space text-slate-400 flex items-center gap-1">
                  <Shield size={12} className="text-emerald-400" /> TEACHER & ADMIN RBAC VERIFIED
                </span>
              </div>
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white leading-tight">
                User Quiz & Game Activity Reports
              </h1>
              <p className="text-white/50 text-xs sm:text-sm font-inter">
                Permanent activity logging, accuracy tracking, multi-attempt user history, and one-click Excel (.xlsx) export.
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleDownloadExcel(false)}
              disabled={downloading}
              className="px-4 py-2.5 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-0 cursor-pointer shadow-lg shadow-emerald-500/25 disabled:opacity-50"
              title="Download full Excel report with all columns and summary sheets"
            >
              <FileSpreadsheet size={16} />
              <span>{downloading ? 'Exporting...' : 'Download Full Excel (.xlsx)'}</span>
            </button>

            <button
              onClick={() => handleDownloadExcel(true)}
              disabled={downloading}
              className="px-3.5 py-2.5 rounded-xl font-space text-xs transition-all duration-200 flex items-center gap-2 bg-[#0B1210] hover:bg-[#121c19] text-emerald-300 border border-emerald-500/30 cursor-pointer disabled:opacity-50"
              title="Download currently filtered rows as Excel"
            >
              <Download size={14} />
              <span>Export Filtered</span>
            </button>

            <button
              onClick={() => fetchReportsData()}
              disabled={loading}
              className="p-2.5 rounded-xl font-space text-xs transition-all duration-200 flex items-center justify-center bg-[#0B1210] hover:bg-[#121c19] text-emerald-400 border border-emerald-500/20 cursor-pointer"
              title="Refresh report records"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ── KPI Analytics Metric Cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Activities Logged',
              value: stats?.totalActivities ?? totalItems,
              suffix: '',
              icon: FileSpreadsheet,
              color: '#10b981',
              subtext: 'Quizzes & Game sessions tracked',
            },
            {
              label: 'Registered Students',
              value: stats?.uniqueUsers ?? 0,
              suffix: '',
              icon: Users,
              color: '#00d4ff',
              subtext: 'Unique registered user IDs',
            },
            {
              label: 'Average Student Accuracy',
              value: parseInt(stats?.avgAccuracy || '0', 10),
              suffix: '%',
              icon: Target,
              color: '#fbbf24',
              subtext: 'Calculated across all attempts',
            },
            {
              label: 'Completion Pass Rate',
              value: stats?.passRate ? parseInt(stats.passRate, 10) : 0,
              suffix: '%',
              icon: Award,
              color: '#a855f7',
              subtext: `${stats?.passedCount || 0} passed / ${stats?.failedCount || 0} retries`,
            },
          ].map((card, i) => (
            <DashCard key={card.label} className="p-4 sm:p-5" glow={`${card.color}15`} delay={i * 0.05}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50 font-space tracking-wide uppercase">{card.label}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}
                >
                  <card.icon size={16} style={{ color: card.color }} />
                </div>
              </div>
              <p className="font-orbitron font-black text-2xl sm:text-3xl text-white leading-none mt-1">
                <AnimatedCounter value={card.value} />{card.suffix}
              </p>
              <p className="text-[11px] text-white/40 font-space mt-2">{card.subtext}</p>
            </DashCard>
          ))}
        </div>

        {/* ── Filters & Search Controls ─────────────────────────────────── */}
        <DashCard className="p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4">
            {/* Top row: Search input + Reset button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by Student Name, Registered User ID, Subject, or Chapter..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#070D0B] border border-emerald-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-space"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white bg-transparent border-0 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                onClick={handleResetFilters}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-space text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Bottom row: Multi-Dropdowns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-emerald-500/10">
              {/* Standard */}
              <div>
                <label className="block text-[10px] font-space uppercase text-emerald-400/60 mb-1 font-semibold">
                  Standard/Class
                </label>
                <select
                  value={selectedStandard}
                  onChange={(e) => {
                    setSelectedStandard(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#070D0B] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-space"
                >
                  <option value="ALL">All Standards</option>
                  <option value="4th">4th Standard</option>
                  <option value="5th">5th Standard</option>
                  <option value="6th">6th Standard</option>
                  <option value="7th">7th Standard</option>
                  <option value="8th">8th Standard</option>
                  <option value="11th">11th Standard</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[10px] font-space uppercase text-emerald-400/60 mb-1 font-semibold">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#070D0B] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-space"
                >
                  <option value="ALL">All Subjects</option>
                  <option value="Tamil">Tamil</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Chemistry">Chemistry</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-space uppercase text-emerald-400/60 mb-1 font-semibold">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#070D0B] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-space"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PASSED">PASSED / COMPLETED</option>
                  <option value="FAILED">FAILED / RETRY</option>
                </select>
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-[10px] font-space uppercase text-emerald-400/60 mb-1 font-semibold">
                  Activity Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#070D0B] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 font-space"
                >
                  <option value="ALL">All Activities</option>
                  <option value="Quiz">Quizzes</option>
                  <option value="Game">Games & Labs</option>
                </select>
              </div>

              {/* Date */}
              <div className="col-span-2 sm:col-span-4 lg:col-span-1">
                <label className="block text-[10px] font-space uppercase text-emerald-400/60 mb-1 font-semibold">
                  Filter Date (DD-MM-YYYY)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 04-09-2026"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#070D0B] border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 font-space"
                />
              </div>
            </div>
          </div>
        </DashCard>

        {/* ── Table Container ───────────────────────────────────────────── */}
        <DashCard className="p-0 overflow-hidden mb-6">
          <div className="p-4 sm:p-5 border-b border-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-orbitron font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-400" />
                Live Student Activity Roster
              </h3>
              <p className="text-white/40 text-xs font-space mt-0.5">
                Showing {reports.length} of {totalItems} total recorded activities
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-space text-white/50">
              <span>Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#0B1210] border border-emerald-500/20 rounded-lg px-2 py-1 text-white text-xs"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0A120F] text-emerald-400/80 uppercase font-orbitron text-[10px] tracking-wider border-b border-emerald-500/20 whitespace-nowrap">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Registered User ID</th>
                  <th className="py-3.5 px-4">Standard/Class</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Chapter</th>
                  <th className="py-3.5 px-4">Quiz/Game Name</th>
                  <th className="py-3.5 px-4 text-right">Points/Score</th>
                  <th className="py-3.5 px-4 text-center">Accuracy</th>
                  <th className="py-3.5 px-4 text-center">Total Qs</th>
                  <th className="py-3.5 px-4 text-center text-emerald-400">Correct</th>
                  <th className="py-3.5 px-4 text-center text-red-400">Wrong</th>
                  <th className="py-3.5 px-4">Time Taken</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">User History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10 font-space text-white/80 whitespace-nowrap">
                {loading ? (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-white/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-emerald-400" />
                        <span className="font-space text-xs">Loading activity reports...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-red-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertTriangle size={24} />
                        <span className="font-space text-xs">{error}</span>
                      </div>
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-white/40">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileSpreadsheet size={28} className="text-white/20" />
                        <p className="font-space text-sm font-semibold text-white">No reports available yet</p>
                        <p className="font-space text-xs text-white/40 mt-0.5">
                          {searchTerm || selectedStandard !== 'ALL' || selectedSubject !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedDate
                            ? 'No activity records match your search or filters.'
                            : 'Reports will appear automatically as registered scholars complete quizzes and challenges.'}
                        </p>
                        {(searchTerm || selectedStandard !== 'ALL' || selectedSubject !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedDate) && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-2 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  reports.map((row, idx) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + idx + 1;
                    const accNum = parseInt(row.accuracy, 10) || 0;
                    const isPassed = row.status === 'PASSED' || row.status === 'COMPLETED';

                    return (
                      <tr
                        key={row.id || `${row.userId}-${idx}`}
                        className="hover:bg-emerald-500/5 transition-colors group"
                      >
                        <td className="py-3 px-4 text-white/30 text-[11px]">{rowNumber}</td>
                        <td className="py-3 px-4 font-semibold text-white group-hover:text-emerald-300">
                          {row.name}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            onClick={() => {
                              setSearchTerm(row.userId);
                              setCurrentPage(1);
                            }}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20"
                            title="Click to filter by this user ID"
                          >
                            {row.userId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {row.standard}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-white/90">{row.subject}</td>
                        <td className="py-3 px-4 text-white/70 max-w-[200px] truncate" title={row.chapter}>
                          {row.chapter}
                        </td>
                        <td className="py-3 px-4 font-medium text-white max-w-[220px] truncate" title={row.gameOrQuizName}>
                          {row.gameOrQuizName}
                        </td>
                        <td className="py-3 px-4 text-right font-orbitron font-bold text-amber-400">
                          {row.points}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              accNum >= 80
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : accNum >= 60
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {row.accuracy}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-white/60">{row.totalQuestions}</td>
                        <td className="py-3 px-4 text-center text-emerald-400 font-semibold">{row.correctAnswers}</td>
                        <td className="py-3 px-4 text-center text-red-400 font-semibold">{row.wrongAnswers}</td>
                        <td className="py-3 px-4 text-white/60 flex items-center gap-1">
                          <Clock size={12} className="text-white/40" />
                          <span>{row.timeTaken}</span>
                        </td>
                        <td className="py-3 px-4 text-white/50 text-[11px]">{row.dateTime}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-orbitron font-bold uppercase ${
                              isPassed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenUserHistory(row.userId, row.name)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-space font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1 mx-auto cursor-pointer"
                            title="View all past quiz and game activities for this user"
                          >
                            <Eye size={12} />
                            <span>View History</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="p-4 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-space text-white/50">
            <div>
              Showing {reports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 rounded-lg bg-[#0B1210] border border-emerald-500/20 text-white hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-white cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft size={14} />
                <span>Previous</span>
              </button>
              <span className="px-2 text-white font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || loading}
                className="px-3 py-1.5 rounded-lg bg-[#0B1210] border border-emerald-500/20 text-white hover:text-emerald-300 disabled:opacity-40 disabled:hover:text-white cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </DashCard>

        {/* ── Individual User History Modal / Drawer ───────────────────── */}
        <AnimatePresence>
          {historyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setHistoryModalOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              />

              {/* Modal window */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#070D0B] border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-emerald-500/15 flex items-center justify-between bg-[#0A1310]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
                      🎓
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-orbitron font-bold text-lg text-white">
                          {activeUserHistory?.name || 'Student Activity History'}
                        </h2>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ID: {activeUserHistory?.userId}
                        </span>
                        {activeUserHistory?.standard && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-space">
                            {activeUserHistory.standard}
                          </span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs font-space mt-0.5">
                        Complete chronological record of all quiz completions, game plays, and retries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadSingleUserExcel(activeUserHistory?.userId)}
                      disabled={downloadingUserExcel}
                      className="px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download this student's history to Excel"
                    >
                      <FileSpreadsheet size={14} />
                      <span>{downloadingUserExcel ? 'Exporting...' : 'Export to Excel'}</span>
                    </button>
                    <button
                      onClick={() => setHistoryModalOpen(false)}
                      className="p-1.5 rounded-lg text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-colors border-0 cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5">
                  {loadingHistory ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-white/50">
                      <RefreshCw size={28} className="animate-spin text-emerald-400" />
                      <span className="font-space text-xs">Loading user history records...</span>
                    </div>
                  ) : !activeUserHistory || activeUserHistory.records?.length === 0 ? (
                    <div className="py-16 text-center text-white/40">
                      <FileSpreadsheet size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="font-space text-sm">No activity history found for this user.</p>
                    </div>
                  ) : (
                    <>
                      {/* Aggregate KPI Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                          <span className="text-[10px] uppercase font-space text-white/40 block">Total Activities</span>
                          <span className="font-orbitron font-bold text-xl text-white">
                            {activeUserHistory.totalActivities}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-[10px] uppercase font-space text-emerald-400/60 block">Total Points</span>
                          <span className="font-orbitron font-bold text-xl text-emerald-300">
                            {activeUserHistory.summary?.totalPoints || 0}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                          <span className="text-[10px] uppercase font-space text-cyan-400/60 block">Avg Accuracy</span>
                          <span className="font-orbitron font-bold text-xl text-cyan-300">
                            {activeUserHistory.summary?.avgAccuracy || '0%'}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                          <span className="text-[10px] uppercase font-space text-amber-400/60 block">Pass / Retry</span>
                          <span className="font-orbitron font-bold text-xl text-amber-300">
                            {activeUserHistory.summary?.passedCount || 0} <span className="text-xs text-white/40 font-space font-normal">/ {activeUserHistory.summary?.failedCount || 0}</span>
                          </span>
                        </div>
                      </div>

                      {/* Chronological Activities Table */}
                      <div className="border border-emerald-500/15 rounded-xl overflow-hidden bg-[#0A120F]">
                        <div className="p-3 bg-[#0B1512] border-b border-emerald-500/10">
                          <h4 className="font-orbitron font-bold text-xs text-emerald-300 uppercase tracking-wider">
                            Activity Timeline (Most Recent First)
                          </h4>
                        </div>
                        <div className="overflow-x-auto max-h-[350px]">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-[#050B09] text-white/40 font-orbitron text-[9px] uppercase tracking-wider border-b border-white/5 sticky top-0">
                              <tr>
                                <th className="py-2.5 px-3">Date & Time</th>
                                <th className="py-2.5 px-3">Quiz / Game</th>
                                <th className="py-2.5 px-3">Subject & Chapter</th>
                                <th className="py-2.5 px-3 text-right">Points</th>
                                <th className="py-2.5 px-3 text-center">Accuracy</th>
                                <th className="py-2.5 px-3 text-center">Correct / Total</th>
                                <th className="py-2.5 px-3">Time Taken</th>
                                <th className="py-2.5 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-space text-white/80">
                              {(!activeUserHistory.records || activeUserHistory.records.length === 0) ? (
                                <tr>
                                  <td colSpan={8} className="py-8 text-center text-white/40 font-space text-xs">
                                    No quiz activity available
                                  </td>
                                </tr>
                              ) : (
                                activeUserHistory.records.map((r, i) => {
                                const isPassed = r.status === 'PASSED' || r.status === 'COMPLETED';
                                return (
                                  <tr key={r.id || i} className="hover:bg-white/5 transition-colors">
                                    <td className="py-2 px-3 text-white/50 text-[11px]">{r.dateTime}</td>
                                    <td className="py-2 px-3 font-medium text-white">{r.gameOrQuizName}</td>
                                    <td className="py-2 px-3 text-white/60 text-[11px]">
                                      {r.subject} - {r.chapter}
                                    </td>
                                    <td className="py-2 px-3 text-right font-orbitron font-bold text-amber-400">
                                      {r.points}
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-emerald-300">
                                        {r.accuracy}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-center text-white/70">
                                      {r.correctAnswers} / {r.totalQuestions}
                                    </td>
                                    <td className="py-2 px-3 text-white/60 text-[11px]">{r.timeTaken}</td>
                                    <td className="py-2 px-3 text-center">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-orbitron font-bold uppercase ${
                                          isPassed
                                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                        }`}
                                      >
                                        {r.status}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              }))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-emerald-500/15 bg-[#0A1310] flex items-center justify-between text-xs font-space text-white/50">
                  <span>Student ID: <span className="text-emerald-400 font-mono">{activeUserHistory?.userId}</span></span>
                  <button
                    onClick={() => setHistoryModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer border-0"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
