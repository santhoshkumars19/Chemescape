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

async function runUserProgressUnlockTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE USER PROGRESS & CHAPTER UNLOCK TEST SUITE');
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

  const userAId = `test-user-a-${Date.now()}`;
  const userBId = `test-user-b-${Date.now()}`;

  const tokenUserA = generateToken({ userId: userAId, role: 'STUDENT', name: 'Student A', email: `${userAId}@test.com` });
  const tokenUserB = generateToken({ userId: userBId, role: 'STUDENT', name: 'Student B', email: `${userBId}@test.com` });

  // ── 1. UNAUTHENTICATED ACCESS ──
  try {
    const res = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-math');
    record('1. Unauthenticated GET /api/game/unlocked blocked (401)', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated access blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. NEW USER INITIAL CHAPTER STATUS (STD 4 MATH) ──
  try {
    const resA = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-math', null, { Authorization: `Bearer ${tokenUserA}` });
    const chaptersA = resA.body?.data?.chapters || [];

    const ch1 = chaptersA.find(c => c.chapterNumber === 1);
    const ch2 = chaptersA.find(c => c.chapterNumber === 2);
    const ch3 = chaptersA.find(c => c.chapterNumber === 3);

    const isCh1Unlocked = ch1 && ch1.unlocked === true && ch1.status === 'UNLOCKED';
    const isCh2Locked = ch2 && ch2.unlocked === false && ch2.status === 'LOCKED';
    const isCh3Locked = ch3 && ch3.unlocked === false && ch3.status === 'LOCKED';

    record('2. New user: Chapter 1 is UNLOCKED', true, Boolean(isCh1Unlocked), Boolean(isCh1Unlocked));
    record('3. New user: Chapter 2 and 3 are LOCKED', true, Boolean(isCh2Locked && isCh3Locked), Boolean(isCh2Locked && isCh3Locked));
  } catch (err) {
    record('2-3. New user chapter status', true, 'ERROR', false, err.message);
  }

  // ── 3. USER A COMPLETES STANDARD 4 MATH CHAPTER 1 ROOM ──
  try {
    // Start session
    const resStart = await request('POST', '/game/progress/room-math4-1-1/start', null, { Authorization: `Bearer ${tokenUserA}` });
    record('4. User A can start game session', 200, resStart.status, resStart.status === 200);

    // Save mid-game progress
    const resSave = await request(
      'POST',
      '/game/progress/room-math4-1-1/save',
      { score: 100, livesRemaining: 2, gameState: { stage: 2 } },
      { Authorization: `Bearer ${tokenUserA}` }
    );
    record('5. User A can save mid-game progress', 200, resSave.status, resSave.status === 200);

    // Complete room
    const resComplete = await request(
      'POST',
      '/game/progress/room-math4-1-1/complete',
      { score: 500, stars: 3, timeSpentSec: 90 },
      { Authorization: `Bearer ${tokenUserA}` }
    );
    record('6. User A completes Chapter 1 Room (200 OK)', 200, resComplete.status, resComplete.status === 200 && resComplete.body?.data?.isFirstCompletion === true);
  } catch (err) {
    record('4-6. User A room completion', 200, 'ERROR', false, err.message);
  }

  // ── 4. USER A PROGRESS REFLECTION: CHAPTER 2 UNLOCKED FOR USER A ──
  try {
    const resA = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-math', null, { Authorization: `Bearer ${tokenUserA}` });
    const chaptersA = resA.body?.data?.chapters || [];

    const ch1 = chaptersA.find(c => c.chapterNumber === 1);
    const ch2 = chaptersA.find(c => c.chapterNumber === 2);

    const isCh1Completed = ch1 && ch1.status === 'COMPLETED' && ch1.progress === 100;
    const isCh2NowUnlocked = ch2 && ch2.unlocked === true;

    record('7. User A: Chapter 1 is COMPLETED and Chapter 2 is UNLOCKED', true, Boolean(isCh1Completed && isCh2NowUnlocked), Boolean(isCh1Completed && isCh2NowUnlocked));
  } catch (err) {
    record('7. User A chapter unlock', true, 'ERROR', false, err.message);
  }

  // ── 5. CRITICAL USER ISOLATION: USER B STILL HAS CHAPTER 2 LOCKED ──
  try {
    const resB = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-math', null, { Authorization: `Bearer ${tokenUserB}` });
    const chaptersB = resB.body?.data?.chapters || [];

    const ch1B = chaptersB.find(c => c.chapterNumber === 1);
    const ch2B = chaptersB.find(c => c.chapterNumber === 2);

    const isCh1BNotDone = ch1B && ch1B.status === 'UNLOCKED' && ch1B.progress === 0;
    const isCh2BStillLocked = ch2B && ch2B.unlocked === false && ch2B.status === 'LOCKED';

    record('8. User B Isolation: Chapter 2 remains LOCKED for User B', true, Boolean(isCh1BNotDone && isCh2BStillLocked), Boolean(isCh1BNotDone && isCh2BStillLocked));
  } catch (err) {
    record('8. User B isolation', true, 'ERROR', false, err.message);
  }

  // ── 6. ATTACK VECTOR: CLIENT SUPPLIED USERID IN BODY IS IGNORED ──
  try {
    const resHack = await request(
      'POST',
      '/game/progress/room-math4-1-1/complete',
      { userId: userBId, score: 9999, stars: 3 }, // User A tries to complete as User B
      { Authorization: `Bearer ${tokenUserA}` }
    );
    // Verify User B still has 0 progress
    const resBCheck = await request('GET', '/game/progress/room-math4-1-1', null, { Authorization: `Bearer ${tokenUserB}` });
    const isBUnchanged = resBCheck.body?.data?.progress?.isCompleted === false;

    record('9. Client-supplied userId in body is strictly ignored', true, isBUnchanged, isBUnchanged);
  } catch (err) {
    record('9. Client userId override defense', true, 'ERROR', false, err.message);
  }

  // ── 7. ATTACK VECTOR: QUERY PARAMETER USERID ATTACK ──
  try {
    const resQueryAttack = await request(
      'GET',
      `/game/progress?userId=${userAId}`, // User B tries to spy on User A
      null,
      { Authorization: `Bearer ${tokenUserB}` }
    );
    // User B's completedRooms should be 0
    const completedRooms = resQueryAttack.body?.data?.completedRooms;
    record('10. Query param ?userId= attack ignored (returns caller stats)', 0, completedRooms, completedRooms === 0);
  } catch (err) {
    record('10. Query param attack defense', 0, 'ERROR', false, err.message);
  }

  // ── 8. CROSS-SUBJECT ISOLATION ──
  try {
    // User A completed Math Ch 1 -> Science Ch 2 must remain LOCKED
    const resScience = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-sci', null, { Authorization: `Bearer ${tokenUserA}` });
    const sciChapters = resScience.body?.data?.chapters || [];
    const sciCh2 = sciChapters.find(c => c.chapterNumber === 2);
    const sciCh2Locked = !sciCh2 || sciCh2.unlocked === false;

    record('11. Cross-Subject Isolation: Math completion does not unlock Science', true, sciCh2Locked, sciCh2Locked);
  } catch (err) {
    record('11. Cross-subject isolation', true, 'ERROR', false, err.message);
  }

  // ── 9. CROSS-STANDARD ISOLATION ──
  try {
    // User A completed Std 4 Math Ch 1 -> Std 11 Chemistry Ch 2 must remain LOCKED
    const resChem = await request('GET', '/game/unlocked?standardId=std-11&subjectId=subj-chem', null, { Authorization: `Bearer ${tokenUserA}` });
    const chemChapters = resChem.body?.data?.chapters || [];
    const chemCh2 = chemChapters.find(c => c.chapterNumber === 2);
    const chemCh2Locked = !chemCh2 || chemCh2.unlocked === false;

    record('12. Cross-Standard Isolation: Std 4 completion does not unlock Std 11', true, chemCh2Locked, chemCh2Locked);
  } catch (err) {
    record('12. Cross-standard isolation', true, 'ERROR', false, err.message);
  }

  // ── 10. IDEMPOTENCY: REPEAT COMPLETION PREVENTS DUPLICATE REWARDS ──
  try {
    const resDupComplete = await request(
      'POST',
      '/game/progress/room-math4-1-1/complete',
      { score: 600, stars: 3, timeSpentSec: 80 },
      { Authorization: `Bearer ${tokenUserA}` }
    );
    const isFirstCompletion = resDupComplete.body?.data?.isFirstCompletion;
    const coinsAwarded = resDupComplete.body?.data?.awardedCoins;

    record('13. Idempotency: Repeat completion awards 0 repeat coins and no duplicate badge', false, isFirstCompletion, isFirstCompletion === false && coinsAwarded === 0);
  } catch (err) {
    record('13. Repeat completion idempotency', false, 'ERROR', false, err.message);
  }

  // ── 11. GAME FAIL DOES NOT COMPLETE ROOM OR UNLOCK CHAPTER ──
  try {
    const resFail = await request(
      'POST',
      '/game/progress/room-math4-2-1/fail',
      { score: 50, timeSpentSec: 30 },
      { Authorization: `Bearer ${tokenUserA}` }
    );
    record('14. Game fail records attempt without completing room', 'FAILED', resFail.body?.data?.status, resFail.body?.data?.status === 'FAILED');

    // Verify Chapter 3 remains locked
    const resA = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-math', null, { Authorization: `Bearer ${tokenUserA}` });
    const ch3 = (resA.body?.data?.chapters || []).find(c => c.chapterNumber === 3);
    const isCh3Locked = ch3 && ch3.unlocked === false;
    record('15. Failed room does not unlock next chapter', true, Boolean(isCh3Locked), Boolean(isCh3Locked));
  } catch (err) {
    record('14-15. Fail game handling', true, 'ERROR', false, err.message);
  }

  // ── 12. INVALID CONTEXT REJECTION (UNMAPPED SUBJECT) ──
  try {
    // Standard 4 does not have Chemistry
    const resInvalidMap = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-chem', null, { Authorization: `Bearer ${tokenUserA}` });
    record('16. Unmapped Standard-Subject combination rejected (400 Bad Request)', 400, resInvalidMap.status, resInvalidMap.status === 400);
  } catch (err) {
    record('16. Invalid context rejection', 400, 'ERROR', false, err.message);
  }

  // ── 13. CONCURRENT COMPLETION HANDLING ──
  try {
    const p1 = request('POST', '/game/progress/room-math4-1-1/complete', { score: 550, stars: 3 }, { Authorization: `Bearer ${tokenUserA}` });
    const p2 = request('POST', '/game/progress/room-math4-1-1/complete', { score: 560, stars: 3 }, { Authorization: `Bearer ${tokenUserA}` });
    const [res1, res2] = await Promise.all([p1, p2]);
    const bothOk = res1.status === 200 && res2.status === 200;
    record('17. Concurrent completion requests handled safely without errors', 200, res1.status, bothOk);
  } catch (err) {
    record('17. Concurrent completion handling', 200, 'ERROR', false, err.message);
  }

  // ── 14. EXPIRED / INVALID TOKEN REJECTED ──
  try {
    const resBadToken = await request('GET', '/game/unlocked?standardId=std-4&subjectId=subj-math', null, { Authorization: 'Bearer invalid.expired.token' });
    record('18. Invalid or expired token rejected (401 Unauthorized)', 401, resBadToken.status, resBadToken.status === 401);
  } catch (err) {
    record('18. Token validation', 401, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 USER PROGRESS & CHAPTER UNLOCK TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL USER PROGRESS & CHAPTER UNLOCK TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runUserProgressUnlockTests().catch(console.error);
}

module.exports = runUserProgressUnlockTests;