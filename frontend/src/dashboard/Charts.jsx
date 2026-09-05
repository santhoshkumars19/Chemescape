import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import { DashCard, SectionHeader } from './DashComponents';
import {
  weakTopicsData, strongTopicsData, subjectPerformance,
} from './mockData';
import { darkGridX, darkGridY, noGrid } from './chartConfig';
import { TrendingUp, Target, AlertTriangle, CheckCircle, Atom } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Weekly Progress — Line chart
// ─────────────────────────────────────────────────────────────────────────────
export function ProgressChart() {
  const { xp = 0, coins = 0 } = useNavigation();
  const hasProgress = xp > 0 || coins > 0;

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

  const dynamicProgressData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'XP Earned',
        data: [0, 0, 0, 0, 0, 0, xp],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        borderWidth: 2.5,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#050807',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Coins Earned',
        data: [0, 0, 0, 0, 0, 0, coins],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245,158,11,0.06)',
        borderWidth: 2,
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#050807',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
      },
    ],
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.1} id="chart-progress">
      <SectionHeader
        title="Weekly Progress"
        subtitle="XP & coins earned this week"
        icon={TrendingUp}
        color="#10B981"
      />
      {!hasProgress ? (
        <div className="py-14 text-center text-[var(--text-muted)]">
          <TrendingUp size={36} className="mx-auto text-emerald-500/40 mb-2" />
          <p className="text-sm font-heading font-semibold text-[var(--text-main)]">No quiz activity available</p>
          <p className="text-xs mt-0.5">Start learning missions to track your weekly XP growth.</p>
        </div>
      ) : (
        <div className="w-full min-w-0 relative" style={{ height: 220 }}>
          <Line data={dynamicProgressData} options={options} />
        </div>
      )}
    </DashCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Accuracy — Doughnut + center text
// ─────────────────────────────────────────────────────────────────────────────
export function AccuracyChart() {
  const { userProgressList, completedRooms } = useNavigation();
  const completedCount = userProgressList?.filter(p => p.isCompleted)?.length || completedRooms?.length || 0;
  const totalAttempts = userProgressList?.length || completedRooms?.length || 0;

  const hasActivity = completedCount > 0;
  const accuracyPct = hasActivity && totalAttempts > 0 ? Math.round((completedCount / totalAttempts) * 100) : 0;
  const incorrectCount = Math.max(0, totalAttempts - completedCount);

  const dynamicAccuracyData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: hasActivity ? [completedCount, incorrectCount] : [0, 0],
        backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(255,255,255,0.06)'],
        borderColor: ['#10B981', 'rgba(255,255,255,0.05)'],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
        },
      },
    },
  };

  return (
    <DashCard className="p-5 sm:p-6 min-w-0 w-full" delay={0.15} id="chart-accuracy">
      <SectionHeader
        title="Overall Accuracy"
        subtitle={hasActivity ? `Based on ${totalAttempts} quiz attempts` : 'Real-time quiz accuracy'}
        icon={Target}
        color="#34D399"
      />
      {!hasActivity ? (
        <div className="py-12 text-center text-[var(--text-muted)]">
          <Target size={36} className="mx-auto text-emerald-500/40 mb-2" />
          <p className="text-sm font-heading font-semibold text-[var(--text-main)]">No quiz activity available</p>
          <p className="text-xs mt-0.5">Complete chapter quizzes to see your accuracy breakdown.</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 min-w-0">
          <div className="relative flex-shrink-0" style={{ width: 130, height: 130 }}>
            <Doughnut data={dynamicAccuracyData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading font-extrabold text-xl text-[var(--text-main)]">{accuracyPct}%</span>
              <span className="text-[10px] text-[var(--text-muted)] font-medium">accuracy</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5 min-w-0">
            {[
              { label: 'Correct', value: String(completedCount), color: '#10B981', pct: `${accuracyPct}%` },
              { label: 'Incorrect', value: String(incorrectCount), color: 'rgba(255,255,255,0.15)', pct: `${100 - accuracyPct}%` },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <div className="min-w-0">
                  <p className="text-xs font-sans font-semibold text-[var(--text-main)] truncate">{item.label}</p>
                  <p className="text-xs text-[var(--text-muted)] font-sans">{item.value} quizzes <span className="text-[var(--text-muted)]">({item.pct})</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
      {(!weakTopicsData.labels || weakTopicsData.labels.length === 0) ? (
        <div className="py-8 text-center text-[var(--text-muted)]">
          <AlertTriangle size={32} className="mx-auto text-amber-500/40 mb-2" />
          <p className="text-sm font-heading font-semibold text-[var(--text-main)]">No quiz activity available</p>
          <p className="text-xs mt-0.5">Attempt practice questions to identify topics needing review.</p>
        </div>
      ) : (
        <div className="w-full min-w-0 relative" style={{ height: 170 }}>
          <Bar data={weakTopicsData} options={options} />
        </div>
      )}
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
      {(!strongTopicsData.labels || strongTopicsData.labels.length === 0) ? (
        <div className="py-8 text-center text-[var(--text-muted)]">
          <CheckCircle size={32} className="mx-auto text-emerald-500/40 mb-2" />
          <p className="text-sm font-heading font-semibold text-[var(--text-main)]">No quiz activity available</p>
          <p className="text-xs mt-0.5">Complete chapter quizzes to unlock your mastery breakdown.</p>
        </div>
      ) : (
        <div className="w-full min-w-0 relative" style={{ height: 170 }}>
          <Bar data={strongTopicsData} options={options} />
        </div>
      )}
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
