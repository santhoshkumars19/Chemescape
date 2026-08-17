import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Atom, ChevronLeft, ChevronRight } from 'lucide-react';

const PERIODIC_ELEMENTS = [
  { num: 1, sym: 'H', name: 'Hydrogen', mass: '1.008', group: 'Non-metal', color: '#00d4ff' },
  { num: 2, sym: 'He', name: 'Helium', mass: '4.0026', group: 'Noble Gas', color: '#a855f7' },
  { num: 3, sym: 'Li', name: 'Lithium', mass: '6.94', group: 'Alkali Metal', color: '#f97316' },
  { num: 6, sym: 'C', name: 'Carbon', mass: '12.011', group: 'Non-metal', color: '#00d4ff' },
  { num: 7, sym: 'N', name: 'Nitrogen', mass: '14.007', group: 'Non-metal', color: '#00d4ff' },
  { num: 8, sym: 'O', name: 'Oxygen', mass: '15.999', group: 'Non-metal', color: '#34d399' },
  { num: 9, sym: 'F', name: 'Fluorine', mass: '18.998', group: 'Halogen', color: '#ef4444' },
  { num: 10, sym: 'Ne', name: 'Neon', mass: '20.180', group: 'Noble Gas', color: '#a855f7' },
  { num: 11, sym: 'Na', name: 'Sodium', mass: '22.990', group: 'Alkali Metal', color: '#f97316' },
  { num: 17, sym: 'Cl', name: 'Chlorine', mass: '35.45', group: 'Halogen', color: '#ef4444' },
  { num: 18, sym: 'Ar', name: 'Argon', mass: '39.948', group: 'Noble Gas', color: '#a855f7' },
  { num: 26, sym: 'Fe', name: 'Iron', mass: '55.845', group: 'Transition', color: '#22d3ee' },
  { num: 29, sym: 'Cu', name: 'Copper', mass: '63.546', group: 'Transition', color: '#22d3ee' },
  { num: 79, sym: 'Au', name: 'Gold', mass: '196.97', group: 'Transition', color: '#fbbf24' },
  { num: 92, sym: 'U', name: 'Uranium', mass: '238.03', group: 'Actinide', color: '#ec4899' }
];

export default function PeriodicTableStrip() {
  const scrollRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section ref={sectionRef} className="relative py-12 overflow-hidden border-y border-white/5 bg-slate-950/40 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-sm md:text-base text-white tracking-wider uppercase">
              Periodic Table Element Strip
            </h3>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/30 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-xl glass border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-500/30 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── CONTROLLED HORIZONTAL SCROLL STRIP (Section 6 Requirements) ── */}
        <div
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
        >
          {PERIODIC_ELEMENTS.map((el, i) => (
            <motion.div
              key={el.sym}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              whileHover={{ y: -4, scale: 1.05 }}
              className="w-24 h-32 rounded-2xl flex-shrink-0 flex flex-col justify-between p-3 border backdrop-blur-md cursor-pointer transition-all shadow-lg select-none"
              style={{
                background: `linear-gradient(145deg, ${el.color}12, rgba(255,255,255,0.02))`,
                borderColor: `${el.color}35`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
              }}
            >
              {/* Top Row: Number & Mass */}
              <div className="flex items-center justify-between font-mono text-[9px]">
                <span className="font-orbitron font-bold text-slate-400">{el.num}</span>
                <span style={{ color: `${el.color}99` }}>{el.mass}</span>
              </div>

              {/* Center: Symbol */}
              <div className="text-center my-1">
                <span
                  className="font-orbitron font-black text-2xl md:text-3xl block leading-none"
                  style={{
                    color: el.color,
                    textShadow: `0 0 15px ${el.color}60`
                  }}
                >
                  {el.sym}
                </span>
              </div>

              {/* Bottom: Name */}
              <div className="text-center border-t border-white/5 pt-1.5">
                <span className="text-[10px] font-space font-medium text-slate-300 block truncate">
                  {el.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
