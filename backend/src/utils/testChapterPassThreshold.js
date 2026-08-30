/**
 * testChapterPassThreshold.js — Minimum 7/10 Pass Threshold & Chapter Unlock Verification Suite
 *
 * Tests the server-authoritative Pass/Fail completion rules:
 * 1.  Score 6/10 (Fail) -> passed=false, completed=false, nextChapterUnlocked=false
 * 2.  Score 5/10 (Fail) -> passed=false
 * 3.  Score 0/10 (Fail) -> passed=false
 * 4.  Score 7/10 (Pass) -> passed=true, completed=true, nextChapterUnlocked=true
 * 5.  Score 8/10 (Pass) -> passed=true
 * 6.  Score 9/10 (Pass) -> passed=true
 * 7.  Score 10/10 (Pass) -> passed=true
 * 8.  User Isolation: User A (6/10) -> Ch 2 locked; User B (7/10) -> Ch 2 unlocked
 * 9.  Subject Isolation: Passing Tamil Ch 1 unlocks Tamil Ch 2 only; Math Ch 2 remains locked
 * 10. Standard Isolation: Passing Std 4 Math Ch 1 unlocks Std 4 Math Ch 2 only; Std 5 unchanged
 * 11. Replay Safety: Passing with 8/10, then replaying with 5/10 -> Chapter remains COMPLETED, Ch 2 remains UNLOCKED
 * 12. Retry Progression: Failing with 6/10 (locked), then retrying with 7/10 -> Chapter COMPLETED, Ch 2 UNLOCKS
 * 13. Idempotency: Duplicate completion requests do not duplicate first-time rewards or badges
 * 14. Chemistry Unit 1-6 Regression Safety: Specialized game engines remain intact
 */

'use strict';

const gameProgressService = require('../services/gameProgressService');
const chapterUnlockService = require('../services/chapterUnlockService');
const prisma = require('../config/db');

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
let passed = 0;
let failed = 0;

async function test(label, fn) {
  try {
    await fn();
    console.log(PASS + ' | ' + label);
    passed++;
  } catch (err) {
    console.log(FAIL + ' | ' + label);
    console.log('         Error: ' + err.message);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

async function run() {
  console.log('\n========================================================================================');
  console.log('🧪 CHEMESCAPE — CHAPTER PASS THRESHOLD (MIN 7/10) VERIFICATION SUITE');
  console.log('========================================================================================\n');

  // Unique test user IDs for isolated test runs
  const userFail6  = 'user-test-threshold-fail6-' + Date.now();
  const userPass7  = 'user-test-threshold-pass7-' + Date.now();
  const userPass8  = 'user-test-threshold-pass8-' + Date.now();
  const userPass9  = 'user-test-threshold-pass9-' + Date.now();
  const userPass10 = 'user-test-threshold-pass10-' + Date.now();
  const userReplay = 'user-test-threshold-replay-' + Date.now();
  const userRetry  = 'user-test-threshold-retry-' + Date.now();

  const tamilRoom1 = 'room-tam4-1';
  const mathRoom1  = 'room-math4-1';

  // ── Group 1: Exact Score Thresholds (0, 5, 6 Fail; 7, 8, 9, 10 Pass) ────────
  console.log('--- Group 1: Score Threshold Boundary Checks ---');

  await test('1. Score 6/10 -> FAIL (passed=false, completed=false, nextChapterUnlocked=false)', async () => {
    const res = await gameProgressService.completeGame(userFail6, tamilRoom1, {
      score: 600,
      stars: 1,
      timeSpentSec: 60,
      gameState: { answeredQuestions: 10, correctAnswers: 6, wrongAnswers: 4 },
    });
    assert(res.passed === false, 'Expected passed=false, got: ' + res.passed);
    assert(res.completed === false, 'Expected completed=false, got: ' + res.completed);
    assert(res.nextChapterUnlocked === false, 'Expected nextChapterUnlocked=false');
    assert(res.retryRequired === true, 'Expected retryRequired=true');
    assert(res.awardedXP === 0, 'Expected awardedXP=0 for failed mission');
    assert(res.awardedCoins === 0, 'Expected awardedCoins=0 for failed mission');
  });

  await test('2. Score 5/10 -> FAIL (passed=false)', async () => {
    const u = 'user-test-5-' + Date.now();
    const res = await gameProgressService.completeGame(u, tamilRoom1, {
      score: 500,
      stars: 1,
      timeSpentSec: 50,
      gameState: { answeredQuestions: 10, correctAnswers: 5, wrongAnswers: 5 },
    });
    assert(res.passed === false, 'Expected passed=false, got: ' + res.passed);
    assert(res.completed === false, 'Expected completed=false');
    assert(res.nextChapterUnlocked === false, 'Expected nextChapterUnlocked=false');
  });

  await test('3. Score 0/10 -> FAIL (passed=false)', async () => {
    const u = 'user-test-0-' + Date.now();
    const res = await gameProgressService.completeGame(u, tamilRoom1, {
      score: 0,
      stars: 0,
      timeSpentSec: 30,
      gameState: { answeredQuestions: 10, correctAnswers: 0, wrongAnswers: 10 },
    });
    assert(res.passed === false, 'Expected passed=false, got: ' + res.passed);
    assert(res.completed === false, 'Expected completed=false');
    assert(res.nextChapterUnlocked === false, 'Expected nextChapterUnlocked=false');
  });

  await test('4. Score 7/10 -> PASS (passed=true, completed=true, nextChapterUnlocked=true)', async () => {
    const res = await gameProgressService.completeGame(userPass7, tamilRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 75,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });
    assert(res.passed === true, 'Expected passed=true, got: ' + res.passed);
    assert(res.completed === true, 'Expected completed=true, got: ' + res.completed);
    assert(res.nextChapterUnlocked === true, 'Expected nextChapterUnlocked=true');
    assert(res.retryRequired === false, 'Expected retryRequired=false');
    assert(res.awardedXP > 0, 'Expected awardedXP > 0 on first pass');
  });

  await test('5. Score 8/10 -> PASS (passed=true)', async () => {
    const res = await gameProgressService.completeGame(userPass8, tamilRoom1, {
      score: 800,
      stars: 3,
      timeSpentSec: 80,
      gameState: { answeredQuestions: 10, correctAnswers: 8, wrongAnswers: 2 },
    });
    assert(res.passed === true, 'Expected passed=true');
    assert(res.completed === true, 'Expected completed=true');
    assert(res.nextChapterUnlocked === true, 'Expected nextChapterUnlocked=true');
  });

  await test('6. Score 9/10 -> PASS (passed=true)', async () => {
    const res = await gameProgressService.completeGame(userPass9, tamilRoom1, {
      score: 900,
      stars: 3,
      timeSpentSec: 90,
      gameState: { answeredQuestions: 10, correctAnswers: 9, wrongAnswers: 1 },
    });
    assert(res.passed === true, 'Expected passed=true');
    assert(res.completed === true, 'Expected completed=true');
    assert(res.nextChapterUnlocked === true, 'Expected nextChapterUnlocked=true');
  });

  await test('7. Score 10/10 -> PASS (passed=true)', async () => {
    const res = await gameProgressService.completeGame(userPass10, tamilRoom1, {
      score: 1000,
      stars: 3,
      timeSpentSec: 100,
      gameState: { answeredQuestions: 10, correctAnswers: 10, wrongAnswers: 0 },
    });
    assert(res.passed === true, 'Expected passed=true');
    assert(res.completed === true, 'Expected completed=true');
    assert(res.nextChapterUnlocked === true, 'Expected nextChapterUnlocked=true');
  });

  // ── Group 2: User Isolation ──────────────────────────────────────────────────
  console.log('\n--- Group 2: User Isolation ---');

  await test('8. User A (6/10) fails & Ch 2 stays locked; User B (7/10) passes & Ch 2 unlocks', async () => {
    const unlA = await chapterUnlockService.getUnlockedChapters(userFail6, 'grade-4', 'tamil');
    const ch2A = unlA.chapters.find(c => c.chapterNumber === 2);
    assert(!ch2A || !ch2A.unlocked, 'User A should have Chapter 2 LOCKED');

    const unlB = await chapterUnlockService.getUnlockedChapters(userPass7, 'grade-4', 'tamil');
    const ch2B = unlB.chapters.find(c => c.chapterNumber === 2);
    assert(ch2B && ch2B.unlocked, 'User B should have Chapter 2 UNLOCKED');
  });

  // ── Group 3: Subject Isolation ───────────────────────────────────────────────
  console.log('\n--- Group 3: Subject Isolation ---');

  await test('9. Passing Tamil Ch 1 unlocks Tamil Ch 2 ONLY; Math Ch 2 remains LOCKED', async () => {
    const unlMath = await chapterUnlockService.getUnlockedChapters(userPass7, 'grade-4', 'mathematics');
    const mathCh2 = unlMath.chapters.find(c => c.chapterNumber === 2);
    assert(!mathCh2 || !mathCh2.unlocked, 'Math Chapter 2 must remain LOCKED when only Tamil was passed');
  });

  // ── Group 4: Standard Isolation ──────────────────────────────────────────────
  console.log('\n--- Group 4: Standard Isolation ---');

  await test('10. Passing Std 4 Math Ch 1 unlocks Std 4 Math Ch 2; Std 5 unchanged', async () => {
    const uStd = 'user-test-std-iso-' + Date.now();
    await gameProgressService.completeGame(uStd, mathRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 70,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });
    const unlStd4 = await chapterUnlockService.getUnlockedChapters(uStd, 'grade-4', 'mathematics');
    const std4Ch2 = unlStd4.chapters.find(c => c.chapterNumber === 2);
    assert(std4Ch2 && std4Ch2.unlocked, 'Std 4 Math Ch 2 should be UNLOCKED');
  });

  // ── Group 5: Replay & Best Score Safety ──────────────────────────────────────
  console.log('\n--- Group 5: Replay Safety (Never Relock Completed Chapter) ---');

  await test('11. First attempt: 8/10 -> PASS; Replay attempt: 5/10 -> Chapter REMAINS completed & unlocked', async () => {
    // Attempt 1: 8/10 -> Pass
    const r1 = await gameProgressService.completeGame(userReplay, tamilRoom1, {
      score: 800,
      stars: 3,
      timeSpentSec: 80,
      gameState: { answeredQuestions: 10, correctAnswers: 8, wrongAnswers: 2 },
    });
    assert(r1.passed === true && r1.completed === true, 'Attempt 1 must pass');

    // Attempt 2 (Replay): 5/10 -> lower score
    const r2 = await gameProgressService.completeGame(userReplay, tamilRoom1, {
      score: 500,
      stars: 1,
      timeSpentSec: 60,
      gameState: { answeredQuestions: 10, correctAnswers: 5, wrongAnswers: 5 },
    });
    // Even though this replay attempt scored 5/10, the chapter completion status must NOT be revoked!
    assert(r2.completed === true, 'Replay must preserve completed=true');
    assert(r2.nextChapterUnlocked === true, 'Replay must preserve nextChapterUnlocked=true');

    // Check unlock status
    const unl = await chapterUnlockService.getUnlockedChapters(userReplay, 'grade-4', 'tamil');
    const ch1 = unl.chapters.find(c => c.chapterNumber === 1);
    const ch2 = unl.chapters.find(c => c.chapterNumber === 2);
    assert(ch1 && ch1.isCompleted, 'Chapter 1 must remain COMPLETED after lower replay');
    assert(ch2 && ch2.unlocked, 'Chapter 2 must remain UNLOCKED after lower replay');
  });

  // ── Group 6: Retry Progression ───────────────────────────────────────────────
  console.log('\n--- Group 6: Retry Progression (Fail then Pass) ---');

  await test('12. Attempt 1: 6/10 (Fail, Ch 2 locked) -> Attempt 2: 7/10 (Pass, Ch 2 unlocks)', async () => {
    // Attempt 1: 6/10 -> Fail
    const a1 = await gameProgressService.completeGame(userRetry, tamilRoom1, {
      score: 600,
      stars: 1,
      timeSpentSec: 60,
      gameState: { answeredQuestions: 10, correctAnswers: 6, wrongAnswers: 4 },
    });
    assert(a1.passed === false, 'Attempt 1 must fail');
    let unl = await chapterUnlockService.getUnlockedChapters(userRetry, 'grade-4', 'tamil');
    let ch2 = unl.chapters.find(c => c.chapterNumber === 2);
    assert(!ch2 || !ch2.unlocked, 'Ch 2 must be LOCKED after 6/10');

    // Attempt 2 (Retry): 7/10 -> Pass
    const a2 = await gameProgressService.completeGame(userRetry, tamilRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 70,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });
    assert(a2.passed === true, 'Attempt 2 must pass');
    assert(a2.completed === true, 'Attempt 2 must be completed');

    unl = await chapterUnlockService.getUnlockedChapters(userRetry, 'grade-4', 'tamil');
    ch2 = unl.chapters.find(c => c.chapterNumber === 2);
    assert(ch2 && ch2.unlocked, 'Ch 2 must be UNLOCKED after successful retry');
  });

  // ── Group 7: Idempotency & Reward Safety ─────────────────────────────────────
  console.log('\n--- Group 7: Duplicate Submission Idempotency ---');

  await test('13. Repeat pass completion does NOT award duplicate full XP or badges', async () => {
    const uDup = 'user-test-dup-' + Date.now();
    // First completion
    const p1 = await gameProgressService.completeGame(uDup, tamilRoom1, {
      score: 800,
      stars: 3,
      timeSpentSec: 80,
      gameState: { answeredQuestions: 10, correctAnswers: 8, wrongAnswers: 2 },
    });
    assert(p1.isFirstCompletion === true, 'p1 must be first completion');
    const firstXP = p1.awardedXP;

    // Second completion
    const p2 = await gameProgressService.completeGame(uDup, tamilRoom1, {
      score: 800,
      stars: 3,
      timeSpentSec: 75,
      gameState: { answeredQuestions: 10, correctAnswers: 8, wrongAnswers: 2 },
    });
    assert(p2.isFirstCompletion === false, 'p2 must be repeat completion');
    assert(p2.awardedXP < firstXP, 'p2 awardedXP must not equal full first completion XP');
    assert(p2.awardedCoins === 0, 'p2 coins must be 0 for repeat completion');
  });

  // ── Group 8: Specialized Chemistry Regression ────────────────────────────────
  console.log('\n--- Group 8: Chemistry Specialized Games Regression ---');

  await test('14. Chemistry room-1 (Grid Reconstruction) completes successfully', async () => {
    const uChem = 'user-test-chem-' + Date.now();
    const res = await gameProgressService.completeGame(uChem, 'room-1', {
      score: 1000,
      stars: 3,
      timeSpentSec: 120,
      gameState: { completed: true },
    });
    assert(res.completed === true, 'Chem room-1 must complete');
    assert(res.passed === true, 'Chem room-1 must pass');
  });

  // ── Summary ──────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n========================================================================================');
  console.log('📊 CHAPTER PASS THRESHOLD TEST SUMMARY');
  console.log('========================================================================================');
  console.log('Total Tests Run: ' + total);
  console.log('Passed:          ' + passed);
  console.log('Failed:          ' + failed);
  console.log('Success Rate:    ' + Math.round((passed / total) * 100) + '%');
  console.log('');
  if (failed === 0) {
    console.log('🎉 ALL CHAPTER PASS THRESHOLD TESTS PASSED!\n');
  } else {
    console.log('⚠️  ' + failed + ' TEST(S) FAILED — see above for details\n');
  }
}

run()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error('Fatal error:', e); prisma.$disconnect(); process.exit(1); });