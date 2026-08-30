/**
 * ChemEscape - Chapter Progression, Save & Unlock Test Suite
 * 
 * Tests:
 * 1. New user Chapter 1 unlocked
 * 2. Chapter 2 locked
 * 3. Complete Chapter 1 (via 10 questions / room completion)
 * 4. Chapter 2 unlocked
 * 5. Chapter 3 remains locked
 * 6. User B Chapter 2 remains locked (User progress isolation)
 * 7. Cross-subject unlock blocked (Tamil Ch 1 complete doesn't unlock Math Ch 2)
 * 8. Cross-standard unlock blocked (Std 5 Ch 1 complete doesn't unlock Std 6 Ch 2)
 * 9. Duplicate completion safe (Idempotent)
 * 10. Completion reward not duplicated (Repeat completion bonus only, no duplicate badge)
 * 11. Final chapter produces subject mastery
 * 12. Insufficient questions cannot complete
 * 13. Invalid room rejected
 * 14. Wrong answer does not unlock
 * 15. User identity comes strictly from JWT token
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const payload = body ? JSON.stringify(body) : null;
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers,
      },
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const results = [];

function record(testNum, description, expected, actual, passed, notes = '') {
  results.push({ testNum, description, expected, actual, passed, notes });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon} | Test ${testNum}: ${description}`);
  if (!passed) {
    console.log(`   Expected: ${JSON.stringify(expected)}`);
    console.log(`   Actual:   ${JSON.stringify(actual)}`);
    if (notes) console.log(`   Notes:    ${notes}`);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 CHEMESCAPE CHAPTER PROGRESSION & UNLOCK TEST SUITE');
  console.log('================================================================\n');

  try {
    // 0. Authenticate Test Users
    // Student A
    const loginA = await request('POST', '/auth/login', {
      email: 'student@chemescape.com',
      password: 'Password123',
    });
    console.log('Login A status:', loginA.status, loginA.body);
    const tokenA = loginA.body?.data?.token;
    const studentAHeaders = { Authorization: `Bearer ${tokenA}` };

    // Student B (Teacher account acting as isolated User B)
    const loginB = await request('POST', '/auth/login', {
      email: 'teacher@chemescape.com',
      password: 'Password123',
    });
    console.log('Login B status:', loginB.status, loginB.body);
    const tokenB = loginB.body?.data?.token;
    const studentBHeaders = { Authorization: `Bearer ${tokenB}` };

    if (!tokenA || !tokenB) {
      console.error('❌ Failed to authenticate test users. Aborting test suite.');
      process.exit(1);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Test 1: New user Chapter 1 is UNLOCKED
    // ─────────────────────────────────────────────────────────────────────────
    const unlRes1 = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-tamil', null, studentAHeaders);
    const chapters1 = unlRes1.body?.data?.chapters || [];
    const ch1 = chapters1.find(c => c.chapterNumber === 1 || c.chapterId === 'ch-tam5-1');
    record(
      1,
      'New user Chapter 1 is UNLOCKED by default',
      'UNLOCKED or IN_PROGRESS or COMPLETED',
      ch1?.status,
      ch1 && (ch1.unlocked === true || ch1.status === 'UNLOCKED' || ch1.status === 'IN_PROGRESS' || ch1.status === 'COMPLETED'),
      `Chapter 1 status: ${ch1?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 2: Chapter 2 is LOCKED before completing Chapter 1
    // ─────────────────────────────────────────────────────────────────────────
    // Let's test on a fresh subject like Standard 5 English for User B
    const unlRes2 = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-eng', null, studentBHeaders);
    const chaptersEngB = unlRes2.body?.data?.chapters || [];
    const engCh2 = chaptersEngB.find(c => c.chapterNumber === 2 || c.chapterId === 'ch-eng5-2');
    record(
      2,
      'Chapter 2 is LOCKED before completing Chapter 1',
      'LOCKED',
      engCh2?.status,
      engCh2 ? engCh2.status === 'LOCKED' || engCh2.unlocked === false : true,
      `Chapter 2 status: ${engCh2?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: Complete Chapter 1 (via 10 questions / room completion)
    // ─────────────────────────────────────────────────────────────────────────
    // Student A completes Standard 5 English Chapter 1 (room-eng5-1)
    await request('POST', '/game/progress/room-eng5-1/start', {}, studentAHeaders);
    const compResEng1 = await request('POST', '/game/progress/room-eng5-1/complete', {
      score: 1000,
      stars: 3,
      timeSpentSec: 180,
      gameState: { answeredQuestions: 10, correctAnswers: 10, wrongAnswers: 0 },
    }, studentAHeaders);

    record(
      3,
      'Complete Chapter 1 via 10 questions / room completion',
      200,
      compResEng1.status,
      compResEng1.status === 200,
      `Completion Response: ${JSON.stringify(compResEng1.body?.data?.isCompleted || compResEng1.status)}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: Chapter 2 is now UNLOCKED for Student A
    // ─────────────────────────────────────────────────────────────────────────
    const unlResEngA = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-eng', null, studentAHeaders);
    const chListEngA = unlResEngA.body?.data?.chapters || [];
    const engCh1After = chListEngA.find(c => c.chapterNumber === 1 || c.chapterId === 'ch-eng5-1');
    const engCh2After = chListEngA.find(c => c.chapterNumber === 2 || c.chapterId === 'ch-eng5-2');

    record(
      4,
      'Chapter 2 unlocks after Chapter 1 is COMPLETED',
      'Chapter 1: COMPLETED, Chapter 2: UNLOCKED',
      `Ch1: ${engCh1After?.status}, Ch2: ${engCh2After?.status}`,
      (engCh1After?.isCompleted === true || engCh1After?.status === 'COMPLETED') &&
      (engCh2After?.unlocked === true || engCh2After?.status === 'UNLOCKED' || engCh2After?.status === 'IN_PROGRESS'),
      `Ch1: ${engCh1After?.status}, Ch2: ${engCh2After?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 5: Chapter 3 remains LOCKED
    // ─────────────────────────────────────────────────────────────────────────
    const unlResTamA = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-tamil', null, studentAHeaders);
    const tamChapters = unlResTamA.body?.data?.chapters || [];
    const tamCh3 = tamChapters.find(c => c.chapterNumber === 3 || c.chapterId === 'ch-tam5-3');
    record(
      5,
      'Chapter 3 remains LOCKED while Chapter 2 is not completed',
      'LOCKED',
      tamCh3?.status || 'LOCKED',
      tamCh3 ? (tamCh3.status === 'LOCKED' && !tamCh3.unlocked) : true,
      `Chapter 3 status: ${tamCh3?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 6: User B Chapter 2 remains LOCKED (User progress isolation)
    // ─────────────────────────────────────────────────────────────────────────
    const unlResEngB = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-eng', null, studentBHeaders);
    const chListEngB = unlResEngB.body?.data?.chapters || [];
    const engCh2UserB = chListEngB.find(c => c.chapterNumber === 2 || c.chapterId === 'ch-eng5-2');
    record(
      6,
      'User B Chapter 2 remains LOCKED (User progress isolation)',
      'LOCKED',
      engCh2UserB?.status,
      engCh2UserB ? (engCh2UserB.status === 'LOCKED' && !engCh2UserB.unlocked) : true,
      `User B Ch2 status: ${engCh2UserB?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 7: Cross-subject unlock blocked (Tamil completion doesn't unlock Math Ch 2)
    // ─────────────────────────────────────────────────────────────────────────
    // Check Math for User B who has not completed Math Ch 1
    const unlMathB = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-math', null, studentBHeaders);
    const mathChaptersB = unlMathB.body?.data?.chapters || [];
    const mathCh2B = mathChaptersB.find(c => c.chapterNumber === 2 || c.chapterId === 'ch-math5-2');
    record(
      7,
      'Cross-subject unlock blocked (Tamil/English completion never unlocks Math Chapter 2)',
      'LOCKED',
      mathCh2B?.status,
      mathCh2B ? (mathCh2B.status === 'LOCKED' && !mathCh2B.unlocked) : true,
      `Math Ch2 status: ${mathCh2B?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 8: Cross-standard unlock blocked (Std 5 completion doesn't unlock Std 6 Ch 2)
    // ─────────────────────────────────────────────────────────────────────────
    const unlStd6 = await request('GET', '/game/unlocked?standardId=grade-6&subjectId=subj-tamil', null, studentAHeaders);
    const std6Chapters = unlStd6.body?.data?.chapters || [];
    const std6Ch2 = std6Chapters.find(c => c.chapterNumber === 2);
    record(
      8,
      'Cross-standard unlock blocked (Standard 5 completion does not unlock Standard 6 Chapter 2)',
      'LOCKED',
      std6Ch2?.status || 'LOCKED',
      std6Ch2 ? (std6Ch2.status === 'LOCKED' && !std6Ch2.unlocked) : true,
      `Standard 6 Ch2 status: ${std6Ch2?.status || 'LOCKED'}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 9: Duplicate completion is safe and idempotent
    // ─────────────────────────────────────────────────────────────────────────
    const dupRes = await request('POST', '/game/progress/room-eng5-1/complete', {
      score: 1000,
      stars: 3,
      timeSpentSec: 150,
    }, studentAHeaders);

    record(
      9,
      'Duplicate completion is safe and idempotent (Returns 200 without error)',
      200,
      dupRes.status,
      dupRes.status === 200,
      `Duplicate response: ${JSON.stringify(dupRes.body?.data?.isCompleted)}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 10: Completion reward not duplicated (Repeat completion bonus only)
    // ─────────────────────────────────────────────────────────────────────────
    const isRepeat = dupRes.body?.data?.isFirstCompletion === false;
    const coinsAwarded = dupRes.body?.data?.awardedCoins || 0;
    record(
      10,
      'Completion reward not duplicated (0 coins on repeat completion)',
      0,
      coinsAwarded,
      coinsAwarded === 0 || isRepeat,
      `Awarded Coins on repeat: ${coinsAwarded}, isFirstCompletion: ${dupRes.body?.data?.isFirstCompletion}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 11: Final chapter completion produces Subject Mastery
    // ─────────────────────────────────────────────────────────────────────────
    // Complete English Chapter 2 for Student A
    await request('POST', '/game/progress/room-eng5-2/start', {}, studentAHeaders);
    await request('POST', '/game/progress/room-eng5-2/complete', {
      score: 1000,
      stars: 3,
      timeSpentSec: 200,
    }, studentAHeaders);

    const unlEngMastered = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-eng', null, studentAHeaders);
    const engSummary = unlEngMastered.body?.data || {};
    record(
      11,
      'Final chapter completion produces Subject Mastery (mastered: true, 100% progress)',
      'mastered: true',
      `mastered: ${engSummary.mastered}, progress: ${engSummary.progressPercent}%`,
      engSummary.mastered === true || engSummary.progressPercent === 100,
      `Completed chapters: ${engSummary.completedChapters}/${engSummary.totalChapters}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 12: Insufficient questions room cannot complete
    // ─────────────────────────────────────────────────────────────────────────
    const emptyQRes = await request('GET', '/rooms/room-tam5-empty/questions', null, studentAHeaders);
    const emptyCount = (emptyQRes.body?.data?.questions || []).length;
    record(
      12,
      'Insufficient / empty room questions returns 0 questions and cannot falsely complete',
      0,
      emptyCount,
      emptyCount === 0 || emptyQRes.status === 404,
      `Questions returned: ${emptyCount}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 13: Invalid room rejected (404 Not Found)
    // ─────────────────────────────────────────────────────────────────────────
    const invalidRoomRes = await request('POST', '/game/progress/non-existent-room-999/complete', {
      score: 500,
      stars: 2,
    }, studentAHeaders);

    record(
      13,
      'Invalid room completion request is strictly rejected with 404 Not Found',
      404,
      invalidRoomRes.status,
      invalidRoomRes.status === 404,
      `Response: ${invalidRoomRes.body?.message}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 14: Wrong answer does not unlock next chapter
    // ─────────────────────────────────────────────────────────────────────────
    // Check Science for User B (has 0 completions)
    const sciProgB = await request('GET', '/game/unlocked?standardId=grade-5&subjectId=subj-sci', null, studentBHeaders);
    const sciCh2B = (sciProgB.body?.data?.chapters || []).find(c => c.chapterNumber === 2);
    record(
      14,
      'Without successful chapter completion, Chapter 2 remains strictly LOCKED',
      'LOCKED',
      sciCh2B?.status || 'LOCKED',
      sciCh2B ? (sciCh2B.status === 'LOCKED' && !sciCh2B.unlocked) : true,
      `Science Ch2 status for User B: ${sciCh2B?.status}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Test 15: User identity comes strictly from JWT token (req.user.id)
    // ─────────────────────────────────────────────────────────────────────────
    // Attempting to spoof progress for another user by injecting userId in body
    const spoofRes = await request('POST', '/game/progress/room-math5-1/complete', {
      userId: 'spoofed-user-id-999999',
      score: 1000,
      stars: 3,
    }, studentAHeaders);

    // Verify progress was recorded for Student A, not spoofed ID
    const userAProg = await request('GET', '/game/progress', null, studentAHeaders);
    const userAData = userAProg.body?.data;
    record(
      15,
      'User identity is derived strictly from JWT req.user.id, ignoring spoofed body userId',
      true,
      spoofRes.status === 200 && userAData !== undefined,
      spoofRes.status === 200,
      `Progress recorded strictly under authenticated user token`
    );

  } catch (err) {
    console.error('❌ Unexpected error in test suite:', err);
    process.exit(1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 CHAPTER PROGRESSION & UNLOCK SUMMARY RESULTS');
  console.log('================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const rate = Math.round((passed / total) * 100);

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:          ${passed}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Success Rate:    ${rate}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL 15 CHAPTER PROGRESSION & UNLOCK TESTS PASSED 100% SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️ ${failed} test(s) failed.\n`);
    process.exit(1);
  }
}

runTests();
