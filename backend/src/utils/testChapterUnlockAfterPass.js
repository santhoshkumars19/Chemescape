/**
 * testChapterUnlockAfterPass.js — 7/10 Pass & Next Chapter Unlock Verification Suite
 *
 * Verifies the authoritative flow from Question 10 submission to Next Chapter Unlock:
 * 1.  6/10 fails (passed=false, chapterCompleted=false, nextChapterUnlocked=false)
 * 2.  7/10 passes (passed=true, chapterCompleted=true, nextChapterUnlocked=true)
 * 3.  8/10 passes (passed=true)
 * 4.  9/10 passes (passed=true)
 * 5.  10/10 passes (passed=true)
 * 6.  7/10 unlocks Chapter 2 in getUnlockedChapters
 * 7.  6/10 does NOT unlock Chapter 2
 * 8.  User A unlock does NOT affect User B (User Isolation)
 * 9.  Tamil unlock does NOT affect Mathematics (Subject Isolation)
 * 10. Standard 4 unlock does NOT affect Standard 5 (Standard Isolation)
 * 11. Replay with lower score (5/10) does NOT relock Chapter 2 (Replay Safety)
 * 12. Duplicate completion is safe & idempotent (no duplicate badges or full XP)
 * 13. API getUnlockedChapters returns exact authoritative unlock states
 * 14. getUserProgress returns populated completedList with user completed rooms
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
  console.log('🧪 CHEMESCAPE — 7/10 PASS & CHAPTER UNLOCK VERIFICATION SUITE');
  console.log('========================================================================================\n');

  const userFail6   = 'user-unlock-fail6-' + Date.now();
  const userPass7   = 'user-unlock-pass7-' + Date.now();
  const userPass8   = 'user-unlock-pass8-' + Date.now();
  const userPass9   = 'user-unlock-pass9-' + Date.now();
  const userPass10  = 'user-unlock-pass10-' + Date.now();
  const userIsoA    = 'user-unlock-isoA-' + Date.now();
  const userIsoB    = 'user-unlock-isoB-' + Date.now();
  const userReplay  = 'user-unlock-replay-' + Date.now();
  const userDup     = 'user-unlock-dup-' + Date.now();

  const tamilRoom1 = 'room-tam4-1';
  const mathRoom1  = 'room-math4-1';

  // ── 1. 6/10 fails ───────────────────────────────────────────────────────────
  await test('1. 6/10 fails (passed=false, chapterCompleted=false, nextChapterUnlocked=false)', async () => {
    const res = await gameProgressService.completeGame(userFail6, tamilRoom1, {
      score: 600,
      stars: 1,
      timeSpentSec: 60,
      gameState: { answeredQuestions: 10, correctAnswers: 6, wrongAnswers: 4 },
    });
    assert(res.passed === false, 'Expected passed=false, got: ' + res.passed);
    assert(res.completed === false, 'Expected completed=false, got: ' + res.completed);
    assert(res.nextChapterUnlocked === false, 'Expected nextChapterUnlocked=false, got: ' + res.nextChapterUnlocked);
    assert(res.retryRequired === true, 'Expected retryRequired=true');
    assert(res.awardedXP === 0, 'Expected awardedXP=0');
    assert(res.awardedCoins === 0, 'Expected awardedCoins=0');
  });

  // ── 2. 7/10 passes ──────────────────────────────────────────────────────────
  await test('2. 7/10 passes (passed=true, chapterCompleted=true, nextChapterUnlocked=true)', async () => {
    const res = await gameProgressService.completeGame(userPass7, tamilRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 70,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });
    assert(res.passed === true, 'Expected passed=true, got: ' + res.passed);
    assert(res.completed === true, 'Expected completed=true, got: ' + res.completed);
    assert(res.nextChapterUnlocked === true, 'Expected nextChapterUnlocked=true, got: ' + res.nextChapterUnlocked);
    assert(res.retryRequired === false, 'Expected retryRequired=false');
    assert(res.awardedXP > 0, 'Expected awardedXP > 0 on pass');
  });

  // ── 3. 8/10 passes ──────────────────────────────────────────────────────────
  await test('3. 8/10 passes (passed=true, chapterCompleted=true)', async () => {
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

  // ── 4. 9/10 passes ──────────────────────────────────────────────────────────
  await test('4. 9/10 passes (passed=true, chapterCompleted=true)', async () => {
    const res = await gameProgressService.completeGame(userPass9, tamilRoom1, {
      score: 900,
      stars: 3,
      timeSpentSec: 90,
      gameState: { answeredQuestions: 10, correctAnswers: 9, wrongAnswers: 1 },
    });
    assert(res.passed === true, 'Expected passed=true');
    assert(res.completed === true, 'Expected completed=true');
  });

  // ── 5. 10/10 passes ─────────────────────────────────────────────────────────
  await test('5. 10/10 passes (passed=true, chapterCompleted=true)', async () => {
    const res = await gameProgressService.completeGame(userPass10, tamilRoom1, {
      score: 1000,
      stars: 3,
      timeSpentSec: 100,
      gameState: { answeredQuestions: 10, correctAnswers: 10, wrongAnswers: 0 },
    });
    assert(res.passed === true, 'Expected passed=true');
    assert(res.completed === true, 'Expected completed=true');
  });

  // ── 6. 7/10 unlocks Chapter 2 ───────────────────────────────────────────────
  await test('6. 7/10 unlocks Chapter 2 in getUnlockedChapters', async () => {
    const unl = await chapterUnlockService.getUnlockedChapters(userPass7, 'grade-4', 'tamil');
    const ch1 = unl.chapters.find(c => c.chapterNumber === 1);
    const ch2 = unl.chapters.find(c => c.chapterNumber === 2);
    assert(ch1 && ch1.isCompleted === true, 'Chapter 1 must be marked isCompleted=true');
    assert(ch1 && ch1.status === 'COMPLETED', 'Chapter 1 status must be COMPLETED');
    assert(ch2 && ch2.unlocked === true, 'Chapter 2 must be unlocked=true');
    assert(ch2 && ch2.status === 'UNLOCKED', 'Chapter 2 status must be UNLOCKED');
    assert(unl.completedChapters === 1, 'completedChapters must equal 1');
    assert(unl.progressPercent > 0, 'progressPercent must be > 0');
  });

  // ── 7. 6/10 does NOT unlock Chapter 2 ───────────────────────────────────────
  await test('7. 6/10 does NOT unlock Chapter 2', async () => {
    const unl = await chapterUnlockService.getUnlockedChapters(userFail6, 'grade-4', 'tamil');
    const ch1 = unl.chapters.find(c => c.chapterNumber === 1);
    const ch2 = unl.chapters.find(c => c.chapterNumber === 2);
    assert(ch1 && ch1.isCompleted === false, 'Chapter 1 must NOT be completed');
    assert(!ch2 || ch2.unlocked === false, 'Chapter 2 must remain LOCKED');
    assert(!ch2 || ch2.status === 'LOCKED', 'Chapter 2 status must be LOCKED');
    assert(unl.completedChapters === 0, 'completedChapters must equal 0');
  });

  // ── 8. User A unlock does not affect User B ─────────────────────────────────
  await test('8. User A unlock does not affect User B (User Isolation)', async () => {
    // User A passes 7/10
    await gameProgressService.completeGame(userIsoA, tamilRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 70,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });

    const unlA = await chapterUnlockService.getUnlockedChapters(userIsoA, 'grade-4', 'tamil');
    const unlB = await chapterUnlockService.getUnlockedChapters(userIsoB, 'grade-4', 'tamil');

    const ch2A = unlA.chapters.find(c => c.chapterNumber === 2);
    const ch2B = unlB.chapters.find(c => c.chapterNumber === 2);

    assert(ch2A && ch2A.unlocked === true, 'User A Chapter 2 must be UNLOCKED');
    assert(!ch2B || ch2B.unlocked === false, 'User B Chapter 2 must remain LOCKED');
  });

  // ── 9. Tamil unlock does not affect Mathematics ─────────────────────────────
  await test('9. Tamil unlock does not affect Mathematics (Subject Isolation)', async () => {
    const unlMath = await chapterUnlockService.getUnlockedChapters(userPass7, 'grade-4', 'mathematics');
    const mathCh1 = unlMath.chapters.find(c => c.chapterNumber === 1);
    const mathCh2 = unlMath.chapters.find(c => c.chapterNumber === 2);

    assert(mathCh1 && mathCh1.unlocked === true, 'Math Chapter 1 is always unlocked initially');
    assert(mathCh1 && mathCh1.isCompleted === false, 'Math Chapter 1 must be NOT completed');
    assert(!mathCh2 || mathCh2.unlocked === false, 'Math Chapter 2 must remain LOCKED');
  });

  // ── 10. Standard 4 unlock does not affect Standard 5 ────────────────────────
  await test('10. Standard 4 unlock does not affect Standard 5 (Standard Isolation)', async () => {
    const uStd = 'user-unlock-std-' + Date.now();
    await gameProgressService.completeGame(uStd, mathRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 70,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });

    const unlStd4 = await chapterUnlockService.getUnlockedChapters(uStd, 'grade-4', 'mathematics');
    const std4Ch2 = unlStd4.chapters.find(c => c.chapterNumber === 2);
    assert(std4Ch2 && std4Ch2.unlocked === true, 'Std 4 Math Ch 2 must be UNLOCKED');

    const unlStd5 = await chapterUnlockService.getUnlockedChapters(uStd, 'grade-5', 'mathematics');
    const std5Ch2 = unlStd5.chapters.find(c => c.chapterNumber === 2);
    assert(!std5Ch2 || std5Ch2.unlocked === false, 'Std 5 Math Ch 2 must remain LOCKED');
  });

  // ── 11. Replay lower score does not relock ──────────────────────────────────
  await test('11. Replay lower score (5/10) does NOT relock Chapter 2 (Replay Safety)', async () => {
    // Attempt 1: 8/10 -> PASS
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
    assert(r2.completed === true, 'Replay must preserve completed=true');
    assert(r2.nextChapterUnlocked === true, 'Replay must preserve nextChapterUnlocked=true');

    // Verify through chapter unlock service
    const unl = await chapterUnlockService.getUnlockedChapters(userReplay, 'grade-4', 'tamil');
    const ch1 = unl.chapters.find(c => c.chapterNumber === 1);
    const ch2 = unl.chapters.find(c => c.chapterNumber === 2);
    assert(ch1 && ch1.isCompleted === true, 'Chapter 1 must remain COMPLETED after replay');
    assert(ch2 && ch2.unlocked === true, 'Chapter 2 must remain UNLOCKED after replay');
  });

  // ── 12. Duplicate completion safe & idempotent ──────────────────────────────
  await test('12. Duplicate completion is safe & idempotent (no duplicate badge/full rewards)', async () => {
    const p1 = await gameProgressService.completeGame(userDup, tamilRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 70,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });
    assert(p1.isFirstCompletion === true, 'p1 must be first completion');
    const firstXP = p1.awardedXP;

    const p2 = await gameProgressService.completeGame(userDup, tamilRoom1, {
      score: 700,
      stars: 2,
      timeSpentSec: 65,
      gameState: { answeredQuestions: 10, correctAnswers: 7, wrongAnswers: 3 },
    });
    assert(p2.isFirstCompletion === false, 'p2 must be repeat completion');
    assert(p2.awardedXP < firstXP, 'p2 awardedXP must not equal full first completion XP');
    assert(p2.awardedCoins === 0, 'p2 coins must be 0 for repeat completion');
  });

  // ── 13. API getUnlockedChapters returns exact state ─────────────────────────
  await test('13. getUnlockedChapters returns accurate progression and status metadata', async () => {
    const unl = await chapterUnlockService.getUnlockedChapters(userPass7, 'grade-4', 'tamil');
    assert(Array.isArray(unl.chapters), 'chapters must be an array');
    assert(unl.totalChapters >= 2, 'totalChapters must be >= 2');
    assert(unl.completedChapters === 1, 'completedChapters must be 1');
    assert(unl.progressPercent === Math.round((1 / unl.totalChapters) * 100), 'progressPercent must match chapter count ratio');
  });

  // ── 14. getUserProgress returns populated completedList ──────────────────────
  await test('14. getUserProgress returns completedList with user completed rooms', async () => {
    const progress = await gameProgressService.getUserProgress(userPass7);
    assert(progress !== null && typeof progress === 'object', 'progress must be an object');
    assert(progress.totalXP > 0, 'totalXP must be > 0');
    assert(Array.isArray(progress.completedList), 'completedList must be an array');
    assert(progress.completedList.length > 0, 'completedList must contain completed room');
    const hasTamilRoom = progress.completedList.some(p => (p.roomId === tamilRoom1 || p.room?.id === tamilRoom1));
    assert(hasTamilRoom, 'completedList must contain room-tam4-1');
  });

  // ── Summary ──────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n========================================================================================');
  console.log('📊 CHAPTER UNLOCK VERIFICATION TEST SUMMARY');
  console.log('========================================================================================');
  console.log('Total Tests Run: ' + total);
  console.log('Passed:          ' + passed);
  console.log('Failed:          ' + failed);
  console.log('Success Rate:    ' + Math.round((passed / total) * 100) + '%');
  console.log('');
  if (failed === 0) {
    console.log('🎉 ALL CHAPTER UNLOCK TESTS PASSED 100% SUCCESSFULLY!\n');
  } else {
    console.log('⚠️  ' + failed + ' TEST(S) FAILED — see above for details\n');
  }
}

run()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error('Fatal error:', e); prisma.$disconnect(); process.exit(1); });