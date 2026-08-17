import { useEffect, useRef } from 'react';

/**
 * A lighter, auth-focused canvas background —
 * fewer atoms, more focused smoke / particle density to let
 * the glass card read cleanly against it.
 */
export default function AuthBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    let raf;

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // --- Atoms (fewer than landing, but crisp) ---
    const atoms = Array.from({ length: 8 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: 6 + Math.random() * 10,
      orbitR: 18 + Math.random() * 22,
      orbitSpeed: 0.009 + Math.random() * 0.01,
      orbitAngle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#10B981' : '#67E8F9',
      electrons: 1 + Math.floor(Math.random() * 3),
    }));

    // --- Floating formula strings ---
    const formulae = ['H₂O', 'CO₂', 'NaCl', 'O₂', 'C₆H₁₂O₆', 'NH₃', 'HCl', 'H₂SO₄', 'Fe₂O₃', 'CH₄'];
    const labels = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: -0.15 - Math.random() * 0.15,
      alpha: 0.04 + Math.random() * 0.1,
      text: formulae[i % formulae.length],
      size: 10 + Math.random() * 8,
    }));

    // --- Particles ---
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.35,
      r: 0.5 + Math.random() * 1.8,
      alpha: 0.15 + Math.random() * 0.5,
      color: ['#10B981', '#34D399', '#67E8F9'][Math.floor(Math.random() * 3)],
      life: Math.random(),
      decay: 0.004 + Math.random() * 0.006,
    }));

    // --- Hex grid dots (subtle) ---
    const hexDots = [];
    const spacing = 70;
    for (let row = 0; row * spacing < H + spacing; row++) {
      for (let col = 0; col * spacing < W + spacing; col++) {
        hexDots.push({
          x: col * spacing + (row % 2 === 0 ? 0 : spacing / 2),
          y: row * spacing * 0.866,
          pulse: Math.random() * Math.PI * 2,
          speed: 0.008 + Math.random() * 0.012,
        });
      }
    }

    function drawAtom({ x, y, r, orbitR, orbitAngle, color, electrons }) {
      // Glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
      const rgba = color === '#10B981' ? '16,185,129' : '103,232,249';
      grd.addColorStop(0, `rgba(${rgba},0.4)`);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Nucleus
      ctx.beginPath();
      ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Orbits + electrons
      for (let i = 0; i < electrons; i++) {
        const tilt = (i / electrons) * Math.PI;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitR, orbitR * 0.38, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgba},0.18)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();

        const ea = orbitAngle + (i / electrons) * Math.PI * 2;
        const ex = x + Math.cos(ea) * orbitR;
        const ey = y + Math.sin(ea) * orbitR * 0.38;
        ctx.beginPath();
        ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);

      // Hex dots
      hexDots.forEach(d => {
        d.pulse += d.speed;
        const a = (Math.sin(d.pulse) * 0.5 + 0.5) * 0.04;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16,185,129,${a})`;
        ctx.fill();
      });

      // Floating formulae
      labels.forEach(l => {
        l.y += l.vy;
        if (l.y < -30) { l.y = H + 20; l.x = Math.random() * W; }
        ctx.font = `${l.size}px 'Orbitron', monospace`;
        ctx.fillStyle = `rgba(16,185,129,${l.alpha})`;
        ctx.fillText(l.text, l.x, l.y);
      });

      // Atom connections
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[j].x - atoms[i].x;
          const dy = atoms[j].y - atoms[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.strokeStyle = `rgba(16,185,129,${(1 - d / 180) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Atoms
      atoms.forEach(a => {
        a.x += a.vx; a.y += a.vy; a.orbitAngle += a.orbitSpeed;
        if (a.x < -60) a.x = W + 60; if (a.x > W + 60) a.x = -60;
        if (a.y < -60) a.y = H + 60; if (a.y > H + 60) a.y = -60;
        drawAtom(a);
      });

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) {
          p.x = Math.random() * W; p.y = H + 10;
          p.life = 0.7 + Math.random() * 0.3;
          p.vx = (Math.random() - 0.5) * 0.25;
          p.vy = -0.15 - Math.random() * 0.35;
        }
        const cm = { '#10B981': '16,185,129', '#34D399': '52,211,153', '#67E8F9': '103,232,249' };
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cm[p.color] || '16,185,129'},${p.alpha * p.life})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(tick);
    }

    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.75 }}
    />
  );
}
