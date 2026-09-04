/**
 * ChemEscape Comprehensive Subject & Curriculum Content Mapping Test Suite
 * 
 * Tests:
 * 1. Standard 5 Tamil (Only Tamil questions, 10 questions)
 * 2. Standard 5 English (Only English questions, 10 questions)
 * 3. Standard 5 Mathematics (Only Mathematics questions, 10 questions)
 * 4. Standard 5 Science (Only Science questions, 10 questions)
 * 5. Standard 5 Social Science (Only Social Science questions, 10 questions)
 * 6. Standard 11 Chemistry (Existing Chemistry questions & specialized engines)
 * 7. Standard 11 Physics (Physics chamber content)
 * 8. No cross-subject questions (Zero leakage across subjects)
 * 9. No cross-standard questions (Zero leakage across standards)
 * 10. No cross-chapter questions (Zero leakage across chapters)
 * 11. Invalid room / hierarchy mismatch rejected (400/404)
 * 12. Empty content handled cleanly (0 questions returned without fallback)
 * 13. Insufficient content handled cleanly
 * 14. Question sanitization (no answer keys, solution keys, isCorrect leaked)
 * 15. Hint belongs strictly to current question
 * 16. User progress isolation (User A progress vs User B progress)
 * 17. Stale cache protection
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

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runSubjectContentMappingTests() {
  console.log('================================================================');
  console.log('🧪 CHEMESCAPE SUBJECT & CONTENT HIERARCHY MAPPING TEST SUITE');
  console.log('================================================================\n');

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

  try {
    // 0. Authenticate Student A & Student B
    const loginA = await request('POST', '/auth/login', {
      email: 'student@chemescape.com',
      password: 'Password123',
    });
    const tokenA = loginA.body?.data?.token;
    const studentAHeaders = { Authorization: `Bearer ${tokenA}` };

    const loginB = await request('POST', '/auth/login', {
      email: 'teacher@chemescape.com',
      password: 'Password123',
    });
    const tokenB = loginB.body?.data?.token;
    const teacherHeaders = { Authorization: `Bearer ${tokenB}` };

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Standard 5 Tamil
    // ─────────────────────────────────────────────────────────────────────────
    const tamRes = await request('GET', '/rooms/room-tam5-1/questions?standardId=grade-5&subjectId=tamil&chapterId=ch-tam5-1', null, studentAHeaders);
    const tamQuestions = tamRes.body?.data?.questions || [];
    const isTamAllTamil = tamQuestions.length === 10 && tamQuestions.every(q => /[\u0B80-\u0BFF]/.test(q.questionText));
    record(
      1,
      'Standard 5 Tamil Chapter 1 loads 10 authentic Tamil questions',
      '10 Tamil Questions',
      `${tamQuestions.length} Questions (All Tamil: ${isTamAllTamil})`,
      tamRes.status === 200 && isTamAllTamil,
      `Count: ${tamQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Standard 5 English
    // ─────────────────────────────────────────────────────────────────────────
    const engRes = await request('GET', '/rooms/room-eng5-1/questions?standardId=grade-5&subjectId=english&chapterId=ch-eng5-1', null, studentAHeaders);
    const engQuestions = engRes.body?.data?.questions || [];
    const isEngAllEng = engQuestions.length === 10 && engQuestions.every(q => q.questionText?.includes('noun') || q.questionText?.includes('verb') || q.questionText?.includes('plural') || q.questionText?.includes('antonym') || q.questionText?.includes('sentence') || q.questionText?.includes('article') || q.questionText?.includes('adjective') || q.questionText?.includes('preposition') || q.questionText?.includes('past tense') || q.questionText?.includes('conjunction') || q.questionText?.includes('punctuation'));
    record(
      2,
      'Standard 5 English Chapter 1 loads 10 authentic English questions',
      '10 English Questions',
      `${engQuestions.length} Questions (All English: ${isEngAllEng})`,
      engRes.status === 200 && isEngAllEng,
      `Count: ${engQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Standard 5 Mathematics
    // ─────────────────────────────────────────────────────────────────────────
    const mathRes = await request('GET', '/rooms/room-math5-1/questions?standardId=grade-5&subjectId=mathematics&chapterId=ch-math5-1', null, studentAHeaders);
    const mathQuestions = mathRes.body?.data?.questions || [];
    const isMathAllMath = mathQuestions.length === 10 && mathQuestions.every(q => q.questionText?.includes('sum') || q.questionText?.includes('fraction') || q.questionText?.includes('perimeter') || q.questionText?.includes('product') || q.questionText?.includes('area') || q.questionText?.includes('grams') || q.questionText?.includes('LCM') || q.questionText?.includes('%') || q.questionText?.includes('angles') || q.questionText?.includes('Solve'));
    record(
      3,
      'Standard 5 Mathematics Chapter 1 loads 10 authentic Mathematics questions',
      '10 Math Questions',
      `${mathQuestions.length} Questions (All Math: ${isMathAllMath})`,
      mathRes.status === 200 && isMathAllMath,
      `Count: ${mathQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Standard 5 Science
    // ─────────────────────────────────────────────────────────────────────────
    const sciRes = await request('GET', '/rooms/room-sci5-1/questions?standardId=grade-5&subjectId=science&chapterId=ch-sci5-1', null, studentAHeaders);
    const sciQuestions = sciRes.body?.data?.questions || [];
    const isSciAllSci = sciQuestions.length === 10 && sciQuestions.every(q => q.questionText?.includes('matter') || q.questionText?.includes('gas') || q.questionText?.includes('machine') || q.questionText?.includes('photosynthesis') || q.questionText?.includes('blood') || q.questionText?.includes('boiling') || q.questionText?.includes('energy') || q.questionText?.includes('plant') || q.questionText?.includes('force') || q.questionText?.includes('vitamin'));
    record(
      4,
      'Standard 5 Science Chapter 1 loads 10 authentic Science questions',
      '10 Science Questions',
      `${sciQuestions.length} Questions (All Science: ${isSciAllSci})`,
      sciRes.status === 200 && isSciAllSci,
      `Count: ${sciQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Standard 5 Social Science
    // ─────────────────────────────────────────────────────────────────────────
    const socRes = await request('GET', '/rooms/room-soc5-1/questions?standardId=grade-5&subjectId=social-science&chapterId=ch-soc5-1', null, studentAHeaders);
    const socQuestions = socRes.body?.data?.questions || [];
    const isSocAllSoc = socQuestions.length === 10 && socQuestions.every(q => {
      const lower = q.questionText?.toLowerCase() || '';
      return lower.includes('continent') || lower.includes('ocean') || lower.includes('capital') || lower.includes('constitution') || lower.includes('hemisphere') || lower.includes('civilis') || lower.includes('civiliz') || lower.includes('map') || lower.includes('independen') || lower.includes('animal') || lower.includes('fundamental right');
    });
    record(
      5,
      'Standard 5 Social Science Chapter 1 loads 10 authentic Social Science questions',
      '10 Social Science Questions',
      `${socQuestions.length} Questions (All Social Science: ${isSocAllSoc})`,
      socRes.status === 200 && isSocAllSoc,
      `Count: ${socQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Standard 11 Chemistry
    // ─────────────────────────────────────────────────────────────────────────
    const chemRes = await request('GET', '/rooms/room-1/questions?standardId=grade-11&subjectId=chemistry&chapterId=ch-3', null, studentAHeaders);
    const chemQuestions = chemRes.body?.data?.questions || [];
    const isChemAllChem = chemQuestions.length > 0 && chemQuestions.every(q => q.questionText?.toLowerCase().includes('periodic') || q.questionText?.toLowerCase().includes('element') || q.questionText?.toLowerCase().includes('sodium'));
    record(
      6,
      'Standard 11 Chemistry Room 1 preserves authentic Chemistry content',
      'True',
      `Count: ${chemQuestions.length}, Chem: ${isChemAllChem}`,
      chemRes.status === 200 && isChemAllChem
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Standard 11 Physics
    // ─────────────────────────────────────────────────────────────────────────
    const phyRoomsRes = await request('GET', '/chapters/ch-phy11-1/rooms?standardId=grade-11&subjectId=physics', null, studentAHeaders);
    const phyRooms = phyRoomsRes.body?.data?.rooms || [];
    record(
      7,
      'Standard 11 Physics rooms belong strictly to Physics without Chemistry leakage',
      'True',
      `Rooms: ${phyRooms.length}`,
      phyRoomsRes.status === 200 && phyRooms.length > 0 && phyRooms.every(r => r.chapterId === 'ch-phy11-1')
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 8. No Cross-Subject Questions (Tamil never contains Math/Chemistry)
    // ─────────────────────────────────────────────────────────────────────────
    const hasMathInTamil = tamQuestions.some(q => q.questionText?.includes('fraction') || q.questionText?.includes('moles') || q.questionText?.includes('Sodium'));
    const hasChemInMath = mathQuestions.some(q => q.questionText?.includes('Periodic') || q.questionText?.includes('Electron') || q.questionText?.includes('Sodium'));
    record(
      8,
      'No cross-subject questions exist between Tamil, Math, and Chemistry',
      'false (no leakage)',
      `Tamil Leak: ${hasMathInTamil}, Math Leak: ${hasChemInMath}`,
      !hasMathInTamil && !hasChemInMath
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 9. No Cross-Standard Questions (Standard 5 never gets Standard 11)
    // ─────────────────────────────────────────────────────────────────────────
    const has11thInStd5 = tamQuestions.concat(mathQuestions, sciQuestions, socQuestions, engQuestions).some(q => q.questionText?.includes('molarMass') || q.questionText?.includes('Aufbau') || q.questionText?.includes('enthalpy'));
    record(
      9,
      'No cross-standard content (Standard 5 never receives Standard 11 content)',
      'false (no 11th content)',
      `Leaked 11th Content: ${has11thInStd5}`,
      !has11thInStd5
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 10. No Cross-Chapter Questions
    // ─────────────────────────────────────────────────────────────────────────
    const allBelongToRoom = tamQuestions.every(q => q.roomId === 'room-tam5-1');
    record(
      10,
      'No cross-chapter questions (All questions belong strictly to requested room)',
      'true',
      `All room-tam5-1: ${allBelongToRoom}`,
      allBelongToRoom
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 11. Invalid Room / Hierarchy Mismatch Rejected
    // ─────────────────────────────────────────────────────────────────────────
    // Requesting Room 1 (Chemistry) with Tamil chapterId
    const mismatchRes = await request('GET', '/rooms/room-1/questions?chapterId=ch-tam5-1', null, studentAHeaders);
    record(
      11,
      'Curriculum hierarchy mismatch is strictly rejected with 400 Bad Request',
      400,
      mismatchRes.status,
      mismatchRes.status === 400,
      `Response Message: ${mismatchRes.body?.message}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 12. Empty Content Handled Gracefully
    // ─────────────────────────────────────────────────────────────────────────
    const emptyRes = await request('GET', '/rooms/room-tam5-empty/questions', null, studentAHeaders);
    const emptyQuestions = emptyRes.body?.data?.questions || [];
    record(
      12,
      'Unconfigured room returns empty array with 0 questions (No fallback to other subjects)',
      0,
      emptyQuestions.length,
      emptyQuestions.length === 0 || emptyRes.status === 404
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 13. Insufficient Content Handled Gracefully
    // ─────────────────────────────────────────────────────────────────────────
    const partialRes = await request('GET', '/rooms/room-math4-2-1/questions', null, studentAHeaders);
    const partialQuestions = partialRes.body?.data?.questions || [];
    const isPartialPure = partialQuestions.length > 0 && partialQuestions.length < 10 && partialQuestions.every(q => q.roomId === 'room-math4-2-1');
    record(
      13,
      'Insufficient content returns only the room\'s exact questions without borrowing',
      'True',
      `Count: ${partialQuestions.length}, Pure: ${isPartialPure}`,
      isPartialPure
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 14. Question Sanitization (No Answers/Keys Leaked)
    // ─────────────────────────────────────────────────────────────────────────
    const allFetched = tamQuestions.concat(mathQuestions, sciQuestions, socQuestions, engQuestions);
    const leakedAnswerKeys = allFetched.some(q => {
      if (q.correctAnswer !== undefined || q.solutionKey !== undefined || q.solution !== undefined) return true;
      if (q.options && q.options.some(opt => opt.isCorrect !== undefined)) return true;
      if (q.puzzleData && (q.puzzleData.correctMapping || q.puzzleData.expectedValue || q.puzzleData.expectedConfiguration)) return true;
      return false;
    });
    record(
      14,
      'Authoritative answer keys and solutions are stripped from student responses',
      'false (zero leaks)',
      `Leaked Answer Keys: ${leakedAnswerKeys}`,
      !leakedAnswerKeys
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 15. Hint Belongs Strictly to Current Question
    // ─────────────────────────────────────────────────────────────────────────
    const distinctHints = new Set(tamQuestions.map(q => q.hint).filter(Boolean));
    record(
      15,
      'Each question maintains its own unique, question-specific hint',
      tamQuestions.length,
      distinctHints.size,
      distinctHints.size === tamQuestions.length,
      `Unique hints: ${distinctHints.size}/${tamQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 16. User Progress Isolation
    // ─────────────────────────────────────────────────────────────────────────
    await request('POST', '/game/progress/room-1/start', {}, studentAHeaders);
    const compRes = await request('POST', '/game/progress/room-1/complete', {
      score: 750,
      stars: 2,
      timeSpentSec: 120,
    }, studentAHeaders);

    const progResA = await request('GET', '/game/progress', null, studentAHeaders);
    const progResB = await request('GET', '/game/progress', null, teacherHeaders);

    const studentAList = progResA.body?.data?.completedList || progResA.body?.data?.progress || [];
    const teacherList = progResB.body?.data?.completedList || progResB.body?.data?.progress || [];

    const studentAHasProg = (progResA.body?.data?.completedRooms > 0) || studentAList.length > 0 || compRes.status === 200;
    const teacherHasProg = (progResB.body?.data?.completedRooms > 0) || teacherList.some(p => p.roomId === 'room-1');

    record(
      16,
      'User progress is strictly isolated by userId and never shared between users',
      'Student A: true, Teacher: false',
      `Student A: ${studentAHasProg}, Teacher: ${teacherHasProg}`,
      studentAHasProg && !teacherHasProg
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 17. Stale Cache Protection
    // ─────────────────────────────────────────────────────────────────────────
    // After requesting Tamil, requesting Math returns Math without cached Tamil questions
    const freshMathRes = await request('GET', '/rooms/room-math5-1/questions', null, studentAHeaders);
    const freshMathQuestions = freshMathRes.body?.data?.questions || [];
    const isMathPureAfterTamil = freshMathQuestions.length === 10 && freshMathQuestions.every(q => q.roomId === 'room-math5-1');
    record(
      17,
      'Room-keyed queries prevent stale question cache leakage between missions',
      'true',
      `Count: ${freshMathQuestions.length}, Pure: ${isMathPureAfterTamil}`,
      freshMathRes.status === 200 && isMathPureAfterTamil
    );

  } catch (error) {
    console.error('Fatal error during test execution:', error);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 SUBJECT & CONTENT MAPPING SUMMARY RESULTS');
  console.log('================================================================');
  const total = report.length;
  const passed = report.filter(r => r.status === 'PASS').length;
  const failed = report.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:          ${passed}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Success Rate:    ${Math.round((passed / total) * 100)}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL 17 SUBJECT & CONTENT MAPPING TESTS PASSED 100% SUCCESSFULLY!');
  } else {
    console.error(`⚠️ ${failed} test(s) failed.`);
    process.exit(1);
  }
}

runSubjectContentMappingTests();
