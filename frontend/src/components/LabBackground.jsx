import { useEffect, useRef } from 'react';

// Canvas-based particle/atom background
export default function LabBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animFrame;

    // Resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // ---- Atoms ----
    const atoms = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 8 + Math.random() * 14,
      orbitRadius: 20 + Math.random() * 30,
      orbitSpeed: 0.008 + Math.random() * 0.012,
      orbitAngle: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? '#00d4ff' : '#a855f7',
      electronCount: 1 + Math.floor(Math.random() * 3),
    }));

    // ---- Particles ----
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.1 - Math.random() * 0.4,
      radius: 0.5 + Math.random() * 2,
      alpha: 0.1 + Math.random() * 0.6,
      color: Math.random() > 0.6 ? '#00d4ff' : Math.random() > 0.5 ? '#a855f7' : '#ec4899',
      life: Math.random(),
      maxLife: 0.005 + Math.random() * 0.008,
    }));

    // ---- Smoke puffs ----
    const smokes = Array.from({ length: 6 }, (_, i) => ({
      x: (i + 0.5) * (width / 6),
      baseY: height * 0.75,
      t: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
      radius: 30 + Math.random() * 40,
      alpha: 0.04 + Math.random() * 0.04,
    }));

    // ---- Connections ----
    function drawConnections() {
      for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
          const dx = atoms[j].x - atoms[i].x;
          const dy = atoms[j].y - atoms[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.15;
            ctx.beginPath();
            ctx.moveTo(atoms[i].x, atoms[i].y);
            ctx.lineTo(atoms[j].x, atoms[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function drawAtom(atom) {
      const { x, y, radius, orbitRadius, orbitSpeed, orbitAngle, color, electronCount } = atom;

      // Core glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, color.replace(')', ', 0.6)').replace('rgb', 'rgba').replace('#00d4ff', 'rgba(0,212,255,0.6)').replace('#a855f7', 'rgba(168,85,247,0.6)'));
      gradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Nucleus
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Orbit rings
      for (let i = 0; i < electronCount; i++) {
        const angle = (i / electronCount) * Math.PI;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, orbitRadius, orbitRadius * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = color === '#00d4ff' ? 'rgba(0,212,255,0.2)' : 'rgba(168,85,247,0.2)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();

        // Electron
        const eAngle = orbitAngle + (i / electronCount) * Math.PI * 2;
        const ex = x + Math.cos(eAngle) * orbitRadius;
        const ey = y + Math.sin(eAngle) * orbitRadius * 0.4;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    function drawSmoke(smoke) {
      smoke.t += smoke.speed;
      const x = smoke.x + Math.sin(smoke.t) * 20;
      const y = smoke.baseY - (smoke.t * 30) % 400;
      const r = smoke.radius + smoke.t * 5;

      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(100, 130, 180, ${smoke.alpha})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Smoke
      smokes.forEach(drawSmoke);

      // Connections
      drawConnections();

      // Atoms
      atoms.forEach(atom => {
        atom.x += atom.vx;
        atom.y += atom.vy;
        atom.orbitAngle += atom.orbitSpeed;

        if (atom.x < -50) atom.x = width + 50;
        if (atom.x > width + 50) atom.x = -50;
        if (atom.y < -50) atom.y = height + 50;
        if (atom.y > height + 50) atom.y = -50;

        drawAtom(atom);
      });

      // Particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.maxLife;

        if (p.life <= 0) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.life = 0.8 + Math.random() * 0.2;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = -0.1 - Math.random() * 0.4;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const colorMap = {
          '#00d4ff': `rgba(0,212,255,${p.alpha * p.life})`,
          '#a855f7': `rgba(168,85,247,${p.alpha * p.life})`,
          '#ec4899': `rgba(236,72,153,${p.alpha * p.life})`,
        };
        ctx.fillStyle = colorMap[p.color] || `rgba(0,212,255,${p.alpha * p.life})`;
        ctx.fill();
      });

      animFrame = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      style={{ opacity: 0.85 }}
    />
  );
}
