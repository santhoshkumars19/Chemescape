/**
 * Chart.js global defaults + shared chart options factory.
 * Supports dynamic Dark / Light mode axis and grid styling.
 */
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale,
  Tooltip, Legend, Filler,
} from 'chart.js';

export function registerCharts() {
  ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, RadialLinearScale,
    Tooltip, Legend, Filler,
  );

  const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');

  ChartJS.defaults.color = isLight ? '#334155' : 'rgba(255,255,255,0.45)';
  ChartJS.defaults.borderColor = isLight ? 'rgba(100,116,139,0.15)' : 'rgba(255,255,255,0.05)';
  ChartJS.defaults.font.family = "'Space Grotesk', sans-serif";
  ChartJS.defaults.font.size = 11;
  ChartJS.defaults.plugins.legend.labels.boxWidth = 10;
  ChartJS.defaults.plugins.legend.labels.padding = 16;
  ChartJS.defaults.plugins.legend.labels.color = isLight ? '#334155' : 'rgba(255,255,255,0.6)';
  ChartJS.defaults.plugins.tooltip.backgroundColor = isLight ? '#FFFFFF' : 'rgba(5,8,7,0.95)';
  ChartJS.defaults.plugins.tooltip.borderColor = isLight ? '#047857' : 'rgba(16,185,129,0.3)';
  ChartJS.defaults.plugins.tooltip.titleColor = isLight ? '#10201A' : '#F1F5F4';
  ChartJS.defaults.plugins.tooltip.bodyColor = isLight ? '#33453E' : '#A7B3AE';
  ChartJS.defaults.plugins.tooltip.borderWidth = 1;
  ChartJS.defaults.plugins.tooltip.padding = 10;
  ChartJS.defaults.plugins.tooltip.titleFont = { family: "'Orbitron', monospace", size: 11, weight: 'bold' };
  ChartJS.defaults.plugins.tooltip.bodyFont = { family: "'Space Grotesk', sans-serif", size: 11 };
  ChartJS.defaults.plugins.tooltip.cornerRadius = 10;
}

// ─── Shared axis options ──────────────────────────────────────────────────────
const isLightMode = () => typeof document !== 'undefined' && document.documentElement.classList.contains('light');

export const darkGridX = {
  grid: {
    color: () => isLightMode() ? 'rgba(100,116,139,0.15)' : 'rgba(255,255,255,0.04)',
    drawBorder: false,
  },
  ticks: {
    color: () => isLightMode() ? '#475569' : 'rgba(255,255,255,0.35)',
    padding: 8,
  },
  border: { display: false },
};

export const darkGridY = {
  grid: {
    color: () => isLightMode() ? 'rgba(100,116,139,0.15)' : 'rgba(255,255,255,0.04)',
    drawBorder: false,
  },
  ticks: {
    color: () => isLightMode() ? '#475569' : 'rgba(255,255,255,0.35)',
    padding: 8,
  },
  border: { display: false },
};

export const noGrid = {
  grid: { display: false },
  ticks: {
    color: () => isLightMode() ? '#475569' : 'rgba(255,255,255,0.4)',
    padding: 8,
  },
  border: { display: false },
};
