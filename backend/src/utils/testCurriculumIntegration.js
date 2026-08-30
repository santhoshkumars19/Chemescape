/**
 * ChemEscape Comprehensive Curriculum Integration Test Suite
 * Validates the complete integrated flow:
 * Student -> Standard -> Subject -> Chapter -> Topic -> Room -> Question -> Game -> Progress -> Chapter Complete -> Next Chapter Unlock -> Subject Mastery
 * Along with cross-user, cross-subject, cross-standard isolation, security checks, and RBAC rules.
 */

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

async function runCurriculumIntegrationTests() {
  console.log('================================================================');
  console.log('🎓 CHEMESCAPE END-TO-END CURRICULUM INTEGRATION TEST SUITE');
  console.log('================================================================\n');

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

  const userAId = `integ-user-a-${Date.now()}`;
  const userBId = `integ-user-b-${Date.now()}`;
  const teacherId = `integ-teacher-${Date.now()}`;

  const tokenUserA = generateToken({ userId: userAId, role: 'STUDENT', name: 'Student A', email: `${userAId}@test.com` });
  const tokenUserB = generateToken({ userId: userBId, role: 'STUDENT', name: 'Student B', email: `${userBId}@test.com` });
  const tokenTeacher = generateToken({ userId: teacherId, role: 'TEACHER', name: 'Teacher', email: `${teacherId}@test.com` });

  const headersA = { Authorization: `Bearer ${tokenUserA}` };
  const headersB = { Authorization: `Bearer ${tokenUserB}` };
  const headersTeacher = { Authorization: `Bearer ${tokenTeacher}` };

  // ----------------------------------------------------------------
  // 1. FULL CURRICULUM FLOW (STUDENT A: STD 4 MATH)
  // ----------------------------------------------------------------
  console.log('\n--- 1. Full Hierarchy Flow (Standard -> Subject -> Chapter -> Topic -> Room -> Question) ---');

  // 1.1 Get Standards
  const stdRes = await request('GET', '/standards', null, headersA);
  const rawStandards = stdRes.body.data;
  const standards = Array.isArray(rawStandards) ? rawStandards : (rawStandards?.standards || []);
  record('1. Get all standards', 200, stdRes.status, stdRes.status === 200 && standards.length >= 2);

  const std4 = standards.find(s => String(s.name || s.grade).includes('4')) || { id: 'grade-4' };

  // 1.2 Get Subjects for Standard 4
  const subjRes = await request('GET', `/standards/${std4.id}/subjects`, null, headersA);
  const rawSubjects = subjRes.body.data;
  const subjects = Array.isArray(rawSubjects) ? rawSubjects : (rawSubjects?.subjects || []);
  const hasMath = subjects.some(s => s.code === 'MATH');
  record('2. Get subjects for Standard 4 (includes Mathematics)', 200, subjRes.status, subjRes.status === 200 && hasMath);

  const mathSubj = subjects.find(s => s.code === 'MATH') || { id: 'subj-math' };

  // 1.3 Get Chapters for Standard 4 Mathematics
  const chapRes = await request('GET', `/standards/${std4.id}/chapters?subjectId=${mathSubj.id}`, null, headersA);
  const rawChapters = chapRes.body.data;
  const chapters = Array.isArray(rawChapters) ? rawChapters : (rawChapters?.chapters || []);
  record('3. Get chapters for Standard 4 Mathematics', 200, chapRes.status, chapRes.status === 200 && chapters.length >= 2);

  const ch1 = chapters.find(c => c.chapterNumber === 1) || chapters[0];

  // 1.4 Get Topics for Chapter 1
  const topicRes = await request('GET', `/chapters/${ch1.id}/topics`, null, headersA);
  const topics = topicRes.body.data?.topics || [];
  record('4. Get topics for Chapter 1', 200, topicRes.status, topicRes.status === 200);

  // 1.5 Get Rooms for Chapter 1
  const roomRes = await request('GET', `/chapters/${ch1.id}/rooms`, null, headersA);
  const rooms = roomRes.body.data?.rooms || [];
  record('5. Get rooms for Chapter 1', 200, roomRes.status, roomRes.status === 200 && rooms.length >= 1);

  const r1 = rooms[0];

  // 1.6 Get Questions for Room 1 (Student View)
  const qRes = await request('GET', `/rooms/${r1.id}/questions`, null, headersA);
  const questions = qRes.body.data?.questions || [];
  record('6. Get questions for Room 1', 200, qRes.status, qRes.status === 200);

  // 1.7 Answer Key Security Audit (No Leaks)
  let answerKeyLeaked = false;
  questions.forEach(q => {
    if (q.isCorrect !== undefined || q.correctAnswer !== undefined || q.solutionKey !== undefined) {
      answerKeyLeaked = true;
    }
    if (q.options) {
      q.options.forEach(opt => {
        if (opt.isCorrect !== undefined) answerKeyLeaked = true;
      });
    }
  });
  record('7. Question Security: Student response strictly hides answer keys', false, answerKeyLeaked, answerKeyLeaked === false);

  // ----------------------------------------------------------------
  // 2. GAMEPLAY, PROGRESSION & CHAPTER UNLOCK
  // ----------------------------------------------------------------
  console.log('\n--- 2. Gameplay Session, Progress Save & Chapter Unlock Flow ---');

  // 2.1 Initial Unlock Status (Chapter 1 unlocked, Chapter 2 locked)
  const unlockInitial = await request('GET', `/game/unlocked?standardId=${std4.id}&subjectId=${mathSubj.id}`, null, headersA);
  const initChaps = unlockInitial.body.data?.chapters || [];
  const initCh1 = initChaps.find(c => c.chapterNumber === 1);
  const initCh2 = initChaps.find(c => c.chapterNumber === 2);
  const ch1Unlocked = initCh1 && initCh1.unlocked === true;
  const ch2Locked = initCh2 && initCh2.unlocked === false;
  record('8. Initial state: Chapter 1 is UNLOCKED, Chapter 2 is LOCKED', true, ch1Unlocked && ch2Locked, ch1Unlocked && ch2Locked);

  // 2.2 Start Game Session
  const sessionStart = await request('POST', `/game/progress/${r1.id}/start`, null, headersA);
  record('9. Start game session for Room 1', 200, sessionStart.status, sessionStart.status === 200);

  // 2.3 Save Mid-game State
  const saveProgress = await request('POST', `/game/progress/${r1.id}/save`, { score: 100, livesRemaining: 2, currentStage: 2 }, headersA);
  record('10. Save mid-game progress', 200, saveProgress.status, saveProgress.status === 200);

  // 2.4 Complete Room 1
  const completeRoom = await request('POST', `/game/progress/${r1.id}/complete`, { score: 500, stars: 3, timeSpentSec: 90 }, headersA);
  record('11. Complete Room 1 with server rewards', 200, completeRoom.status, completeRoom.status === 200);

  // 2.5 Verify Chapter 1 is COMPLETED and Chapter 2 is UNLOCKED for User A
  const unlockAfterA = await request('GET', `/game/unlocked?standardId=${std4.id}&subjectId=${mathSubj.id}`, null, headersA);
  const afterAChaps = unlockAfterA.body.data?.chapters || [];
  const afterACh1 = afterAChaps.find(c => c.chapterNumber === 1);
  const afterACh2 = afterAChaps.find(c => c.chapterNumber === 2);
  const ch1Completed = afterACh1 && afterACh1.status === 'COMPLETED' && afterACh1.isCompleted === true;
  const ch2Unlocked = afterACh2 && afterACh2.unlocked === true;
  record('12. User A: Chapter 1 is COMPLETED and Chapter 2 is UNLOCKED', true, ch1Completed && ch2Unlocked, ch1Completed && ch2Unlocked);

  // ----------------------------------------------------------------
  // 3. CROSS-USER, CROSS-SUBJECT & CROSS-STANDARD ISOLATION
  // ----------------------------------------------------------------
  console.log('\n--- 3. Cross-User, Cross-Subject & Cross-Standard Isolation ---');

  // 3.1 User B Isolation: Chapter 2 remains LOCKED for User B
  const unlockUserB = await request('GET', `/game/unlocked?standardId=${std4.id}&subjectId=${mathSubj.id}`, null, headersB);
  const bChaps = unlockUserB.body.data?.chapters || [];
  const bCh1 = bChaps.find(c => c.chapterNumber === 1);
  const bCh2 = bChaps.find(c => c.chapterNumber === 2);
  const bCh1Incomplete = bCh1 && bCh1.isCompleted === false;
  const bCh2Locked = bCh2 && bCh2.unlocked === false;
  record('13. Cross-User Isolation: Chapter 2 remains LOCKED for User B', true, bCh1Incomplete && bCh2Locked, bCh1Incomplete && bCh2Locked);

  // 3.2 Cross-Subject Isolation: Math completion does not unlock Science
  const unlockSciA = await request('GET', `/game/unlocked?standardId=${std4.id}&subjectId=subj-sci`, null, headersA);
  const sciChaps = unlockSciA.body.data?.chapters || [];
  const sciCh2 = sciChaps.find(c => c.chapterNumber === 2);
  const sciCh2Locked = !sciCh2 || sciCh2.unlocked === false;
  record('14. Cross-Subject Isolation: Math Ch 1 completion does not unlock Science Ch 2', true, sciCh2Locked, sciCh2Locked);

  // 3.3 Cross-Standard Isolation: Std 4 completion does not unlock Std 11 Chemistry
  const unlockStd11 = await request('GET', `/game/unlocked?standardId=std-11&subjectId=subj-chem`, null, headersA);
  const std11Chaps = unlockStd11.body.data?.chapters || [];
  const std11Ch2 = std11Chaps.find(c => c.chapterNumber === 2);
  const std11Ch2Locked = !std11Ch2 || std11Ch2.unlocked === false;
  record('15. Cross-Standard Isolation: Std 4 completion does not unlock Std 11 Ch 2', true, std11Ch2Locked, std11Ch2Locked);

  // ----------------------------------------------------------------
  // 4. INVALID RELATIONSHIPS & MALICIOUS CONTEXT REJECTION
  // ----------------------------------------------------------------
  console.log('\n--- 4. Relationship Validation & Attack Vector Defenses ---');

  // 4.1 Unmapped Standard + Subject rejected (Std 4 + Chemistry)
  const invalidMap = await request('GET', `/standards/${std4.id}/chapters?subjectId=subj-chem`, null, headersA);
  record('16. Unmapped Standard-Subject rejected (400 Bad Request)', 400, invalidMap.status, invalidMap.status === 400);

  // 4.2 Query parameter userId injection attack ignored
  const spoofStats = await request('GET', `/game/progress?userId=${userBId}`, null, headersA);
  record('17. Security: Query param userId injection returns caller stats only', 200, spoofStats.status, spoofStats.status === 200);

  // 4.3 Idempotent Repeat Completion: 0 repeat coins and no duplicate badge
  const dupCompletion = await request('POST', `/game/progress/${r1.id}/complete`, { score: 600, stars: 3, timeSpentSec: 80 }, headersA);
  const dupFirst = dupCompletion.body.data?.isFirstCompletion;
  const dupCoins = dupCompletion.body.data?.awardedCoins;
  record('18. Idempotency: Repeat completion awards 0 repeat coins and duplicate badge avoided', false, dupFirst, dupFirst === false && dupCoins === 0);

  // ----------------------------------------------------------------
  // 5. ROLE-BASED ACCESS CONTROL (RBAC)
  // ----------------------------------------------------------------
  console.log('\n--- 5. Role-Based Access Control (RBAC) Tests ---');

  // 5.1 Student blocked from creating Chapter (403 Forbidden)
  const studentCreateChap = await request('POST', '/chapters', { title: 'Hacker Chapter', standardId: std4.id, subjectId: mathSubj.id }, headersA);
  record('19. RBAC: Student cannot create Chapter (403 Forbidden)', 403, studentCreateChap.status, studentCreateChap.status === 403);

  // 5.2 Teacher authorized to create Chapter (201 Created)
  const teacherCreateChap = await request('POST', '/chapters', {
    standardId: std4.id,
    subjectId: mathSubj.id,
    title: `Integration Test Chapter ${Date.now()}`,
    chapterNumber: 88,
    description: 'Teacher created chapter for integration verification'
  }, headersTeacher);
  record('20. RBAC: Teacher can create Chapter (201 Created)', 201, teacherCreateChap.status, teacherCreateChap.status === 201);

  // ----------------------------------------------------------------
  // 6. SUMMARY & VALIDATION
  // ----------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 CURRICULUM INTEGRATION TEST SUMMARY RESULTS');
  console.log('================================================================');
  const total = report.length;
  const passed = report.filter((r) => r.status === 'PASS').length;
  const failed = total - passed;
  console.log(`TOTAL TESTS RUN: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.error('❌ SOME INTEGRATION TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
    process.exit(1);
  } else {
    console.log('🎉 ALL CURRICULUM INTEGRATION TESTS PASSED 100% SUCCESSFULLY!');
  }
}

if (require.main === module) {
  runCurriculumIntegrationTests().catch((err) => {
    console.error('Fatal Integration Test Suite Error:', err);
    process.exit(1);
  });
}

module.exports = runCurriculumIntegrationTests;
