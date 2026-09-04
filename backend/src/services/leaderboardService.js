'use strict';

const prisma = require('../config/db');

// Multi-subject EduNova Scholar Rankings (Fallback & Seed)
const SCHOLARS_SEED = [
  {
    id: 'sch-1',
    name: 'Kavitha R.',
    avatar: '👩‍🎓',
    country: '🇮🇳',
    title: 'Math Prodigy',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    xp: 12450,
    level: 13,
    streak: 21,
    badges: 14,
    trend: '+2',
  },
  {
    id: 'sch-2',
    name: 'Arjun S.',
    avatar: '🧑‍🔬',
    country: '🇮🇳',
    title: 'Science Virtuoso',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'science',
    subjectName: 'Science',
    xp: 11800,
    level: 12,
    streak: 19,
    badges: 12,
    trend: '+1',
  },
  {
    id: 'sch-3',
    name: 'Meera N.',
    avatar: '👩‍🏫',
    country: '🇮🇳',
    title: 'Grammar Master',
    standardId: 'grade-6',
    standardName: '6th Standard',
    subjectId: 'english',
    subjectName: 'English',
    xp: 11150,
    level: 12,
    streak: 17,
    badges: 11,
    trend: '0',
  },
  {
    id: 'sch-4',
    name: 'Siddharth V.',
    avatar: '🧑‍🚀',
    country: '🇮🇳',
    title: 'History Explorer',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    xp: 10640,
    level: 11,
    streak: 15,
    badges: 10,
    trend: '+3',
  },
  {
    id: 'sch-5',
    name: 'Pooja Krishnan',
    avatar: '👩‍💼',
    country: '🇮🇳',
    title: 'Tamil Scholar',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    xp: 10100,
    level: 11,
    streak: 14,
    badges: 9,
    trend: '+1',
  },
  {
    id: 'sch-6',
    name: 'Rahul Dev',
    avatar: '🧑‍💻',
    country: '🇮🇳',
    title: 'Lab Explorer',
    standardId: 'grade-6',
    standardName: '6th Standard',
    subjectId: 'science',
    subjectName: 'Science',
    xp: 9750,
    level: 10,
    streak: 12,
    badges: 8,
    trend: '-1',
  },
  {
    id: 'sch-7',
    name: 'Divya M.',
    avatar: '👧',
    country: '🇮🇳',
    title: 'Number Wizard',
    standardId: 'grade-5',
    standardName: '5th Standard',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    xp: 9200,
    level: 10,
    streak: 11,
    badges: 8,
    trend: '+2',
  },
  {
    id: 'sch-8',
    name: 'Vikram Karthik',
    avatar: '👦',
    country: '🇮🇳',
    title: 'Word Hunter',
    standardId: 'grade-4',
    standardName: '4th Standard',
    subjectId: 'english',
    subjectName: 'English',
    xp: 8950,
    level: 9,
    streak: 10,
    badges: 7,
    trend: '0',
  },
  {
    id: 'sch-9',
    name: 'Nithya S.',
    avatar: '👩‍🎓',
    country: '🇮🇳',
    title: 'Tamil Illakkiya Star',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    xp: 8400,
    level: 9,
    streak: 9,
    badges: 6,
    trend: '+1',
  },
  {
    id: 'sch-10',
    name: 'Harish K.',
    avatar: '🧑‍🎓',
    country: '🇮🇳',
    title: 'Geography Ace',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    xp: 7900,
    level: 8,
    streak: 8,
    badges: 6,
    trend: '-2',
  },
  {
    id: 'sch-11',
    name: 'Sneha V.',
    avatar: '👩‍💻',
    country: '🇮🇳',
    title: 'Curious Discoverer',
    standardId: 'grade-5',
    standardName: '5th Standard',
    subjectId: 'science',
    subjectName: 'Science',
    xp: 7450,
    level: 8,
    streak: 7,
    badges: 5,
    trend: '+1',
  },
  {
    id: 'sch-12',
    name: 'Anand Kumar',
    avatar: '🧑‍🏫',
    country: '🇮🇳',
    title: 'Tamil Kavignar',
    standardId: 'grade-4',
    standardName: '4th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    xp: 6900,
    level: 7,
    streak: 6,
    badges: 5,
    trend: '0',
  }
];

class LeaderboardService {
  async getLeaderboard({
    timeframe = 'weekly',
    standardId = null,
    subjectId = null,
    search = '',
    currentUser = null,
  } = {}) {
    let list = [];

    try {
      const statsRecords = await prisma.userStats.findMany({
        take: 50,
        orderBy: { totalXP: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });

      if (statsRecords && statsRecords.length > 0) {
        list = statsRecords.map((s, idx) => ({
          id: s.userId,
          name: s.user?.name || `Scholar ${idx + 1}`,
          avatar: '🎓',
          country: '🇮🇳',
          title: `Level ${s.currentLevel} Scholar`,
          standardId: 'grade-8',
          standardName: '8th Standard',
          subjectId: 'all',
          subjectName: 'General',
          xp: s.totalXP,
          level: s.currentLevel,
          streak: s.currentStreak,
          badges: Math.floor(s.totalXP / 1000),
          trend: '0',
        }));
      }
    } catch {
      // DB offline - gracefully use fallback seed
    }

    if (list.length === 0) {
      list = JSON.parse(JSON.stringify(SCHOLARS_SEED));
    }

    if (timeframe === 'weekly') {
      list = list.map(item => ({
        ...item,
        xp: Math.round(item.xp * 0.35),
      }));
    } else if (timeframe === 'monthly') {
      list = list.map(item => ({
        ...item,
        xp: Math.round(item.xp * 0.75),
      }));
    }

    if (currentUser) {
      const userXP = currentUser.xp !== undefined ? currentUser.xp : (currentUser.totalXP || 0);
      const userLevel = currentUser.level || Math.floor(userXP / 1000) + 1;
      const userStreak = currentUser.streak || 1;

      const existingIdx = list.findIndex(p => p.id === currentUser.id);
      const userEntry = {
        id: currentUser.id,
        name: currentUser.name || 'You',
        avatar: currentUser.avatar || '⚡',
        country: '🇮🇳',
        title: `Rising Scholar · Lv ${userLevel}`,
        standardId: currentUser.standardId || 'grade-8',
        standardName: currentUser.standardName || '8th Standard',
        subjectId: currentUser.subjectId || 'mathematics',
        subjectName: currentUser.subjectName || 'General',
        xp: timeframe === 'weekly' ? Math.round(userXP * 0.35) : timeframe === 'monthly' ? Math.round(userXP * 0.75) : userXP,
        level: userLevel,
        streak: userStreak,
        badges: currentUser.badges?.length || 1,
        trend: '+1',
        isUser: true,
      };

      if (existingIdx !== -1) {
        list[existingIdx] = { ...list[existingIdx], ...userEntry };
      } else {
        list.push(userEntry);
      }
    }

    if (standardId && standardId !== 'all') {
      const stdFilter = standardId.toLowerCase().trim();
      list = list.filter(p => p.standardId && p.standardId.toLowerCase() === stdFilter);
    }

    if (subjectId && subjectId !== 'all') {
      const subFilter = subjectId.toLowerCase().trim();
      list = list.filter(p => p.subjectId && p.subjectId.toLowerCase() === subFilter);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.subjectName && p.subjectName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => b.xp - a.xp);

    list = list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    let userStatsSummary = null;
    if (currentUser) {
      const userItem = list.find(p => p.id === currentUser.id || p.isUser);
      if (userItem) {
        const nextAbove = list[userItem.rank - 2];
        userStatsSummary = {
          rank: userItem.rank,
          totalXP: userItem.xp,
          level: userItem.level,
          streak: userItem.streak,
          xpToNextRank: nextAbove ? (nextAbove.xp - userItem.xp + 10) : 0,
        };
      }
    }

    return {
      timeframe,
      standardId: standardId || 'all',
      subjectId: subjectId || 'all',
      totalScholars: list.length,
      top3: list.slice(0, 3),
      rankings: list,
      userStanding: userStatsSummary,
    };
  }
}

module.exports = new LeaderboardService();
