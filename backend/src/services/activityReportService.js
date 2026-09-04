const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DATA_DIR = path.resolve(__dirname, '../../data');
const REPORTS_DIR = path.resolve(__dirname, '../../reports');
const DATA_FILE = path.join(DATA_DIR, 'user_activity_history.json');
const EXCEL_FILE = path.join(REPORTS_DIR, 'EduNova_User_Activity_Report.xlsx');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

// Initial seed data to ensure rich demonstration data for teachers/admins
const SEED_ACTIVITIES = [
  {
    id: 'act-001',
    name: 'John',
    userId: 'USER001',
    standard: '7th',
    subject: 'Science',
    chapter: 'Chapter 1: Measurement & Motion',
    gameOrQuizName: 'Interactive Chapter Quiz',
    points: 90,
    accuracy: '90%',
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    timeTaken: '05:30 mins',
    timeSpentSec: 330,
    dateTime: '04-09-2026 14:15:22',
    timestamp: '2026-09-04T14:15:22.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-002',
    name: 'John',
    userId: 'USER001',
    standard: '7th',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Number System: Integers',
    gameOrQuizName: 'Integer Operations Challenge',
    points: 80,
    accuracy: '80%',
    totalQuestions: 10,
    correctAnswers: 8,
    wrongAnswers: 2,
    timeTaken: '06:15 mins',
    timeSpentSec: 375,
    dateTime: '04-09-2026 15:10:05',
    timestamp: '2026-09-04T15:10:05.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-003',
    name: 'John',
    userId: 'USER001',
    standard: '7th',
    subject: 'English',
    chapter: 'Chapter 1: Eidgah (Prose & Grammar)',
    gameOrQuizName: 'Grammar & Vocabulary Quiz',
    points: 100,
    accuracy: '100%',
    totalQuestions: 10,
    correctAnswers: 10,
    wrongAnswers: 0,
    timeTaken: '04:40 mins',
    timeSpentSec: 280,
    dateTime: '04-09-2026 15:45:18',
    timestamp: '2026-09-04T15:45:18.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-004',
    name: 'Priya Sharma',
    userId: 'USER002',
    standard: '8th',
    subject: 'Tamil',
    chapter: 'Chapter 1: தமிழ் இன்பம் (Tamil Inbam)',
    gameOrQuizName: 'Tamil Literature Quiz',
    points: 100,
    accuracy: '100%',
    totalQuestions: 10,
    correctAnswers: 10,
    wrongAnswers: 0,
    timeTaken: '04:15 mins',
    timeSpentSec: 255,
    dateTime: '04-09-2026 11:20:45',
    timestamp: '2026-09-04T11:20:45.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-005',
    name: 'Priya Sharma',
    userId: 'USER002',
    standard: '8th',
    subject: 'Science',
    chapter: 'Chapter 1: Measurement',
    gameOrQuizName: 'SI Unit & Mechanics Quiz',
    points: 90,
    accuracy: '90%',
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    timeTaken: '05:05 mins',
    timeSpentSec: 305,
    dateTime: '04-09-2026 12:35:10',
    timestamp: '2026-09-04T12:35:10.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-006',
    name: 'Arun Kumar',
    userId: 'USER003',
    standard: '6th',
    subject: 'Science',
    chapter: 'Chapter 1: Measurements & Motion',
    gameOrQuizName: 'Motion & Scales Quest',
    points: 70,
    accuracy: '70%',
    totalQuestions: 10,
    correctAnswers: 7,
    wrongAnswers: 3,
    timeTaken: '07:20 mins',
    timeSpentSec: 440,
    dateTime: '04-09-2026 09:30:12',
    timestamp: '2026-09-04T09:30:12.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-007',
    name: 'Arun Kumar',
    userId: 'USER003',
    standard: '6th',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Numbers & Operations',
    gameOrQuizName: 'Numbers Mastery Quiz',
    points: 60,
    accuracy: '60%',
    totalQuestions: 10,
    correctAnswers: 6,
    wrongAnswers: 4,
    timeTaken: '08:15 mins',
    timeSpentSec: 495,
    dateTime: '04-09-2026 10:15:30',
    timestamp: '2026-09-04T10:15:30.000Z',
    status: 'FAILED'
  },
  {
    id: 'act-008',
    name: 'Arun Kumar',
    userId: 'USER003',
    standard: '6th',
    subject: 'Mathematics',
    chapter: 'Chapter 1: Numbers & Operations',
    gameOrQuizName: 'Numbers Mastery Quiz (Retry)',
    points: 90,
    accuracy: '90%',
    totalQuestions: 10,
    correctAnswers: 9,
    wrongAnswers: 1,
    timeTaken: '05:45 mins',
    timeSpentSec: 345,
    dateTime: '04-09-2026 10:45:00',
    timestamp: '2026-09-04T10:45:00.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-009',
    name: 'Divya Nair',
    userId: 'USER004',
    standard: '5th',
    subject: 'Social Science',
    chapter: 'Chapter 1: Introduction to Social Science',
    gameOrQuizName: 'Continents & Oceans Quiz',
    points: 100,
    accuracy: '100%',
    totalQuestions: 10,
    correctAnswers: 10,
    wrongAnswers: 0,
    timeTaken: '03:50 mins',
    timeSpentSec: 230,
    dateTime: '04-09-2026 13:00:25',
    timestamp: '2026-09-04T13:00:25.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-010',
    name: 'Student Scholar',
    userId: 'usr-student-1',
    standard: '4th',
    subject: 'Tamil',
    chapter: 'Chapter 1: அன்னைத் தமிழே',
    gameOrQuizName: 'Tamil Poem & Grammar Quiz',
    points: 100,
    accuracy: '100%',
    totalQuestions: 10,
    correctAnswers: 10,
    wrongAnswers: 0,
    timeTaken: '04:10 mins',
    timeSpentSec: 250,
    dateTime: '04-09-2026 14:00:15',
    timestamp: '2026-09-04T14:00:15.000Z',
    status: 'PASSED'
  },
  {
    id: 'act-011',
    name: 'Student Scholar',
    userId: 'usr-student-1',
    standard: '11th',
    subject: 'Chemistry',
    chapter: 'Chapter 3: Periodic Classification',
    gameOrQuizName: 'Grid Reconstruction Game',
    points: 150,
    accuracy: '100%',
    totalQuestions: 3,
    correctAnswers: 3,
    wrongAnswers: 0,
    timeTaken: '03:20 mins',
    timeSpentSec: 200,
    dateTime: '04-09-2026 15:30:00',
    timestamp: '2026-09-04T15:30:00.000Z',
    status: 'COMPLETED'
  }
];

class ActivityReportService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    try {
      if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(SEED_ACTIVITIES, null, 2), 'utf8');
        this.writeExcelFile(SEED_ACTIVITIES);
      } else {
        // Ensure excel file also exists on disk
        if (!fs.existsSync(EXCEL_FILE)) {
          const records = this.readAllRecords();
          this.writeExcelFile(records);
        }
      }
    } catch (err) {
      console.error('[ActivityReportService] Error initializing storage:', err);
    }
  }

  readAllRecords() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[ActivityReportService] Error reading records:', err);
    }
    return [...SEED_ACTIVITIES];
  }

  saveAllRecords(records) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf8');
      this.writeExcelFile(records);
    } catch (err) {
      console.error('[ActivityReportService] Error saving records:', err);
    }
  }

  formatTimeTaken(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00 mins';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mm = m < 10 ? '0' + m : m;
    const ss = s < 10 ? '0' + s : s;
    return `${mm}:${ss} mins`;
  }

  formatDateTime(date = new Date()) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const secs = String(d.getSeconds()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${mins}:${secs}`;
  }

  /**
   * Log a new user quiz or game activity record
   */
  logActivity({
    userId,
    name = 'Student',
    standard = '7th',
    subject = 'General',
    chapter = 'Chapter 1',
    gameOrQuizName = 'Quiz',
    points = 0,
    accuracy = null,
    totalQuestions = 10,
    correctAnswers = 0,
    wrongAnswers = 0,
    timeSpentSec = 0,
    status = 'PASSED',
  }) {
    const records = this.readAllRecords();

    // Compute accuracy if not provided
    let accuracyStr = accuracy;
    if (!accuracyStr) {
      if (totalQuestions > 0) {
        const pct = Math.round((correctAnswers / totalQuestions) * 100);
        accuracyStr = `${pct}%`;
      } else {
        accuracyStr = '100%';
      }
    } else if (typeof accuracyStr === 'number') {
      accuracyStr = `${Math.round(accuracyStr)}%`;
    }

    // Standardize standard name (e.g. 'grade-7' -> '7th', '7th Standard' -> '7th')
    let stdLabel = standard || '7th';
    if (stdLabel.includes('4')) stdLabel = '4th';
    else if (stdLabel.includes('5')) stdLabel = '5th';
    else if (stdLabel.includes('6')) stdLabel = '6th';
    else if (stdLabel.includes('7')) stdLabel = '7th';
    else if (stdLabel.includes('8')) stdLabel = '8th';
    else if (stdLabel.includes('11')) stdLabel = '11th';

    const newRecord = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name || 'Student Scholar',
      userId: userId || `USER-${Date.now()}`,
      standard: stdLabel,
      subject: subject || 'Science',
      chapter: chapter || 'Chapter 1',
      gameOrQuizName: gameOrQuizName || 'Quiz',
      points: Number(points) || 0,
      accuracy: accuracyStr,
      totalQuestions: Number(totalQuestions) || 10,
      correctAnswers: Number(correctAnswers) || 0,
      wrongAnswers: Number(wrongAnswers) || 0,
      timeTaken: this.formatTimeTaken(timeSpentSec),
      timeSpentSec: Number(timeSpentSec) || 0,
      dateTime: this.formatDateTime(),
      timestamp: new Date().toISOString(),
      status: status || 'PASSED',
    };

    // Prepend new record so recent activities appear first
    records.unshift(newRecord);
    this.saveAllRecords(records);
    return newRecord;
  }

  /**
   * Filter and search reports
   */
  getReports(filter = {}) {
    let records = this.readAllRecords();

    if (filter.userId) {
      records = records.filter(r => r.userId === filter.userId);
    }

    if (filter.standard && filter.standard !== 'ALL') {
      const stdTerm = filter.standard.toLowerCase().replace(' standard', '');
      records = records.filter(r => r.standard.toLowerCase().includes(stdTerm));
    }

    if (filter.subject && filter.subject !== 'ALL') {
      const subjTerm = filter.subject.toLowerCase();
      records = records.filter(r => r.subject.toLowerCase().includes(subjTerm));
    }

    if (filter.chapter && filter.chapter !== 'ALL') {
      const chTerm = filter.chapter.toLowerCase();
      records = records.filter(r => r.chapter.toLowerCase().includes(chTerm));
    }

    if (filter.gameOrQuiz && filter.gameOrQuiz !== 'ALL') {
      const gTerm = filter.gameOrQuiz.toLowerCase();
      records = records.filter(r => r.gameOrQuizName.toLowerCase().includes(gTerm));
    }

    if (filter.status && filter.status !== 'ALL') {
      records = records.filter(r => r.status.toUpperCase() === filter.status.toUpperCase());
    }

    if (filter.search && filter.search.trim()) {
      const s = filter.search.toLowerCase().trim();
      records = records.filter(r =>
        (r.name && r.name.toLowerCase().includes(s)) ||
        (r.userId && r.userId.toLowerCase().includes(s)) ||
        (r.subject && r.subject.toLowerCase().includes(s)) ||
        (r.chapter && r.chapter.toLowerCase().includes(s)) ||
        (r.gameOrQuizName && r.gameOrQuizName.toLowerCase().includes(s))
      );
    }

    if (filter.date) {
      records = records.filter(r => r.dateTime && r.dateTime.startsWith(filter.date));
    }

    return records;
  }

  /**
   * Complete quiz/game activity history for a specific registered user
   */
  getUserHistory(userId) {
    const allRecords = this.readAllRecords();
    const userRecords = allRecords.filter(r => r.userId === userId);

    if (userRecords.length === 0) {
      return {
        userId,
        name: 'Unknown User',
        totalActivities: 0,
        records: [],
        summary: {
          totalPoints: 0,
          avgAccuracy: '0%',
          passedCount: 0,
          failedCount: 0,
          totalTimeSec: 0,
        }
      };
    }

    const totalPoints = userRecords.reduce((sum, r) => sum + (Number(r.points) || 0), 0);
    const passedCount = userRecords.filter(r => r.status === 'PASSED' || r.status === 'COMPLETED').length;
    const failedCount = userRecords.filter(r => r.status === 'FAILED').length;
    const totalTimeSec = userRecords.reduce((sum, r) => sum + (Number(r.timeSpentSec) || 0), 0);

    let totalAcc = 0;
    userRecords.forEach(r => {
      const num = parseInt(r.accuracy, 10) || 0;
      totalAcc += num;
    });
    const avgAccuracy = Math.round(totalAcc / userRecords.length) + '%';

    return {
      userId,
      name: userRecords[0].name,
      standard: userRecords[0].standard,
      totalActivities: userRecords.length,
      records: userRecords,
      summary: {
        totalPoints,
        avgAccuracy,
        passedCount,
        failedCount,
        totalTimeSec,
        formattedTotalTime: this.formatTimeTaken(totalTimeSec)
      }
    };
  }

  /**
   * High-level metrics for dashboard cards
   */
  getStats() {
    const records = this.readAllRecords();
    const uniqueUsers = new Set(records.map(r => r.userId));
    const passedCount = records.filter(r => r.status === 'PASSED' || r.status === 'COMPLETED').length;
    const passRate = records.length > 0 ? Math.round((passedCount / records.length) * 100) : 0;

    let totalAcc = 0;
    records.forEach(r => {
      totalAcc += parseInt(r.accuracy, 10) || 0;
    });
    const avgAccuracy = records.length > 0 ? Math.round(totalAcc / records.length) : 0;

    return {
      totalActivities: records.length,
      uniqueUsers: uniqueUsers.size,
      avgAccuracy: `${avgAccuracy}%`,
      passRate: `${passRate}%`,
      totalPassed: passedCount,
      totalFailed: records.length - passedCount,
    };
  }

  /**
   * Build XLSX workbook and return as binary buffer
   */
  generateExcelBuffer(filter = {}) {
    const records = this.getReports(filter);

    // Sheet 1: Exact columns required by User Request
    const excelRows = records.map(r => ({
      'Name': r.name,
      'Registered User ID': r.userId,
      'Standard/Class': r.standard,
      'Subject': r.subject,
      'Chapter': r.chapter,
      'Quiz/Game Name': r.gameOrQuizName,
      'Points/Score': r.points,
      'Accuracy': r.accuracy,
      'Total Questions': r.totalQuestions,
      'Correct Answers': r.correctAnswers,
      'Wrong Answers': r.wrongAnswers,
      'Time Taken to Complete the Quiz/Game': r.timeTaken,
      'Date and Time': r.dateTime,
      'Game/Quiz Completion Status': r.status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelRows);

    // Column widths for professional readability
    ws['!cols'] = [
      { wch: 18 }, // Name
      { wch: 20 }, // Registered User ID
      { wch: 15 }, // Standard/Class
      { wch: 16 }, // Subject
      { wch: 32 }, // Chapter
      { wch: 28 }, // Quiz/Game Name
      { wch: 14 }, // Points/Score
      { wch: 12 }, // Accuracy
      { wch: 16 }, // Total Questions
      { wch: 16 }, // Correct Answers
      { wch: 16 }, // Wrong Answers
      { wch: 34 }, // Time Taken
      { wch: 22 }, // Date and Time
      { wch: 28 }, // Completion Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'User Activity Report');

    // Sheet 2: User Summary Table
    const userMap = {};
    records.forEach(r => {
      if (!userMap[r.userId]) {
        userMap[r.userId] = {
          userId: r.userId,
          name: r.name,
          standard: r.standard,
          totalPlays: 0,
          totalPoints: 0,
          accuracies: [],
          passed: 0,
          failed: 0,
        };
      }
      userMap[r.userId].totalPlays += 1;
      userMap[r.userId].totalPoints += Number(r.points) || 0;
      userMap[r.userId].accuracies.push(parseInt(r.accuracy, 10) || 0);
      if (r.status === 'PASSED' || r.status === 'COMPLETED') {
        userMap[r.userId].passed += 1;
      } else {
        userMap[r.userId].failed += 1;
      }
    });

    const summaryRows = Object.values(userMap).map(u => {
      const avgAcc = u.accuracies.length > 0 ? Math.round(u.accuracies.reduce((a, b) => a + b, 0) / u.accuracies.length) : 0;
      return {
        'User ID': u.userId,
        'Name': u.name,
        'Standard': u.standard,
        'Total Quizzes/Games': u.totalPlays,
        'Total Points Earned': u.totalPoints,
        'Average Accuracy': `${avgAcc}%`,
        'Passed Activities': u.passed,
        'Failed Activities': u.failed,
      };
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [
      { wch: 18 },
      { wch: 20 },
      { wch: 14 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Registered Users Summary');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  writeExcelFile(records) {
    try {
      const excelRows = records.map(r => ({
        'Name': r.name,
        'Registered User ID': r.userId,
        'Standard/Class': r.standard,
        'Subject': r.subject,
        'Chapter': r.chapter,
        'Quiz/Game Name': r.gameOrQuizName,
        'Points/Score': r.points,
        'Accuracy': r.accuracy,
        'Total Questions': r.totalQuestions,
        'Correct Answers': r.correctAnswers,
        'Wrong Answers': r.wrongAnswers,
        'Time Taken to Complete the Quiz/Game': r.timeTaken,
        'Date and Time': r.dateTime,
        'Game/Quiz Completion Status': r.status,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelRows);
      ws['!cols'] = [
        { wch: 18 },
        { wch: 20 },
        { wch: 15 },
        { wch: 16 },
        { wch: 32 },
        { wch: 28 },
        { wch: 14 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 34 },
        { wch: 22 },
        { wch: 28 },
      ];
      XLSX.utils.book_append_sheet(wb, ws, 'User Activity Report');
      XLSX.writeFile(wb, EXCEL_FILE);
    } catch (err) {
      console.error('[ActivityReportService] Error writing excel file:', err);
    }
  }

  getExcelFilePath() {
    return EXCEL_FILE;
  }
}

module.exports = new ActivityReportService();
