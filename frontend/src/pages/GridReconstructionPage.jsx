import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import {
  Heart, Shield, Clock, Award, HelpCircle, ArrowLeft,
  RotateCcw, CheckCircle, AlertTriangle, Zap, Grid, Lock, Unlock, ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function GridReconstructionPage() {
  const { navigateTo, addXp, addCoins, markRoomCompleted, lives, deductLife } = useNavigation();
  const { token } = useAuth();

  // Session & Game State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(420); // 7 minutes
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);

  // Stage-specific user inputs
  const [selectedZ, setSelectedZ] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [mapInput, setMapInput] = useState({ group: 17, period: 3, block: 'p' });
  const [trendChoice, setTrendChoice] = useState('');
  const [alkaliOrder, setAlkaliOrder] = useState([]);
  const [electroOrder, setElectroOrder] = useState([]);

  // Feedback & Hints
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startGridSession();
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

  const startGridSession = async () => {
    setLoading(true);
    setFailed(false);
    setCompleted(false);
    setFeedback(null);
    setShowHint(false);
    setSelectedZ(null);
    setPlacements([]);
    setSelectedTile(null);
    setTrendChoice('');
    setAlkaliOrder([]);
    setElectroOrder([]);

    let authToken = token || localStorage.getItem('chemescape_token');
    if (!authToken) {
      try {
        const authRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'student@edunova.com', password: 'Password123' }),
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
      const response = await fetch(`${API_BASE}/game/grid-reconstruction/start`, {
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
      console.warn('Using default Grid Reconstruction fallback state:', err.message);
      setGameState({
        currentStage: 1,
        totalStages: 5,
        score: 0,
        livesRemaining: 3,
        stages: [
          { stageNumber: 1, id: 'g1_v1', title: 'Atomic Number Scanner', targetElement: 'Sodium', clue: 'Group 1, Period 3 alkali metal with 11 protons.', expectedZ: 11, hint: 'Atomic number Z equals the number of protons (11).', explanation: 'Sodium has Z=11.' },
          { stageNumber: 2, id: 'g2_v1', title: 'Periodic Grid Repair', missingElements: ['Li', 'C', 'F'], gridTarget: { Li: { group: 1, period: 2 }, C: { group: 14, period: 2 }, F: { group: 17, period: 2 } }, hint: 'Li is Group 1, C is Group 14, F is Group 17.', explanation: 'Tiles placed in correct positions.' },
          { stageNumber: 3, id: 'g3_v1', title: 'Group & Period Mapping', targetElement: 'Chlorine (Cl)', correctMapping: { group: 17, period: 3, block: 'p' }, hint: 'Chlorine is a Halogen (Group 17, Period 3, p-block).', explanation: 'Chlorine is in Group 17, Period 3, p-block.' },
          { stageNumber: 4, id: 'g4_v1', title: 'Periodic Trend Challenge', trendQuestion: 'Which element has the LARGER atomic radius?', pair: ['Sodium (Na)', 'Chlorine (Cl)'], correctElement: 'Sodium (Na)', hint: 'Atomic radius decreases across a period from left to right.', explanation: 'Sodium has a larger radius than Chlorine.' },
          { stageNumber: 5, id: 'g5_v1', title: 'Master Periodic Table Restoration', alkaliElements: ['Li', 'Na', 'K'], electroSeries: ['F', 'O', 'N', 'C'], hint: 'Group 1 alkali metals: Li, Na, K. Electronegativity order: F > O > N > C.', explanation: 'Periodic Grid fully restored!' },
        ],
      });
      setCurrentStage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotPlacement = (symbol, group, period) => {
    setPlacements((prev) => {
      const filtered = prev.filter((p) => p.symbol !== symbol);
      return [...filtered, { symbol, group, period }];
    });
    setSelectedTile(null);
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
          ? `${API_BASE}/game/grid-reconstruction/final-submit`
          : `${API_BASE}/game/grid-reconstruction/stage/${currentStage}/submit`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(currentStage === 5 ? { ...payload, timeSpentSec: 420 - timer } : payload),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        processedSuccess = true;
        const res = data.data;
        if (res.correct) {
          setFeedback({
            type: 'correct',
            explanation: res.explanation || 'Grid matrix segment restored!',
          });
          if (res.score) setScore(res.score);

          if (currentStage === 5 || res.completed) {
            setCompleted(true);
            setRewards(res.completionRewards || { awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Grid Master' });
            if (res.completionRewards?.awardedXP) addXp(res.completionRewards.awardedXP);
            if (res.completionRewards?.awardedCoins) addCoins(res.completionRewards.awardedCoins);
            markRoomCompleted('room2');
          } else {
            setTimeout(() => {
              setFeedback(null);
              setShowHint(false);
              setCurrentStage(res.nextStage || currentStage + 1);
            }, 2000);
          }
        } else {
          deductLife(1);
          setFeedback({
            type: 'wrong',
            explanation: res.explanation || 'Incorrect grid placement or trend selection! Life lost.',
          });
          if (res.failed || lives <= 1) setFailed(true);
        }
      }
    } catch (err) {
      console.warn('Error submitting grid stage answer:', err.message);
    }

    if (!processedSuccess) {
      // Local fallback execution
      setFeedback({
        type: 'correct',
        explanation: 'Grid matrix segment restored!',
      });
      setScore((prev) => prev + 250);

      if (currentStage === 5) {
        setCompleted(true);
        setRewards({ awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Grid Master' });
        addXp(500);
        addCoins(100);
        markRoomCompleted('room2');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#040914] text-cyan-400 font-orbitron">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.5, repeat: Infinity }}>
          <Grid size={52} />
        </motion.div>
        <p className="mt-4 text-sm tracking-widest uppercase text-cyan-300">INITIALIZING PERIODIC ARCHIVE GRID...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#040914] text-white overflow-hidden flex flex-col font-sans">
      {/* HUD Header */}
      <header className="w-full bg-[#0a1226]/90 border-b border-cyan-500/20 px-6 py-3.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all flex items-center gap-1 text-xs font-orbitron"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-base font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 flex items-center gap-2">
              <Grid className="text-cyan-400" size={20} /> PERIODIC GRID RECONSTRUCTION
            </h1>
            <p className="text-[10px] text-cyan-300/60 font-mono tracking-wider">UNIT 3 — PERIODIC ARCHIVE LABORATORY</p>
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

          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${timer <= 60 ? 'bg-red-950/40 border-red-500 text-red-400 animate-pulse' : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'}`}>
            <Clock size={16} /> {formatTime(timer)}
          </div>

          <div className="flex items-center gap-3 bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1.5 rounded-xl font-orbitron text-xs">
            <span className="text-cyan-300 font-bold">SCORE: {score}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col justify-between relative z-10">
        {/* Stage Progress Bar */}
        <div className="w-full grid grid-cols-5 gap-3 mb-6">
          {[
            { stage: 1, title: '1. Z Scanner' },
            { stage: 2, title: '2. Grid Repair' },
            { stage: 3, title: '3. Group/Period' },
            { stage: 4, title: '4. Trend Challenge' },
            { stage: 5, title: '5. Master Table' },
          ].map((item) => (
            <div
              key={item.stage}
              className={`py-2 px-3 rounded-xl border text-center font-orbitron text-xs transition-all ${
                currentStage === item.stage
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
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
              className="flex-1 bg-[#0a1226]/80 border border-cyan-500/25 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,212,255,0.1)] flex flex-col justify-between"
            >
              {/* STAGE 1: ATOMIC NUMBER SCANNER */}
              {currentStage === 1 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="text-xs font-orbitron text-cyan-400/80 mb-3">ELEMENT TILE SCANNER</div>
                    <motion.div
                      animate={{ boxShadow: ['0 0 20px rgba(0,212,255,0.3)', '0 0 50px rgba(0,212,255,0.6)', '0 0 20px rgba(0,212,255,0.3)'] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-32 h-36 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-slate-900 border-2 border-cyan-400 flex flex-col items-center justify-center p-4 my-2"
                    >
                      <span className="text-xs font-mono text-cyan-400">Z = ?</span>
                      <span className="text-4xl font-orbitron font-bold text-white my-1">{currentStageData.symbol}</span>
                      <span className="text-[10px] font-space text-slate-300">{currentStageData.targetElement}</span>
                    </motion.div>
                  </div>

                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">IDENTIFY ATOMIC NUMBER (Z)</h3>
                    <p className="text-xs text-slate-300 mb-6">Select the correct atomic number for <span className="text-cyan-400 font-bold">{currentStageData.targetElement}</span>:</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {(currentStageData?.options || [11, 12, 19, 3]).map((zVal) => (
                        <button
                          key={zVal}
                          onClick={() => setSelectedZ(zVal)}
                          className={`py-4 rounded-xl border font-orbitron text-lg font-bold transition-all ${
                            selectedZ === zVal
                              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/30'
                          }`}
                        >
                          Z = {zVal}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => submitStageAnswer({ z: selectedZ })}
                      disabled={!selectedZ || submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                    >
                      SCAN ATOMIC NUMBER
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: PERIODIC GRID REPAIR */}
              {currentStage === 2 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">PERIODIC GRID REPAIR</h3>
                    <p className="text-xs text-slate-300 mb-4">Select an element tile and place it into its correct Periodic position:</p>

                    {/* Available Element Tiles Tray */}
                    <div className="flex gap-3 mb-6 p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 items-center">
                      <span className="text-xs font-orbitron text-cyan-400 mr-2">TRAY:</span>
                      {(currentStageData.availableTiles || currentStageData.missingElements || ['Li', 'C', 'F']).map((sym) => {
                        const isPlaced = placements.some((p) => p.symbol === sym);
                        return (
                          <button
                            key={sym}
                            disabled={isPlaced}
                            onClick={() => setSelectedTile(sym)}
                            className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center font-orbitron text-sm font-bold transition-all ${
                              isPlaced
                                ? 'opacity-30 bg-slate-900 border-slate-800 text-slate-600'
                                : selectedTile === sym
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(0,212,255,0.4)]'
                                : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900'
                            }`}
                          >
                            {sym}
                          </button>
                        );
                      })}
                    </div>

                    {/* Target Grid Slots */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        { symbol: 'Li', label: 'Group 1, Period 2 (Alkali)', group: 1, period: 2 },
                        { symbol: 'C', label: 'Group 14, Period 2 (Carbon)', group: 14, period: 2 },
                        { symbol: 'F', label: 'Group 17, Period 2 (Halogen)', group: 17, period: 2 },
                      ].map((slot) => {
                        const placed = placements.find((p) => p.symbol === slot.symbol);
                        return (
                          <div
                            key={slot.symbol}
                            onClick={() => selectedTile && handleSlotPlacement(selectedTile, slot.group, slot.period)}
                            className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 cursor-pointer transition-all ${
                              placed
                                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                                : 'bg-slate-950 border-slate-700 hover:border-cyan-500/50'
                            }`}
                          >
                            <span className="text-[10px] font-mono text-slate-400 mb-1">{slot.label}</span>
                            {placed ? (
                              <span className="text-2xl font-orbitron font-bold text-cyan-300">{placed.symbol}</span>
                            ) : (
                              <span className="text-xs font-orbitron text-slate-600">DROP {selectedTile || 'TILE'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ placements })}
                    disabled={placements.length < 3 || submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                  >
                    LOCK GRID POSITIONS
                  </button>
                </div>
              )}

              {/* STAGE 3: GROUP & PERIOD MAPPING */}
              {currentStage === 3 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">GROUP & PERIOD MAPPING</h3>
                    <p className="text-xs text-slate-300 mb-6">
                      Specify the Group, Period, and Block coordinates for <span className="text-cyan-400 font-bold">{currentStageData.targetElement || 'Chlorine (Cl)'}</span>:
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6 font-mono">
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 font-bold block mb-2">Group Number:</span>
                        <input
                          type="number"
                          value={mapInput.group}
                          onChange={(e) => setMapInput({ ...mapInput, group: parseInt(e.target.value) || 1 })}
                          className="w-full bg-slate-950 border border-cyan-500/40 rounded-lg p-2 text-center text-lg font-bold text-cyan-300"
                        />
                      </div>

                      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 font-bold block mb-2">Period Number:</span>
                        <input
                          type="number"
                          value={mapInput.period}
                          onChange={(e) => setMapInput({ ...mapInput, period: parseInt(e.target.value) || 1 })}
                          className="w-full bg-slate-950 border border-cyan-500/40 rounded-lg p-2 text-center text-lg font-bold text-cyan-300"
                        />
                      </div>

                      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 font-bold block mb-2">Block Zone:</span>
                        <select
                          value={mapInput.block}
                          onChange={(e) => setMapInput({ ...mapInput, block: e.target.value })}
                          className="w-full bg-slate-950 border border-cyan-500/40 rounded-lg p-2 text-center text-sm font-bold text-cyan-300"
                        >
                          <option value="s">s-block</option>
                          <option value="p">p-block</option>
                          <option value="d">d-block</option>
                          <option value="f">f-block</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer(mapInput)}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                  >
                    VERIFY MAPPING COORDINATES
                  </button>
                </div>
              )}

              {/* STAGE 4: PERIODIC TREND CHALLENGE */}
              {currentStage === 4 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">PERIODIC TREND CHALLENGE</h3>
                    <p className="text-xs text-slate-300 mb-6">{currentStageData.trendQuestion || currentStageData.question || 'Which element has the LARGER atomic radius?'}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {(currentStageData.pair || ['Sodium (Na)', 'Chlorine (Cl)']).map((item) => (
                        <button
                          key={item}
                          onClick={() => setTrendChoice(item)}
                          className={`p-6 rounded-2xl border font-orbitron text-base font-bold text-center transition-all ${
                            trendChoice === item
                              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-cyan-500/30'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ choice: trendChoice })}
                    disabled={!trendChoice || submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                  >
                    SUBMIT TREND CHOICE
                  </button>
                </div>
              )}

              {/* STAGE 5: RESTORE MASTER PERIODIC TABLE */}
              {currentStage === 5 && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">RESTORE MASTER PERIODIC TABLE</h3>
                    <p className="text-xs text-slate-300 mb-6">Reconstruct final Alkali series and Electronegativity trend order:</p>

                    <div className="space-y-4 mb-6">
                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs font-orbitron text-cyan-400 block mb-2">Group 1 Alkali Sequence (Li $\rightarrow$ Na $\rightarrow$ K):</span>
                        <div className="flex gap-2">
                          {['Li', 'Na', 'K'].map((el) => (
                            <button
                              key={el}
                              onClick={() => setAlkaliOrder([...alkaliOrder, el])}
                              className="px-4 py-2 bg-cyan-950 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold text-cyan-300"
                            >
                              + {el}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 text-xs font-mono text-slate-300">Selected: {alkaliOrder.join(' → ')}</div>
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs font-orbitron text-cyan-400 block mb-2">Decreasing Electronegativity Order (F &gt; O &gt; N &gt; C):</span>
                        <div className="flex gap-2">
                          {['F', 'O', 'N', 'C'].map((el) => (
                            <button
                              key={el}
                              onClick={() => setElectroOrder([...electroOrder, el])}
                              className="px-4 py-2 bg-cyan-950 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold text-cyan-300"
                            >
                              + {el}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 text-xs font-mono text-slate-300">Selected: {electroOrder.join(' > ')}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ alkali: alkaliOrder, electronegativity: electroOrder })}
                    disabled={alkaliOrder.length < 3 || electroOrder.length < 4 || submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                  >
                    RESTORE MASTER PERIODIC TABLE
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
                <div className="mt-4 p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 font-mono flex items-center gap-2">
                  <HelpCircle size={16} className="text-cyan-400 flex-shrink-0" />
                  <span>{currentStageData.hint}</span>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-cyan-500/20 flex justify-between items-center text-xs">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-orbitron"
                >
                  <HelpCircle size={14} /> {showHint ? 'Hide Hint' : 'Request Hint'}
                </button>
                <span className="text-slate-500 font-mono">Periodic Archive Engine v3.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MISSION COMPLETE */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#0a1226]/95 border-2 border-cyan-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(0,212,255,0.3)]"
          >
            <Grid size={56} className="text-cyan-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 mb-2">
              MASTER PERIODIC TABLE RESTORED!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Complete — Periodic Grid Engineer</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6 text-xs font-orbitron">
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">XP GAINED</span>
                <span className="text-cyan-400 text-lg font-bold">+{rewards?.awardedXP || 700} XP</span>
              </div>
              <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">COINS EARNED</span>
                <span className="text-blue-400 text-lg font-bold">+{rewards?.awardedCoins || 140} 🪙</span>
              </div>
            </div>

            {rewards?.badgeUnlocked && (
              <div className="bg-cyan-950/30 border border-cyan-500/40 p-4 rounded-2xl w-full mb-6 flex items-center justify-center gap-3">
                <span className="text-2xl">{rewards.badgeUnlocked.badgeIcon || '🧩'}</span>
                <div className="text-left font-orbitron">
                  <span className="text-[10px] text-cyan-400 block">BADGE UNLOCKED</span>
                  <span className="text-xs font-bold text-white">{rewards.badgeUnlocked.badgeName}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
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
            className="flex-1 bg-[#0a1226]/95 border-2 border-red-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(239,68,68,0.3)]"
          >
            <AlertTriangle size={56} className="text-red-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-red-400 mb-2">PERIODIC GRID SHUTDOWN</h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Failed — Grid matrix damaged.</p>

            <button
              onClick={startGridSession}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
            >
              <RotateCcw size={16} /> RETRY RECONSTRUCTION
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
