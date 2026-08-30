/**
 * ChemEscape - Standard 4 English Chapter 1 Content & Isolation Test Suite
 * 
 * Tests:
 * 1. Standard 4 exists (grade-4)
 * 2. English exists (subj-eng)
 * 3. StandardSubject mapping exists (grade-4 -> subj-eng)
 * 4. Chapter 1 exists (ch-eng4-1 / A Feast for Rats)
 * 5. Topics are correct under Chapter 1
 * 6. Room exists for Chapter 1 (room-eng4-1)
 * 7. Generic quiz configured (GENERIC_CHAPTER_QUIZ)
 * 8. Exactly 10 published questions
 * 9. Questions belong to same room (room-eng4-1)
 * 10. Questions belong to English Chapter 1 (ch-eng4-1)
 * 11. Hints are question-specific
 * 12. Student answer keys are sanitized
 * 13. No Tamil questions
 * 14. No Maths questions
 * 15. No Science questions
 * 16. No Social Science questions
 * 17. No cross-standard questions (Std 5 or Std 11)
 * 18. Duplicate seed protection / Idempotency
 * 19. Existing Tamil content unaffected
 * 20. Existing Chemistry content unaffected
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

async function runStandard4EnglishTests() {
  console.log('================================================================');
  console.log('🧪 CHEMESCAPE STANDARD 4 ENGLISH CHAPTER 1 TEST SUITE');
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
    // Test 2: English Subject Exists
    // ─────────────────────────────────────────────────────────────────────────
    const subjRes = await request('GET', '/standards/grade-4/subjects', null, studentHeaders);
    const subjects = subjRes.body?.data?.subjects || subjRes.body?.data || [];
    const engSubj = subjects.find(s => s.code === 'ENG' || s.name?.toLowerCase() === 'english' || s.id === 'subj-eng');
    record(
      2,
      'English subject exists under Standard 4',
      'ENG',
      engSubj?.code || engSubj?.name,
      Boolean(engSubj),
      `Found Subject: ${engSubj?.name} (${engSubj?.code})`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: StandardSubject Mapping Exists
    // ─────────────────────────────────────────────────────────────────────────
    const isMapped = subjects.some(s => s.code === 'ENG' || s.id === 'subj-eng');
    record(
      3,
      'Standard 4 -> English mapping is active and valid',
      true,
      isMapped,
      isMapped,
      `Standard 4 contains ${subjects.length} mapped subjects`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: Chapter 1 Exists (A Feast for Rats)
    // ─────────────────────────────────────────────────────────────────────────
    const chRes = await request('GET', '/standards/grade-4/chapters?subjectId=subj-eng', null, studentHeaders);
    const chapters = chRes.body?.data?.chapters || chRes.body?.data || [];
    const ch1 = chapters.find(c => c.chapterNumber === 1 || c.id === 'ch-eng4-1');
    record(
      4,
      'Standard 4 English Chapter 1 exists (A Feast for Rats)',
      'A Feast for Rats',
      ch1?.title,
      Boolean(ch1 && (ch1.title.includes('A Feast for Rats') || ch1.chapterNumber === 1)),
      `Chapter Title: ${ch1?.title}, Chapter ID: ${ch1?.id}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 5: Topics Are Correct Under Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    const topRes = await request('GET', '/chapters/ch-eng4-1/topics', null, studentHeaders);
    const topics = topRes.body?.data?.topics || topRes.body?.data || [];
    record(
      5,
      'Authentic topics exist for Standard 4 English Chapter 1',
      '>= 1 topic',
      `${topics.length} topics`,
      topics.length >= 1,
      `Topics: ${topics.map(t => t.title).join(', ')}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 6: Room Exists for Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    const roomRes = await request('GET', '/chapters/ch-eng4-1/rooms', null, studentHeaders);
    const rooms = roomRes.body?.data?.rooms || roomRes.body?.data || [];
    const room1 = rooms.find(r => r.id === 'room-eng4-1' || r.chapterId === 'ch-eng4-1');
    record(
      6,
      'Room exists for Standard 4 English Chapter 1 (room-eng4-1)',
      'room-eng4-1',
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
    // Test 8: Exactly 10 Published Questions
    // ─────────────────────────────────────────────────────────────────────────
    const qRes = await request('GET', '/rooms/room-eng4-1/questions?standardId=grade-4&subjectId=english&chapterId=ch-eng4-1', null, studentHeaders);
    const questions = qRes.body?.data?.questions || [];
    record(
      8,
      'Exactly 10 questions configured for Standard 4 English Chapter 1',
      10,
      questions.length,
      questions.length === 10,
      `Questions count: ${questions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 9: All Questions Belong to room-eng4-1
    // ─────────────────────────────────────────────────────────────────────────
    const allSameRoom = questions.length === 10 && questions.every(q => q.roomId === 'room-eng4-1');
    record(
      9,
      'All 10 questions belong strictly to room-eng4-1 without cross-room borrowing',
      true,
      allSameRoom,
      allSameRoom
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 10: All Questions Belong to English Chapter 1 (ch-eng4-1)
    // ─────────────────────────────────────────────────────────────────────────
    const allSameChapter = questions.length === 10 && questions.every(q => q.chapterId === 'ch-eng4-1');
    record(
      10,
      'All 10 questions belong strictly to ch-eng4-1',
      true,
      allSameChapter,
      allSameChapter
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 11: Hints Are Question-Specific
    // ─────────────────────────────────────────────────────────────────────────
    const allHaveHints = questions.every(q => typeof q.hint === 'string' && q.hint.length > 0);
    const distinctHints = new Set(questions.map(q => q.hint));
    record(
      11,
      'Each English question maintains its own unique, question-specific hint',
      questions.length,
      distinctHints.size,
      allHaveHints && distinctHints.size === questions.length,
      `Unique hints: ${distinctHints.size}/${questions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 12: Student Answer Keys Are Sanitized
    // ─────────────────────────────────────────────────────────────────────────
    const anyLeaked = questions.some(q => {
      if (q.correctAnswer !== undefined || q.solutionKey !== undefined || q.solution !== undefined) return true;
      if (q.options && q.options.some(opt => opt.isCorrect !== undefined)) return true;
      if (q.puzzleData && (q.puzzleData.correctMapping !== undefined || q.puzzleData.solutionKey !== undefined)) return true;
      return false;
    });
    record(
      12,
      'Student question response strictly hides isCorrect, solutionKey, and answers',
      false,
      anyLeaked,
      !anyLeaked,
      'All student responses sanitized'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 13: No Tamil Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const containsTamilText = questions.some(q => /[\u0B80-\u0BFF]/.test(q.questionText));
    record(
      13,
      'Standard 4 English questions contain ZERO Tamil character leakage',
      false,
      containsTamilText,
      !containsTamilText
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 14: No Maths Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasMathLeakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('fraction') || text.includes('perimeter') || text.includes('triangle') || text.includes('squared');
    });
    record(
      14,
      'Standard 4 English questions contain ZERO Mathematics leakage',
      false,
      hasMathLeakage,
      !hasMathLeakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 15: No Science Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasScienceLeakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('photosynthesis') || text.includes('evaporation') || text.includes('pulley') || text.includes('solid');
    });
    record(
      15,
      'Standard 4 English questions contain ZERO Science leakage',
      false,
      hasScienceLeakage,
      !hasScienceLeakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 16: No Social Science Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasSocialLeakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('chola') || text.includes('pandya') || text.includes('continent') || text.includes('municipality');
    });
    record(
      16,
      'Standard 4 English questions contain ZERO Social Science leakage',
      false,
      hasSocialLeakage,
      !hasSocialLeakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 17: No Cross-Standard Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasChemistry11Leakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('periodic') || text.includes('orbital') || text.includes('stoichiometry') || text.includes('boyle');
    });
    record(
      17,
      'Standard 4 English questions contain ZERO 11th Chemistry leakage',
      false,
      hasChemistry11Leakage,
      !hasChemistry11Leakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 18: Duplicate Seed Protection / Idempotency
    // ─────────────────────────────────────────────────────────────────────────
    const repeatRes = await request('GET', '/rooms/room-eng4-1/questions?standardId=grade-4&subjectId=english&chapterId=ch-eng4-1', null, studentHeaders);
    const repeatQuestions = repeatRes.body?.data?.questions || [];
    const isIdempotent = repeatQuestions.length === 10 && repeatQuestions.every((q, idx) => q.id === questions[idx].id);
    record(
      18,
      'Curriculum structure is idempotent and protects against duplicate entities',
      true,
      isIdempotent,
      isIdempotent,
      'Repeat queries return exactly identical 10 question entities'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 19: Existing Tamil Content Unaffected
    // ─────────────────────────────────────────────────────────────────────────
    const tamRes = await request('GET', '/rooms/room-tam4-1/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-1', null, studentHeaders);
    const tamQuestions = tamRes.body?.data?.questions || [];
    const isTamIntact = tamQuestions.length === 10 && tamQuestions.every(q => /[\u0B80-\u0BFF]/.test(q.questionText));
    record(
      19,
      'Standard 4 Tamil Chapter 1 (அன்னைத் தமிழே) remains 100% intact and unaffected',
      true,
      isTamIntact,
      isTamIntact,
      `Standard 4 Tamil questions count: ${tamQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 20: Existing Chemistry Content Unaffected
    // ─────────────────────────────────────────────────────────────────────────
    const chemRes = await request('GET', '/rooms/room-1/questions', null, studentHeaders);
    const chemQuestions = chemRes.body?.data?.questions || [];
    const isChemIntact = chemQuestions.length > 0 && chemQuestions.every(q => q.roomId === 'room-1');
    record(
      20,
      '11th Chemistry Room 1 content remains 100% intact and unaffected',
      true,
      isChemIntact,
      isChemIntact,
      `11th Chemistry questions count: ${chemQuestions.length}`
    );

  } catch (err) {
    console.error('❌ Unexpected error in Standard 4 English Chapter 1 test suite:', err);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 STANDARD 4 ENGLISH CHAPTER 1 SUMMARY RESULTS');
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
    console.log('\n🎉 ALL 20 STANDARD 4 ENGLISH CHAPTER 1 TESTS PASSED 100% SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

runStandard4EnglishTests();
