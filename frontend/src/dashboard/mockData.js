// ─── Real Product & Clean State Data for EduNova Dashboard ───────────

export const mockUser = {
  name: 'Student Scholar',
  username: '@student',
  avatar: '🎓',
  level: 1,
  title: 'EduNova Scholar',
  xp: 0,
  xpToNext: 1000,
  coins: 0,
  streak: 1,
  totalTime: '0h 0m',
  joinDate: 'Aug 2026',
  accuracy: 0,
  rank: 1,
};

export const mockMission = {
  id: 'mission-periodic-table',
  title: 'Find the Missing Element',
  room: 'Escape Room #1',
  description: 'Solve interactive academic puzzles and master curriculum concepts.',
  progress: 0,
  puzzlesTotal: 5,
  puzzlesDone: 0,
  xpReward: 500,
  coinReward: 100,
  timeLeft: '30:00',
  difficulty: 'Medium',
  difficultyColor: '#10B981',
};

export const mockStats = {
  xp: 0,
  coins: 0,
  streak: 1,
  learningTime: '0h 0m',
  accuracy: 0,
  roomsCompleted: 0,
  puzzlesSolved: 0,
  hintsUsed: 0,
};

// ─── Weekly XP progress (line chart default state) ─────────────────────────
export const weeklyProgressData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'XP Earned',
      data: [0, 0, 0, 0, 0, 0, 0],
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
      data: [0, 0, 0, 0, 0, 0, 0],
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

// ─── Accuracy doughnut default state ────────────────────────────────────────
export const accuracyData = {
  labels: ['Correct', 'Incorrect'],
  datasets: [
    {
      data: [100, 0],
      backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(255,255,255,0.06)'],
      borderColor: ['#10B981', 'rgba(255,255,255,0.05)'],
      borderWidth: 2,
      hoverOffset: 6,
    },
  ],
};

// ─── Weak & Strong topics default states ──────────────────────────────────
export const weakTopicsData = {
  labels: [],
  datasets: [
    {
      label: 'Accuracy %',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
};

export const strongTopicsData = {
  labels: [],
  datasets: [
    {
      label: 'Accuracy %',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
};

// ─── Leaderboard preview (default clean state) ──────────────────────────────
export const leaderboardPreview = [];

// ─── Achievements (default clean state) ─────────────────────────────────────
export const recentAchievements = [];

// ─── Daily challenge ──────────────────────────────────────────────────────────
export const dailyChallenge = {
  title: 'Daily Lab Sprint',
  description: 'Solve 3 periodic trend questions correctly in under 2 minutes.',
  xpReward: 250,
  coinReward: 80,
  timeLeft: '12:00:00',
  difficulty: 'Medium',
  difficultyColor: '#10B981',
  completedToday: false,
  participants: 0,
};

// ─── Subject performance default state ──────────────────────────────────────
export const subjectPerformance = {
  labels: ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science'],
  datasets: [
    {
      label: 'Your Score',
      data: [0, 0, 0, 0, 0],
      backgroundColor: 'rgba(16,185,129,0.14)',
      borderColor: '#10B981',
      borderWidth: 2,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#050807',
      pointBorderWidth: 2,
      pointRadius: 5,
    },
  ],
};

// ─── Monthly activity heatmap data default state ─────────────────────────────
export const activityData = [
  { day: 'Mon', values: [0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Tue', values: [0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Wed', values: [0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Thu', values: [0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Fri', values: [0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Sat', values: [0, 0, 0, 0, 0, 0, 0, 0] },
  { day: 'Sun', values: [0, 0, 0, 0, 0, 0, 0, 0] },
];
