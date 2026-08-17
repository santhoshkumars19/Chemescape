import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Play, Lock, DoorOpen } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const rooms = [
  {
    id: 'room-acid-chamber',
    name: 'Acid Chamber',
    difficulty: 'Beginner',
    desc: 'Neutralize the acids before the lab floods. Balance pH equations to escape.',
    elements: ['H', 'OH', 'pH'],
    color: '#22d3ee',
    unlocked: true,
    completionRate: 78,
    avgTime: '8:42',
    emoji: '🧪',
  },
  {
    id: 'room-quantum-vault',
    name: 'Quantum Vault',
    difficulty: 'Intermediate',
    desc: 'Quantum states are your keys. Solve electron configuration puzzles to unlock the vault.',
    elements: ['e⁻', 'n', 'p⁺'],
    color: '#a855f7',
    unlocked: true,
    completionRate: 54,
    avgTime: '14:22',
    emoji: '⚛️',
  },
  {
    id: 'room-plasma-core',
    name: 'Plasma Core',
    difficulty: 'Advanced',
    desc: 'The reactor is failing. Complete nuclear equations before critical meltdown.',
    elements: ['U', 'Pu', 'Ra'],
    color: '#ec4899',
    unlocked: false,
    completionRate: 31,
    avgTime: '22:07',
    emoji: '🔥',
  },
  {
    id: 'room-molecular-maze',
    name: 'Molecular Maze',
    difficulty: 'Expert',
    desc: 'Navigate a 3D molecular maze by forming correct covalent bonds at each junction.',
    elements: ['C', 'N', 'O'],
    color: '#fbbf24',
    unlocked: false,
    completionRate: 18,
    avgTime: '31:55',
    emoji: '🧬',
  },
];

const diffColors = {
  Beginner: '#22d3ee',
  Intermediate: '#a855f7',
  Advanced: '#ec4899',
  Expert: '#fbbf24',
};

export default function EscapeRoomsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(null);
  const { navigateTo } = useNavigation();

  return (
    <section id="rooms" className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border border-pink-500/30 text-xs font-orbitron font-bold text-pink-400 tracking-widest uppercase mb-4">
            <DoorOpen size={14} />
            <span>Escape Rooms</span>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase mb-3">
            CHOOSE YOUR <span className="gradient-text-cyan-purple">PRISON</span>
          </h2>

          <p className="text-slate-400 font-space text-xs sm:text-sm max-w-xl mx-auto">
            12 unique chemistry labs. One rule: chemistry knowledge is the only key to freedom.
          </p>
        </motion.div>

        {/* Rooms 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mb-8">
          {rooms.map((room, i) => (
            <motion.div
              key={room.id}
              id={room.id}
              className="relative group rounded-2xl overflow-hidden backdrop-blur-md transition-all flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${room.color}10 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${hovered === room.id ? room.color + '50' : 'rgba(255,255,255,0.08)'}`,
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onHoverStart={() => setHovered(room.id)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -4, boxShadow: `0 16px 40px ${room.color}20` }}
            >
              {/* Lock Overlay */}
              {!room.unlocked && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-3">
                    <Lock size={22} style={{ color: room.color }} />
                  </div>
                  <p className="font-orbitron text-sm font-extrabold text-white tracking-widest uppercase mb-1">
                    LOCKED ROOM
                  </p>
                  <p className="text-xs text-slate-400 font-space max-w-xs">Complete previous escape rooms to unlock this mission</p>
                </div>
              )}

              <div className="p-6 flex flex-col justify-between h-full space-y-5">
                {/* Top Info */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{room.emoji}</span>
                      <div>
                        <span
                          className="text-[10px] font-orbitron font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                          style={{
                            background: `${diffColors[room.difficulty]}15`,
                            color: diffColors[room.difficulty],
                            border: `1px solid ${diffColors[room.difficulty]}40`,
                          }}
                        >
                          {room.difficulty}
                        </span>
                        <h3 className="font-orbitron font-bold text-white text-lg md:text-xl mt-1">{room.name}</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-xs md:text-sm font-space leading-relaxed mb-4">{room.desc}</p>

                  {/* Elements */}
                  <div className="flex items-center gap-2">
                    {room.elements.map((el) => (
                      <span
                        key={el}
                        className="px-2.5 py-1 rounded-lg font-orbitron text-xs font-bold"
                        style={{
                          background: `${room.color}15`,
                          color: room.color,
                          border: `1px solid ${room.color}30`,
                        }}
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Stats & Enter Button */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider mb-1">Completion</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: room.color }}
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${room.completionRate}%` } : {}}
                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                          />
                        </div>
                        <span className="font-orbitron text-xs font-bold" style={{ color: room.color }}>
                          {room.completionRate}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-orbitron text-slate-400 uppercase tracking-wider mb-0.5">Avg Time</p>
                      <p className="font-orbitron text-xs font-bold text-white">{room.avgTime}</p>
                    </div>
                  </div>

                  {room.unlocked && (
                    <motion.button
                      onClick={() => navigateTo('mission')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-orbitron font-bold text-xs uppercase text-white cursor-pointer shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${room.color}, ${room.color}aa)`,
                        boxShadow: `0 0 20px ${room.color}40`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      id={`enter-${room.id}`}
                    >
                      <Play size={12} className="fill-white" />
                      <span>Enter Lab</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
