import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { DashCard, SectionHeader } from './DashComponents';
import {
  weeklyProgressData, accuracyData,
  weakTopicsData, strongTopicsData, subjectPerformance,
} from './mockData';
import { darkGridX, darkGridY, noGrid } from './chartConfig';
import { TrendingUp, Target, AlertTriangle, CheckCircle, Atom } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Weekly Progress — Line chart
// ─────────────────────────────────────────────────────────────────────────────
export function ProgressChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'rgba(255,255,255,0.45)', usePointStyle: true, pointStyleWidth: 8 },
      },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { ...darkGridX },
      y: { ...darkGridY, beginAtZero: true, ticks: { ...darkGridY.ticks, callback: v => v >= 1000 ? `${v/1000}k` : v } },
    },
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.1} id="chart-progress">
      <SectionHeader
        title="Weekly Progress"
        subtitle="XP & coins earned this week"
        icon={TrendingUp}
        color="#10B981"
        action="View all"
      />
      <div className="w-full min-w-0 relative" style={{ height: 220 }}>
        <Line data={weeklyProgressData} options={options} />
      </div>
    </DashCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Accuracy — Doughnut + center text
// ─────────────────────────────────────────────────────────────────────────────
export function AccuracyChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.15} id="chart-accuracy">
      <SectionHeader
        title="Overall Accuracy"
        subtitle="Based on 142 puzzles solved"
        icon={Target}
        color="#34D399"
      />
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-w-0">
        {/* Doughnut with center text */}
        <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
          <Doughnut data={accuracyData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-orbitron font-black text-xl text-white">82%</span>
            <span className="text-[9px] text-white/30 font-space">accuracy</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2.5 min-w-0">
          {[
            { label: 'Correct', value: '116', color: '#10B981', pct: '82%' },
            { label: 'Incorrect', value: '26',  color: 'rgba(255,255,255,0.15)', pct: '18%' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
              <div className="min-w-0">
                <p className="text-xs font-space text-white/70 truncate">{item.label}</p>
                <p className="text-xs text-white/30 font-inter">{item.value} puzzles <span className="text-white/50">({item.pct})</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Weak Topics — Horizontal bar chart
// ─────────────────────────────────────────────────────────────────────────────
export function WeakTopicsChart() {
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ...darkGridX, max: 100, ticks: { ...darkGridX.ticks, callback: v => `${v}%` } },
      y: { ...noGrid, ticks: { color: 'rgba(255,255,255,0.6)', font: { family: 'Space Grotesk', size: 10 } } },
    },
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.2} id="chart-weak-topics">
      <SectionHeader
        title="Needs Practice"
        subtitle="Lowest accuracy topics"
        icon={AlertTriangle}
        color="#EF4444"
      />
      <div className="w-full min-w-0 relative" style={{ height: 170 }}>
        <Bar data={weakTopicsData} options={options} />
      </div>
    </DashCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Strong Topics — Horizontal bar chart
// ─────────────────────────────────────────────────────────────────────────────
export function StrongTopicsChart() {
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ...darkGridX, max: 100, ticks: { ...darkGridX.ticks, callback: v => `${v}%` } },
      y: { ...noGrid, ticks: { color: 'rgba(255,255,255,0.6)', font: { family: 'Space Grotesk', size: 10 } } },
    },
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.25} id="chart-strong-topics">
      <SectionHeader
        title="Top Mastery"
        subtitle="Highest accuracy topics"
        icon={CheckCircle}
        color="#10B981"
      />
      <div className="w-full min-w-0 relative" style={{ height: 170 }}>
        <Bar data={strongTopicsData} options={options} />
      </div>
    </DashCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Subject Radar — Curriculum domains
// ─────────────────────────────────────────────────────────────────────────────
export function RadarChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.08)' },
        pointLabels: {
          color: 'rgba(255,255,255,0.5)',
          font: { family: 'Space Grotesk', size: 10 },
        },
      },
    },
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.3} id="chart-radar">
      <SectionHeader
        title="Domain Mastery"
        subtitle="Subject mastery breakdown"
        icon={Atom}
        color="#67E8F9"
      />
      <div className="w-full min-w-0 relative flex items-center justify-center" style={{ height: 210 }}>
        <Radar data={subjectPerformance} options={options} />
      </div>
    </DashCard>
  );
}
