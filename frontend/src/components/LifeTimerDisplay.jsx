import { useState, useEffect } from 'react';
import { Timer, Clock } from 'lucide-react';

export default function LifeTimerDisplay({ nextLifeRegenTime, variant = 'compact' }) {
  const [formattedTime, setFormattedTime] = useState('10:00');

  useEffect(() => {
    if (!nextLifeRegenTime) return;

    const updateTimer = () => {
      const remainingMs = Math.max(0, nextLifeRegenTime - Date.now());
      const totalSec = Math.ceil(remainingMs / 1000);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      setFormattedTime(
        `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextLifeRegenTime]);

  if (!nextLifeRegenTime) return null;

  if (variant === 'large') {
    return (
      <div className="text-3xl font-black text-red-400 flex items-center justify-center gap-2">
        <Clock size={24} className="text-red-400 animate-spin" />
        <span>{formattedTime}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-[11px] font-mono text-red-300 font-bold border-l border-red-500/20 pl-2">
      <Timer size={12} className="text-red-400 animate-spin" />
      <span>{formattedTime}</span>
    </div>
  );
}
