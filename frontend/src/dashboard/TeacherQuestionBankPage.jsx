import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, Edit3, Trash2,
  Zap, Save, X, FlaskConical, Award, HelpCircle, Check, ArrowLeft
} from 'lucide-react';
import { DashCard, AnimatedCounter } from './DashComponents';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';

const unitStats = [
  { id: 1, name: 'Unit 1: Calculation Quest', topic: 'Core Concepts', gameType: 'CALCULATION_HEIST' },
  { id: 2, name: 'Unit 2: Quantum Orbital Architect', topic: 'Quantum Mechanical Model of Atom', gameType: 'QUANTUM_ARCHITECT' },
  { id: 3, name: 'Unit 3: Periodic Grid Reconstruction', topic: 'Periodic Classification of Elements', gameType: 'GRID_RECONSTRUCTION' },
  { id: 4, name: 'Unit 4: Hydrogen Reactor', topic: 'Hydrogen & Hydrides', gameType: 'HYDROGEN_REACTOR' },
  { id: 5, name: 'Unit 5: Element Sorting Factory', topic: 'Alkali & Alkaline Earth Metals', gameType: 'METAL_SORTING' },
  { id: 6, name: 'Unit 6: Gas Chamber Simulator', topic: 'States of Matter: Gaseous State', gameType: 'GAS_SIMULATOR' },
];

const initialQuestionBank = [
  {
    id: 'q-u1-1',
    chapterNumber: 1,
    unitName: 'Unit 1: Calculation Quest',
    gameType: 'CALCULATION_HEIST',
    stageNumber: 1,
    stageTitle: 'Stage 1: Molar Mass Vault Calculation',
    questionText: 'Calculate the molar mass of H₂O given atomic masses: H = 1.008 g/mol, O = 15.999 g/mol.',
    targetAnswer: '18.015',
    difficulty: 'EASY',
    points: 100,
    hint: 'Molar mass = 2*(1.008) + 15.999',
    explanation: 'Sum of atomic masses of 2 Hydrogen atoms and 1 Oxygen atom gives 18.015 g/mol.',
    options: ['18.015 g/mol', '16.000 g/mol', '20.015 g/mol', '34.015 g/mol'],
    correctOptionIndex: 0
  },
  {
    id: 'q-u2-1',
    chapterNumber: 2,
    unitName: 'Unit 2: Quantum Orbital Architect',
    gameType: 'QUANTUM_ARCHITECT',
    stageNumber: 2,
    stageTitle: 'Stage 2: Quantum Numbers Configurator',
    questionText: 'Determine the principal quantum number (n) and azimuthal quantum number (l) for 3d orbital.',
    targetAnswer: 'n=3, l=2',
    difficulty: 'MEDIUM',
    points: 150,
    hint: 'Principal shell number is 3. For d subshell, l = 2.',
    explanation: 'For 3d, n = 3 and orbital subshell d corresponds to angular momentum quantum number l = 2.',
    options: ['n=3, l=2', 'n=3, l=1', 'n=2, l=2', 'n=3, l=0'],
    correctOptionIndex: 0
  },
  {
    id: 'q-u3-1',
    chapterNumber: 3,
    unitName: 'Unit 3: Periodic Grid Reconstruction',
    gameType: 'GRID_RECONSTRUCTION',
    stageNumber: 3,
    stageTitle: 'Stage 3: Halogen Family Matrix Placement',
    questionText: 'Identify the electronic configuration trend and group number for Halogens.',
    targetAnswer: 'Group 17 (ns² np⁵)',
    difficulty: 'MEDIUM',
    points: 150,
    hint: 'Halogens have 7 valence electrons in outermost shell.',
    explanation: 'Halogens belong to Group 17 with general valence electronic configuration ns² np⁵.',
    options: ['Group 17 (ns² np⁵)', 'Group 16 (ns² np⁴)', 'Group 18 (ns² np⁶)', 'Group 1 (ns¹)'],
    correctOptionIndex: 0
  },
  {
    id: 'q-u4-1',
    chapterNumber: 4,
    unitName: 'Unit 4: Hydrogen Reactor',
    gameType: 'HYDROGEN_REACTOR',
    stageNumber: 4,
    stageTitle: 'Stage 4: Heavy Water Equilibrium',
    questionText: 'Which isotope of Hydrogen is non-radioactive and used as moderator in nuclear reactors?',
    targetAnswer: 'Deuterium (²H or D)',
    difficulty: 'MEDIUM',
    points: 200,
    hint: 'Deuterium oxide (D₂O) is known as heavy water.',
    explanation: 'Deuterium (D₂O) slows down fast neutrons in nuclear reactors and is non-radioactive.',
    options: ['Deuterium (D₂O)', 'Tritium (³H)', 'Protium (¹H)', 'Hydride (H⁻)'],
    correctOptionIndex: 0
  },
  {
    id: 'q-u5-1',
    chapterNumber: 5,
    unitName: 'Unit 5: Element Sorting Factory',
    gameType: 'METAL_SORTING',
    stageNumber: 5,
    stageTitle: 'Stage 5: Flame Test Spectrum Sorter',
    questionText: 'Which alkali metal imparts a characteristic golden yellow color to the Bunsen flame?',
    targetAnswer: 'Sodium (Na)',
    difficulty: 'EASY',
    points: 100,
    hint: 'Sodium emission spectrum exhibits strong D-lines at 589 nm.',
    explanation: 'Sodium atoms excite in flame to impart intense golden yellow color.',
    options: ['Sodium (Na)', 'Lithium (Li)', 'Potassium (K)', 'Calcium (Ca)'],
    correctOptionIndex: 0
  },
  {
    id: 'q-u6-1',
    chapterNumber: 6,
    unitName: 'Unit 6: Gas Chamber Simulator',
    gameType: 'GAS_SIMULATOR',
    stageNumber: 1,
    stageTitle: 'Stage 1: Kinetic Molecular Temperature Scanner',
    questionText: 'Calculate pressure P for 2.0 moles of ideal gas at V = 10.0 L and T = 300 K.',
    targetAnswer: '4.92 atm',
    difficulty: 'HARD',
    points: 250,
    hint: 'Use P = nRT / V where R = 0.0821 L·atm/(mol·K)',
    explanation: 'P = (2.0 * 0.0821 * 300) / 10.0 = 4.926 atm.',
    options: ['4.92 atm', '2.46 atm', '9.85 atm', '1.00 atm'],
    correctOptionIndex: 0
  }
];

export default function TeacherQuestionBankPage() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();

  const [questions, setQuestions] = useState(initialQuestionBank);
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [questionForm, setQuestionForm] = useState({
    id: '',
    chapterNumber: 1,
    unitName: 'Unit 1: Calculation Quest',
    gameType: 'CALCULATION_HEIST',
    stageNumber: 1,
    stageTitle: '',
    questionText: '',
    targetAnswer: '',
    difficulty: 'MEDIUM',
    points: 150,
    hint: '',
    explanation: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
  });

  const filteredQuestions = questions.filter(q => {
    const matchesUnit = selectedUnitFilter === 'ALL' || q.gameType === selectedUnitFilter;
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.stageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.unitName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUnit && matchesSearch;
  });

  const handleOpenEditQuestion = (q) => {
    if (q) {
      setEditingQuestion(q);
      setQuestionForm({
        id: q.id,
        chapterNumber: q.chapterNumber,
        unitName: q.unitName,
        gameType: q.gameType,
        stageNumber: q.stageNumber,
        stageTitle: q.stageTitle,
        questionText: q.questionText,
        targetAnswer: q.targetAnswer,
        difficulty: q.difficulty,
        points: q.points,
        hint: q.hint,
        explanation: q.explanation,
        options: q.options ? [...q.options] : ['', '', '', ''],
        correctOptionIndex: q.correctOptionIndex || 0,
      });
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        id: `q-${Date.now()}`,
        chapterNumber: 1,
        unitName: 'Unit 1: Calculation Quest',
        gameType: 'CALCULATION_HEIST',
        stageNumber: 1,
        stageTitle: 'New Curriculum Question',
        questionText: '',
        targetAnswer: '',
        difficulty: 'MEDIUM',
        points: 150,
        hint: '',
        explanation: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
      });
    }
    setQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.questionText) return;

    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...questionForm } : q));
      setToast('Game question & variant parameters updated successfully!');
    } else {
      setQuestions(prev => [questionForm, ...prev]);
      setToast('New question added to active game pool!');
    }
    setQuestionModalOpen(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setToast('Question removed from game pool!');
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative min-h-screen bg-[#040810] text-white overflow-x-hidden w-full pb-16">
      {/* Background ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(0,212,255,0.12) 0%, transparent 60%)' }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">

        {/* Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-600/90 text-white font-space text-xs border border-cyan-400/30 shadow-xl flex items-center gap-2"
            >
              <Zap size={14} className="text-amber-300" />
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
                <span className="text-xs font-orbitron font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                  QUESTION BANK EDITOR
                </span>
                <span className="text-xs font-space text-white/40">Chapters 1 – 15</span>
              </div>
              <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-white leading-tight mt-1">
                Curriculum Question Bank
              </h1>
              <p className="text-white/40 text-xs sm:text-sm font-inter">
                Create, edit, and configure problem variants, target parameters, formulas & options across all 6 Units.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenEditQuestion(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer transition-all flex-shrink-0"
          >
            <Plus size={16} />
            <span>Add New Question</span>
          </button>
        </div>

        {/* ── METRICS STATS ROW ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Questions', value: questions.length, icon: FileText, color: '#00d4ff' },
            { label: 'Active Units', value: 6, icon: FlaskConical, color: '#a855f7' },
            { label: 'Custom Variants', value: questions.length * 4, icon: Zap, color: '#ec4899' },
            { label: 'Avg Question XP', value: 150, icon: Award, color: '#fbbf24' },
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

        {/* ── SEARCH & FILTER CONTROLS ────────────────────────────────────── */}
        <DashCard className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search by question text, formula, or stage title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0a1628] border border-white/10 text-white placeholder-white/30 text-xs outline-none focus:border-cyan-500/40 transition-all font-inter"
              />
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={14} className="text-cyan-400" />
              <select
                value={selectedUnitFilter}
                onChange={e => setSelectedUnitFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-white/10 text-white font-space text-xs outline-none cursor-pointer hover:border-cyan-500/30 transition-all"
              >
                <option value="ALL">All Units & Chapters</option>
                <option value="CALCULATION_HEIST">Unit 1: Calculation Heist</option>
                <option value="QUANTUM_ARCHITECT">Unit 2: Quantum Architect</option>
                <option value="GRID_RECONSTRUCTION">Unit 3: Periodic Grid</option>
                <option value="HYDROGEN_REACTOR">Unit 4: Hydrogen Reactor</option>
                <option value="METAL_SORTING">Unit 5: Element Sorting</option>
                <option value="GAS_SIMULATOR">Unit 6: Gas Chamber</option>
              </select>
            </div>
          </div>
        </DashCard>

        {/* ── QUESTION CARDS GRID ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredQuestions.map(q => (
            <DashCard key={q.id} className="p-5 flex flex-col justify-between" glow="rgba(0,212,255,0.04)">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase">
                    {q.unitName || `Chapter ${q.chapterNumber}`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold ${
                    q.difficulty === 'HARD' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                    q.difficulty === 'MEDIUM' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {q.difficulty} • {q.points} pts
                  </span>
                </div>

                <h3 className="font-space font-bold text-white text-base mb-1.5">{q.stageTitle || `Stage ${q.stageNumber}`}</h3>
                <p className="text-white/80 text-xs font-inter leading-relaxed mb-3">{q.questionText}</p>

                <div className="p-3 rounded-xl bg-[#0a1628] border border-white/5 mb-3 flex flex-col gap-1 text-xs font-mono">
                  <div className="text-cyan-400 font-bold">Target Answer / Formula: <span className="text-white">{q.targetAnswer}</span></div>
                  {q.hint && <div className="text-white/50 text-[11px] font-inter">💡 Hint: {q.hint}</div>}
                </div>

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 mb-3">
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg text-[11px] font-space border ${
                          idx === q.correctOptionIndex
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold'
                            : 'bg-white/5 text-white/50 border-white/5'
                        }`}
                      >
                        {idx === q.correctOptionIndex && '✓ '} {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleOpenEditQuestion(q)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 font-space text-xs font-bold cursor-pointer transition-all"
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
          ))}
        </div>
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
            <div className="w-full max-w-2xl p-6 rounded-2xl bg-[#0a1628] border border-cyan-500/30 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center">
                    <Edit3 size={18} />
                  </div>
                  <div>
                    <h3 className="font-orbitron font-bold text-lg text-white">
                      {editingQuestion ? 'Edit Game Question & Parameters' : 'Create New Curriculum Question'}
                    </h3>
                    <p className="text-xs text-white/40 font-space">Configure gaming variants across chapters</p>
                  </div>
                </div>
                <button onClick={() => setQuestionModalOpen(false)} className="text-white/40 hover:text-white cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Chapter & Game Engine</label>
                    <select
                      value={questionForm.gameType}
                      onChange={e => {
                        const val = e.target.value;
                        const matched = unitStats.find(u => u.gameType === val);
                        setQuestionForm({
                          ...questionForm,
                          gameType: val,
                          chapterNumber: matched ? matched.id : 1,
                          unitName: matched ? matched.name : 'Chapter Question'
                        });
                      }}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-orbitron font-bold outline-none cursor-pointer"
                    >
                      <option value="CALCULATION_HEIST">Unit 1: Calculation Heist</option>
                      <option value="QUANTUM_ARCHITECT">Unit 2: Quantum Architect</option>
                      <option value="GRID_RECONSTRUCTION">Unit 3: Periodic Grid</option>
                      <option value="HYDROGEN_REACTOR">Unit 4: Hydrogen Reactor</option>
                      <option value="METAL_SORTING">Unit 5: Element Sorting</option>
                      <option value="GAS_SIMULATOR">Unit 6: Gas Chamber</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Stage Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Stage 1: Kinetic Molecular Scanner"
                      value={questionForm.stageTitle}
                      onChange={e => setQuestionForm({ ...questionForm, stageTitle: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-space text-white/70 mb-1">Question Prompt / Problem Text</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter question text or problem statement..."
                    value={questionForm.questionText}
                    onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Target Answer / Formula</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 18.015 or 4.92 atm"
                      value={questionForm.targetAnswer}
                      onChange={e => setQuestionForm({ ...questionForm, targetAnswer: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-mono outline-none focus:border-cyan-500/40 text-cyan-300 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={e => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-space font-bold outline-none cursor-pointer"
                    >
                      <option value="EASY">EASY</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HARD">HARD</option>
                      <option value="EXPERT">EXPERT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-space text-white/70 mb-1">Points Reward</label>
                    <input
                      type="number"
                      value={questionForm.points}
                      onChange={e => setQuestionForm({ ...questionForm, points: parseInt(e.target.value, 10) || 100 })}
                      className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-mono outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-space text-white/70 mb-1">Question Hint</label>
                  <input
                    type="text"
                    placeholder="e.g. Apply ideal gas law PV = nRT"
                    value={questionForm.hint}
                    onChange={e => setQuestionForm({ ...questionForm, hint: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-space text-white/70 mb-1">Explanation / Solution Details</label>
                  <input
                    type="text"
                    placeholder="Enter detailed step-by-step solution..."
                    value={questionForm.explanation}
                    onChange={e => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-[#040810] border border-white/10 text-white text-xs font-inter outline-none focus:border-cyan-500/40"
                  />
                </div>

                {/* Multiple Choice Options Editor */}
                <div>
                  <label className="block text-xs font-space text-white/70 mb-2">Answer Choices (Select radio button for Correct Answer):</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {questionForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-[#040810] border border-white/10">
                        <input
                          type="radio"
                          name="correctOption"
                          checked={questionForm.correctOptionIndex === idx}
                          onChange={() => setQuestionForm({ ...questionForm, correctOptionIndex: idx })}
                          className="accent-cyan-400 cursor-pointer"
                        />
                        <input
                          type="text"
                          placeholder={`Option ${idx + 1}`}
                          value={opt}
                          onChange={e => {
                            const updated = [...questionForm.options];
                            updated[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: updated });
                          }}
                          className="w-full bg-transparent text-white text-xs font-space outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setQuestionModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-white/60 text-xs font-space cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-space font-bold text-xs uppercase cursor-pointer shadow-lg shadow-cyan-500/20"
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
