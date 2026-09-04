import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, Edit3, Trash2,
  Zap, Save, X, Award, Check, ArrowLeft,
  GraduationCap, BookOpen, Layers, CheckCircle2,
  Sparkles, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { DashCard, AnimatedCounter } from './DashComponents';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { CURRICULUM_QUESTIONS } from '../data/curriculumQuestions';

const STANDARDS = [
  { id: 'ALL', label: 'All Standards' },
  { id: '4th Standard', label: '4th Standard' },
  { id: '5th Standard', label: '5th Standard' },
  { id: '6th Standard', label: '6th Standard' },
  { id: '7th Standard', label: '7th Standard' },
  { id: '8th Standard', label: '8th Standard' },
  { id: '11th Standard', label: '11th Standard' },
];

const SUBJECTS = [
  { id: 'ALL', label: 'All Subjects', color: '#00d4ff' },
  { id: 'Tamil', label: 'Tamil', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  { id: 'English', label: 'English', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  { id: 'Mathematics', label: 'Mathematics', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.3)' },
  { id: 'Science', label: 'Science', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)' },
  { id: 'Social Science', label: 'Social Science', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.3)' },
  { id: 'Chemistry', label: 'Chemistry', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' },
];

const SUBJECT_COLOR_MAP = {
  'Tamil': { text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.35)' },
  'English': { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)' },
  'Mathematics': { text: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)', border: 'rgba(129, 140, 248, 0.35)' },
  'Science': { text: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.35)' },
  'Social Science': { text: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: 'rgba(244, 114, 182, 0.35)' },
  'Chemistry': { text: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.35)' },
};

const ITEMS_PER_PAGE = 12;

export default function TeacherQuestionBankPage() {
  const { user, token } = useAuth();
  const { navigateTo } = useNavigation();

  const [questions, setQuestions] = useState(CURRICULUM_QUESTIONS);
  const [selectedStandard, setSelectedStandard] = useState('ALL');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Form State
  const [questionForm, setQuestionForm] = useState({
    id: '',
    standard: '6th Standard',
    subject: 'Science',
    chapterNumber: 1,
    chapterTitle: 'Chapter 1: Measurements & Motion',
    questionNumber: 1,
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    targetAnswer: '',
    difficulty: 'MEDIUM',
    points: 150,
    hint: '',
    explanation: '',
  });

  // Attempt backend API sync on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBackendQuestions = async () => {
      const authToken = token || localStorage.getItem('chemescape_token');
      if (!authToken) return;
      try {
        setIsLoadingApi(true);
        const res = await fetch('http://localhost:5000/api/questions', {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.questions) && json.data.questions.length > 0) {
            if (isMounted && json.data.questions.length >= CURRICULUM_QUESTIONS.length) {
              const mapped = json.data.questions.map(q => {
                let options = [];
                let correctOptionIndex = 0;
                let targetAnswer = '';
                if (q.options && Array.isArray(q.options)) {
                  options = q.options.map((opt, idx) => {
                    const text = typeof opt === 'string' ? opt : (opt.optionText || opt.text || '');
                    if (opt.isCorrect) {
                      correctOptionIndex = idx;
                      targetAnswer = text;
                    }
                    return text;
                  });
                }
                return {
                  id: q.id,
                  standard: q.chapter?.standard?.displayName || 'Curriculum',
                  standardId: q.chapter?.standardId || 'grade-all',
                  subject: q.chapter?.subject?.name || 'General',
                  subjectId: q.chapter?.subjectId || 'subj-all',
                  chapterNumber: q.chapter?.chapterNumber || 1,
                  chapterTitle: q.chapter?.title ? `Chapter ${q.chapter.chapterNumber}: ${q.chapter.title}` : `Chapter 1`,
                  questionNumber: q.questionNumber || 1,
                  questionText: q.questionText,
                  options: options.length > 0 ? options : ['', '', '', ''],
                  correctOptionIndex,
                  targetAnswer: targetAnswer || options[0] || '',
                  difficulty: q.difficulty || 'MEDIUM',
                  points: q.points || 100,
                  hint: q.hint || '',
                  explanation: q.explanation || ''
                };
              });
              setQuestions(mapped);
            }
          }
        }
      } catch {
        // Silently preserve local curriculum questions
      } finally {
        if (isMounted) setIsLoadingApi(false);
      }
    };

    fetchBackendQuestions();
    return () => { isMounted = false; };
  }, [token]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesStandard = selectedStandard === 'ALL' || q.standard === selectedStandard;
      const matchesSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
      const matchesDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      
      const qText = (q.questionText || '').toLowerCase();
      const qChapter = (q.chapterTitle || '').toLowerCase();
      const qHint = (q.hint || '').toLowerCase();
      const qOpts = (q.options || []).join(' ').toLowerCase();
      const sTerm = searchQuery.toLowerCase().trim();

      const matchesSearch = !sTerm || qText.includes(sTerm) || qChapter.includes(sTerm) || qHint.includes(sTerm) || qOpts.includes(sTerm);

      return matchesStandard && matchesSubject && matchesDifficulty && matchesSearch;
    });
  }, [questions, selectedStandard, selectedSubject, selectedDifficulty, searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStandard, selectedSubject, selectedDifficulty, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  };

  const handleOpenEditQuestion = (q) => {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        id: q.id,
        standard: q.standard || '6th Standard',
        subject: q.subject || 'Science',
        chapterNumber: q.chapterNumber || 1,
        chapterTitle: q.chapterTitle || 'Chapter 1',
        questionNumber: q.questionNumber || 1,
        questionText: q.questionText || '',
        options: q.options && q.options.length > 0 ? [...q.options] : ['', '', '', ''],
        correctOptionIndex: q.correctOptionIndex || 0,
        targetAnswer: q.targetAnswer || (q.options ? q.options[q.correctOptionIndex || 0] : ''),
        difficulty: q.difficulty || 'MEDIUM',
        points: q.points || 150,
        hint: q.hint || '',
        explanation: q.explanation || '',
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        id: `q-custom-${Date.now()}`,
        standard: selectedStandard !== 'ALL' ? selectedStandard : '6th Standard',
        subject: selectedSubject !== 'ALL' ? selectedSubject : 'Science',
        chapterNumber: 1,
        chapterTitle: 'Chapter 1: Curriculum Concepts',
        questionNumber: 1,
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        targetAnswer: '',
        difficulty: 'MEDIUM',
        points: 150,
        hint: '',
        explanation: '',
      });
    }
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.questionText.trim()) return;

    const validatedAnswer = questionForm.options[questionForm.correctOptionIndex] || questionForm.targetAnswer || '';
    const updatedQuestion = {
      ...questionForm,
      targetAnswer: validatedAnswer,
    };

    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
      showToast('Curriculum question & solution updated successfully!');
    } else {
      setQuestions(prev => [updatedQuestion, ...prev]);
      showToast('New curriculum question added to the active question bank!');
    }

    setQuestionModalOpen(false);

    // Optional background sync with backend API if teacher token available
    const authToken = token || localStorage.getItem('chemescape_token');
    if (authToken) {
      try {
        const payload = {
          questionText: updatedQuestion.questionText,
          difficulty: updatedQuestion.difficulty,
          points: updatedQuestion.points,
          hint: updatedQuestion.hint,
          explanation: updatedQuestion.explanation,
          questionType: 'MCQ',
          options: updatedQuestion.options.map((opt, idx) => ({
            optionKey: String.fromCharCode(65 + idx),
            optionText: opt,
            isCorrect: idx === updatedQuestion.correctOptionIndex,
            orderNumber: idx + 1
          }))
        };

        if (editingQuestion) {
          await fetch(`http://localhost:5000/api/questions/${editingQuestion.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch('http://localhost:5000/api/questions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
          });
        }
      } catch {
        // Gracefully ignore network errors
      }
    }
  };

  const handleDeleteQuestion = async (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    showToast('Question removed from the curriculum question bank!');

    const authToken = token || localStorage.getItem('chemescape_token');
    if (authToken) {
      try {
        await fetch(`http://localhost:5000/api/questions/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
      } catch {
        // Silently ignore
      }
    }
  };

  const resetAllFilters = () => {
    setSelectedStandard('ALL');
    setSelectedSubject('ALL');
    setSelectedDifficulty('ALL');
    setSearchQuery('');
  };

  return (
    <div className="relative min-h-screen bg-[#050807] text-white overflow-x-hidden w-full pb-16">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 60%)' }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(103,232,249,0.06) 0%, transparent 70%)' }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">

        {/* Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600/95 text-slate-950 font-space font-bold text-xs border border-emerald-400/50 shadow-2xl flex items-center gap-2"
            >
              <Zap size={14} className="text-slate-950" />
              <span>{toast}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer flex-shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  QUESTION BANK EDITOR
                </span>
                <span className="text-xs font-space text-slate-400">Curriculum Standards 4th – 11th</span>
              </div>
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white leading-tight mt-1">
                Curriculum Question Bank
              </h1>
              <p className="text-white/50 text-xs sm:text-sm font-inter mt-0.5">
                Create, edit, and configure questions, options, hints & solutions across all Standards and Subjects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenEditQuestion(null)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-orbitron font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer transition-all flex-shrink-0"
            >
              <Plus size={16} />
              <span>Add New Question</span>
            </button>
          </div>
        </div>

        {/* ── METRICS STATS ROW ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Questions', value: questions.length, icon: FileText, color: '#00d4ff', suffix: '' },
            { label: 'Active Standards', value: 6, icon: GraduationCap, color: '#34d399', suffix: ' Grades' },
            { label: 'Curriculum Subjects', value: 5, icon: BookOpen, color: '#67e8f9', suffix: ' Core' },
            { label: 'Avg Question XP', value: 150, icon: Award, color: '#fbbf24', suffix: ' XP' },
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
                <span className="text-xs text-white/50 font-space font-normal">{m.suffix}</span>
              </p>
              <p className="text-[11px] text-white/40 font-space mt-1">{m.label}</p>
            </DashCard>
          ))}
        </div>

        {/* ── MULTI-LEVEL FILTERING BAR ───────────────────────────────────── */}
        <DashCard className="p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4">
            
            {/* Top Row: Search & Action Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by question text, option choices, hint, or chapter name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a1628] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-emerald-500/40 transition-all font-inter"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Standard Filter Dropdown */}
              <div className="flex items-center gap-2">
                <GraduationCap size={15} className="text-emerald-400 flex-shrink-0" />
                <select
                  value={selectedStandard}
                  onChange={e => setSelectedStandard(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#0a1628] border border-white/10 text-white font-space text-xs outline-none cursor-pointer hover:border-emerald-500/30 transition-all"
                >
                  {STANDARDS.map(std => (
                    <option key={std.id} value={std.id}>{std.label}</option>
                  ))}
                </select>
              </div>

              {/* Subject Filter Dropdown */}
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-cyan-400 flex-shrink-0" />
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#0a1628] border border-white/10 text-white font-space text-xs outline-none cursor-pointer hover:border-cyan-500/30 transition-all"
                >
                  {SUBJECTS.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.label}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-amber-400 flex-shrink-0" />
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2.5 rounded-xl bg-[#0a1628] border border-white/10 text-white font-space text-xs outline-none cursor-pointer hover:border-amber-500/30 transition-all"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              {(selectedStandard !== 'ALL' || selectedSubject !== 'ALL' || selectedDifficulty !== 'ALL' || searchQuery) && (
                <button
                  onClick={resetAllFilters}
                  className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-space text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Reset all filters"
                >
                  <RefreshCw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Bottom Row: Quick Subject Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-space text-white/40 uppercase tracking-wider mr-1 flex-shrink-0">
                Quick Subject:
              </span>
              {SUBJECTS.map(sub => {
                const isActive = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-space font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/5'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>
          </div>
        </DashCard>

        {/* ── QUESTION LIST HEADER & COUNT ────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <p className="text-xs font-space text-white/50">
            Showing <span className="text-emerald-400 font-bold">{paginatedQuestions.length}</span> of <span className="text-white font-bold">{filteredQuestions.length}</span> questions
            {selectedStandard !== 'ALL' && <span> in <span className="text-cyan-300">{selectedStandard}</span></span>}
            {selectedSubject !== 'ALL' && <span> (<span className="text-amber-300">{selectedSubject}</span>)</span>}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-space text-white/60">
                Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── QUESTION CARDS GRID ─────────────────────────────────────────── */}
        {paginatedQuestions.length === 0 ? (
          <DashCard className="p-12 text-center">
            <Layers className="mx-auto mb-3 text-white/20" size={42} />
            <h3 className="font-orbitron font-bold text-base text-white">No Questions Found</h3>
            <p className="text-xs text-white/40 font-inter mt-1 max-w-md mx-auto">
              No curriculum questions match your current search and filter settings. Try clearing the search or changing the selected Standard or Subject.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-space font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </DashCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {paginatedQuestions.map(q => {
              const subStyle = SUBJECT_COLOR_MAP[q.subject] || {
                text: '#34d399',
                bg: 'rgba(52, 211, 153, 0.15)',
                border: 'rgba(52, 211, 153, 0.35)'
              };

              return (
                <DashCard key={q.id} className="p-5 flex flex-col justify-between" glow="rgba(16,185,129,0.04)">
                  <div>
                    {/* Card Badges Row */}
                    <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Standard Badge */}
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-white/10 text-white/80 border border-white/15 uppercase">
                          {q.standard}
                        </span>

                        {/* Subject Badge */}
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold uppercase tracking-wider"
                          style={{
                            color: subStyle.text,
                            background: subStyle.bg,
                            border: `1px solid ${subStyle.border}`
                          }}
                        >
                          {q.subject}
                        </span>
                      </div>

                      {/* Difficulty & XP Badge */}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold ${
                        q.difficulty === 'HARD' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                        q.difficulty === 'MEDIUM' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {q.difficulty} • {q.points} pts
                      </span>
                    </div>

                    {/* Chapter Title */}
                    <div className="flex items-center gap-1.5 text-xs text-white/50 font-space mb-1.5">
                      <Layers size={13} className="text-white/40" />
                      <span>{q.chapterTitle}</span>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-white text-sm font-inter font-medium leading-relaxed mb-3">
                      {q.questionText}
                    </h3>

                    {/* Multiple Choice Options Grid */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                        {q.options.map((opt, idx) => {
                          const isCorrect = idx === q.correctOptionIndex;
                          const optKey = String.fromCharCode(65 + idx);
                          return (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl text-xs font-space border transition-all flex items-start gap-2 ${
                                isCorrect
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 font-bold'
                                  : 'bg-white/5 text-white/60 border-white/5'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-orbitron font-bold flex-shrink-0 ${
                                isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white/50'
                              }`}>
                                {isCorrect ? '✓' : optKey}
                              </span>
                              <span className="leading-snug break-words flex-1">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Solution & Hint Details Box */}
                    <div className="p-3 rounded-xl bg-[#0a1628] border border-white/5 mb-3 flex flex-col gap-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-space font-bold">
                        <CheckCircle2 size={13} className="flex-shrink-0" />
                        <span>Correct Answer: <span className="text-white font-normal">{q.targetAnswer || q.options?.[q.correctOptionIndex]}</span></span>
                      </div>
                      {q.hint && (
                        <div className="text-white/60 text-[11px] font-inter flex items-start gap-1.5">
                          <span className="text-amber-400 flex-shrink-0">💡</span>
                          <span>Hint: {q.hint}</span>
                        </div>
                      )}
                      {q.explanation && (
                        <div className="text-white/50 text-[11px] font-inter flex items-start gap-1.5">
                          <span className="text-cyan-400 flex-shrink-0">📖</span>
                          <span>Solution: {q.explanation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-space text-xs font-bold cursor-pointer transition-all"
                    >
                      <Edit3 size={13} />
                      <span>Edit Question</span>
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer transition-all"
                      title="Delete Question"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </DashCard>
              );
            })}
          </div>
        )}

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                setCurrentPage(prev => Math.max(1, prev - 1));
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-space text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>
            <span className="text-xs font-space text-white/50">
              Page <span className="text-emerald-400 font-bold">{currentPage}</span> of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => {
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-space text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ── ADD/EDIT QUESTION MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {questionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
          >
            <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0a1628] border border-emerald-500/30 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">
                      {editingQuestion ? 'Edit Curriculum Question' : 'Create New Curriculum Question'}
                    </h3>
                    <p className="text-xs text-white/40 font-space">
                      Configure question content, options, hint and solution
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuestionModalOpen(false)}
                  className="text-white/40 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4">
                {/* Standard & Subject Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Standard / Grade</label>
                    <select
                      value={questionForm.standard}
                      onChange={e => setQuestionForm({ ...questionForm, standard: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space outline-none cursor-pointer focus:border-emerald-500/40"
                    >
                      {STANDARDS.filter(s => s.id !== 'ALL').map(std => (
                        <option key={std.id} value={std.id}>{std.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Subject</label>
                    <select
                      value={questionForm.subject}
                      onChange={e => setQuestionForm({ ...questionForm, subject: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space outline-none cursor-pointer focus:border-emerald-500/40"
                    >
                      {SUBJECTS.filter(s => s.id !== 'ALL').map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chapter Title & Number */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Chapter No.</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={questionForm.chapterNumber}
                      onChange={e => setQuestionForm({ ...questionForm, chapterNumber: parseInt(e.target.value, 10) || 1 })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-space text-white/70 mb-1">Chapter Name / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chapter 1: Measurements & Motion"
                      value={questionForm.chapterTitle}
                      onChange={e => setQuestionForm({ ...questionForm, chapterTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space outline-none focus:border-emerald-500/40"
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <label className="block text-xs font-space text-white/70 mb-1">Question Prompt / Statement</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter question text or problem statement..."
                    value={questionForm.questionText}
                    onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-emerald-500/40"
                  />
                </div>

                {/* Multiple Choice Options Editor */}
                <div>
                  <label className="block text-xs font-space text-white/70 mb-2">
                    Answer Choices (Select radio button for Correct Answer):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {questionForm.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                          questionForm.correctOptionIndex === idx
                            ? 'bg-emerald-500/10 border-emerald-500/40'
                            : 'bg-[#040810] border-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOption"
                          checked={questionForm.correctOptionIndex === idx}
                          onChange={() => setQuestionForm({
                            ...questionForm,
                            correctOptionIndex: idx,
                            targetAnswer: opt
                          })}
                          className="accent-emerald-400 cursor-pointer w-4 h-4"
                        />
                        <span className="text-[11px] font-orbitron font-bold text-white/40">
                          {String.fromCharCode(65 + idx)}:
                        </span>
                        <input
                          type="text"
                          required
                          placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                          value={opt}
                          onChange={e => {
                            const updated = [...questionForm.options];
                            updated[idx] = e.target.value;
                            setQuestionForm({
                              ...questionForm,
                              options: updated,
                              targetAnswer: idx === questionForm.correctOptionIndex ? e.target.value : questionForm.targetAnswer
                            });
                          }}
                          className="w-full bg-transparent text-white text-xs font-space outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty, Points & Target Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space font-bold outline-none cursor-pointer focus:border-emerald-500/40"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Points Reward</label>
                    <input
                      type="number"
                      step={10}
                      min={50}
                      max={500}
                      value={questionForm.points}
                      onChange={e => setQuestionForm({ ...questionForm, points: parseInt(e.target.value, 10) || 100 })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Target Answer</label>
                    <input
                      type="text"
                      readOnly
                      value={questionForm.options[questionForm.correctOptionIndex] || ''}
                      placeholder="Selected via radio"
                      className="w-full p-2.5 rounded-xl bg-[#040810]/50 border border-white/10 text-emerald-300 text-xs font-space outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Question Hint */}
                <div>
                  <label className="block text-xs font-space text-white/70 mb-1">Question Hint</label>
                  <input
                    type="text"
                    placeholder="e.g. Remember to check the base units of the SI system..."
                    value={questionForm.hint}
                    onChange={e => setQuestionForm({ ...questionForm, hint: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-emerald-500/40"
                  />
                </div>

                {/* Explanation / Solution */}
                <div>
                  <label className="block text-xs font-space text-white/70 mb-1">Explanation / Solution Details</label>
                  <input
                    type="text"
                    placeholder="Enter detailed educational explanation..."
                    value={questionForm.explanation}
                    onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-emerald-500/40"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setQuestionModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 text-xs font-space cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-space font-bold text-xs uppercase cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Save size={15} />
                    <span>Save Question</span>
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
