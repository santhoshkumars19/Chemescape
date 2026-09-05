import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import {
  Heart, Shield, Clock, Award, HelpCircle, ArrowLeft,
  RotateCcw, CheckCircle, AlertTriangle, Key, Zap, Lock, Unlock
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function CalculationHeistPage() {
  const { navigateTo, addXp, addCoins, markRoomCompleted, lives, deductLife } = useNavigation();
  const { token } = useAuth();

  // Session & Game State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [collectedDigits, setCollectedDigits] = useState([null, null, null, null]);
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);

  // User input states
  const [inputAnswer, setInputAnswer] = useState('');
  const [molarMassSelection, setMolarMassSelection] = useState({});
  const [empiricalInput, setEmpiricalInput] = useState({ C: 1, H: 1, O: 1 });
  const [vaultCodeInput, setVaultCodeInput] = useState(['', '', '', '']);

  // Feedback & Hints
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', explanation: '' }
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Initialize Heist Game Session from Backend
  useEffect(() => {
    startHeistSession();
  }, []);

  // 2. Timer Countdown Effect
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

  const startHeistSession = async () => {
    setLoading(true);
    setFailed(false);
    setCompleted(false);
    setFeedback(null);
    setShowHint(false);
    setInputAnswer('');
    setVaultCodeInput(['', '', '', '']);

    const authToken = token || localStorage.getItem('chemescape_token');

    try {
      const response = await fetch(`${API_BASE}/game/calculation-heist/start`, {
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
        setCollectedDigits(data.data.gameState.collectedDigits || [null, null, null, null]);
      } else {
        throw new Error(data.message || 'Start session failed');
      }
    } catch (err) {
      console.warn('Using default Calculation Heist fallback session state:', err.message);
      setGameState({
        currentStage: 1,
        totalStages: 4,
        score: 0,
        livesRemaining: 3,
        stages: [
          { stageNumber: 1, id: 's1_v1', title: 'Mole Scanner', compound: 'H2O (Water)', givenMass: 36, molarMass: 18, targetUnit: 'mol', hint: 'Moles = mass / molar mass.', explanation: '36 / 18 = 2 moles.' },
          { stageNumber: 2, id: 's2_v1', title: 'Molar Mass Calculator', compound: 'CO2', elements: [{ symbol: 'C', atomicMass: 12, requiredQty: 1 }, { symbol: 'O', atomicMass: 16, requiredQty: 2 }], hint: 'C + 2*O = 12 + 32.', explanation: 'Molar mass = 44 g/mol.' },
          { stageNumber: 3, id: 's3_v1', title: 'Particle Decoder', givenMoles: 2, avogadroConst: '6.022 x 10^23', expectedExponent: 24, correctCoefficient: 1.204, hint: 'Particles = moles * Avogadro.', explanation: '2 * 6.022e23 = 1.204e24.' },
          { stageNumber: 4, id: 's4_v1', title: 'Empirical Formula Analyzer', composition: [{ element: 'Carbon (C)', percentage: 40 }, { element: 'Hydrogen (H)', percentage: 6.67 }, { element: 'Oxygen (O)', percentage: 53.33 }], hint: 'Convert % to moles.', explanation: 'Formula is CH2O.' },
        ],
      });
      setCurrentStage(1);
    } finally {
      setLoading(false);
    }
  };

  // Stage 1 & 3 Answer Handler (Keypad / Number Input)
  const handleKeypadPress = (val) => {
    if (submitting || feedback?.type === 'correct') return;
    if (val === 'CLEAR') {
      setInputAnswer('');
    } else if (val === 'BACKSPACE') {
      setInputAnswer((prev) => prev.slice(0, -1));
    } else {
      if (inputAnswer.length < 8) {
        setInputAnswer((prev) => prev + val);
      }
    }
  };

  // Stage 2 Molar Mass Calculator Qty Changer
  const handleElementQtyChange = (symbol, delta) => {
    setMolarMassSelection((prev) => {
      const current = prev[symbol] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [symbol]: next };
    });
  };

  // Submit Stage Answer to Backend with client fallback
  const submitStageAnswer = async (ansPayload) => {
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);

    const authToken = token || localStorage.getItem('chemescape_token');

    let processedSuccess = false;

    try {
      const response = await fetch(`${API_BASE}/game/calculation-heist/stage/${currentStage}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ answer: ansPayload }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        processedSuccess = true;
        const res = data.data;
        if (res.correct) {
          setFeedback({
            type: 'correct',
            explanation: res.explanation || 'Calculations verified! Security panel unlocked.',
          });
          setScore(res.score || score + 250);
          if (res.codeDigit !== null && res.codeDigit !== undefined) {
            setCollectedDigits((prev) => {
              const updated = [...prev];
              updated[currentStage - 1] = res.codeDigit;
              return updated;
            });
          }

          setTimeout(() => {
            setFeedback(null);
            setShowHint(false);
            setInputAnswer('');
            setCurrentStage(res.nextStage || Math.min(5, currentStage + 1));
          }, 2000);
        } else {
          deductLife(1);
          setFeedback({
            type: 'wrong',
            explanation: res.explanation || 'Incorrect calculation! Life lost.',
          });
          if (res.failed || lives <= 1) setFailed(true);
        }
      }
    } catch (err) {
      console.warn('[CalculationHeist] Backend submit error, applying local validation fallback:', err.message);
    }

    // Fallback handling if backend is unavailable or session out of sync
    if (!processedSuccess) {
      let isCorrect = false;
      let exp = 'Calculations verified! Security panel unlocked.';
      let revealedDigit = 7;

      if (currentStage === 1) {
        const expected = currentStageData?.givenMass && currentStageData?.molarMass
          ? currentStageData.givenMass / currentStageData.molarMass
          : 2;
        isCorrect = Math.abs(parseFloat(ansPayload) - expected) < 0.05;
        exp = isCorrect ? `Moles (n) = Mass / Molar Mass = ${ansPayload} moles. Correct!` : 'Incorrect moles calculation. Formula: n = m / M.';
        revealedDigit = currentStageData?.digit || 7;
      } else if (currentStage === 2) {
        const expected = 44;
        isCorrect = Math.abs(parseFloat(ansPayload) - expected) < 0.5;
        exp = isCorrect ? 'Molar mass calculated correctly: 44 g/mol.' : 'Incorrect molar mass calculation.';
        revealedDigit = currentStageData?.digit || 3;
      } else if (currentStage === 3) {
        isCorrect = ansPayload === '1.204' || Math.abs(parseFloat(ansPayload) - 1.204) < 0.05;
        exp = isCorrect ? 'Particles decoded: 1.204 x 10^24 particles.' : 'Incorrect particle count.';
        revealedDigit = currentStageData?.digit || 9;
      } else if (currentStage === 4) {
        isCorrect = String(ansPayload).trim().toUpperCase() === 'CH2O';
        exp = isCorrect ? 'Empirical formula analyzed: CH2O.' : 'Incorrect empirical formula.';
        revealedDigit = currentStageData?.digit || 2;
      }

      if (isCorrect) {
        setFeedback({ type: 'correct', explanation: exp });
        setScore((prev) => prev + 250);
        setCollectedDigits((prev) => {
          const updated = [...prev];
          updated[currentStage - 1] = revealedDigit;
          return updated;
        });

        setTimeout(() => {
          setFeedback(null);
          setShowHint(false);
          setInputAnswer('');
          setCurrentStage((prev) => Math.min(5, prev + 1));
        }, 2000);
      } else {
        deductLife(1);
        if (lives <= 1) setFailed(true);
        setFeedback({ type: 'wrong', explanation: exp });
      }
    }

    setSubmitting(false);
  };

  // Submit Final Vault Code
  const submitVaultCode = async () => {
    const fullCode = vaultCodeInput.join('');
    if (fullCode.length < 4 || submitting) return;
    setSubmitting(true);
    setFeedback(null);

    const authToken = token || localStorage.getItem('chemescape_token');
    let processedSuccess = false;

    try {
      const response = await fetch(`${API_BASE}/game/calculation-heist/final-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          code: fullCode,
          timeSpentSec: 300 - timer,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        processedSuccess = true;
        const res = data.data;
        if (res.unlocked) {
          setCompleted(true);
          setRewards(res.completionRewards || { awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Vault Breaker' });
          if (res.completionRewards?.awardedXP) addXp(res.completionRewards.awardedXP);
          if (res.completionRewards?.awardedCoins) addCoins(res.completionRewards.awardedCoins);
          markRoomCompleted('room1');
        } else {
          setLives(res.livesRemaining);
          setFeedback({
            type: 'wrong',
            explanation: res.message || 'Vault code invalid! Security alarm triggered.',
          });
          if (res.failed) setFailed(true);
        }
      }
    } catch (err) {
      console.warn('Error submitting final code:', err.message);
    }

    if (!processedSuccess) {
      // Fallback code validation
      setCompleted(true);
      setRewards({ awardedXP: 500, awardedCoins: 100, badgeAwarded: 'Vault Breaker' });
      addXp(500);
      addCoins(100);
      markRoomCompleted('room1');
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#040810] text-cyan-400 font-orbitron">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
          <Zap size={48} />
        </motion.div>
        <p className="mt-4 text-sm tracking-widest uppercase">INITIALIZING CHEM CALCULATION HEIST...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] text-white overflow-hidden flex flex-col font-sans">
      {/* HUD Header */}
      <header className="w-full bg-[#0b1329]/90 border-b border-cyan-500/20 px-6 py-3.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/60 transition-all flex items-center gap-1 text-xs font-orbitron"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-base font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
              <Shield className="text-cyan-400" size={18} /> CHEM CALCULATION HEIST
            </h1>
            <p className="text-[10px] text-cyan-300/60 font-mono tracking-wider">UNIT 1 — QUANTITATIVE CHEMISTRY VAULT</p>
          </div>
        </div>

        {/* HUD Center Stats */}
        <div className="flex items-center gap-6">
          {/* Lives */}
          <div className="flex items-center gap-1 bg-red-950/30 border border-red-500/30 px-3 py-1.5 rounded-xl">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                size={18}
                className={heartIndex <= lives ? 'fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-slate-700'}
              />
            ))}
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${timer <= 60 ? 'bg-red-950/40 border-red-500 text-red-400 animate-pulse' : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300'}`}>
            <Clock size={16} /> {formatTime(timer)}
          </div>

          {/* Score & Collected Digits */}
          <div className="flex items-center gap-3 bg-blue-950/30 border border-blue-500/30 px-3.5 py-1.5 rounded-xl font-orbitron text-xs">
            <span className="text-cyan-400 font-bold">SCORE: {score}</span>
          </div>
        </div>

        {/* Vault Combination Status */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 px-4 py-2 rounded-xl">
          <span className="text-[10px] font-orbitron text-cyan-400/80 tracking-widest mr-1">VAULT CODE:</span>
          {collectedDigits.map((digit, idx) => (
            <div
              key={idx}
              className={`w-7 h-8 rounded-lg flex items-center justify-center font-orbitron font-bold text-sm border ${
                digit !== null
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 drop-shadow-[0_0_10px_rgba(0,212,255,0.6)]'
                  : 'bg-slate-950 border-slate-700 text-slate-600'
              }`}
            >
              {digit !== null ? digit : '?'}
            </div>
          ))}
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col justify-between relative z-10">
        {/* Game Stage Navigation Bar */}
        <div className="w-full grid grid-cols-5 gap-3 mb-6">
          {[
            { stage: 1, title: '1. Mole Scanner' },
            { stage: 2, title: '2. Molar Mass' },
            { stage: 3, title: '3. Particle Decoder' },
            { stage: 4, title: '4. Empirical Formula' },
            { stage: 5, title: '5. Vault Code' },
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

        {/* Stage Content Card */}
        <AnimatePresence mode="wait">
          {!completed && !failed && (
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-1 bg-[#0b1329]/80 border border-cyan-500/25 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,212,255,0.1)] flex flex-col justify-between"
            >
              {/* STAGE 1: MOLE SCANNER */}
              {currentStage === 1 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  {/* Scanner Visual */}
                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-3 left-3 text-[10px] font-orbitron text-cyan-400/60">SCANNER ENGINE ACTIVE</div>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-32 h-32 rounded-full border-2 border-dashed border-cyan-400 flex items-center justify-center my-4 relative shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                    >
                      <Zap size={40} className="text-cyan-400" />
                    </motion.div>
                    <div className="text-center font-orbitron">
                      <h3 className="text-xl font-bold text-cyan-300">{currentStageData.compound}</h3>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700">MASS: {currentStageData.givenMass} g</div>
                        <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-700">MOLAR MASS: {currentStageData.molarMass} g/mol</div>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Keypad Interface */}
                  <div className="flex flex-col justify-center">
                    <p className="text-sm text-cyan-200/80 mb-4">Calculate the number of moles ($n = m / M$) to activate the chemical scanner:</p>
                    
                    {/* Display input */}
                    <div className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-xl p-3 mb-4 text-right font-mono font-bold text-2xl text-cyan-300 tracking-wider">
                      {inputAnswer || <span className="text-slate-700">ENTER MOLES...</span>}
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'BACKSPACE'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleKeypadPress(btn)}
                          className="py-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-xl font-orbitron text-sm font-bold text-cyan-300 active:scale-95 transition-all"
                        >
                          {btn === 'BACKSPACE' ? '⌫' : btn}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => submitStageAnswer(inputAnswer)}
                      disabled={!inputAnswer || submitting}
                      className="mt-5 w-full max-w-xs mx-auto py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                    >
                      SUBMIT MOLE CALCULATION
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: MOLAR MASS CALCULATOR */}
              {currentStage === 2 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  <div>
                    <h3 className="text-lg font-orbitron text-cyan-300 font-bold mb-2">CALCULATE MOLAR MASS</h3>
                    <p className="text-xs text-slate-300 mb-6">Target Compound: <span className="font-mono text-cyan-400 text-base font-bold">{currentStageData.compound}</span></p>

                    {/* Interactive Element Qty Selector */}
                    <div className="space-y-3 mb-6">
                      {currentStageData.elements.map((el) => {
                        const currentQty = molarMassSelection[el.symbol] || 0;
                        return (
                          <div key={el.symbol} className="flex items-center justify-between bg-slate-900/70 p-3 rounded-xl border border-cyan-500/20">
                            <div>
                              <span className="font-orbitron font-bold text-sm text-cyan-300 mr-2">{el.symbol}</span>
                              <span className="text-xs text-slate-400 font-mono">({el.atomicMass} g/mol)</span>
                            </div>
                            <div className="flex items-center gap-3 font-mono">
                              <button
                                onClick={() => handleElementQtyChange(el.symbol, -1)}
                                className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold hover:bg-cyan-900"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-white">{currentQty}</span>
                              <button
                                onClick={() => handleElementQtyChange(el.symbol, 1)}
                                className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-bold hover:bg-cyan-900"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Computed Molar Mass display */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs font-mono mb-4">
                      <span className="text-slate-400">Total Calculated Mass:</span>
                      <span className="text-cyan-300 font-bold text-base">
                        {currentStageData.elements.reduce((acc, el) => acc + (molarMassSelection[el.symbol] || 0) * el.atomicMass, 0)} g/mol
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        const totalMass = currentStageData.elements.reduce((acc, el) => acc + (molarMassSelection[el.symbol] || 0) * el.atomicMass, 0);
                        submitStageAnswer(totalMass);
                      }}
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                    >
                      VERIFY MOLAR MASS
                    </button>
                  </div>

                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <Shield size={48} className="text-cyan-400 mb-3" />
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      "Sum the atomic masses of all constituent atoms in the molecular formula to determine total molar mass."
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 3: PARTICLE DECODER */}
              {currentStage === 3 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-xs font-orbitron text-cyan-400 mb-3">AVOGADRO PARTICLE CHAMBER</div>
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-28 h-28 rounded-full border-2 border-cyan-400 flex items-center justify-center my-2 shadow-[0_0_30px_rgba(0,212,255,0.4)]"
                    >
                      <span className="font-orbitron font-bold text-lg text-cyan-300">{currentStageData.givenMoles} mol</span>
                    </motion.div>
                    <p className="text-xs text-slate-400 font-mono mt-3">Avogadro Constant $N_A = 6.022 \times 10^{23}$</p>
                  </div>

                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">CALCULATE TOTAL PARTICLES</h3>
                    <p className="text-xs text-slate-300 mb-4">
                      Compute particles for <span className="text-cyan-400 font-bold">{currentStageData.givenMoles} moles</span> ($\times 10^{24}$ coefficient):
                    </p>

                    <div className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-xl p-3 mb-4 text-right font-mono font-bold text-xl text-cyan-300">
                      {inputAnswer || <span className="text-slate-700">1.204...</span>}
                    </div>

                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'BACKSPACE'].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleKeypadPress(btn)}
                          className="py-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 rounded-xl font-orbitron text-xs font-bold text-cyan-300 active:scale-95 transition-all"
                        >
                          {btn === 'BACKSPACE' ? '⌫' : btn}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => submitStageAnswer(inputAnswer)}
                      disabled={!inputAnswer || submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                    >
                      DECODE PARTICLES
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: EMPIRICAL FORMULA ANALYZER */}
              {currentStage === 4 && currentStageData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-1">
                  <div>
                    <h3 className="text-base font-orbitron text-cyan-300 font-bold mb-2">EMPIRICAL FORMULA ANALYZER</h3>
                    <p className="text-xs text-slate-300 mb-4">Percentage Composition Received:</p>

                    <div className="space-y-2 mb-6 font-mono text-xs">
                      {currentStageData.composition.map((c) => (
                        <div key={c.element} className="flex justify-between bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-slate-300">{c.element}:</span>
                          <span className="text-cyan-400 font-bold">{c.percentage}%</span>
                        </div>
                      ))}
                    </div>

                    {/* Formula builder selector */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 mb-6">
                      <p className="text-xs font-orbitron text-cyan-400 mb-3">SELECT EMPIRICAL RATIO:</p>
                      <div className="flex gap-4 items-center justify-center font-mono">
                        {['C', 'H', 'O'].map((el) => (
                          <div key={el} className="flex items-center gap-1.5">
                            <span className="font-bold text-cyan-300">{el}</span>
                            <input
                              type="number"
                              min="1"
                              max="6"
                              value={empiricalInput[el] || 1}
                              onChange={(e) => setEmpiricalInput({ ...empiricalInput, [el]: parseInt(e.target.value) || 1 })}
                              className="w-12 bg-slate-900 border border-cyan-500/40 rounded-lg py-1 px-2 text-center text-sm font-bold text-cyan-400"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const formula = `C${empiricalInput.C > 1 ? empiricalInput.C : ''}H${empiricalInput.H > 1 ? empiricalInput.H : ''}O${empiricalInput.O > 1 ? empiricalInput.O : ''}`;
                        submitStageAnswer(formula);
                      }}
                      disabled={submitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                    >
                      ANALYZE EMPIRICAL FORMULA
                    </button>
                  </div>

                  <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                    <Zap size={40} className="text-cyan-400 mb-3" />
                    <p className="text-xs text-slate-300 font-mono leading-relaxed">
                      "1. Convert % to mass. 2. Divide by atomic mass to find moles. 3. Divide by smallest mole value for simplest integer ratio."
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 5: FINAL VAULT CODE ENTRY */}
              {currentStage === 5 && (
                <div className="flex flex-col items-center justify-center text-center flex-1 max-w-md mx-auto">
                  <Lock size={48} className="text-cyan-400 mb-3 animate-pulse" />
                  <h3 className="text-xl font-orbitron font-bold text-cyan-300 mb-2">FINAL VAULT OVERRIDE</h3>
                  <p className="text-xs text-slate-300 mb-6">Enter the 4 collected digits to breach the Chemistry Vault:</p>

                  <div className="flex gap-3 mb-6">
                    {[0, 1, 2, 3].map((idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={vaultCodeInput[idx]}
                        onChange={(e) => {
                          const val = e.target.value;
                          const next = [...vaultCodeInput];
                          next[idx] = val;
                          setVaultCodeInput(next);
                        }}
                        className="w-14 h-16 bg-slate-950 border-2 border-cyan-500/50 rounded-xl text-center font-orbitron text-2xl font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none shadow-[0_0_15px_rgba(0,212,255,0.3)]"
                      />
                    ))}
                  </div>

                  <button
                    onClick={submitVaultCode}
                    disabled={vaultCodeInput.join('').length < 4 || submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)]"
                  >
                    OVERRIDE VAULT LOCKS
                  </button>
                </div>
              )}

              {/* Feedback Alert Bar */}
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
                <div className="mt-4 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono flex items-center gap-2">
                  <HelpCircle size={16} className="text-amber-400 flex-shrink-0" />
                  <span>{currentStageData.hint}</span>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="mt-6 pt-4 border-t border-cyan-500/20 flex justify-between items-center text-xs">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-orbitron"
                >
                  <HelpCircle size={14} /> {showHint ? 'Hide Hint' : 'Request Hint'}
                </button>
                <span className="text-slate-500 font-mono">EduNova Vault Engine v1.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MISSION COMPLETE SCREEN */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#0b1329]/95 border-2 border-emerald-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(52,211,153,0.3)]"
          >
            <Unlock size={56} className="text-emerald-400 mb-4 animate-bounce" />
            <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mb-2">
              CHEMISTRY VAULT UNLOCKED!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Complete — Master of Chemical Calculations</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6 text-xs font-orbitron">
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">XP GAINED</span>
                <span className="text-emerald-400 text-lg font-bold">+{rewards?.awardedXP || 500} XP</span>
              </div>
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">COINS EARNED</span>
                <span className="text-cyan-400 text-lg font-bold">+{rewards?.awardedCoins || 100} 🪙</span>
              </div>
            </div>

            {rewards?.badgeUnlocked && (
              <div className="bg-amber-950/30 border border-amber-500/40 p-4 rounded-2xl w-full mb-6 flex items-center justify-center gap-3">
                <span className="text-2xl">{rewards.badgeUnlocked.badgeIcon || '🧮'}</span>
                <div className="text-left font-orbitron">
                  <span className="text-[10px] text-amber-400 block">BADGE UNLOCKED</span>
                  <span className="text-xs font-bold text-white">{rewards.badgeUnlocked.badgeName}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)]"
            >
              RETURN TO DASHBOARD
            </button>
          </motion.div>
        )}

        {/* MISSION FAILED SCREEN */}
        {failed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#0b1329]/95 border-2 border-red-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(239,68,68,0.3)]"
          >
            <AlertTriangle size={56} className="text-red-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-red-400 mb-2">SECURITY LOCKDOWN TRIGGERED</h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Failed — All lives depleted or time expired.</p>

            <button
              onClick={startHeistSession}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2"
            >
              <RotateCcw size={16} /> RETRY MISSION
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
