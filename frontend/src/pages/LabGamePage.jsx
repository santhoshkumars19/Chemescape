import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  X, Heart, Zap, Clock, Lightbulb, ChevronRight,
  BookOpen, Map, CheckCircle2, ChevronDown, Pause,
  Play, LogOut, Shield, Star, SkipForward, Crosshair,
} from 'lucide-react';

// ═══════════════════════════════════════════════
// GAME CONSTANTS
// ═══════════════════════════════════════════════
const W = 1200, H = 900;
const WALL = 40;
const P_R = 14;
const SPEED = 190;
const INTERACT_R = 85;
const HUD_TOP = 56; // px height of top HUD bar

// ═══════════════════════════════════════════════
// OBJECTS
// ═══════════════════════════════════════════════
const OBJECTS = [
  {
    id: 'periodic_table', label: 'Periodic Table',
    x: 60, y: 0, w: 300, h: 130, solid: true,
    color: '#00d4ff', interactR: 110,
    interact: {
      title: '⚛️ Periodic Table',
      subtitle: 'Interactive Element Reference Board',
      body: 'The Periodic Table organizes all 118 known elements by atomic number. Periods run horizontally (electron shells), Groups run vertically (similar properties). Metals dominate the left; non-metals cluster to the right.',
      details: [{ l: 'Total Elements', v: '118' }, { l: 'Groups', v: '18' }, { l: 'Periods', v: '7' }, { l: 'Discovered', v: 'Mendeleev 1869' }],
      action: 'Study Elements', hint: 'Noble gases (Group 18) have full valence shells — most stable!',
      xp: 50, coins: 10, missionId: 'study_table',
    },
  },
  {
    id: 'computer', label: 'Computer Terminal',
    x: 760, y: 40, w: 170, h: 145, solid: true,
    color: '#22d3ee', interactR: 100,
    interact: {
      title: '💻 Lab Terminal',
      subtitle: 'ChemLab OS v4.1 — Secure Access',
      body: '> SESSION: Periodic Research Lab\n> USER: LAB_AGENT_01\n> STATUS: 3 files encrypted\n> periodic_trends.dat [LOCKED]\n> element_config.enc [LOCKED]\n> master_key.exe [ENCRYPTED]\n\nSolve lab puzzles to decrypt mission files.',
      details: [{ l: 'System', v: 'ChemLab OS v4.1' }, { l: 'Network', v: '⚡ Connected' }, { l: 'Files', v: '3 Encrypted' }, { l: 'Access', v: 'Mission-required' }],
      action: 'Access Terminal', hint: 'Complete all objectives to decrypt the master key!',
      xp: 40, coins: 15, missionId: 'use_computer',
    },
  },
  {
    id: 'chemical_cabinet', label: 'Chemical Cabinet',
    x: 36, y: 280, w: 115, h: 200, solid: true,
    color: '#f97316', interactR: 95,
    interact: {
      title: '🧪 Chemical Cabinet',
      subtitle: 'Reagent Storage — Class B Hazard',
      body: 'The steel cabinet contains 47 classified chemical reagents. Target reagents for this mission: HCl (Hydrochloric Acid) in Row 2, NaOH (Sodium Hydroxide) in Row 3. An unidentified cyan vial occupies the lower locked compartment.',
      details: [{ l: 'Reagents', v: '47 Stored' }, { l: 'Hazard', v: '⚠️ Class B' }, { l: 'Target', v: 'NaOH — Row 3' }, { l: 'Temp', v: '18°C (Safe)' }],
      action: 'Collect NaOH', hint: 'NaOH is a strong base — it reacts with acids exothermically!',
      xp: 60, coins: 20, missionId: 'collect_sample',
      item: { id: 'naoh', label: 'NaOH', emoji: '🧴' },
    },
  },
  {
    id: 'test_tubes', label: 'Test Tube Rack',
    x: 870, y: 340, w: 140, h: 95, solid: true,
    color: '#a855f7', interactR: 95,
    interact: {
      title: '🔭 Test Tube Rack',
      subtitle: 'Active Sample Station — 6 Tubes',
      body: 'Six test tubes are active on the rack. Tube #3 (violet solution) shows anomalous behavior: it\'s spontaneously bubbling at room temperature with a pH reading of 4.2. This acidic mystery sample is your target for the microscope analysis.',
      details: [{ l: 'Active Tubes', v: '6 / 6' }, { l: 'Anomaly', v: 'Tube #3 — pH 4.2' }, { l: 'Temperature', v: '23°C (Unusual)' }, { l: 'Color', v: 'Violet (Ionic)' }],
      action: 'Collect Sample', hint: 'An acidic pH below 7 suggests excess H⁺ ions!',
      xp: 70, coins: 25, missionId: 'collect_sample',
      item: { id: 'sample3', label: 'Sample #3', emoji: '🟣' },
    },
  },
  {
    id: 'microscope', label: 'Microscope',
    x: 955, y: 520, w: 100, h: 135, solid: true,
    color: '#34d399', interactR: 95,
    interact: {
      title: '🔬 Electron Microscope',
      subtitle: 'Sample Analysis — ×12,000 Magnification',
      body: 'Loading Sample #3 under the electron microscope reveals a clear face-centered cubic ionic crystal lattice. The regular alternating arrangement of cations and anions matches the NaCl crystal structure perfectly. Bond length measured at 0.231 nm.',
      details: [{ l: 'Mode', v: 'Electron Scan' }, { l: 'Magnification', v: '×12,000' }, { l: 'Structure', v: 'FCC Ionic Lattice' }, { l: 'Bond Length', v: '0.231 nm' }],
      action: 'Analyze Sample', hint: 'The FCC crystal structure is characteristic of ionic compounds like NaCl!',
      xp: 80, coins: 30, missionId: 'analyze_sample',
    },
  },
  {
    id: 'experiment_table', label: 'Experiment Table',
    x: 160, y: 510, w: 300, h: 120, solid: true,
    color: '#7c3aed', interactR: 110,
    interact: {
      title: '⚗️ Experiment Table',
      subtitle: 'Acid-Base Titration — Active Setup',
      body: 'The titration apparatus is armed and ready. A burette loaded with 0.1 M HCl hangs over a 250 mL Erlenmeyer flask containing NaOH with phenolphthalein indicator. The solution is currently pink — meaning it\'s basic. Add HCl drop by drop until the pink fades to colorless at the equivalence point.',
      details: [{ l: 'Titrant', v: 'HCl (0.1 M)' }, { l: 'Analyte', v: 'NaOH (? M)' }, { l: 'Indicator', v: 'Phenolphthalein' }, { l: 'Endpoint', v: 'Pink → Colorless' }],
      action: 'Run Titration', hint: 'At equivalence: moles HCl = moles NaOH. Record volume used!',
      xp: 100, coins: 35, missionId: 'run_experiment',
    },
  },
  {
    id: 'door', label: 'Exit Door',
    x: 508, y: 860, w: 184, h: 40, solid: false,
    color: '#f59e0b', interactR: 100,
    interact: {
      title: '🚪 Security Exit Door',
      subtitle: 'Magnetic Lock — Level 3 Security',
      body: 'The exit door is sealed by a Level 3 magnetic lock. The security system will only disengage when all four mission objectives are verified as complete. Current status: checking mission database...',
      details: [{ l: 'Lock', v: '🔒 Engaged' }, { l: 'Security', v: 'Level 3 Magnetic' }, { l: 'Override', v: 'Mission-required' }, { l: 'Emergency', v: 'Break glass only' }],
      action: 'Attempt Exit', hint: 'Complete ALL 4 lab objectives to unlock the door!',
      xp: 0, coins: 0, missionId: null,
    },
  },
];

// ═══════════════════════════════════════════════
// COLLISION WALLS
// ═══════════════════════════════════════════════
const SOLID_WALLS = [
  { x: 0, y: 0, w: W, h: WALL },                    // top
  { x: 0, y: H - WALL, w: 508, h: WALL },           // bottom-left
  { x: 692, y: H - WALL, w: W - 692, h: WALL },     // bottom-right
  { x: 0, y: 0, w: WALL, h: H },                    // left
  { x: W - WALL, y: 0, w: WALL, h: H },             // right
  { x: 548, y: WALL, w: 36, h: 210 },               // divider upper
  { x: 548, y: 340, w: 36, h: 215 },                // divider lower
];

// ═══════════════════════════════════════════════
// MISSIONS
// ═══════════════════════════════════════════════
const INIT_MISSIONS = [
  { id: 'study_table',     label: 'Examine the Periodic Table',  icon: '⚛️', done: false },
  { id: 'use_computer',    label: 'Access the Computer Terminal', icon: '💻', done: false },
  { id: 'collect_sample',  label: 'Collect a Lab Sample',        icon: '🧪', done: false },
  { id: 'analyze_sample',  label: 'Analyze Sample under Scope',  icon: '🔬', done: false },
];

// Utility
function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function isBlocked(px, py) {
  // World bounds (with door gap)
  if (px < WALL + P_R || px > W - WALL - P_R) return true;
  if (py < WALL + P_R) return true;
  if (py > H - WALL - P_R) {
    if (px < 508 || px > 692) return true;
  }
  // Solid walls
  for (const w of SOLID_WALLS.slice(5)) {
    if (px + P_R > w.x && px - P_R < w.x + w.w &&
        py + P_R > w.y && py - P_R < w.y + w.h) return true;
  }
  // Objects
  for (const o of OBJECTS) {
    if (!o.solid) continue;
    if (px + P_R > o.x + 6 && px - P_R < o.x + o.w - 6 &&
        py + P_R > o.y + 6 && py - P_R < o.y + o.h - 6) return true;
  }
  return false;
}

// ═══════════════════════════════════════════════
// OBJECT VISUAL COMPONENTS
// ═══════════════════════════════════════════════

function ObjPeriodicTable({ near }) {
  const color = '#00d4ff';
  const els = [
    { n:1,s:'H',c:'#22d3ee' },{ n:2,s:'He',c:'#a855f7' },{ n:3,s:'Li',c:'#f97316' },
    { n:4,s:'Be',c:'#34d399' },{ n:6,s:'C',c:'#ec4899' },{ n:7,s:'N',c:'#a78bfa' },
    { n:8,s:'O',c:'#00d4ff' },{ n:9,s:'F',c:'#f97316' },{ n:10,s:'Ne',c:'#22d3ee' },
    { n:11,s:'Na',c:'#ec4899' },{ n:12,s:'Mg',c:'#fbbf24' },{ n:17,s:'Cl',c:'#34d399' },
  ];
  return (
    <div className="w-full h-full flex flex-col p-2.5 gap-1.5"
      style={{ background: 'linear-gradient(160deg,#0a1828,#060e1a)', borderRadius: 6 }}>
      <div style={{ color, fontFamily: 'Orbitron,monospace', fontSize: 7, letterSpacing: 2, opacity: 0.8 }}>
        ⚛ PERIODIC TABLE — MENDELEEV 1869
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2, flex: 1 }}>
        {els.map(el => (
          <div key={el.s} style={{ background: `${el.c}14`, border: `1px solid ${el.c}40`, borderRadius: 3, padding: '1px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 5, color: el.c, opacity: 0.5, lineHeight: 1.2 }}>{el.n}</div>
            <div style={{ fontSize: 9, color: el.c, fontWeight: 900, fontFamily: 'Orbitron,monospace', lineHeight: 1.3 }}>{el.s}</div>
          </div>
        ))}
      </div>
      {near && <div style={{ color, fontSize: 6, textAlign: 'center', opacity: 0.6, fontFamily: 'Orbitron,monospace' }}>⚡ INTERACTIVE</div>}
    </div>
  );
}

function ObjComputer({ near }) {
  const color = '#22d3ee';
  const lines = ['> SYSTEM: CHEMLAB OS v4.1','> USER: LAB_AGENT_01','> FILES: 3 ENCRYPTED','> SCANNING...','> AWAITING INPUT_'];
  return (
    <div className="w-full h-full flex flex-col items-center gap-1.5 p-2"
      style={{ background: 'linear-gradient(160deg,#091420,#050c18)' }}>
      {/* Monitor */}
      <div style={{ flex: 1, width: '100%', background: '#020a0e', border: `1px solid ${color}40`, borderRadius: 4, padding: 6, overflow: 'hidden' }}>
        {lines.map((l, i) => (
          <motion.div key={i} style={{ fontSize: 7, fontFamily: 'monospace', lineHeight: 1.6, color: i === lines.length-1 ? color : `${color}88` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.15 }}>
            {l}
          </motion.div>
        ))}
        {near && <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}
          style={{ width: 6, height: 10, background: color, display: 'inline-block' }} />}
      </div>
      {/* Stand */}
      <div style={{ width: 20, height: 4, background: `${color}30`, borderRadius: 2 }} />
      {/* Keyboard */}
      <div style={{ width: '100%', height: 12, background: '#0c1820', border: `1px solid ${color}20`, borderRadius: 3,
        backgroundImage: `repeating-linear-gradient(90deg,${color}10 0px,${color}10 8px,transparent 8px,transparent 10px)` }} />
    </div>
  );
}

function ObjChemCabinet({ near }) {
  const color = '#f97316';
  const vials = [
    ['#ef4444','#22d3ee','#f97316'],
    ['#a855f7','#34d399','#fbbf24'],
    ['#ec4899','#00d4ff','#f43f5e'],
  ];
  return (
    <div className="w-full h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg,#18120a,#0e0a06)', border: `1px solid ${color}25` }}>
      {/* Header */}
      <div style={{ padding: '4px 6px', borderBottom: `1px solid ${color}20`, display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 8 }}>⚗</span>
        <span style={{ fontSize: 7, color, fontFamily: 'Orbitron,monospace', opacity: 0.8 }}>REAGENTS</span>
      </div>
      {/* Vial rows */}
      <div style={{ flex: 1, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {vials.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            {row.map((c, ci) => (
              <motion.div key={ci}
                style={{ width: 16, height: 36, borderRadius: '4px 4px 6px 6px', position: 'relative', overflow: 'hidden',
                  background: `${c}18`, border: `1px solid ${c}50` }}
                animate={{ opacity: near ? [0.7, 1, 0.7] : 0.7 }}
                transition={{ duration: 2, repeat: Infinity, delay: (ri * 3 + ci) * 0.2 }}>
                {/* Liquid fill */}
                <div style={{ position: 'absolute', bottom: 2, left: 1, right: 1, height: '55%', borderRadius: '2px 2px 5px 5px', background: c, opacity: 0.6 }} />
                {/* Bubble */}
                {near && <motion.div style={{ position: 'absolute', bottom: '55%', left: '50%', width: 3, height: 3, borderRadius: '50%', background: c, marginLeft: -1.5 }}
                  animate={{ y: [0, -10], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: (ri*3+ci)*0.3 }} />}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      {/* Hazard stripe */}
      <div style={{ height: 16, backgroundImage: `repeating-linear-gradient(45deg,${color}40 0px,${color}40 4px,transparent 4px,transparent 8px)`, borderTop: `1px solid ${color}30` }}>
        <div style={{ textAlign: 'center', fontSize: 7, color, fontFamily: 'Orbitron,monospace', lineHeight: '16px', opacity: 0.8 }}>⚠ CLASS-B</div>
      </div>
    </div>
  );
}

function ObjTestTubes({ near }) {
  const color = '#a855f7';
  const tubes = ['#ef4444','#22d3ee','#a855f7','#34d399','#f59e0b','#ec4899'];
  return (
    <div className="w-full h-full flex flex-col justify-between p-2.5"
      style={{ background: 'linear-gradient(160deg,#10081e,#08040e)' }}>
      {/* Rack top bar */}
      <div style={{ height: 6, background: `${color}30`, border: `1px solid ${color}40`, borderRadius: 3 }} />
      {/* Tubes */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'flex-start', paddingTop: 4 }}>
        {tubes.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* Tube */}
            <motion.div style={{ width: 14, height: 48, borderRadius: '4px 4px 8px 8px', position: 'relative', overflow: 'hidden',
              background: `${c}10`, border: `1px solid ${c}${i===2?'99':'40'}`,
              boxShadow: i===2 ? `0 0 8px ${c}60` : 'none' }}
              animate={i===2 && near ? { boxShadow: [`0 0 8px ${c}60`,`0 0 16px ${c}90`,`0 0 8px ${c}60`] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}>
              <div style={{ position: 'absolute', bottom: 2, left: 1, right: 1, height: '60%', borderRadius: '2px 2px 7px 7px', background: c, opacity: 0.65 }} />
              {near && i===2 && (
                <motion.div style={{ position: 'absolute', bottom: '62%', left: '40%', width: 3, height: 3, borderRadius: '50%', background: c }}
                  animate={{ y: [0, -14], opacity: [0.9, 0] }}
                  transition={{ duration: 1, repeat: Infinity }} />
              )}
            </motion.div>
            {/* Label */}
            <div style={{ fontSize: 5.5, color: i===2 ? c : 'rgba(255,255,255,0.3)', fontFamily: 'Orbitron,monospace' }}>#{i+1}</div>
          </div>
        ))}
      </div>
      {/* Rack bottom bar */}
      <div style={{ height: 6, background: `${color}30`, border: `1px solid ${color}40`, borderRadius: 3 }} />
    </div>
  );
}

function ObjMicroscope({ near }) {
  const color = '#34d399';
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-3 px-2"
      style={{ background: 'linear-gradient(160deg,#061812,#030e0a)' }}>
      {/* Eyepiece */}
      <motion.div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${color}70`,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        animate={near ? { boxShadow: [`0 0 10px ${color}40`,`0 0 20px ${color}70`,`0 0 10px ${color}40`] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: `${color}30`, border: `1px solid ${color}50` }} />
      </motion.div>
      {/* Body column */}
      <div style={{ width: 18, flex: 1, background: `${color}20`, border: `1px solid ${color}35`, borderRadius: 4, margin: '4px 0' }} />
      {/* Stage */}
      <div style={{ width: '70%', height: 10, background: `${color}25`, border: `1px solid ${color}40`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '60%', height: 3, background: near ? color : `${color}50`, borderRadius: 2, transition: 'background 0.3s' }} />
      </div>
      {/* Base */}
      <div style={{ width: '80%', height: 14, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 8, color, fontFamily: 'Orbitron,monospace', opacity: 0.7 }}>SEM</div>
      </div>
      {/* Light spot */}
      {near && <motion.div style={{ width: 10, height: 4, borderRadius: '50%', background: color, filter: 'blur(2px)', marginTop: 2 }}
        animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }} />}
    </div>
  );
}

function ObjExpTable({ near }) {
  const color = '#7c3aed';
  return (
    <div className="w-full h-full flex flex-col"
      style={{ background: 'linear-gradient(160deg,#0e0820,#08041a)' }}>
      {/* Table surface */}
      <div style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
        {/* Beaker */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 28, height: 38, borderRadius: '3px 3px 8px 8px', border: `1.5px solid ${color}60`, background: `${color}12`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: 2, left: 2, right: 2, height: '45%', background: '#ec489960', borderRadius: '1px 1px 6px 6px' }} />
            {near && <motion.div style={{ position: 'absolute', bottom: '47%', left: '50%', width: 4, height: 4, borderRadius: '50%', background: '#ec4899', marginLeft: -2 }}
              animate={{ y: [0, -8], opacity: [0.8, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />}
          </div>
          <div style={{ fontSize: 7, color: `${color}99`, fontFamily: 'Orbitron,monospace' }}>NaOH</div>
        </div>
        {/* Burette */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 8, height: 55, borderRadius: 4, border: `1px solid ${color}50`, background: `${color}10`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 4, left: 1, right: 1, height: '60%', background: '#22d3ee50', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 7, color: `${color}80`, fontFamily: 'Orbitron,monospace' }}>HCl</div>
        </div>
        {/* Flask */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 36, height: 40, position: 'relative' }}>
            <div style={{ width: 36, height: 36, borderRadius: '4px 4px 50% 50%', border: `1.5px solid ${color}50`, background: `${color}10`, position: 'relative', overflow: 'hidden', bottom: 0 }}>
              <div style={{ position: 'absolute', bottom: 2, left: 3, right: 3, height: '50%', background: '#f97316aa', borderRadius: '0 0 50% 50%' }} />
            </div>
            <div style={{ width: 12, height: 8, background: `${color}20`, border: `1px solid ${color}40`, borderRadius: '2px 2px 0 0', margin: '-8px auto 0', position: 'relative', zIndex: 1 }} />
          </div>
          <div style={{ fontSize: 7, color: `${color}99`, fontFamily: 'Orbitron,monospace' }}>Flask</div>
        </div>
        {/* Bunsen burner */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <motion.div style={{ fontSize: 18 }}
            animate={near ? { scale: [1, 1.15, 0.95, 1], y: [0, -2, 0] } : {}}
            transition={{ duration: 0.6, repeat: Infinity }}>
            🔥
          </motion.div>
          <div style={{ width: 12, height: 20, background: `${color}25`, border: `1px solid ${color}40`, borderRadius: 3 }} />
          <div style={{ fontSize: 7, color: `${color}80`, fontFamily: 'Orbitron,monospace' }}>Bunsen</div>
        </div>
      </div>
      {/* Table front edge */}
      <div style={{ height: 10, background: `${color}20`, borderTop: `2px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 6, color, fontFamily: 'Orbitron,monospace', opacity: 0.6, letterSpacing: 2 }}>LAB BENCH A — TITRATION</div>
      </div>
    </div>
  );
}

function ObjDoor({ near, allDone }) {
  const color = '#f59e0b';
  return (
    <div className="w-full h-full flex items-center"
      style={{ background: allDone ? 'linear-gradient(90deg,#1a1000,#f59e0b30)' : 'linear-gradient(90deg,#1a0e00,#0e0800)',
        border: `2px solid ${allDone ? color : color+'50'}`, borderBottom: 'none', borderRadius: '6px 6px 0 0' }}>
      {/* Door panels */}
      <div style={{ flex: 1, height: '80%', margin: '0 6px', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 4,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
        <div style={{ fontSize: 9, color, fontFamily: 'Orbitron,monospace', fontWeight: 700, opacity: allDone ? 1 : 0.5 }}>
          {allDone ? '🔓 EXIT' : '🔒 EXIT'}
        </div>
        {near && (
          <motion.div style={{ width: 8, height: 8, borderRadius: '50%', background: allDone ? '#34d399' : color }}
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        )}
      </div>
      {/* Handle */}
      <div style={{ width: 8, height: 18, background: color, borderRadius: 4, marginRight: 12, opacity: 0.8 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════
// PLAYER SPRITE
// ═══════════════════════════════════════════════
function PlayerSprite({ dir, moving }) {
  const headPos = { up:{x:0,y:-7}, down:{x:0,y:7}, left:{x:-7,y:0}, right:{x:7,y:0} }[dir] || {x:0,y:0};
  return (
    <div style={{ width: P_R*2+8, height: P_R*2+8, position: 'relative', pointerEvents: 'none' }}>
      {/* Glow */}
      <motion.div style={{ position:'absolute', inset:-10, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,255,0.25) 0%,transparent 70%)' }}
        animate={{ scale: moving ? [1, 1.15, 1] : 1, opacity: moving ? [0.7, 1, 0.7] : 0.5 }}
        transition={{ duration: 0.45, repeat: Infinity }} />
      {/* Shadow on floor */}
      <div style={{ position:'absolute', bottom:0, left:'15%', right:'15%', height:6, background:'rgba(0,0,0,0.4)', borderRadius:'50%', filter:'blur(3px)' }} />
      {/* Lab coat body */}
      <div style={{ position:'absolute', inset:4, borderRadius:'50%', background:'linear-gradient(135deg,#e8f4ff,#c8e8f8)', border:'2px solid rgba(0,212,255,0.7)', boxShadow:'0 2px 8px rgba(0,0,0,0.5)' }} />
      {/* Head */}
      <motion.div
        style={{ position:'absolute', width:14, height:14, borderRadius:'50%', background:'linear-gradient(135deg,#fcd34d,#f59e0b)', border:'1px solid rgba(0,0,0,0.2)',
          top: P_R + headPos.y - 7 + 4, left: P_R + headPos.x - 7 + 4 }}
        animate={moving ? { y: [0,-1.5,0] } : {}}
        transition={{ duration:0.28, repeat:Infinity }} />
      {/* Goggles */}
      <div style={{ position:'absolute', width:8, height:5, borderRadius:2, background:'rgba(0,212,255,0.4)', border:'1px solid rgba(0,212,255,0.6)',
        top: P_R + headPos.y - 4 + 4, left: P_R + headPos.x - 4 + 4 }} />
      {/* Name tag */}
      <div style={{ position:'absolute', top:-18, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', fontSize:8, fontFamily:'Orbitron,monospace',
        color:'#00d4ff', background:'rgba(0,0,0,0.75)', padding:'1px 5px', borderRadius:3, border:'1px solid rgba(0,212,255,0.35)', boxShadow:'0 0 6px rgba(0,212,255,0.3)' }}>
        AGENT
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// HUD COMPONENTS
// ═══════════════════════════════════════════════

function TopBar({ hud, isPaused, onPause, onHint, onExit, showMissions, setShowMissions, hints }) {
  const pct = Math.max(0, (hud.timer / 600) * 100);
  const timerRed = hud.timer < 120;
  return (
    <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 relative z-50"
      style={{ background: 'rgba(2,6,14,0.96)', borderBottom: '1px solid rgba(0,212,255,0.1)', backdropFilter: 'blur(16px)' }}>
      {/* Lives */}
      <div className="flex items-center gap-1.5">
        {[...Array(3)].map((_, i) => (
          <motion.div key={i} animate={{ scale: i < hud.lives ? 1 : 0.6, opacity: i < hud.lives ? 1 : 0.2 }} transition={{ duration: 0.3 }}>
            <Heart size={16} fill={i < hud.lives ? '#ef4444' : 'none'} className={i < hud.lives ? 'text-red-500' : 'text-white/20'} />
          </motion.div>
        ))}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
        <Clock size={12} className={timerRed ? 'text-red-400' : 'text-white/40'} />
        <motion.span className="font-orbitron font-bold text-sm" style={{ color: timerRed ? '#f87171' : 'white' }}
          animate={timerRed ? { opacity:[1,0.5,1] } : {}} transition={{ duration:0.6, repeat:Infinity }}>
          {fmtTime(hud.timer)}
        </motion.span>
      </div>

      {/* Timer bar */}
      <div className="hidden sm:flex flex-1 items-center gap-2 max-w-32">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
          <motion.div className="h-full rounded-full" style={{ background: pct > 40 ? '#00d4ff' : pct > 20 ? '#f59e0b' : '#ef4444' }}
            animate={{ width: `${pct}%` }} transition={{ duration:0.5 }} />
        </div>
      </div>

      {/* Mission toggle */}
      <button onClick={() => setShowMissions(s => !s)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-space text-xs transition-all"
        style={{ background: showMissions ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${showMissions ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.08)'}`, color: showMissions ? '#00d4ff' : 'rgba(255,255,255,0.5)' }}>
        <BookOpen size={12} />
        <span className="hidden sm:inline">Missions</span>
        <span className="font-orbitron text-[10px]">{hud.missions.filter(m=>m.done).length}/{hud.missions.length}</span>
      </button>

      <div className="flex-1" />

      {/* XP */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)' }}>
        <Zap size={11} className="text-cyan-400" />
        <span className="font-orbitron font-bold text-xs text-cyan-400">{hud.xp.toLocaleString()}</span>
      </div>
      {/* Coins */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)' }}>
        <span className="text-xs">🪙</span>
        <span className="font-orbitron font-bold text-xs text-amber-400">{hud.coins}</span>
      </div>

      {/* Hint */}
      <button id="game-hint-btn" onClick={onHint} disabled={hints <= 0}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all relative"
        style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', opacity: hints > 0 ? 1 : 0.4 }}>
        <Lightbulb size={14} className="text-amber-400" />
        {hints > 0 && <span style={{ position:'absolute', top:-3, right:-3, width:12, height:12, borderRadius:'50%', background:'#f59e0b', fontSize:7, fontFamily:'Orbitron,monospace', color:'black', fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{hints}</span>}
      </button>

      {/* Pause */}
      <button id="game-pause-btn" onClick={onPause}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)' }}>
        {isPaused ? <Play size={14} className="text-cyan-400" /> : <Pause size={14} className="text-white/60" />}
      </button>

      {/* Exit */}
      <button id="game-exit-btn" onClick={onExit}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
        <LogOut size={13} className="text-red-400" />
      </button>
    </div>
  );
}

function MiniMap({ pos, cam, viewW, viewH }) {
  const scale = 140 / W;
  const mH = Math.round(H * scale);
  return (
    <div className="absolute bottom-4 left-4 z-40 rounded-xl overflow-hidden"
      style={{ width:140, height:mH, background:'rgba(2,6,14,0.9)', border:'1px solid rgba(0,212,255,0.2)', boxShadow:'0 0 20px rgba(0,0,0,0.5)' }}>
      {/* Floor */}
      <div style={{ position:'absolute', inset:0, background:'#040a12' }} />
      {/* Objects */}
      {OBJECTS.map(o => (
        <div key={o.id} style={{ position:'absolute', left:o.x*scale, top:o.y*scale, width:Math.max(4,o.w*scale), height:Math.max(4,o.h*scale),
          background:o.color, opacity:0.45, borderRadius:1 }} />
      ))}
      {/* Walls */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:WALL*scale, background:'rgba(0,212,255,0.08)', borderBottom:'1px solid rgba(0,212,255,0.2)' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:WALL*scale, background:'rgba(0,212,255,0.08)', borderTop:'1px solid rgba(0,212,255,0.2)' }} />
      <div style={{ position:'absolute', top:0, left:0, bottom:0, width:WALL*scale, background:'rgba(0,212,255,0.06)' }} />
      <div style={{ position:'absolute', top:0, right:0, bottom:0, width:WALL*scale, background:'rgba(0,212,255,0.06)' }} />
      {/* Camera box */}
      <div style={{ position:'absolute', left:cam.x*scale, top:cam.y*scale, width:viewW*scale, height:viewH*scale,
        border:'1px solid rgba(255,255,255,0.2)', borderRadius:1, pointerEvents:'none' }} />
      {/* Player */}
      <motion.div style={{ position:'absolute', width:5, height:5, borderRadius:'50%', background:'#00d4ff',
        left:pos.x*scale-2.5, top:pos.y*scale-2.5, boxShadow:'0 0 4px #00d4ff' }}
        animate={{ scale:[1,1.4,1] }} transition={{ duration:1, repeat:Infinity }} />
      {/* Label */}
      <div style={{ position:'absolute', top:2, left:3, fontSize:6, fontFamily:'Orbitron,monospace', color:'rgba(0,212,255,0.6)' }}>MAP</div>
    </div>
  );
}

function InventoryBar({ items }) {
  const slots = Array(4).fill(null).map((_, i) => items[i] || null);
  return (
    <div className="absolute bottom-4 right-4 z-40 flex gap-2">
      {slots.map((item, i) => (
        <motion.div key={i}
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5"
          style={{ background: item ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${item ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}` }}
          animate={item ? { boxShadow:['0 0 0px rgba(0,212,255,0)','0 0 10px rgba(0,212,255,0.3)','0 0 0px rgba(0,212,255,0)'] } : {}}
          transition={{ duration:2, repeat:Infinity }}>
          {item ? (
            <>
              <span style={{ fontSize:16 }}>{item.emoji}</span>
              <span style={{ fontSize:6, color:'rgba(0,212,255,0.8)', fontFamily:'Orbitron,monospace', textAlign:'center', lineHeight:1 }}>{item.label.slice(0,6)}</span>
            </>
          ) : (
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.1)', fontFamily:'Orbitron,monospace' }}>{i+1}</span>
          )}
        </motion.div>
      ))}
      <div style={{ position:'absolute', top:-16, right:0, fontSize:8, fontFamily:'Orbitron,monospace', color:'rgba(255,255,255,0.25)' }}>INVENTORY</div>
    </div>
  );
}

function MissionPanel({ missions, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="absolute top-16 left-4 z-40 rounded-2xl p-4 w-72"
          style={{ background:'rgba(2,6,18,0.92)', border:'1px solid rgba(0,212,255,0.15)', backdropFilter:'blur(16px)', boxShadow:'0 8px 40px rgba(0,0,0,0.6)' }}
          initial={{ opacity:0, y:-10, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-10, scale:0.95 }}
          transition={{ duration:0.25 }}>
          <div className="flex items-center gap-2 mb-3">
            <Crosshair size={13} className="text-cyan-400" />
            <span style={{ fontFamily:'Orbitron,monospace', fontSize:10, color:'#00d4ff', letterSpacing:'0.2em' }}>MISSION TRACKER</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {missions.map(m => (
              <div key={m.id} className="flex items-center gap-2.5">
                <motion.div animate={{ scale: m.done ? [1,1.3,1] : 1 }} transition={{ duration:0.4 }}>
                  {m.done
                    ? <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    : <div style={{ width:16, height:16, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.2)', flexShrink:0 }} />}
                </motion.div>
                <span style={{ fontSize:10, color: m.done ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.75)', fontFamily:'Inter,sans-serif', textDecoration: m.done ? 'line-through' : 'none' }}>
                  {m.icon} {m.label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-xs text-white/30 font-space mb-1.5">
              <span>Progress</span>
              <span style={{ color:'#00d4ff' }}>{missions.filter(m=>m.done).length}/{missions.length}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.06)' }}>
              <motion.div className="h-full rounded-full" style={{ background:'linear-gradient(90deg,#22d3ee,#7c3aed)' }}
                animate={{ width:`${(missions.filter(m=>m.done).length/missions.length)*100}%` }}
                transition={{ duration:0.5 }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════
// INTERACTION MODAL
// ═══════════════════════════════════════════════
function InteractionModal({ data, onClose, missions }) {
  const allMissionsDone = missions.every(m => m.done);
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background:'rgba(4,8,20,0.98)', border:`1px solid ${data.color}35`, boxShadow:`0 0 60px ${data.color}25, 0 30px 80px rgba(0,0,0,0.7)` }}
        initial={{ y:50, scale:0.9, opacity:0 }} animate={{ y:0, scale:1, opacity:1 }} exit={{ y:30, scale:0.95, opacity:0 }}
        transition={{ type:'spring', damping:22, stiffness:260 }}>
        {/* Top glow line */}
        <div style={{ height:2, background:`linear-gradient(90deg,transparent,${data.color},transparent)` }} />

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:16, fontWeight:900, color:'white' }}>{data.title}</h2>
              <p style={{ fontSize:11, color:`${data.color}99`, fontFamily:'Space Grotesk,sans-serif', marginTop:3 }}>{data.subtitle}</p>
            </div>
            <button onClick={onClose} id="modal-close-btn"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)' }}>
              <X size={14} className="text-white/60" />
            </button>
          </div>
          {/* Body */}
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.55)', fontFamily:'Inter,sans-serif', lineHeight:1.7, whiteSpace:'pre-line' }}>{data.body}</p>
        </div>

        {/* Details grid */}
        <div className="px-6 pb-4 grid grid-cols-2 gap-2">
          {data.details.map(({ l, v }) => (
            <div key={l} className="flex flex-col gap-0.5 p-2.5 rounded-xl" style={{ background:`${data.color}08`, border:`1px solid ${data.color}18` }}>
              <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontFamily:'Space Grotesk,sans-serif', letterSpacing:'0.1em' }}>{l.toUpperCase()}</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.8)', fontFamily:'Orbitron,monospace', fontWeight:700 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Rewards */}
        {(data.xp > 0 || data.coins > 0) && (
          <div className="px-6 pb-4 flex gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background:`${data.color}0d`, border:`1px solid ${data.color}25` }}>
              <Zap size={12} style={{ color:data.color }} />
              <span style={{ fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:13, color:data.color }}>+{data.xp} XP</span>
            </div>
            {data.coins > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)' }}>
                <span>🪙</span>
                <span style={{ fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:13, color:'#fbbf24' }}>+{data.coins}</span>
              </div>
            )}
            {data.item && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)' }}>
                <span>{data.item.emoji}</span>
                <span style={{ fontFamily:'Space Grotesk,sans-serif', fontSize:11, color:'#34d399' }}>{data.item.label} added</span>
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        <div className="px-6 pb-4">
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)' }}>
            <Lightbulb size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <p style={{ fontSize:11, color:'rgba(251,191,36,0.85)', fontFamily:'Inter,sans-serif', lineHeight:1.6 }}>{data.hint}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 pb-6">
          <motion.button id="modal-action-btn" onClick={onClose}
            className="relative w-full py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest uppercase text-white overflow-hidden flex items-center justify-center gap-2"
            style={{ background:`linear-gradient(135deg,${data.color},${data.color}99)`, boxShadow:`0 0 20px ${data.color}40` }}
            whileHover={{ scale:1.02, boxShadow:`0 0 35px ${data.color}60` }} whileTap={{ scale:0.97 }}>
            <motion.div className="absolute inset-0" style={{ background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)' }}
              animate={{ x:['-100%','200%'] }} transition={{ duration:2.5, repeat:Infinity }} />
            <ChevronRight size={15} className="relative z-10" />
            <span className="relative z-10">{data.action}</span>
          </motion.button>
          {allMissionsDone && <p className="text-center text-xs text-emerald-400 font-space mt-3">🎉 All objectives complete! Head to the Exit Door!</p>}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// PAUSE OVERLAY
// ═══════════════════════════════════════════════
function PauseOverlay({ onResume, onExit }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background:'rgba(2,6,14,0.92)', backdropFilter:'blur(12px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="flex flex-col items-center gap-8 text-center"
        initial={{ scale:0.85, y:20, opacity:0 }} animate={{ scale:1, y:0, opacity:1 }} transition={{ delay:0.1, duration:0.4 }}>
        <div>
          <p style={{ fontFamily:'Orbitron,monospace', fontSize:10, color:'rgba(0,212,255,0.6)', letterSpacing:'0.4em', marginBottom:8 }}>MISSION PAUSED</p>
          <h2 style={{ fontFamily:'Orbitron,monospace', fontSize:40, fontWeight:900, color:'white', lineHeight:1 }}>PAUSED</h2>
        </div>
        <div className="flex flex-col gap-3 w-56">
          <motion.button id="pause-resume-btn" onClick={onResume}
            className="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            style={{ background:'linear-gradient(135deg,#00d4ff,#22d3ee)', color:'black', boxShadow:'0 0 25px rgba(0,212,255,0.4)' }}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <Play size={15} /> Resume
          </motion.button>
          <motion.button id="pause-exit-btn" onClick={onExit}
            className="w-full py-3.5 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171' }}
            whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}>
            <LogOut size={15} /> Exit Lab
          </motion.button>
        </div>
        <p style={{ fontSize:10, color:'rgba(255,255,255,0.2)', fontFamily:'Space Grotesk,sans-serif' }}>Press ESC to resume</p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// WIN SCREEN
// ═══════════════════════════════════════════════
function WinScreen({ hud, onExit }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background:'rgba(2,6,14,0.97)', backdropFilter:'blur(20px)' }}
      initial={{ opacity:0 }} animate={{ opacity:1 }}>
      <motion.div className="flex flex-col items-center gap-6 text-center px-8"
        initial={{ scale:0.8, opacity:0, y:30 }} animate={{ scale:1, opacity:1, y:0 }} transition={{ delay:0.2, duration:0.7, ease:[0.22,1,0.36,1] }}>
        <motion.div className="text-7xl" animate={{ scale:[1,1.2,1], rotate:[0,10,-10,0] }} transition={{ duration:1.5, repeat:Infinity }}>🏆</motion.div>
        <div>
          <p style={{ fontFamily:'Orbitron,monospace', fontSize:11, color:'rgba(52,211,153,0.7)', letterSpacing:'0.35em', marginBottom:8 }}>MISSION COMPLETE</p>
          <h1 style={{ fontFamily:'Orbitron,monospace', fontSize:42, fontWeight:900, background:'linear-gradient(135deg,#00d4ff,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1 }}>ESCAPED!</h1>
        </div>
        <div className="flex gap-4">
          {[{ icon:'⚡', label:'XP Earned', value:`+${hud.xp}` }, { icon:'🪙', label:'Coins', value:`+${hud.coins}` }, { icon:'⏱', label:'Time Left', value:fmtTime(hud.timer) }].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-5 py-4 rounded-2xl"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-2xl">{s.icon}</span>
              <span style={{ fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:18, color:'white' }}>{s.value}</span>
              <span style={{ fontSize:10, color:'rgba(255,255,255,0.3)', fontFamily:'Space Grotesk,sans-serif' }}>{s.label}</span>
            </div>
          ))}
        </div>
        <motion.button onClick={onExit} id="win-exit-btn"
          className="px-10 py-4 rounded-2xl font-orbitron font-black text-base tracking-widest uppercase text-black flex items-center gap-3"
          style={{ background:'linear-gradient(135deg,#00d4ff,#22d3ee)', boxShadow:'0 0 40px rgba(0,212,255,0.5)' }}
          whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}>
          Return to Dashboard <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// MOBILE D-PAD
// ═══════════════════════════════════════════════
function MobileControls({ onMove, onInteract }) {
  const btnStyle = (dir) => ({
    width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', cursor: 'pointer', userSelect: 'none',
    WebkitUserSelect: 'none', touchAction: 'none',
  });
  const press = (d) => { onMove(d, true); };
  const release = (d) => { onMove(d, false); };

  return (
    <div className="md:hidden absolute bottom-20 left-4 z-40 flex items-center gap-8">
      {/* D-pad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,44px)', gridTemplateRows: 'repeat(3,44px)', gap: 3 }}>
        <div /><button style={btnStyle('up')} onTouchStart={() => press('up')} onTouchEnd={() => release('up')}>▲</button><div />
        <button style={btnStyle('left')} onTouchStart={() => press('left')} onTouchEnd={() => release('left')}>◀</button>
        <div style={{ ...btnStyle(), background:'rgba(255,255,255,0.04)' }} />
        <button style={btnStyle('right')} onTouchStart={() => press('right')} onTouchEnd={() => release('right')}>▶</button>
        <div /><button style={btnStyle('down')} onTouchStart={() => press('down')} onTouchEnd={() => release('down')}>▼</button><div />
      </div>
      {/* Interact button */}
      <motion.button onTouchStart={onInteract} style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#00d4ff,#22d3ee)', color:'black', fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(0,212,255,0.5)', border:'none', cursor:'pointer', touchAction:'none' }}
        whileTap={{ scale:0.9 }}>
        [E]
      </motion.button>
    </div>
  );
}

// ═══════════════════════════════════════════════
// OBJECT RENDERER MAP
// ═══════════════════════════════════════════════
const OBJ_VISUALS = {
  periodic_table: ObjPeriodicTable,
  computer: ObjComputer,
  chemical_cabinet: ObjChemCabinet,
  test_tubes: ObjTestTubes,
  microscope: ObjMicroscope,
  experiment_table: ObjExpTable,
  door: ObjDoor,
};

// ═══════════════════════════════════════════════
// MAIN GAME COMPONENT
// ═══════════════════════════════════════════════
export default function LabGamePage() {
  const { navigateTo } = useNavigation();

  // DOM refs
  const viewportRef = useRef(null);
  const worldRef    = useRef(null);
  const playerRef   = useRef(null);

  // Game state (mutable, not React state)
  const gs = useRef({
    pos: { x: 300, y: 660 },
    dir: 'down', moving: false,
    keys: {}, touch: { x: 0, y: 0 },
    cam: { x: 0, y: 0 },
    timer: 600, lives: 3, xp: 700, coins: 120,
    inventory: [],
    missions: INIT_MISSIONS.map(m => ({ ...m })),
    interacted: new Set(),
    nearObjId: null,
    paused: false,
    hints: 3,
    hudTimer: 0,
    won: false,
  });

  // React state (UI only)
  const [nearObjId, setNearObjId] = useState(null);
  const [modal, setModal] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [hud, setHud] = useState({
    timer: 600, lives: 3, xp: 700, coins: 120, inventory: [], missions: INIT_MISSIONS.map(m=>({...m})),
  });

  // Sync hud from gs
  const syncHud = useCallback(() => {
    const g = gs.current;
    setHud({ timer: g.timer, lives: g.lives, xp: g.xp, coins: g.coins, inventory: [...g.inventory], missions: [...g.missions] });
  }, []);

  // Interaction handler
  const handleInteract = useCallback(() => {
    const g = gs.current;
    if (!g.nearObjId || g.paused) return;
    const obj = OBJECTS.find(o => o.id === g.nearObjId);
    if (!obj) return;
    const isFirst = !g.interacted.has(obj.id);
    if (isFirst) {
      g.interacted.add(obj.id);
      g.xp    += (obj.interact.xp    || 0);
      g.coins += (obj.interact.coins || 0);
      if (obj.interact.item) {
        if (!g.inventory.some(i => i.id === obj.interact.item.id)) {
          g.inventory = [...g.inventory, obj.interact.item];
        }
      }
      if (obj.interact.missionId) {
        g.missions = g.missions.map(m => m.id === obj.interact.missionId ? { ...m, done: true } : m);
      }
    }
    if (obj.id === 'periodic_table') {
      navigateTo('room1');
      return;
    }
    if (obj.id === 'chemical_cabinet') {
      navigateTo('room2');
      return;
    }
    if (obj.id === 'computer') {
      navigateTo('room3');
      return;
    }
    if (obj.id === 'door') {
      navigateTo('boss');
      return;
    }
    g.paused = true;
    setModal({ ...obj.interact, color: obj.color, firstTime: isFirst });
  }, [navigateTo]);

  const closeModal = useCallback(() => {
    const g = gs.current;
    g.paused = false;
    setModal(null);
    syncHud();
    if (g.missions.every(m => m.done) && !g.won) {
      g.won = true;
      setTimeout(() => setGameWon(true), 300);
    }
  }, [syncHud]);

  const togglePause = useCallback(() => {
    const g = gs.current;
    if (modal) return;
    g.paused = !g.paused;
    setIsPaused(g.paused);
  }, [modal]);

  const handleHint = useCallback(() => {
    const g = gs.current;
    if (g.hints <= 0) return;
    g.hints--;
    if (g.nearObjId) {
      const obj = OBJECTS.find(o => o.id === g.nearObjId);
      if (obj) {
        g.paused = true;
        setModal({ ...obj.interact, color: obj.color, firstTime: false, title: '💡 Hint: ' + obj.label });
      }
    }
    syncHud();
  }, [syncHud]);

  // Mobile touch d-pad
  const handleTouchMove = useCallback((dir, pressed) => {
    const keyMap = { up: 'w', down: 's', left: 'a', right: 'd' };
    gs.current.keys[keyMap[dir]] = pressed;
  }, []);

  // Game loop
  useEffect(() => {
    const g = gs.current;
    let rafId;
    let lastT = performance.now();

    const loop = (now) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      if (!g.paused) {
        // Timer
        g.timer = Math.max(0, g.timer - dt);

        // Movement
        const k = g.keys;
        let vx = ((k['d']||k['arrowright']) ? 1 : 0) - ((k['a']||k['arrowleft']) ? 1 : 0);
        let vy = ((k['s']||k['arrowdown'])  ? 1 : 0) - ((k['w']||k['arrowup'])   ? 1 : 0);
        const mag = Math.sqrt(vx*vx + vy*vy);
        if (mag > 0) { vx /= mag; vy /= mag; }
        g.moving = mag > 0;
        if (vx > 0.1) g.dir = 'right'; else if (vx < -0.1) g.dir = 'left';
        else if (vy < -0.1) g.dir = 'up'; else if (vy > 0.1) g.dir = 'down';

        const nx = g.pos.x + vx * SPEED * dt;
        if (!isBlocked(nx, g.pos.y)) g.pos.x = nx;
        const ny = g.pos.y + vy * SPEED * dt;
        if (!isBlocked(g.pos.x, ny)) g.pos.y = ny;

        // Update player DOM
        if (playerRef.current) {
          playerRef.current.style.left = `${g.pos.x - P_R - 8}px`;
          playerRef.current.style.top  = `${g.pos.y - P_R - 8}px`;
        }

        // Camera
        const vw = viewportRef.current?.clientWidth  || 900;
        const vh = (viewportRef.current?.clientHeight || 650);
        const camX = Math.max(0, Math.min(W - vw, g.pos.x - vw / 2));
        const camY = Math.max(0, Math.min(H - vh, g.pos.y - vh / 2));
        g.cam = { x: camX, y: camY };
        if (worldRef.current) {
          worldRef.current.style.transform = `translate(${-camX}px, ${-camY}px)`;
        }

        // Near object
        let nearId = null; let nearDist = Infinity;
        for (const obj of OBJECTS) {
          const ocx = obj.x + obj.w / 2, ocy = obj.y + obj.h / 2;
          const dist = Math.hypot(g.pos.x - ocx, g.pos.y - ocy);
          const r = obj.interactR || INTERACT_R;
          if (dist < r && dist < nearDist) { nearId = obj.id; nearDist = dist; }
        }
        if (nearId !== g.nearObjId) {
          g.nearObjId = nearId;
          setNearObjId(nearId);
        }

        // HUD sync every 0.5s
        g.hudTimer += dt;
        if (g.hudTimer >= 0.5) { g.hudTimer = 0; syncHud(); }
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [syncHud]);

  // Keyboard events
  useEffect(() => {
    const down = (e) => {
      gs.current.keys[e.key.toLowerCase()] = true;
      if ([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
      if (e.key.toLowerCase() === 'e' || e.key === ' ') handleInteract();
      if (e.key === 'Escape') togglePause();
    };
    const up = (e) => { gs.current.keys[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [handleInteract, togglePause]);

  const allDone = hud.missions.every(m => m.done);

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col" style={{ background: '#020608', userSelect: 'none' }}>
      {/* HUD Top Bar */}
      <TopBar hud={hud} isPaused={isPaused} onPause={togglePause} onHint={handleHint}
        onExit={() => navigateTo('chapters')} showMissions={showMissions}
        setShowMissions={setShowMissions} hints={gs.current.hints} />

      {/* Game Viewport */}
      <div ref={viewportRef} className="flex-1 relative overflow-hidden" style={{ cursor: 'crosshair' }}>

        {/* Game World */}
        {/* Game World */}
        <div ref={worldRef} style={{ position: 'absolute', width: W, height: H, willChange: 'transform' }}>
          {/* Floor */}
          <div style={{ position: 'absolute', inset: 0, background: '#060c14',
            backgroundImage: `linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)`,
            backgroundSize: '48px 48px' }} />

          {/* Ambient floor glows */}
          <div style={{ position:'absolute', left:200, top:200, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', left:700, top:400, width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(168,85,247,0.06) 0%,transparent 70%)', pointerEvents:'none' }} />

          {/* WALLS & ROOM BOUNDARIES */}
          <svg style={{ position:'absolute', inset:0, width:W, height:H, pointerEvents:'none' }}>
            {/* Outer wall */}
            <rect x={0} y={0} width={W} height={H} fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth={WALL*2} />
            {/* Inner wall details */}
            <rect x={WALL} y={WALL} width={W-WALL*2} height={H-WALL*2} fill="none" stroke="rgba(0,212,255,0.6)" strokeWidth={2} />
            {/* Interior wall dividers */}
            <line x1={550} y1={WALL} x2={550} y2={400} stroke="rgba(0,212,255,0.4)" strokeWidth={6} />
            <line x1={550} y1={520} x2={550} y2={H-WALL} stroke="rgba(0,212,255,0.4)" strokeWidth={6} />
            <line x1={WALL} y1={500} x2={380} y2={500} stroke="rgba(0,212,255,0.4)" strokeWidth={6} />
          </svg>

          {/* OBJECTS */}
          {OBJECTS.map(obj => {
            const isNear = nearObjId === obj.id;
            const isInteracted = gs.current.interacted.has(obj.id);
            return (
              <motion.div
                key={obj.id}
                style={{
                  position: 'absolute', left: obj.x, top: obj.y, width: obj.w, height: obj.h,
                  background: `${obj.color}10`, border: `2px solid ${isNear ? obj.color : obj.color + '40'}`,
                  borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isNear ? `0 0 25px ${obj.color}60` : `0 0 8px ${obj.color}20`,
                  transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer',
                }}
                whileHover={{ scale: 1.02 }}
                onClick={handleInteract}
              >
                <span style={{ fontSize: 24 }}>{obj.icon}</span>
                <span style={{ fontSize: 9, fontFamily: 'Orbitron,monospace', color: '#fff', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {obj.label}
                </span>

                {/* Status indicator */}
                <div style={{ position:'absolute', top:4, right:4, width:6, height:6, borderRadius:'50%', background: isInteracted ? '#34d399' : obj.color }} />

                {/* Near interact prompt */}
                <AnimatePresence>
                  {isNear && (
                    <motion.div style={{ position:'absolute', bottom:-24, left:'50%', transform:'translateX(-50%)',
                        background:'rgba(4,8,16,0.9)', border:`1px solid ${obj.color}`, borderRadius:6, padding:'2px 8px',
                        fontSize:9, fontFamily:'Orbitron,monospace', color:obj.color, whiteSpace:'nowrap',
                        boxShadow:`0 0 12px ${obj.color}30`, zIndex:10 }}
                      initial={{ opacity:0, y:5, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, scale:0.9 }}
                      transition={{ duration:0.18 }}>
                      [E] {obj.label}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* PLAYER */}
          <div ref={playerRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 100, pointerEvents: 'none' }}>
            <PlayerSprite dir={gs.current.dir} moving={gs.current.moving} />
          </div>

          {/* Wall text labels */}
          <div style={{ position:'absolute', left:170, top:5, fontSize:8, fontFamily:'Orbitron,monospace', color:'rgba(0,212,255,0.3)', letterSpacing:3 }}>RESEARCH LAB — SECTION A</div>
          <div style={{ position:'absolute', left:680, top:5, fontSize:8, fontFamily:'Orbitron,monospace', color:'rgba(34,211,238,0.3)', letterSpacing:3 }}>LAB B — INSTRUMENTS</div>
          <div style={{ position:'absolute', left:42, top:258, fontSize:7, fontFamily:'Orbitron,monospace', color:'rgba(249,115,22,0.35)', letterSpacing:2 }}>⚠ REAGENT STORE</div>

        </div>

        {/* MINIMAP */}
        <MiniMap pos={hud.timer > 0 ? gs.current.pos : { x: 300, y: 660 }}
          cam={gs.current.cam}
          viewW={viewportRef.current?.clientWidth || 900}
          viewH={viewportRef.current?.clientHeight || 650} />

        {/* MISSION PANEL */}
        <MissionPanel missions={hud.missions} show={showMissions} />

        {/* INVENTORY */}
        <InventoryBar items={hud.inventory} />

        {/* Controls hint */}
        <div className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
          style={{ fontSize:9, fontFamily:'Orbitron,monospace', color:'rgba(255,255,255,0.15)', letterSpacing:2 }}>
          WASD / ARROW KEYS TO MOVE &nbsp;|&nbsp; E TO INTERACT &nbsp;|&nbsp; ESC TO PAUSE
        </div>

        {/* Mobile controls */}
        <MobileControls onMove={handleTouchMove} onInteract={handleInteract} />
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {modal && <InteractionModal data={modal} onClose={closeModal} missions={hud.missions} />}
      </AnimatePresence>
      <AnimatePresence>
        {isPaused && !modal && (
          <PauseOverlay onResume={togglePause} onExit={() => navigateTo('chapters')} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {gameWon && <WinScreen hud={hud} onExit={() => navigateTo('mission-complete')} />}
      </AnimatePresence>
    </div>
  );
}
