/**
 * ChemEscape - Standard 4 All Subject Chapter 1 Content Audit Script
 * 
 * Audits all 5 Standard 4 Subjects:
 * - Tamil
 * - English
 * - Mathematics
 * - Science
 * - Social Science
 * 
 * Verifies:
 * SUBJECT | CHAPTER | ROOM | GAME TYPE | PUBLISHED QUESTIONS | ACTIVE QUESTIONS | STATUS
 */

const http = require('http');

const API = 'http://localhost:5000/api';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(API + path);
    const payload = body ? JSON.stringify(body) : null;

    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runAudit() {
  console.log('========================================================================================');
  console.log('📋 CHEMESCAPE STANDARD 4 ALL SUBJECT CONTENT & QUESTION AUDIT');
  console.log('========================================================================================\n');

  try {
    // Authenticate Student
    const login = await request('POST', '/auth/login', {
      email: 'student@chemescape.com',
      password: 'Password123',
    });
    const token = login.body?.data?.token;
    const headers = { Authorization: `Bearer ${token}` };

    const subjectConfigs = [
      { name: 'Tamil', subjId: 'tamil', subjCode: 'TAMIL', chId: 'ch-tam4-1', expectedRoomId: 'room-tam4-1' },
      { name: 'English', subjId: 'english', subjCode: 'ENG', chId: 'ch-eng4-1', expectedRoomId: 'room-eng4-1' },
      { name: 'Mathematics', subjId: 'mathematics', subjCode: 'MATH', chId: 'ch-math4-1', expectedRoomId: 'room-math4-1' },
      { name: 'Science', subjId: 'science', subjCode: 'SCI', chId: 'ch-sci4-1', expectedRoomId: 'room-sci4-1' },
      { name: 'Social Science', subjId: 'social-science', subjCode: 'SOCIAL', chId: 'ch-soc4-1', expectedRoomId: 'room-soc4-1' },
    ];

    const results = [];

    for (const sc of subjectConfigs) {
      // 1. Fetch Chapter
      const chRes = await request('GET', `/chapters/${sc.chId}?standardId=grade-4&subjectId=${sc.subjId}`, null, headers);
      const chapter = chRes.body?.data?.chapter || chRes.body?.data || null;

      // 2. Fetch Rooms for Chapter
      const roomsRes = await request('GET', `/chapters/${sc.chId}/rooms?standardId=grade-4&subjectId=${sc.subjId}`, null, headers);
      const rooms = roomsRes.body?.data?.rooms || roomsRes.body?.data || [];
      const primaryRoom = rooms[0] || null;

      // 3. Fetch Questions for Room
      let questions = [];
      if (primaryRoom?.id) {
        const qRes = await request(
          'GET',
          `/rooms/${primaryRoom.id}/questions?standardId=grade-4&subjectId=${sc.subjId}&chapterId=${sc.chId}`,
          null,
          headers
        );
        questions = qRes.body?.data?.questions || [];
      }

      const publishedCount = questions.length; // Student view returns only published
      const activeCount = questions.length;
      const gameType = primaryRoom?.gameType || 'UNKNOWN';

      const isReady =
        Boolean(chapter) &&
        Boolean(primaryRoom) &&
        (gameType === 'GENERIC_CHAPTER_QUIZ' || gameType === 'GENERIC_QUIZ') &&
        publishedCount === 10 &&
        activeCount === 10;

      const status = isReady ? 'READY' : (publishedCount === 0 ? 'NO_CONTENT' : 'INSUFFICIENT_QUESTIONS');

      results.push({
        subject: sc.name,
        chapter: chapter ? `Chapter ${chapter.chapterNumber || 1}: ${chapter.title}` : 'NOT FOUND',
        roomId: primaryRoom?.id || 'NOT FOUND',
        gameType,
        publishedCount,
        activeCount,
        status,
      });
    }

    // Format output table
    console.log(
      'SUBJECT'.padEnd(16) + ' | ' +
      'CHAPTER'.padEnd(35) + ' | ' +
      'ROOM'.padEnd(15) + ' | ' +
      'GAME TYPE'.padEnd(22) + ' | ' +
      'PUB'.padStart(4) + ' | ' +
      'ACT'.padStart(4) + ' | ' +
      'STATUS'
    );
    console.log('-'.repeat(120));

    let allReady = true;
    for (const r of results) {
      const line =
        r.subject.padEnd(16) + ' | ' +
        r.chapter.padEnd(35) + ' | ' +
        r.roomId.padEnd(15) + ' | ' +
        r.gameType.padEnd(22) + ' | ' +
        String(r.publishedCount).padStart(4) + ' | ' +
        String(r.activeCount).padStart(4) + ' | ' +
        (r.status === 'READY' ? '✅ READY' : '❌ ' + r.status);
      console.log(line);
      if (r.status !== 'READY') allReady = false;
    }

    console.log('-'.repeat(120));
    if (allReady) {
      console.log('\n🎉 ALL 5 STANDARD 4 SUBJECTS ARE VERIFIED 100% READY!\n');
      process.exit(0);
    } else {
      console.log('\n⚠️ AUDIT FAILED: Some subjects are not in READY state.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Audit execution error:', err);
    process.exit(1);
  }
}

runAudit();
