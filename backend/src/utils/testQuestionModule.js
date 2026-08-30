const http = require('http');
const { generateToken } = require('./jwt');

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

async function runQuestionModuleTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE QUESTION / GAME CONTENT MODULE TEST SUITE');
  console.log('====================================================\n');

  const report = [];
  const record = (testName, expected, actual, passed, details = '') => {
    report.push({
      testName,
      expected: String(expected),
      actual: String(actual),
      status: passed ? 'PASS' : 'FAIL',
      details,
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName} | Status: ${actual} (Expected: ${expected}) ${details ? `(${details})` : ''}`);
  };

  const studentToken = generateToken({ userId: 'test-student-1', role: 'STUDENT', name: 'Test Student', email: 'student@test.com' });
  const teacherToken = generateToken({ userId: 'test-teacher-1', role: 'TEACHER', name: 'Test Teacher', email: 'teacher@test.com' });
  const adminToken = generateToken({ userId: 'test-admin-1', role: 'ADMIN', name: 'Test Admin', email: 'admin@test.com' });

  // ── 1. UNAUTHENTICATED ACCESS ──
  try {
    const res = await request('GET', '/rooms/room-1/questions');
    record('1. Unauthenticated GET /api/rooms/:id/questions blocked', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated access blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. STUDENT GETS PUBLISHED QUESTIONS (ORDERED & SANITIZED) ──
  try {
    const res = await request('GET', '/rooms/room-1/questions', null, { Authorization: `Bearer ${studentToken}` });
    const questions = res.body?.data?.questions || [];
    const hasQuestions = questions.length > 0;
    record('2. Student can GET published questions for Room 1', true, hasQuestions, hasQuestions, `Count: ${questions.length}`);

    // Check deterministic ordering
    let isSorted = true;
    for (let i = 1; i < questions.length; i++) {
      if (questions[i].questionNumber < questions[i - 1].questionNumber) isSorted = false;
    }
    record('3. Questions sorted deterministically by questionNumber', true, isSorted, isSorted);

    // Deep check for student answer sanitization
    let hasAnswerLeak = false;
    for (const q of questions) {
      if (q.options) {
        for (const opt of q.options) {
          if (opt.isCorrect !== undefined) hasAnswerLeak = true;
        }
      }
      if (q.puzzleData) {
        if (
          q.puzzleData.correctMapping !== undefined ||
          q.puzzleData.correctOrder !== undefined ||
          q.puzzleData.expectedConfiguration !== undefined ||
          q.puzzleData.expectedCalculation !== undefined ||
          q.puzzleData.solutionKey !== undefined
        ) {
          hasAnswerLeak = true;
        }
      }
    }
    record('4. Student question response strictly sanitizes all answer keys', false, hasAnswerLeak, !hasAnswerLeak);
  } catch (err) {
    record('2-4. Student get questions', true, 'ERROR', false, err.message);
  }

  const runId = Math.floor(Date.now() / 1000) % 10000;

  // ── 3. TEACHER QUESTION CREATION SUITE (ALL TYPES) ──
  // A. MCQ
  let createdMcqId = null;
  try {
    const resMcq = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-1',
        topicId: 'topic-1',
        questionNumber: runId + 10,
        questionType: 'MCQ',
        questionText: 'What is the symbol for Sodium?',
        difficulty: 'EASY',
        points: 50,
        options: [
          { optionKey: 'A', optionText: 'So', isCorrect: false },
          { optionKey: 'B', optionText: 'Na', isCorrect: true },
          { optionKey: 'C', optionText: 'Sd', isCorrect: false },
        ],
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    createdMcqId = resMcq.body?.data?.question?.id;
    record('5. Teacher can create MCQ question (201 Created)', 201, resMcq.status, resMcq.status === 201);
  } catch (err) {
    record('5. Teacher create MCQ', 201, 'ERROR', false, err.message);
  }

  // B. Calculation
  try {
    const resCalc = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-3',
        topicId: 'topic-3',
        questionNumber: runId + 20,
        questionType: 'CALCULATION',
        questionText: 'Calculate the molar mass of CO2 in g/mol.',
        difficulty: 'EASY',
        points: 100,
        puzzleData: {
          carbon: 12,
          oxygen: 16,
          formula: 'C + 2*O',
          expectedCalculation: 44,
          unit: 'g/mol',
        },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('6. Teacher can create Calculation question (201 Created)', 201, resCalc.status, resCalc.status === 201);
  } catch (err) {
    record('6. Teacher create Calculation', 201, 'ERROR', false, err.message);
  }

  // C. Drag & Drop
  try {
    const resDrag = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-1',
        questionNumber: runId + 30,
        questionType: 'DRAG_DROP',
        questionText: 'Match element states of matter at room temperature.',
        difficulty: 'MEDIUM',
        points: 100,
        puzzleData: {
          items: ['Mercury', 'Bromine', 'Helium'],
          targets: ['Liquid Metal', 'Liquid Nonmetal', 'Noble Gas'],
          correctMapping: { Mercury: 'Liquid Metal', Bromine: 'Liquid Nonmetal', Helium: 'Noble Gas' },
        },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('7. Teacher can create Drag & Drop question (201 Created)', 201, resDrag.status, resDrag.status === 201);
  } catch (err) {
    record('7. Teacher create Drag & Drop', 201, 'ERROR', false, err.message);
  }

  // D. Matching
  try {
    const resMatch = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-1',
        questionNumber: runId + 40,
        questionType: 'MATCHING',
        questionText: 'Match periodic groups with their common family names.',
        difficulty: 'MEDIUM',
        points: 100,
        puzzleData: {
          left: ['Group 1', 'Group 17', 'Group 18'],
          right: ['Alkali Metals', 'Halogens', 'Noble Gases'],
          correctMapping: { 'Group 1': 'Alkali Metals', 'Group 17': 'Halogens', 'Group 18': 'Noble Gases' },
        },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('8. Teacher can create Matching question (201 Created)', 201, resMatch.status, resMatch.status === 201);
  } catch (err) {
    record('8. Teacher create Matching', 201, 'ERROR', false, err.message);
  }

  // E. Ordering
  try {
    const resOrder = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-1',
        questionNumber: runId + 50,
        questionType: 'ORDERING',
        questionText: 'Order elements by increasing atomic number.',
        difficulty: 'EASY',
        points: 100,
        puzzleData: {
          items: ['Carbon', 'Hydrogen', 'Oxygen'],
          correctOrder: ['Hydrogen', 'Carbon', 'Oxygen'],
        },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('9. Teacher can create Ordering question (201 Created)', 201, resOrder.status, resOrder.status === 201);
  } catch (err) {
    record('9. Teacher create Ordering', 201, 'ERROR', false, err.message);
  }

  // F. Electron Configuration
  try {
    const resElectron = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-2',
        questionNumber: runId + 60,
        questionType: 'ELECTRON_CONFIGURATION',
        questionText: 'Enter electron configuration for Neon (Z = 10).',
        difficulty: 'MEDIUM',
        points: 150,
        puzzleData: {
          element: 'Neon',
          atomicNumber: 10,
          expectedConfiguration: '1s2 2s2 2p6',
        },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('10. Teacher can create Electron Configuration question (201 Created)', 201, resElectron.status, resElectron.status === 201);
  } catch (err) {
    record('10. Teacher create Electron Configuration', 201, 'ERROR', false, err.message);
  }

  // G. Simulation
  try {
    const resSim = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-6',
        questionNumber: runId + 70,
        questionType: 'SIMULATION',
        questionText: 'Adjust gas parameters to reach Boyle Law equilibrium.',
        difficulty: 'HARD',
        points: 200,
        puzzleData: {
          initialPressure: 1.0,
          targetPressure: 2.0,
          expectedVolume: 0.5,
          tolerance: 0.05,
        },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('11. Teacher can create Simulation question (201 Created)', 201, resSim.status, resSim.status === 201);
  } catch (err) {
    record('11. Teacher create Simulation', 201, 'ERROR', false, err.message);
  }

  // ── 4. DUPLICATE QUESTION NUMBER REJECTION ──
  try {
    const resDup = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-1',
        questionNumber: runId + 10, // Duplicate of MCQ above
        questionType: 'MCQ',
        questionText: 'Duplicate question order test',
        options: [
          { optionKey: 'A', optionText: 'Opt 1', isCorrect: true },
          { optionKey: 'B', optionText: 'Opt 2', isCorrect: false },
        ],
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('12. Duplicate question number in same room rejected (409 Conflict)', 409, resDup.status, resDup.status === 409);
  } catch (err) {
    record('12. Duplicate question number rejection', 409, 'ERROR', false, err.message);
  }

  // ── 5. INVALID ROOM REJECTION ──
  try {
    const resInvalidRoom = await request(
      'POST',
      '/questions',
      {
        roomId: 'nonexistent-room-999',
        questionNumber: 1,
        questionType: 'CALCULATION',
        questionText: 'Orphan question',
        puzzleData: { expectedCalculation: 10 },
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('13. Nonexistent room question creation rejected (404 Not Found)', 404, resInvalidRoom.status, resInvalidRoom.status === 404);
  } catch (err) {
    record('13. Invalid room rejection', 404, 'ERROR', false, err.message);
  }

  // ── 6. CONTEXT VALIDATION: TOPIC FROM DIFFERENT CHAPTER ──
  try {
    const resMismatch = await request(
      'POST',
      '/questions',
      {
        roomId: 'room-1', // Chapter ch-3
        topicId: 'topic-math4-2-1', // Chapter ch-math4-2
        questionNumber: runId + 88,
        questionText: 'Cross context mismatch question',
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('14. Topic from different chapter rejected (400 Bad Request)', 400, resMismatch.status, resMismatch.status === 400);
  } catch (err) {
    record('14. Cross context mismatch', 400, 'ERROR', false, err.message);
  }

  // ── 7. RBAC: STUDENT MUTATION BLOCKED ──
  try {
    const resPost = await request('POST', '/questions', { roomId: 'room-1', questionText: 'Hacked question' }, { Authorization: `Bearer ${studentToken}` });
    record('15. Student cannot POST /api/questions (403 Forbidden)', 403, resPost.status, resPost.status === 403);

    const targetId = createdMcqId || 'q-chem-r1-1';
    const resPut = await request('PUT', `/questions/${targetId}`, { questionText: 'Hacked update' }, { Authorization: `Bearer ${studentToken}` });
    record('16. Student cannot PUT /api/questions/:id (403 Forbidden)', 403, resPut.status, resPut.status === 403);

    const resDel = await request('DELETE', `/questions/${targetId}`, null, { Authorization: `Bearer ${studentToken}` });
    record('17. Student cannot DELETE /api/questions/:id (403 Forbidden)', 403, resDel.status, resDel.status === 403);
  } catch (err) {
    record('15-17. Student mutation blocked', 403, 'ERROR', false, err.message);
  }

  // ── 8. TEACHER UPDATE & REFLECTION TEST ──
  try {
    const targetId = createdMcqId || 'q-chem-r1-1';
    const resUpdate = await request(
      'PUT',
      `/questions/${targetId}`,
      {
        questionText: 'Which element is located in Group 1, Period 3? (Updated By Teacher)',
        options: [
          { optionKey: 'A', optionText: 'Lithium (Li)', isCorrect: false },
          { optionKey: 'B', optionText: 'Sodium (Na)', isCorrect: false },
          { optionKey: 'C', optionText: 'Potassium (K)', isCorrect: true }, // Changed correct answer to C
        ],
      },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('18. Teacher can update question and correct answer (200 OK)', 200, resUpdate.status, resUpdate.status === 200);

    // Student fetches updated question
    const resStudentFetch = await request('GET', `/questions/${targetId}`, null, { Authorization: `Bearer ${studentToken}` });
    const textUpdated = resStudentFetch.body?.data?.question?.questionText?.includes('(Updated By Teacher)');
    const optionsSanitized = (resStudentFetch.body?.data?.question?.options || []).every(opt => opt.isCorrect === undefined);
    record('19. Student receives updated question without answer key leaks', true, Boolean(textUpdated && optionsSanitized), Boolean(textUpdated && optionsSanitized));
  } catch (err) {
    record('18-19. Teacher update & student reflection', true, 'ERROR', false, err.message);
  }

  // ── 9. TEACHER SAFE ARCHIVE ──
  try {
    const targetId = createdMcqId || 'q-chem-r1-1';
    const resArchive = await request('DELETE', `/questions/${targetId}`, null, { Authorization: `Bearer ${teacherToken}` });
    record('20. Teacher can safely archive question (200 OK)', 200, resArchive.status, resArchive.status === 200);
  } catch (err) {
    record('20. Teacher safe archive', 200, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 QUESTION / GAME CONTENT MODULE TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL QUESTION MODULE TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runQuestionModuleTests().catch(console.error);
}

module.exports = runQuestionModuleTests;
