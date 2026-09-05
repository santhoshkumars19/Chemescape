import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import {
  Heart, Shield, Clock, Award, HelpCircle, ArrowLeft,
  RotateCcw, CheckCircle, AlertTriangle, Zap, Flame, Thermometer, Gauge, Activity
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HydrogenReactorPage() {
  const { navigateTo, addXp, addCoins, markRoomCompleted, lives, deductLife } = useNavigation();
  const { token } = useAuth();

  // Session & Game State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(480); // 8 minutes
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);

  // Stage 1 State
  const [neutrons, setNeutrons] = useState(1);
  const [sorting, setSorting] = useState({ '1H': 'Protium', '2H': 'Deuterium', '3H': 'Tritium' });

  // Stage 2 State
  const [selectedReactants, setSelectedReactants] = useState(['Zn', 'HCl']);
  const [selectedProducts, setSelectedProducts] = useState(['ZnCl2', 'H2']);

  // Stage 3 State
  const [stoich, setStoich] = useState({ h2: 2, o2: 1, h2o: 2 });

  // Stage 4 State
  const [selectedActions, setSelectedActions] = useState(['Open Safety Outlet', 'Cool Reactor']);

  // Stage 5 State (Final Reactor Sliders)
  const [temp, setTemp] = useState(70);
  const [pressure, setPressure] = useState(1.5);
  const [h2Flow, setH2Flow] = useState(50);
  const [o2Flow, setO2Flow] = useState(25);

  // Feedback & Hints
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startHydrogenSession();
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

  const startHydrogenSession = async () => {
    setLoading(true);
    setFailed(false);
    setCompleted(false);
    setFeedback(null);
    setShowHint(false);

    const authToken = token || localStorage.getItem('chemescape_token');

    try {
      const response = await fetch(`${API_BASE}/game/hydrogen-reactor/start`, {
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
      console.warn('Using default Hydrogen Reactor fallback state:', err.message);
      setGameState({
        currentStage: 1,
        totalStages: 5,
        score: 0,
        livesRemaining: 3,
        stages: [
          { stageNumber: 1, id: 'h1_v1', title: 'Isotope Analysis Unit', isotopeName: 'Deuterium (2H)', symbol: '2H', hint: 'Deuterium (2H) has 1 proton and 1 neutron.', explanation: '2H contains 1 proton and 1 neutron.' },
          { stageNumber: 2, id: 'h2_v1', title: 'Hydrogen Reaction Pipeline', targetReaction: 'Laboratory Preparation: Zn + 2HCl → ZnCl2 + H2', hint: 'Reactants: Zn and HCl. Products: ZnCl2 and H2.', explanation: 'Zinc reacts with hydrochloric acid to produce hydrogen gas.' },
          { stageNumber: 3, id: 'h3_v1', title: 'Hydrogen Fuel Cell Balancer', equationText: '_ H2 + _ O2 → _ H2O', hint: 'Balance: 2 H2 + 1 O2 → 2 H2O.', explanation: 'Balanced ratio: 2:1:2.' },
          { stageNumber: 4, id: 'h4_v1', title: 'Reactor Safety Protocols', dangerCondition: 'Thermal Overheat (Temp: 180°C, Pressure: 4.2 atm)', hint: 'Open safety outlet and activate cooling fans immediately.', explanation: 'Safety sequence disarmed core melt.' },
          { stageNumber: 5, id: 'h5_v1', title: 'Reactor Core Master Calibration', targetTemp: 75, targetPressure: 1.5, targetH2Flow: 50, targetO2Flow: 25, hint: 'Target: Temp=75°C, P=1.5atm, H2=50%, O2=25%.', explanation: 'Hydrogen Reactor stabilized!' },
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
          ? `${API_BASE}/game/hydrogen-reactor/final-submit`
          : `${API_BASE}/game/hydrogen-reactor/stage/${currentStage}/submit`;

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
            explanation: res.explanation || 'Reactor sub-system online!',
          });
          if (res.score) setScore(res.score);

          if (currentStage === 5 || res.completed) {
            setCompleted(true);
            setRewards(res.completionRewards || { awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Hydrogen Master' });
            if (res.completionRewards?.awardedXP) addXp(res.completionRewards.awardedXP);
            if (res.completionRewards?.awardedCoins) addCoins(res.completionRewards.awardedCoins);
            markRoomCompleted('room1');
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
            explanation: res.explanation || 'Reactor imbalance detected! Life lost.',
          });
          if (res.failed || lives <= 1) setFailed(true);
        }
      }
    } catch (err) {
      console.warn('Error submitting hydrogen stage answer:', err.message);
    }

    if (!processedSuccess) {
      setFeedback({
        type: 'correct',
        explanation: 'Reactor sub-system online!',
      });
      setScore((prev) => prev + 250);

      if (currentStage === 5) {
        setCompleted(true);
        setRewards({ awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Hydrogen Master' });
        addXp(500);
        addCoins(100);
        markRoomCompleted('room1');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] text-cyan-400 font-orbitron">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Flame size={52} />
        </motion.div>
        <p className="mt-4 text-sm tracking-widest uppercase text-cyan-300">STARTING HYDROGEN REACTOR FACILITY...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-hidden flex flex-col font-sans">
      {/* HUD Header */}
      <header className="w-full bg-[#082f49]/90 border-b border-cyan-500/20 px-6 py-3.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all flex items-center gap-1 text-xs font-orbitron"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-base font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400 flex items-center gap-2">
              <Flame className="text-cyan-400 animate-pulse" size={20} /> HYDROGEN REACTOR
            </h1>
            <p className="text-[10px] text-cyan-300/60 font-mono tracking-wider">UNIT 4 — HYDROGEN RESEARCH FACILITY</p>
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
            { stage: 1, title: '1. Isotope Scanner' },
            { stage: 2, title: '2. Reaction Pipeline' },
            { stage: 3, title: '3. Fuel Cell Sync' },
            { stage: 4, title: '4. Safety System' },
            { stage: 5, title: '5. Core Stabilization' },
          ].map((item) => (
            <div
              key={item.stage}
              className={`py-2 px-3 rounded-xl border text-center font-orbitron text-xs transition-all ${
                currentStage === item.stage
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
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
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 bg-[#082f49]/80 border border-cyan-500/25 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col justify-between"
            >
              {/* STAGE 1: ISOTOPE SCANNER & SORTING */}
              {currentStage === 1 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-orbitron text-cyan-400 mb-2">ISOTOPE SCANNER</span>
                    <div className="w-28 h-28 rounded-full border-2 border-cyan-400 flex flex-col items-center justify-center bg-cyan-950/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] my-2">
                      <span className="text-3xl font-orbitron font-bold text-white">{currentStageData.symbol}</span>
                      <span className="text-[10px] text-cyan-300 font-mono">{currentStageData.sampleName}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">ISOTOPE CHARACTERISTICS</h3>
                    <p className="text-xs text-slate-300 mb-4">Set neutron count for {currentStageData.symbol}:</p>

                    <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-cyan-500/30 mb-6">
                      <span className="text-xs font-mono text-cyan-300">Neutrons ($n$):</span>
                      <button
                        onClick={() => setNeutrons(Math.max(0, neutrons - 1))}
                        className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-lg text-white">{neutrons}</span>
                      <button
                        onClick={() => setNeutrons(neutrons + 1)}
                        className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => submitStageAnswer({ protons: 1, neutrons, sorting })}
                      disabled={submitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                    >
                      AUTHENTICATE ISOTOPE
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: HYDROGEN REACTION PIPELINE */}
              {currentStage === 2 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">HYDROGEN REACTION PIPELINE</h3>
                    <p className="text-xs text-slate-300 mb-4">Assemble the laboratory preparation of Hydrogen gas:</p>

                    <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/40 mb-6 flex items-center justify-center gap-3 font-mono text-base font-bold text-cyan-300">
                      <span>{selectedReactants.join(' + ') || 'Reactants'}</span>
                      <span className="text-slate-500">→</span>
                      <span>{selectedProducts.join(' + ') || 'Products'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="text-xs font-orbitron text-cyan-400 block mb-2">Reactants:</span>
                        <div className="flex gap-2">
                          {['Zn', 'HCl', 'H2O'].map((r) => (
                            <button
                              key={r}
                              onClick={() =>
                                setSelectedReactants(
                                  selectedReactants.includes(r)
                                    ? selectedReactants.filter((i) => i !== r)
                                    : [...selectedReactants, r]
                                )
                              }
                              className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold ${
                                selectedReactants.includes(r)
                                  ? 'bg-cyan-500/40 border-cyan-400 text-white'
                                  : 'bg-slate-950 border-slate-800 text-slate-400'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-orbitron text-cyan-400 block mb-2">Products:</span>
                        <div className="flex gap-2">
                          {['ZnCl2', 'H2', 'O2'].map((p) => (
                            <button
                              key={p}
                              onClick={() =>
                                setSelectedProducts(
                                  selectedProducts.includes(p)
                                    ? selectedProducts.filter((i) => i !== p)
                                    : [...selectedProducts, p]
                                )
                              }
                              className={`px-3 py-2 rounded-lg border text-xs font-mono font-bold ${
                                selectedProducts.includes(p)
                                  ? 'bg-cyan-500/40 border-cyan-400 text-white'
                                  : 'bg-slate-950 border-slate-800 text-slate-400'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ reactants: selectedReactants, products: selectedProducts })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    CONNECT REACTION PIPELINE
                  </button>
                </div>
              )}

              {/* STAGE 3: FUEL CELL SYNCHRONIZATION */}
              {currentStage === 3 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">FUEL CELL SYNCHRONIZATION</h3>
                    <p className="text-xs text-slate-300 mb-6">Balance the fuel cell reaction ($2\text{H}_2 + \text{O}_2 \rightarrow 2\text{H}_2\text{O}$):</p>

                    <div className="grid grid-cols-3 gap-4 mb-6 font-mono text-center">
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 block mb-2">$\text{H}_2$ Moles:</span>
                        <span className="text-xl font-bold text-white">{stoich.h2}</span>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 block mb-2">$\text{O}_2$ Moles:</span>
                        <span className="text-xl font-bold text-white">{stoich.o2}</span>
                      </div>
                      <div className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-xs text-cyan-400 block mb-2">$\text{H}_2\text{O}$ Moles:</span>
                        <span className="text-xl font-bold text-white">{stoich.h2o}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer(stoich)}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    SYNCHRONIZE FUEL CELL
                  </button>
                </div>
              )}

              {/* STAGE 4: HYDROGEN SAFETY SYSTEM */}
              {currentStage === 4 && currentStageData && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">HYDROGEN SAFETY SYSTEM</h3>
                    <p className="text-xs text-slate-300 mb-4">{currentStageData.hazardScenario}</p>

                    <div className="space-y-3 mb-6">
                      {currentStageData.availableActions.map((act) => {
                        const checked = selectedActions.includes(act);
                        return (
                          <div
                            key={act}
                            onClick={() =>
                              setSelectedActions(
                                checked
                                  ? selectedActions.filter((a) => a !== act)
                                  : [...selectedActions, act]
                              )
                            }
                            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer font-orbitron text-xs font-bold transition-all ${
                              checked
                                ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span>{act}</span>
                            {checked && <CheckCircle size={16} className="text-cyan-400" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ actions: selectedActions })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  >
                    EXECUTE SAFETY CONTROLS
                  </button>
                </div>
              )}

              {/* STAGE 5: FINAL CORE STABILIZATION */}
              {currentStage === 5 && (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">STABILIZE HYDROGEN REACTOR CORE</h3>
                    <p className="text-xs text-slate-300 mb-6">Adjust reactor sliders into target safe ranges (Temp: 60-80°C, Press: 1.0-2.0 bar, H₂: 40-60%, O₂: 20-30%):</p>

                    <div className="grid grid-cols-2 gap-4 mb-6 font-mono text-xs">
                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-cyan-400 block mb-1">Temperature (°C): {temp}°C</span>
                        <input
                          type="range"
                          min="40"
                          max="120"
                          value={temp}
                          onChange={(e) => setTemp(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-cyan-400 block mb-1">Pressure (bar): {pressure} bar</span>
                        <input
                          type="range"
                          min="0.5"
                          max="5.0"
                          step="0.1"
                          value={pressure}
                          onChange={(e) => setPressure(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-cyan-400 block mb-1">$\text{H}_2$ Flow (%): {h2Flow}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={h2Flow}
                          onChange={(e) => setH2Flow(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>

                      <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30">
                        <span className="text-cyan-400 block mb-1">$\text{O}_2$ Flow (%): {o2Flow}%</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={o2Flow}
                          onChange={(e) => setO2Flow(parseFloat(e.target.value))}
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitStageAnswer({ temp, pressure, h2Flow, o2Flow })}
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                  >
                    ACTIVATE HYDROGEN REACTOR
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
                <span className="text-slate-500 font-mono">Hydrogen Reactor Engine v4.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MISSION COMPLETE */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#082f49]/95 border-2 border-cyan-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(6,182,212,0.3)]"
          >
            <Flame size={56} className="text-cyan-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 mb-2">
              HYDROGEN REACTOR ONLINE!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Complete — Hydrogen Reactor Engineer</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6 text-xs font-orbitron">
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">XP GAINED</span>
                <span className="text-cyan-400 text-lg font-bold">+{rewards?.awardedXP || 800} XP</span>
              </div>
              <div className="bg-sky-950/30 border border-sky-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">COINS EARNED</span>
                <span className="text-sky-400 text-lg font-bold">+{rewards?.awardedCoins || 160} 🪙</span>
              </div>
            </div>

            {rewards?.badgeUnlocked && (
              <div className="bg-cyan-950/30 border border-cyan-500/40 p-4 rounded-2xl w-full mb-6 flex items-center justify-center gap-3">
                <span className="text-2xl">{rewards.badgeUnlocked.badgeIcon || '🔋'}</span>
                <div className="text-left font-orbitron">
                  <span className="text-[10px] text-cyan-400 block">BADGE UNLOCKED</span>
                  <span className="text-xs font-bold text-white">{rewards.badgeUnlocked.badgeName}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
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
            className="flex-1 bg-[#082f49]/95 border-2 border-red-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(239,68,68,0.3)]"
          >
            <AlertTriangle size={56} className="text-red-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-red-400 mb-2">REACTOR CORE MELTDOWN</h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Failed — Reactor stability lost.</p>

            <button
              onClick={startHydrogenSession}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
            >
              <RotateCcw size={16} /> RETRY SIMULATION
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
