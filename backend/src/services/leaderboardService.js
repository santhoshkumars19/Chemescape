'use strict';

const prisma = require('../config/db');

// Clean state - only real registered scholars and real activity are ranked
const SCHOLARS_SEED = [];

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
      // DB offline - fall through to local records
    }

    // Dynamic aggregation from real local activity records
    if (list.length === 0) {
      try {
        const activityReportService = require('./activityReportService');
        const records = activityReportService.readAllRecords();
        if (records && records.length > 0) {
          const userMap = {};
          records.forEach(r => {
            if (!r.userId) return;
            if (!userMap[r.userId]) {
              userMap[r.userId] = {
                id: r.userId,
                name: r.name || 'Scholar',
                avatar: '🎓',
                country: '🇮🇳',
                title: 'EduNova Scholar',
                standardId: r.standard ? (r.standard.toLowerCase().includes('grade') ? r.standard : `grade-${r.standard.replace(/\D/g, '')}`) : 'grade-8',
                standardName: r.standard ? `${r.standard} Standard` : 'General',
                subjectId: r.subject ? r.subject.toLowerCase() : 'all',
                subjectName: r.subject || 'General',
                xp: 0,
                level: 1,
                streak: 1,
                badges: 1,
                trend: '0',
              };
            }
            userMap[r.userId].xp += (Number(r.points) || 0);
          });
          list = Object.values(userMap).map(u => ({
            ...u,
            level: Math.floor(u.xp / 1000) + 1,
            badges: Math.max(1, Math.floor(u.xp / 1000)),
          }));
        }
      } catch (err) {
        console.warn('[LeaderboardService] Error aggregating local user activity:', err.message);
      }
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
      if (userXP > 0 || list.length > 0) {
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
