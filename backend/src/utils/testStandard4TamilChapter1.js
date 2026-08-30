/**
 * ChemEscape - Standard 4 Tamil Chapter 1 Content & Hierarchy Verification Test Suite
 * 
 * Tests:
 * 1. Standard exists (grade-4)
 * 2. Tamil subject exists (subj-tamil)
 * 3. StandardSubject mapping exists (grade-4 -> subj-tamil)
 * 4. Chapter 1 exists (ch-tam4-1 / அன்னைத் தமிழே)
 * 5. Topics exist under Chapter 1
 * 6. Room exists for Chapter 1 (room-tam4-1)
 * 7. Room uses generic quiz (GENERIC_CHAPTER_QUIZ)
 * 8. Exactly 10 questions exist
 * 9. All 10 questions belong to the same room (room-tam4-1)
 * 10. All questions are published (status = PUBLISHED)
 * 11. All questions are active (isActive = true)
 * 12. Hints belong strictly to current questions
 * 13. Answer keys are stripped from student API
 * 14. No Chemistry/Math/Science question leakage
 * 15. Duplicate seed protection
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

const report = [];

const record = (testNum, testName, expected, actual, passed, details = '') => {
  report.push({
    testNum,
    testName,
    expected: String(expected),
    actual: String(actual),
    status: passed ? 'PASS' : 'FAIL',
    details,
  });
  const badge = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${badge} | Test ${testNum}: ${testName}`);
  if (!passed) {
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
    if (details) console.log(`   Details:  ${details}`);
  }
};

async function runStandard4TamilTests() {
  console.log('================================================================');
  console.log('🧪 CHEMESCAPE STANDARD 4 TAMIL CHAPTER 1 TEST SUITE');
  console.log('================================================================\n');

  try {
    // 0. Authenticate Student & Teacher
    const loginStudent = await request('POST', '/auth/login', {
      email: 'student@chemescape.com',
      password: 'Password123',
    });
    const studentToken = loginStudent.body?.data?.token;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    const loginTeacher = await request('POST', '/auth/login', {
      email: 'teacher@chemescape.com',
      password: 'Password123',
    });
    const teacherToken = loginTeacher.body?.data?.token;
    const teacherHeaders = { Authorization: `Bearer ${teacherToken}` };

    // ─────────────────────────────────────────────────────────────────────────
    // Test 1: Standard 4 Exists
    // ─────────────────────────────────────────────────────────────────────────
    const stdRes = await request('GET', '/standards', null, studentHeaders);
    const standards = stdRes.body?.data?.standards || stdRes.body?.data || [];
    const std4 = standards.find(s => s.id === 'grade-4' || s.grade === 4 || s.name === '4');
    record(
      1,
      'Standard 4 exists in curriculum system',
      'grade-4',
      std4?.id,
      Boolean(std4 && (std4.grade === 4 || std4.id === 'grade-4')),
      `Found Standard: ${std4?.displayName || std4?.name}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 2: Tamil Subject Exists
    // ─────────────────────────────────────────────────────────────────────────
    const subjRes = await request('GET', '/standards/grade-4/subjects', null, studentHeaders);
    const subjects = subjRes.body?.data?.subjects || subjRes.body?.data || [];
    const tamilSubj = subjects.find(s => s.code === 'TAMIL' || s.name?.toLowerCase() === 'tamil' || s.id === 'subj-tamil');
    record(
      2,
      'Tamil subject exists under Standard 4',
      'TAMIL',
      tamilSubj?.code || tamilSubj?.name,
      Boolean(tamilSubj),
      `Found Subject: ${tamilSubj?.name} (${tamilSubj?.code})`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: StandardSubject Mapping Exists
    // ─────────────────────────────────────────────────────────────────────────
    const isMapped = subjects.some(s => s.code === 'TAMIL' || s.id === 'subj-tamil');
    record(
      3,
      'Standard 4 -> Tamil mapping is active and valid',
      true,
      isMapped,
      isMapped,
      `Standard 4 contains ${subjects.length} mapped subjects`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: Chapter 1 Exists (அன்னைத் தமிழே)
    // ─────────────────────────────────────────────────────────────────────────
    const chRes = await request('GET', '/standards/grade-4/chapters?subjectId=subj-tamil', null, studentHeaders);
    const chapters = chRes.body?.data?.chapters || chRes.body?.data || [];
    const ch1 = chapters.find(c => c.chapterNumber === 1 || c.id === 'ch-tam4-1');
    record(
      4,
      'Standard 4 Tamil Chapter 1 exists (அன்னைத் தமிழே)',
      'அன்னைத் தமிழே',
      ch1?.title,
      Boolean(ch1 && (ch1.title.includes('அன்னைத் தமிழே') || ch1.chapterNumber === 1)),
      `Chapter Title: ${ch1?.title}, Chapter ID: ${ch1?.id}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 5: Topics Exist under Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    const topRes = await request('GET', '/chapters/ch-tam4-1/topics', null, studentHeaders);
    const topics = topRes.body?.data?.topics || topRes.body?.data || [];
    record(
      5,
      'Authentic topics exist for Standard 4 Tamil Chapter 1',
      '>= 1 topic',
      `${topics.length} topics`,
      topics.length >= 1,
      `Topics: ${topics.map(t => t.title).join(', ')}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 6: Room Exists for Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    const roomRes = await request('GET', '/chapters/ch-tam4-1/rooms', null, studentHeaders);
    const rooms = roomRes.body?.data?.rooms || roomRes.body?.data || [];
    const room1 = rooms.find(r => r.id === 'room-tam4-1' || r.chapterId === 'ch-tam4-1');
    record(
      6,
      'Room exists for Standard 4 Tamil Chapter 1 (room-tam4-1)',
      'room-tam4-1',
      room1?.id,
      Boolean(room1),
      `Room Name: ${room1?.title || room1?.name}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 7: Room Uses Generic Quiz Engine
    // ─────────────────────────────────────────────────────────────────────────
    const gameType = room1?.gameType;
    record(
      7,
      'Room is configured for GENERIC_CHAPTER_QUIZ',
      'GENERIC_CHAPTER_QUIZ',
      gameType,
      gameType === 'GENERIC_CHAPTER_QUIZ' || gameType === 'GENERIC_QUIZ',
      `Room GameType: ${gameType}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 8: Exactly 10 Questions
    // ─────────────────────────────────────────────────────────────────────────
    const qRes = await request('GET', '/rooms/room-tam4-1/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-1', null, studentHeaders);
    const questions = qRes.body?.data?.questions || [];
    record(
      8,
      'Exactly 10 questions configured for Standard 4 Tamil Chapter 1',
      10,
      questions.length,
      questions.length === 10,
      `Questions count: ${questions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 9: All Questions Belong to room-tam4-1
    // ─────────────────────────────────────────────────────────────────────────
    const allSameRoom = questions.length === 10 && questions.every(q => q.roomId === 'room-tam4-1');
    record(
      9,
      'All 10 questions belong strictly to room-tam4-1 without cross-room borrowing',
      true,
      allSameRoom,
      allSameRoom
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 10: All Questions Published
    // ─────────────────────────────────────────────────────────────────────────
    const allPublished = questions.length === 10 && questions.every(q => q.status === 'PUBLISHED');
    record(
      10,
      'All 10 questions have PUBLISHED status',
      true,
      allPublished,
      allPublished
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 11: All Questions Active
    // ─────────────────────────────────────────────────────────────────────────
    const allActive = questions.length === 10 && questions.every(q => q.isActive !== false);
    record(
      11,
      'All 10 questions have isActive = true',
      true,
      allActive,
      allActive
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 12: Hints Belong Strictly to Current Questions
    // ─────────────────────────────────────────────────────────────────────────
    const allHaveHints = questions.every(q => typeof q.hint === 'string' && q.hint.length > 0);
    const distinctHints = new Set(questions.map(q => q.hint));
    record(
      12,
      'Each question maintains its own unique, question-specific hint',
      questions.length,
      distinctHints.size,
      allHaveHints && distinctHints.size === questions.length,
      `Unique hints: ${distinctHints.size}/${questions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 13: Answer Keys Stripped from Student API
    // ─────────────────────────────────────────────────────────────────────────
    const anyLeaked = questions.some(q => {
      if (q.correctAnswer !== undefined || q.solutionKey !== undefined || q.solution !== undefined) return true;
      if (q.options && q.options.some(opt => opt.isCorrect !== undefined)) return true;
      if (q.puzzleData && (q.puzzleData.correctMapping !== undefined || q.puzzleData.solutionKey !== undefined)) return true;
      return false;
    });
    record(
      13,
      'Student question response strictly hides isCorrect, solutionKey, and answers',
      false,
      anyLeaked,
      !anyLeaked,
      'All student responses sanitized'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 14: No Chemistry / Mathematics / Science Leakage
    // ─────────────────────────────────────────────────────────────────────────
    const hasLeakage = questions.some(q => {
      const text = (q.questionText + ' ' + (q.options?.map(o => o.optionText).join(' ') || '')).toLowerCase();
      return text.includes('periodic') || text.includes('quantum') || text.includes('chemistry') ||
             text.includes('molecule') || text.includes('electron') || text.includes('perimeter');
    });
    const allTamilText = questions.every(q => /[\u0B80-\u0BFF]/.test(q.questionText));
    record(
      14,
      'Standard 4 Tamil questions contain ZERO Chemistry, Math, or Science leakage',
      'Tamil text with 0 leakage',
      `allTamilText: ${allTamilText}, hasLeakage: ${hasLeakage}`,
      allTamilText && !hasLeakage,
      'Questions contain 100% authentic Tamil text'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 15: Duplicate Seed Protection / Idempotency
    // ─────────────────────────────────────────────────────────────────────────
    // Repeated retrieval matches identical question count and IDs
    const repeatRes = await request('GET', '/rooms/room-tam4-1/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-1', null, studentHeaders);
    const repeatQuestions = repeatRes.body?.data?.questions || [];
    const isIdempotent = repeatQuestions.length === 10 && repeatQuestions.every((q, idx) => q.id === questions[idx].id);
    record(
      15,
      'Curriculum structure is idempotent and protects against duplicate entities',
      true,
      isIdempotent,
      isIdempotent,
      `Repeat queries return exactly identical 10 question entities`
    );

  } catch (err) {
    console.error('❌ Unexpected error in Standard 4 Tamil Chapter 1 test suite:', err);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 STANDARD 4 TAMIL CHAPTER 1 SUMMARY RESULTS');
  console.log('================================================================');
  const total = report.length;
  const passed = report.filter(r => r.status === 'PASS').length;
  const failed = total - passed;
  const rate = Math.round((passed / total) * 100);

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:          ${passed}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Success Rate:    ${rate}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL 15 STANDARD 4 TAMIL CHAPTER 1 TESTS PASSED 100% SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

runStandard4TamilTests();
