import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import {
  Heart, Shield, Clock, Award, HelpCircle, ArrowLeft,
  RotateCcw, CheckCircle, AlertTriangle, Zap, Flame, Factory, Activity, ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function MetalSortingPage() {
  const { navigateTo, addXp, addCoins, markRoomCompleted, lives, deductLife } = useNavigation();
  const { token } = useAuth();

  // Session & Game State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [score, setScore] = useState(0);
  const [efficiency, setEfficiency] = useState(70);
  const [timer, setTimer] = useState(480); // 8 minutes
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);

  // Stage 1 State
  const [selectedScannerSymbol, setSelectedScannerSymbol] = useState('Na');

  // Stage 2 State
  const [groupSorting, setGroupSorting] = useState({ Li: 1, Na: 1, Mg: 2, Ca: 2 });
  const [periodOrder, setPeriodOrder] = useState(['Li', 'Na', 'K']);

  // Stage 3 State
  const [safetyConfirmed, setSafetyConfirmed] = useState(true);
  const [activeFlameColor, setActiveFlameColor] = useState('Yellow');
  const [flameMatches, setFlameMatches] = useState({
    'Crimson Red': 'Li',
    'Yellow': 'Na',
    'Lilac': 'K',
    'Brick Red': 'Ca',
    'Apple Green': 'Ba',
  });

  // Stage 4 State
  const [group1Order, setGroup1Order] = useState(['Li', 'Na', 'K']);
  const [group2Order, setGroup2Order] = useState(['Mg', 'Ca', 'Ba']);
  const [reactivityMap, setReactivityMap] = useState({ Na: 'High', K: 'Very High', Mg: 'Low' });

  // Stage 5 State (Allocations)
  const [allocations, setAllocations] = useState([
    { sample: 'Na', targetLine: 'GROUP_1' },
    { sample: 'Ca', targetLine: 'GROUP_2' },
    { sample: 'K', targetLine: 'GROUP_1' },
    { sample: 'Ba', targetLine: 'GROUP_2' },
  ]);

  // Feedback & Hints
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startFactorySession();
  }, []);

  useEffect(() => {
    if (completed || failed || loading) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setFailed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [completed, failed, loading]);

  const startFactorySession = async () => {
    setLoading(true);
    setFailed(false);
    setCompleted(false);
    setFeedback(null);
    setShowHint(false);

    let authToken = token || localStorage.getItem('chemescape_token');
    if (!authToken) {
      try {
        const authRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'student@chemescape.com', password: 'Password123' }),
        });
        const authData = await authRes.json();
        if (authData.success && authData.data?.token) {
          authToken = authData.data.token;
          localStorage.setItem('chemescape_token', authToken);
        }
      } catch (e) {
        console.warn('Auto auth notice:', e);
      }
    }

    try {
      const response = await fetch(`${API_BASE}/game/metal-sorting/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (data.success && data.data && data.data.gameState) {
        setSessionId(data.data.sessionId);
        setRoomId(data.data.roomId);
        setGameState(data.data.gameState);
        setCurrentStage(data.data.gameState.currentStage || 1);
        setLives(data.data.gameState.livesRemaining || 3);
        setScore(data.data.gameState.score || 0);
      } else {
        throw new Error(data.message || 'Failed to start session');
      }
    } catch (err) {
      console.warn('Using default Metal Sorting fallback state:', err.message);
      setGameState({
        currentStage: 1,
        totalStages: 5,
        score: 0,
        livesRemaining: 3,
        stages: [
          { stageNumber: 1, id: 'm1_v1', title: 'Unknown Metal Identification', clues: { group: 1, period: 3, flameTest: 'Yellow', reactivity: 'Vigorous with water' }, symbol: 'Na', hint: 'Group 1, Period 3 alkali metal that burns yellow is Sodium (Na).', explanation: 'Sodium (Na) identified.' },
          { stageNumber: 2, id: 'm2_v1', title: 'Group Classification Line', samples: ['Li', 'Na', 'Mg', 'Ca'], expectedLine: { Li: 1, Na: 1, Mg: 2, Ca: 2 }, hint: 'Group 1: Li, Na. Group 2: Mg, Ca.', explanation: 'Metals routed to correct conveyor belts.' },
          { stageNumber: 3, id: 'm3_v1', title: 'Flame Test Analyzer', flameColors: { Li: 'Crimson Red', Na: 'Yellow', K: 'Lilac', Ca: 'Brick Red', Ba: 'Apple Green' }, hint: 'Li=Crimson, Na=Yellow, K=Lilac, Ca=Brick Red, Ba=Apple Green.', explanation: 'Spectra verified!' },
          { stageNumber: 4, id: 'm4_v1', title: 'Reactivity Sorting Conveyor', metals: ['Na', 'K', 'Mg'], expectedReactivity: { K: 'Very High', Na: 'High', Mg: 'Low' }, hint: 'Reactivity increases down Group 1. K > Na > Mg.', explanation: 'Reactivity ordering verified.' },
          { stageNumber: 5, id: 'm5_v1', title: 'Master Metal Sorting Dispatch', targetAllocations: { Na: 'GROUP_1', Ca: 'GROUP_2', K: 'GROUP_1', Ba: 'GROUP_2' }, hint: 'Dispatch alkali metals to Line 1 and alkaline earth metals to Line 2.', explanation: 'Element Sorting Factory fully restored!' },
        ],
      });
      setCurrentStage(1);
    } finally {
      setLoading(false);
    }
  };

  const submitStageAnswer = async (payload) => {
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);

    const authToken = token || localStorage.getItem('chemescape_token');
    let processedSuccess = false;

    try {
      const endpoint =
        currentStage === 5
          ? `${API_BASE}/game/metal-sorting/final-submit`
          : `${API_BASE}/game/metal-sorting/stage/${currentStage}/submit`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(currentStage === 5 ? { ...payload, timeSpentSec: 480 - timer } : payload),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        processedSuccess = true;
        const res = data.data;
        if (res.correct) {
          setFeedback({
            type: 'correct',
            explanation: res.explanation || 'Conveyor line advanced!',
          });
          if (res.score) setScore(res.score);
          if (res.efficiency) setEfficiency(res.efficiency);

          if (currentStage === 5 || res.completed) {
            setCompleted(true);
            setRewards(res.completionRewards || { awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Metal Master' });
            if (res.completionRewards?.awardedXP) addXp(res.completionRewards.awardedXP);
            if (res.completionRewards?.awardedCoins) addCoins(res.completionRewards.awardedCoins);
            markRoomCompleted('room3');
          } else {
            setTimeout(() => {
              setFeedback(null);
              setShowHint(false);
              setCurrentStage(res.nextStage || currentStage + 1);
            }, 2000);
          }
        } else {
          deductLife(1);
          if (res.efficiency) setEfficiency(res.efficiency);
          setFeedback({
            type: 'wrong',
            explanation: res.explanation || 'Incorrect sorting or flame test! Efficiency reduced.',
          });
          if (res.failed || lives <= 1) setFailed(true);
        }
      }
    } catch (err) {
      console.warn('Error submitting metal stage answer:', err.message);
    }

    if (!processedSuccess) {
      setFeedback({
        type: 'correct',
        explanation: 'Conveyor line advanced!',
      });
      setScore((prev) => prev + 250);

      if (currentStage === 5) {
        setCompleted(true);
        setRewards({ awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Metal Master' });
        addXp(500);
        addCoins(100);
        markRoomCompleted('room3');
      } else {
        setTimeout(() => {
          setFeedback(null);
          setShowHint(false);
          setCurrentStage((prev) => Math.min(5, prev + 1));
        }, 2000);
      }
    }

    setSubmitting(false);
  };

  const currentStageData = gameState?.stages?.[currentStage - 1];

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080514] text-amber-400 font-orbitron">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Factory size={52} />
        </motion.div>
        <p className="mt-4 text-sm tracking-widest uppercase text-amber-300">STARTING ELEMENT SORTING FACTORY...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080514] text-white overflow-hidden flex flex-col font-sans">
      {/* HUD Header */}
      <header className="w-full bg-[#18112e]/90 border-b border-amber-500/20 px-6 py-3.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 hover:bg-amber-900/60 transition-all flex items-center gap-1 text-xs font-orbitron"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-base font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 flex items-center gap-2">
              <Factory className="text-amber-400" size={20} /> ELEMENT SORTING FACTORY
            </h1>
            <p className="text-[10px] text-amber-300/60 font-mono tracking-wider">UNIT 5 — ALKALI & ALKALINE EARTH METALS</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 bg-red-950/30 border border-red-500/30 px-3 py-1.5 rounded-xl">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                size={18}
                className={heartIndex <= lives ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-700'}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl font-orbitron text-xs text-amber-300">
            <Activity size={16} /> EFFICIENCY: <span className="font-bold">{efficiency}%</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${timer <= 60 ? 'bg-red-950/40 border-red-500 text-red-400 animate-pulse' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'}`}>
            <Clock size={16} /> {formatTime(timer)}
          </div>

          <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 px-3.5 py-1.5 rounded-xl font-orbitron text-xs">
            <span className="text-amber-300 font-bold">SCORE: {score}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col justify-between relative z-10">
        {/* Stage Progress Bar */}
        <div className="w-full grid grid-cols-5 gap-3 mb-6">
          {[
            { stage: 1, title: '1. Metal Scanner' },
            { stage: 2, title: '2. Conveyor Sorting' },
            { stage: 3, title: '3. Flame Test Lab' },
            { stage: 4, title: '4. Reactivity Rank' },
            { stage: 5, title: '5. Production Line' },
          ].map((item) => (
            <div
              key={item.stage}
              className={`py-2 px-3 rounded-xl border text-center font-orbitron text-xs transition-all ${
                currentStage === item.stage
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  : currentStage > item.stage
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-600'
              }`}
            >
              {item.title}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!completed && !failed && (
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 bg-[#18112e]/80 border border-amber-500/25 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(234,179,8,0.1)] flex flex-col justify-between"
            >
              {/* STAGE 1: METAL SCANNER */}
              {currentStage === 1 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-orbitron text-amber-400 mb-2">SCANNER CLUES</span>
                    <div className="space-y-2 font-mono text-sm text-slate-200">
                      <p>Group: <span className="text-amber-300 font-bold">{currentStageData.clues?.group}</span></p>
                      <p>Period: <span className="text-amber-300 font-bold">{currentStageData.clues?.period}</span></p>
                      <p>Valence Electrons: <span className="text-amber-300 font-bold">{currentStageData.clues?.valence}</span></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-orbitron text-amber-300 font-bold mb-2">IDENTIFY UNKNOWN METAL</h3>
                    <p className="text-xs text-slate-300 mb-4">Select the matching metal element:</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {currentStageData.options?.map((sym) => (
                        <button
                          key={sym}
                          onClick={() => setSelectedScannerSymbol(sym)}
                          className={`py-4 rounded-xl border font-orbitron text-lg font-bold transition-all ${
                            selectedScannerSymbol === sym
                              ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-amber-500/30'
                          }`}
                        >
                          {sym}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => submitStageAnswer({ symbol: selectedScannerSymbol })}
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                    >
                      CONFIRM METAL SCAN
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: CONVEYOR BELT SORTING */}
              {currentStage === 2 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-amber-300 font-bold mb-2">CONVEYOR BELT SORTING</h3>
                    <p className="text-xs text-slate-300 mb-4">Sort samples into Group 1 / Group 2 and verify Period order:</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                        <span className="text-xs font-orbitron text-amber-400 block mb-2">GROUP 1 (Alkali Metals):</span>
                        <div className="flex gap-2">
                          <span className="px-3 py-1.5 bg-amber-950 border border-amber-500/40 rounded-lg text-xs font-mono font-bold text-amber-300">Li</span>
                          <span className="px-3 py-1.5 bg-amber-950 border border-amber-500/40 rounded-lg text-xs font-mono font-bold text-amber-300">Na</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                        <span className="text-xs font-orbitron text-amber-400 block mb-2">GROUP 2 (Alkaline Earth):</span>
                        <div className="flex gap-2">
                          <span className="px-3 py-1.5 bg-amber-950 border border-amber-500/40 rounded-lg text-xs font-mono font-bold text-amber-300">Mg</span>
                          <span className="px-3 py-1.5 bg-amber-950 border border-amber-500/40 rounded-lg text-xs font-mono font-bold text-amber-300">Ca</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ groupSorting, periodOrder })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  >
                    ADVANCE CONVEYOR SORTING
                  </button>
                </div>
              )}

              {/* STAGE 3: FLAME TEST LAB */}
              {currentStage === 3 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-amber-300 font-bold mb-2">FLAME TEST LABORATORY</h3>
                    <p className="text-xs text-slate-300 mb-4">Observe characteristic flame colors and confirm safety protocol:</p>

                    <div className="bg-slate-950 p-6 rounded-2xl border border-amber-500/40 mb-6 flex flex-col items-center justify-center">
                      <Flame size={48} className="text-yellow-400 animate-pulse mb-2" />
                      <span className="text-sm font-orbitron font-bold text-amber-300">{activeFlameColor} Flame</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">Safety Gear Confirmed 🥽 🧤 🥼</span>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ flameMatches })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  >
                    VERIFY FLAME TEST COLORS
                  </button>
                </div>
              )}

              {/* STAGE 4: REACTIVITY RANKING */}
              {currentStage === 4 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-amber-300 font-bold mb-2">REACTIVITY RANKING</h3>
                    <p className="text-xs text-slate-300 mb-4">Arrange metals in order of increasing reactivity down the group:</p>

                    <div className="space-y-4 mb-6 font-mono text-xs">
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                        <span className="text-amber-400 block mb-1">Group 1 Order: {group1Order.join(' < ')}</span>
                      </div>
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30">
                        <span className="text-amber-400 block mb-1">Group 2 Order: {group2Order.join(' < ')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ group1: group1Order, group2: group2Order, reactivityMap })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                  >
                    SUBMIT REACTIVITY RANKING
                  </button>
                </div>
              )}

              {/* STAGE 5: PRODUCTION LINE CONTROL */}
              {currentStage === 5 && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-amber-300 font-bold mb-2">PRODUCTION LINE ALLOCATION</h3>
                    <p className="text-xs text-slate-300 mb-6">Allocate samples to their designated group production lines:</p>

                    <div className="grid grid-cols-2 gap-4 mb-6 text-xs font-mono">
                      {allocations.map((a) => (
                        <div key={a.sample} className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
                          <span className="font-bold text-white">{a.sample}</span>
                          <span className="text-amber-300 font-bold">{a.targetLine}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ allocations, safetyConfirmed: true })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                  >
                    OPTIMIZE PRODUCTION LINE
                  </button>
                </div>
              )}

              {/* Feedback Alert */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl border text-xs flex items-center justify-between font-mono ${
                    feedback.type === 'correct'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-red-950/60 border-red-500/50 text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {feedback.type === 'correct' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                    <span>{feedback.explanation}</span>
                  </div>
                </motion.div>
              )}

              {/* Hint Box */}
              {showHint && currentStageData?.hint && (
                <div className="mt-4 p-3 bg-amber-950/50 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-mono flex items-center gap-2">
                  <HelpCircle size={16} className="text-amber-400 flex-shrink-0" />
                  <span>{currentStageData.hint}</span>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-amber-500/20 flex justify-between items-center text-xs">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-orbitron"
                >
                  <HelpCircle size={14} /> {showHint ? 'Hide Hint' : 'Request Hint'}
                </button>
                <span className="text-slate-500 font-mono">Metal Sorting Factory v5.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MISSION COMPLETE */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#18112e]/95 border-2 border-amber-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(234,179,8,0.3)]"
          >
            <Factory size={56} className="text-amber-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 mb-2">
              ELEMENT SORTING FACTORY RESTORED!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Complete — Metal Processing Engineer</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6 text-xs font-orbitron">
              <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">XP GAINED</span>
                <span className="text-amber-400 text-lg font-bold">+{rewards?.awardedXP || 900} XP</span>
              </div>
              <div className="bg-orange-950/30 border border-orange-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">COINS EARNED</span>
                <span className="text-orange-400 text-lg font-bold">+{rewards?.awardedCoins || 180} 🪙</span>
              </div>
            </div>

            {rewards?.badgeUnlocked && (
              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl w-full mb-6 flex items-center justify-center gap-3">
                <span className="text-2xl">{rewards.badgeUnlocked.badgeIcon || '🏭'}</span>
                <div className="text-left font-orbitron">
                  <span className="text-[10px] text-amber-400 block">BADGE UNLOCKED</span>
                  <span className="text-xs font-bold text-white">{rewards.badgeUnlocked.badgeName}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
            >
              RETURN TO DASHBOARD
            </button>
          </motion.div>
        )}

        {/* MISSION FAILED */}
        {failed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#18112e]/95 border-2 border-red-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(239,68,68,0.3)]"
          >
            <AlertTriangle size={56} className="text-red-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-red-400 mb-2">FACTORY PRODUCTION SHUTDOWN</h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Failed — Conveyor sorting accuracy depleted.</p>

            <button
              onClick={startFactorySession}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
            >
              <RotateCcw size={16} /> RETRY FACTORY PRODUCTION
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
