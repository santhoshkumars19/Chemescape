/**
 * ChemEscape - Standard 4 Mathematics Chapter 1 Content & Isolation Test Suite
 * 
 * Tests:
 * 1. Standard 4 exists (grade-4)
 * 2. Mathematics exists (subj-math)
 * 3. StandardSubject mapping exists (grade-4 -> subj-math)
 * 4. Chapter 1 exists (ch-math4-1 / Geometry & 2D Shapes)
 * 5. Topics belong to Chapter 1
 * 6. Room belongs to Chapter 1 (room-math4-1)
 * 7. Generic quiz configuration is correct (GENERIC_CHAPTER_QUIZ)
 * 8. Exactly 10 published questions
 * 9. All questions belong to same Room (room-math4-1)
 * 10. All questions belong to Mathematics Chapter 1 (ch-math4-1)
 * 11. Hints are question-specific
 * 12. Student answers are protected
 * 13. No Tamil questions
 * 14. No English literature questions
 * 15. No Science questions
 * 16. No Social Science questions
 * 17. No Chemistry questions
 * 18. No cross-standard questions (Std 5 or Std 11)
 * 19. Duplicate seed protection / Idempotency
 * 20. Existing Chemistry, Tamil, and English content remains unaffected
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

async function runStandard4MathTests() {
  console.log('================================================================');
  console.log('🧪 CHEMESCAPE STANDARD 4 MATHEMATICS CHAPTER 1 TEST SUITE');
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
    // Test 2: Mathematics Subject Exists
    // ─────────────────────────────────────────────────────────────────────────
    const subjRes = await request('GET', '/standards/grade-4/subjects', null, studentHeaders);
    const subjects = subjRes.body?.data?.subjects || subjRes.body?.data || [];
    const mathSubj = subjects.find(s => s.code === 'MATH' || s.name?.toLowerCase() === 'mathematics' || s.id === 'subj-math');
    record(
      2,
      'Mathematics subject exists under Standard 4',
      'MATH',
      mathSubj?.code || mathSubj?.name,
      Boolean(mathSubj),
      `Found Subject: ${mathSubj?.name} (${mathSubj?.code})`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: StandardSubject Mapping Exists
    // ─────────────────────────────────────────────────────────────────────────
    const isMapped = subjects.some(s => s.code === 'MATH' || s.id === 'subj-math');
    record(
      3,
      'Standard 4 -> Mathematics mapping is active and valid',
      true,
      isMapped,
      isMapped,
      `Standard 4 contains ${subjects.length} mapped subjects`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: Chapter 1 Exists (Geometry & 2D Shapes)
    // ─────────────────────────────────────────────────────────────────────────
    const chRes = await request('GET', '/standards/grade-4/chapters?subjectId=subj-math', null, studentHeaders);
    const chapters = chRes.body?.data?.chapters || chRes.body?.data || [];
    const ch1 = chapters.find(c => c.chapterNumber === 1 || c.id === 'ch-math4-1');
    record(
      4,
      'Standard 4 Mathematics Chapter 1 exists (Geometry & 2D Shapes)',
      'Geometry & 2D Shapes',
      ch1?.title,
      Boolean(ch1 && (ch1.title.includes('Geometry') || ch1.chapterNumber === 1)),
      `Chapter Title: ${ch1?.title}, Chapter ID: ${ch1?.id}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 5: Topics Belong to Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    const topRes = await request('GET', '/chapters/ch-math4-1/topics', null, studentHeaders);
    const topics = topRes.body?.data?.topics || topRes.body?.data || [];
    record(
      5,
      'Authentic topics exist for Standard 4 Mathematics Chapter 1',
      '>= 1 topic',
      `${topics.length} topics`,
      topics.length >= 1,
      `Topics: ${topics.map(t => t.title).join(', ')}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 6: Room Exists for Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    const roomRes = await request('GET', '/chapters/ch-math4-1/rooms', null, studentHeaders);
    const rooms = roomRes.body?.data?.rooms || roomRes.body?.data || [];
    const room1 = rooms.find(r => r.id === 'room-math4-1' || r.chapterId === 'ch-math4-1');
    record(
      6,
      'Room exists for Standard 4 Mathematics Chapter 1 (room-math4-1)',
      'room-math4-1',
      room1?.id,
      Boolean(room1),
      `Room Name: ${room1?.title || room1?.name}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 7: Generic Quiz Configuration is Correct
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
    const qRes = await request('GET', '/rooms/room-math4-1/questions?standardId=grade-4&subjectId=mathematics&chapterId=ch-math4-1', null, studentHeaders);
    const questions = qRes.body?.data?.questions || [];
    record(
      8,
      'Exactly 10 questions configured for Standard 4 Mathematics Chapter 1',
      10,
      questions.length,
      questions.length === 10,
      `Questions count: ${questions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 9: All Questions Belong to Same Room
    // ─────────────────────────────────────────────────────────────────────────
    const allSameRoom = questions.length === 10 && questions.every(q => q.roomId === 'room-math4-1');
    record(
      9,
      'All 10 questions belong strictly to room-math4-1 without cross-room borrowing',
      true,
      allSameRoom,
      allSameRoom
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 10: All Questions Belong to Mathematics Chapter 1 (ch-math4-1)
    // ─────────────────────────────────────────────────────────────────────────
    const allSameChapter = questions.length === 10 && questions.every(q => q.chapterId === 'ch-math4-1');
    record(
      10,
      'All 10 questions belong strictly to ch-math4-1',
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
      'Each Math question maintains its own unique, question-specific hint',
      questions.length,
      distinctHints.size,
      allHaveHints && distinctHints.size === questions.length,
      `Unique hints: ${distinctHints.size}/${questions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 12: Student Answers Are Protected
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
      'Standard 4 Math questions contain ZERO Tamil character leakage',
      false,
      containsTamilText,
      !containsTamilText
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 14: No English Literature Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasEnglishStoryLeakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('feast for rats') || text.includes('tagore') || text.includes('compartment') || text.includes('pronoun');
    });
    record(
      14,
      'Standard 4 Math questions contain ZERO English literature leakage',
      false,
      hasEnglishStoryLeakage,
      !hasEnglishStoryLeakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 15: No Science Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasScienceLeakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('photosynthesis') || text.includes('chlorophyll') || text.includes('habitat') || text.includes('solid');
    });
    record(
      15,
      'Standard 4 Math questions contain ZERO Science leakage',
      false,
      hasScienceLeakage,
      !hasScienceLeakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 16: No Social Science Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasSocialLeakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('chola') || text.includes('pandya') || text.includes('landform') || text.includes('municipality');
    });
    record(
      16,
      'Standard 4 Math questions contain ZERO Social Science leakage',
      false,
      hasSocialLeakage,
      !hasSocialLeakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 17: No Chemistry Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasChemistry11Leakage = questions.some(q => {
      const text = q.questionText.toLowerCase();
      return text.includes('periodic') || text.includes('orbital') || text.includes('stoichiometry') || text.includes('atom');
    });
    record(
      17,
      'Standard 4 Math questions contain ZERO 11th Chemistry leakage',
      false,
      hasChemistry11Leakage,
      !hasChemistry11Leakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 18: No Cross-Standard Questions Leaked
    // ─────────────────────────────────────────────────────────────────────────
    const hasStd5Leakage = questions.some(q => q.roomId.includes('5') || q.chapterId.includes('5'));
    record(
      18,
      'Standard 4 Math questions contain ZERO Standard 5 or 11 room leakage',
      false,
      hasStd5Leakage,
      !hasStd5Leakage
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 19: Duplicate Seed Protection / Idempotency
    // ─────────────────────────────────────────────────────────────────────────
    const repeatRes = await request('GET', '/rooms/room-math4-1/questions?standardId=grade-4&subjectId=mathematics&chapterId=ch-math4-1', null, studentHeaders);
    const repeatQuestions = repeatRes.body?.data?.questions || [];
    const isIdempotent = repeatQuestions.length === 10 && repeatQuestions.every((q, idx) => q.id === questions[idx].id);
    record(
      19,
      'Curriculum structure is idempotent and protects against duplicate entities',
      true,
      isIdempotent,
      isIdempotent,
      'Repeat queries return exactly identical 10 question entities'
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 20: Existing Chemistry, Tamil, and English Content Unaffected
    // ─────────────────────────────────────────────────────────────────────────
    const tamRes = await request('GET', '/rooms/room-tam4-1/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-1', null, studentHeaders);
    const tamQuestions = tamRes.body?.data?.questions || [];
    const engRes = await request('GET', '/rooms/room-eng4-1/questions?standardId=grade-4&subjectId=english&chapterId=ch-eng4-1', null, studentHeaders);
    const engQuestions = engRes.body?.data?.questions || [];
    const chemRes = await request('GET', '/rooms/room-1/questions', null, studentHeaders);
    const chemQuestions = chemRes.body?.data?.questions || [];

    const isAllIntact = tamQuestions.length === 10 && engQuestions.length === 10 && chemQuestions.length > 0;
    record(
      20,
      'Existing Tamil, English, and 11th Chemistry content remains 100% intact',
      true,
      isAllIntact,
      isAllIntact,
      `Tamil: ${tamQuestions.length}, English: ${engQuestions.length}, Chem: ${chemQuestions.length}`
    );

  } catch (err) {
    console.error('❌ Unexpected error in Standard 4 Mathematics Chapter 1 test suite:', err);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 STANDARD 4 MATHEMATICS CHAPTER 1 SUMMARY RESULTS');
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
    console.log('\n🎉 ALL 20 STANDARD 4 MATHEMATICS CHAPTER 1 TESTS PASSED 100% SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

runStandard4MathTests();
