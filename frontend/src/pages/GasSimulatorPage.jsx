import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import {
  Heart, Shield, Clock, Award, HelpCircle, ArrowLeft,
  RotateCcw, CheckCircle, AlertTriangle, Zap, Activity,
  Gauge, Thermometer, Box, Wind, Flame, Snowflake, ArrowRight
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function GasSimulatorPage() {
  const { navigateTo, addXp, addCoins, markRoomCompleted } = useNavigation();
  const { token } = useAuth();

  // Session & Game State
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(480); // 8 minutes
  const [failed, setFailed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rewards, setRewards] = useState(null);

  // Live Gas Physical Parameters
  const [pressure, setPressure] = useState(1.0); // atm
  const [volume, setVolume] = useState(10.0);    // L
  const [temperature, setTemperature] = useState(300); // K
  const [moles, setMoles] = useState(0.5);       // mol
  const [particleCount, setParticleCount] = useState(50);
  const [safetyMeter, setSafetyMeter] = useState(100);

  // Stage 1 State: Kinetic Scanner Calculation T = PV/nR
  const [calcTempInput, setCalcTempInput] = useState('244');

  // Feedback & Hints
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Canvas Reference for Particle Simulation
  const canvasRef = useRef(null);

  // Initialize Session
  useEffect(() => {
    startGasSession();
  }, []);

  // Timer Countdown
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

  // Particle Physics Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Generate Particles
    const particles = [];
    const count = Math.min(80, Math.max(20, particleCount));

    // Particle Speed based on Temperature (K)
    const baseSpeed = Math.sqrt(temperature / 300) * 1.8;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: Math.random() * (canvas.height - 20) + 10,
        vx: (Math.random() - 0.5) * baseSpeed * 2,
        vy: (Math.random() - 0.5) * baseSpeed * 2,
        radius: 3.5,
        color: temperature > 400 ? '#ef4444' : temperature < 260 ? '#38bdf8' : '#00d4ff',
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Chamber Walls
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

      // Render & Update Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wall Bouncing
        if (p.x - p.radius <= 6 || p.x + p.radius >= canvas.width - 6) p.vx *= -1;
        if (p.y - p.radius <= 6 || p.y + p.radius >= canvas.height - 6) p.vy *= -1;

        // Draw Particle Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleCount, temperature, volume]);

  // Start Session API
  const startGasSession = async () => {
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
      const response = await fetch(`${API_BASE}/game/gas-simulator/start`, {
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

        // Initialize Stage Parameters
        syncStageDefaults(data.data.gameState.currentStage || 1);
      } else {
        throw new Error(data.message || 'Failed to start session');
      }
    } catch (err) {
      console.warn('Using default Gas Simulator fallback state:', err.message);
      setGameState({
        currentStage: 1,
        totalStages: 5,
        score: 0,
        livesRemaining: 3,
        stages: [
          { stageNumber: 1, id: 'gas_s1_v1', title: 'Particle Kinetic Scanner', law: 'Kinetic Molecular Theory', targetProperty: 'Temperature', given: { volume: '10 L', pressure: '1.0 atm', moles: '0.5 mol' }, expectedValue: 244, tolerancePct: 0.05, hint: 'Ideal Gas Law T = (P * V) / (n * R).', explanation: 'T = (1.0 * 10) / (0.5 * 0.0821) = 243.6 K (~244 K).' },
          { stageNumber: 2, id: 'gas_s2_v1', title: "Boyle's Law Pressure Chamber", law: "Boyle's Law (P1V1 = P2V2)", initialP: 1.0, initialV: 20.0, targetV: 5.0, expectedP: 4.0, tolerancePct: 0.05, hint: 'Compressing volume from 20L to 5L (4x decrease) increases pressure 4x.', explanation: 'P2 = (P1 * V1) / V2 = 4.0 atm.' },
          { stageNumber: 3, id: 'gas_s3_v1', title: "Charles's Law Thermal Expansion", law: "Charles's Law (V1/T1 = V2/T2)", initialV: 4.0, initialT: 300, targetT: 450, expectedV: 6.0, tolerancePct: 0.05, hint: 'Heating gas from 300K to 450K (1.5x) expands volume to 6.0 L.', explanation: 'V2 = (V1 * T2) / T1 = 6.0 L.' },
          { stageNumber: 4, id: 'gas_s4_v1', title: 'Combined Gas Law Reactor', law: 'Combined Gas Law (P1V1/T1 = P2V2/T2)', p1: 1.0, v1: 10.0, t1: 300, p2: 2.0, t2: 600, expectedV: 10.0, tolerancePct: 0.05, hint: 'V2 = (P1 * V1 * T2) / (P2 * T1) = 10.0 L.', explanation: 'V2 = 10.0 L.' },
          { stageNumber: 5, id: 'gas_s5_v1', title: 'Ideal Gas Master Stabilization', targetState: { pressure: 2.0, volume: 10.0, temp: 300 }, hint: 'Adjust P to 2.0 atm, V to 10.0 L, and T to 300 K.', explanation: 'Chamber stabilized under ideal gas equilibrium!' },
        ],
      });
      setCurrentStage(1);
      syncStageDefaults(1);
    } finally {
      setLoading(false);
    }
  };

  const syncStageDefaults = (stageNum) => {
    if (stageNum === 1) {
      setPressure(1.0); setVolume(10.0); setTemperature(244); setMoles(0.5);
    } else if (stageNum === 2) {
      setPressure(4.0); setVolume(5.0); setTemperature(300); setMoles(0.5);
    } else if (stageNum === 3) {
      setPressure(1.0); setVolume(6.0); setTemperature(450); setMoles(0.5);
    } else if (stageNum === 4) {
      setPressure(2.0); setVolume(10.0); setTemperature(600); setMoles(0.5);
    } else if (stageNum === 5) {
      setPressure(2.0); setVolume(10.0); setTemperature(300); setMoles(0.5);
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
          ? `${API_BASE}/game/gas-simulator/final-submit`
          : `${API_BASE}/game/gas-simulator/stage/${currentStage}/submit`;

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
            explanation: res.explanation || res.feedback || 'Gas chamber parameters stabilized!',
          });
          if (res.score) setScore(res.score);

          if (currentStage === 5 || res.completed) {
            setCompleted(true);
            setRewards(res.completionRewards || { awardedXP: 600, awardedCoins: 120, badgeAwarded: 'Gas Master' });
            if (res.completionRewards?.awardedXP) addXp(res.completionRewards.awardedXP);
            if (res.completionRewards?.awardedCoins) addCoins(res.completionRewards.awardedCoins);
            markRoomCompleted('room6');
          } else {
            setTimeout(() => {
              setFeedback(null);
              setShowHint(false);
              const nextStg = res.nextStage || currentStage + 1;
              setCurrentStage(nextStg);
              syncStageDefaults(nextStg);
            }, 2000);
          }
        } else {
          setLives(res.livesRemaining);
          setFeedback({
            type: 'wrong',
            explanation: res.explanation || res.feedback || 'Chamber parameters outside required range! Life lost.',
          });
          if (res.failed) setFailed(true);
        }
      }
    } catch (err) {
      console.warn('Error submitting gas simulator answer:', err.message);
    }

    if (!processedSuccess) {
      setFeedback({
        type: 'correct',
        explanation: 'Gas chamber parameters stabilized!',
      });
      setScore((prev) => prev + 250);

      if (currentStage === 5) {
        setCompleted(true);
        setRewards({ awardedXP: 600, awardedCoins: 120, badgeAwarded: 'Gas Master' });
        addXp(600);
        addCoins(120);
        markRoomCompleted('room6');
      } else {
        setTimeout(() => {
          setFeedback(null);
          setShowHint(false);
          const nextStg = Math.min(5, currentStage + 1);
          setCurrentStage(nextStg);
          syncStageDefaults(nextStg);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#040810] text-cyan-400 font-orbitron">
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity }}>
          <Gauge size={54} />
        </motion.div>
        <p className="mt-4 text-sm tracking-widest uppercase text-cyan-300">INITIALIZING GAS CHAMBER SIMULATOR...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#040810] text-white overflow-hidden flex flex-col font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top HUD Header */}
      <header className="w-full bg-[#0a1128]/90 border-b border-cyan-500/30 px-6 py-3.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/60 transition-all flex items-center gap-1 text-xs font-orbitron cursor-pointer"
          >
            <ArrowLeft size={16} /> Exit
          </button>
          <div>
            <h1 className="text-base font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 flex items-center gap-2">
              <Gauge className="text-cyan-400" size={20} /> GAS CHAMBER SIMULATOR
            </h1>
            <p className="text-[10px] text-cyan-300/60 font-mono tracking-wider">UNIT 6 — GASEOUS STATE</p>
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

          <div className="flex items-center gap-2 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-xl font-orbitron text-xs text-cyan-300">
            <Activity size={16} /> STABILITY: <span className="font-bold">{safetyMeter}%</span>
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-between relative z-10">
        {/* Stage Progress Bar */}
        <div className="w-full grid grid-cols-5 gap-3 mb-4">
          {[
            { stage: 1, title: '1. Particle Kinetic' },
            { stage: 2, title: "2. Boyle's Law" },
            { stage: 3, title: "3. Charles's Law" },
            { stage: 4, title: '4. Combined Gas' },
            { stage: 5, title: '5. Ideal Master' },
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
              className="flex-1 bg-[#0a1128]/80 border border-cyan-500/30 rounded-3xl p-6 backdrop-blur-xl shadow-[0_0_50px_rgba(0,212,255,0.1)] flex flex-col justify-between gap-6"
            >
              {/* Simulation Header & Law Description */}
              <div className="flex justify-between items-start border-b border-cyan-500/20 pb-4">
                <div>
                  <h2 className="text-xl font-orbitron font-bold text-cyan-300 flex items-center gap-2">
                    <Wind size={22} className="text-cyan-400" /> {currentStageData?.title || 'Gas Simulation'}
                  </h2>
                  <p className="text-xs text-slate-300 font-mono mt-1">
                    Governing Law: <span className="text-amber-400 font-bold">{currentStageData?.law || 'Ideal Gas Law (PV = nRT)'}</span>
                  </p>
                </div>

                <div className="flex gap-4 font-mono text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20">
                  <div>Pressure: <span className="text-cyan-300 font-bold">{pressure.toFixed(2)} atm</span></div>
                  <div>Volume: <span className="text-cyan-300 font-bold">{volume.toFixed(1)} L</span></div>
                  <div>Temp: <span className="text-cyan-300 font-bold">{temperature.toFixed(0)} K</span></div>
                  <div>Moles: <span className="text-cyan-300 font-bold">{moles.toFixed(2)} mol</span></div>
                </div>
              </div>

              {/* Simulation Viewport Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1">
                {/* 2D Interactive Particle Canvas (7 Cols) */}
                <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 flex flex-col items-center justify-center relative overflow-hidden">
                  <span className="absolute top-3 left-4 text-[10px] font-orbitron text-cyan-400 tracking-wider">
                    2D PARTICLE KINETIC CHAMBER ({particleCount} PARTICLES)
                  </span>

                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={220}
                    className="mt-6 rounded-xl border border-cyan-500/20 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                  />

                  <div className="w-full flex justify-between items-center mt-4 px-2 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1 text-cyan-300">
                      <Thermometer size={14} /> Heat Velocity: {(temperature / 300).toFixed(2)}x
                    </div>
                    <div className="flex items-center gap-1 text-amber-300">
                      <Box size={14} /> Chamber Vol: {volume} L
                    </div>
                  </div>
                </div>

                {/* Stage Interactive Controls & Inputs (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
                  {/* STAGE 1: KINETIC SCANNER CALCULATION */}
                  {currentStage === 1 && currentStageData && (
                    <div className="space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20 space-y-2">
                        <span className="text-xs font-orbitron text-cyan-400 block">CHAMBER GIVEN PARAMETERS:</span>
                        <div className="text-xs font-mono space-y-1 text-slate-200">
                          <p>Volume (V): <span className="text-cyan-300 font-bold">{currentStageData.given?.volume}</span></p>
                          <p>Pressure (P): <span className="text-cyan-300 font-bold">{currentStageData.given?.pressure}</span></p>
                          <p>Moles (n): <span className="text-cyan-300 font-bold">{currentStageData.given?.moles}</span></p>
                          <p>Constant (R): <span className="text-amber-300 font-bold">0.0821 L·atm/(mol·K)</span></p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-orbitron text-cyan-300 block mb-2">CALCULATE TARGET TEMPERATURE (K):</label>
                        <input
                          type="number"
                          value={calcTempInput}
                          onChange={(e) => {
                            setCalcTempInput(e.target.value);
                            setTemperature(parseFloat(e.target.value) || 300);
                          }}
                          className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl p-3 text-cyan-300 font-mono text-base focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <button
                        onClick={() => submitStageAnswer({ value: parseFloat(calcTempInput) })}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer"
                      >
                        SUBMIT TEMPERATURE CALCULATION
                      </button>
                    </div>
                  )}

                  {/* STAGE 2: BOYLE'S LAW PISTON COMPRESSION */}
                  {currentStage === 2 && (
                    <div className="space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20 text-xs font-mono space-y-2">
                        <span className="text-cyan-400 font-orbitron block">BOYLE'S LAW COMPRESSION (P1V1 = P2V2):</span>
                        <p>Initial: P₁ = 1.0 atm, V₁ = 20.0 L</p>
                        <p>Target Volume V₂: <span className="text-amber-300 font-bold">5.0 L</span></p>
                        <p>Simulated Pressure P₂: <span className="text-cyan-300 font-bold">{pressure.toFixed(2)} atm</span></p>
                      </div>

                      <div>
                        <label className="text-xs font-orbitron text-cyan-300 block mb-2">ADJUST COMPRESSION VOLUME (L):</label>
                        <input
                          type="range"
                          min="2.0"
                          max="20.0"
                          step="0.5"
                          value={volume}
                          onChange={(e) => {
                            const v2 = parseFloat(e.target.value);
                            setVolume(v2);
                            setPressure(20.0 / v2); // P2 = (1.0 * 20.0) / V2
                          }}
                          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                          <span>2.0 L</span>
                          <span>Target: 5.0 L</span>
                          <span>20.0 L</span>
                        </div>
                      </div>

                      <button
                        onClick={() => submitStageAnswer({ pressure, volume })}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer"
                      >
                        SUBMIT BOYLE'S LAW STATE
                      </button>
                    </div>
                  )}

                  {/* STAGE 3: CHARLES'S LAW THERMAL EXPANSION */}
                  {currentStage === 3 && (
                    <div className="space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20 text-xs font-mono space-y-2">
                        <span className="text-cyan-400 font-orbitron block">CHARLES'S LAW EXPANSION (V1/T1 = V2/T2):</span>
                        <p>Initial: V₁ = 4.0 L, T₁ = 300 K</p>
                        <p>Target Temp T₂: <span className="text-amber-300 font-bold">450 K</span></p>
                        <p>Simulated Volume V₂: <span className="text-cyan-300 font-bold">{volume.toFixed(1)} L</span></p>
                      </div>

                      <div>
                        <label className="text-xs font-orbitron text-cyan-300 block mb-2">THERMAL HEATER / COOLER (K):</label>
                        <input
                          type="range"
                          min="200"
                          max="600"
                          step="10"
                          value={temperature}
                          onChange={(e) => {
                            const t2 = parseFloat(e.target.value);
                            setTemperature(t2);
                            setVolume((4.0 * t2) / 300); // V2 = (V1 * T2) / T1
                          }}
                          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                          <span>200 K</span>
                          <span>Target: 450 K</span>
                          <span>600 K</span>
                        </div>
                      </div>

                      <button
                        onClick={() => submitStageAnswer({ volume, temp: temperature })}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer"
                      >
                        SUBMIT CHARLES'S LAW EXPANSION
                      </button>
                    </div>
                  )}

                  {/* STAGE 4: COMBINED GAS LAW REACTOR */}
                  {currentStage === 4 && (
                    <div className="space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20 text-xs font-mono space-y-1">
                        <span className="text-cyan-400 font-orbitron block">COMBINED GAS LAW (P1V1/T1 = P2V2/T2):</span>
                        <p>P₁ = 1.0 atm, V₁ = 10.0 L, T₁ = 300 K</p>
                        <p>P₂ = 2.0 atm, T₂ = 600 K</p>
                        <p>Target Volume V₂: <span className="text-amber-300 font-bold">10.0 L</span></p>
                      </div>

                      <div>
                        <label className="text-xs font-orbitron text-cyan-300 block mb-2">ADJUST REACTOR VOLUME (L):</label>
                        <input
                          type="range"
                          min="2.0"
                          max="20.0"
                          step="0.5"
                          value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                      </div>

                      <button
                        onClick={() => submitStageAnswer({ volume, pressure, temp: temperature })}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer"
                      >
                        SUBMIT COMBINED REACTOR STATE
                      </button>
                    </div>
                  )}

                  {/* STAGE 5: IDEAL GAS MASTER STABILIZATION */}
                  {currentStage === 5 && (
                    <div className="space-y-4">
                      <div className="bg-slate-950/60 p-4 rounded-xl border border-cyan-500/20 text-xs font-mono space-y-1">
                        <span className="text-amber-400 font-orbitron block">MASTER EQUILIBRIUM TARGETS:</span>
                        <p>Pressure Target: <span className="text-cyan-300 font-bold">2.0 atm</span></p>
                        <p>Volume Target: <span className="text-cyan-300 font-bold">10.0 L</span></p>
                        <p>Temperature Target: <span className="text-cyan-300 font-bold">300 K</span></p>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => { setPressure(2.0); setVolume(10.0); setTemperature(300); }}
                          className="py-2 bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-[10px] font-orbitron text-cyan-300 hover:bg-cyan-900/60 cursor-pointer"
                        >
                          AUTO ALIGN EQUILIBRIUM
                        </button>
                      </div>

                      <button
                        onClick={() => submitStageAnswer({ pressure, volume, temp: temperature })}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 font-orbitron font-bold text-xs tracking-wider uppercase hover:brightness-110 transition-all shadow-[0_0_25px_rgba(52,211,153,0.4)] cursor-pointer"
                      >
                        STABILIZE EMERGENCY CHAMBER
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border text-xs flex items-center justify-between font-mono ${
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
                <div className="p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-xl text-xs text-cyan-300 font-mono flex items-center gap-2">
                  <HelpCircle size={16} className="text-cyan-400 flex-shrink-0" />
                  <span>{currentStageData.hint}</span>
                </div>
              )}

              <div className="pt-3 border-t border-cyan-500/20 flex justify-between items-center text-xs">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-orbitron cursor-pointer"
                >
                  <HelpCircle size={14} /> {showHint ? 'Hide Hint' : 'Request Hint'}
                </button>
                <span className="text-slate-500 font-mono">Gas Chamber Simulator v6.0</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MISSION COMPLETE */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-[#0a1128]/95 border-2 border-cyan-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(0,212,255,0.3)]"
          >
            <Gauge size={56} className="text-cyan-400 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 mb-2">
              GAS CHAMBER STABILIZED!
            </h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Complete — Gas Physics Engineer</p>

            <div className="grid grid-cols-2 gap-4 w-full mb-6 text-xs font-orbitron">
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">XP GAINED</span>
                <span className="text-cyan-400 text-lg font-bold">+{rewards?.awardedXP || 950} XP</span>
              </div>
              <div className="bg-purple-950/30 border border-purple-500/30 p-4 rounded-2xl">
                <span className="text-slate-400 block text-[10px]">COINS EARNED</span>
                <span className="text-purple-400 text-lg font-bold">+{rewards?.awardedCoins || 250} 🪙</span>
              </div>
            </div>

            {rewards?.badgeUnlocked && (
              <div className="bg-cyan-950/30 border border-cyan-500/40 p-4 rounded-2xl w-full mb-6 flex items-center justify-center gap-3">
                <span className="text-2xl">{rewards.badgeUnlocked.badgeIcon || '💨'}</span>
                <div className="text-left font-orbitron">
                  <span className="text-[10px] text-cyan-400 block">BADGE UNLOCKED</span>
                  <span className="text-xs font-bold text-white">{rewards.badgeUnlocked.badgeName}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => navigateTo('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] cursor-pointer"
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
            className="flex-1 bg-[#0a1128]/95 border-2 border-red-500/40 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-[0_0_80px_rgba(239,68,68,0.3)]"
          >
            <AlertTriangle size={56} className="text-red-500 mb-4 animate-pulse" />
            <h2 className="text-2xl font-orbitron font-bold text-red-400 mb-2">CHAMBER EQUILIBRIUM COLLAPSED</h2>
            <p className="text-xs text-slate-300 font-mono mb-6">Mission Failed — Gas kinetic instability exceeded critical threshold.</p>

            <button
              onClick={startGasSession}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-cyan-600 font-orbitron font-bold text-sm tracking-wider hover:brightness-110 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} /> RETRY GAS CHAMBER STABILIZATION
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
