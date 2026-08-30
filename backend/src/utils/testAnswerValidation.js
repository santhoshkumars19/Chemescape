/**
 * testAnswerValidation.js — Server-Authoritative Answer Validation Test Suite
 *
 * Tests the validateAnswer() method in questionService which powers the
 * POST /api/game/questions/:questionId/answer endpoint.
 *
 * Run: node src/utils/testAnswerValidation.js
 */
'use strict';

const questionService = require('../services/questionService');
const prisma = require('../config/db');

let passed = 0;
let failed = 0;

async function test(label, fn) {
  try {
    await fn();
    console.log('✅ PASS | ' + label);
    passed++;
  } catch (err) {
    console.log('❌ FAIL | ' + label);
    console.log('         Error: ' + err.message);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

async function loadQ(roomId) {
  const questions = await questionService.getQuestionsByRoom(roomId, false);
  const q = questions.find(item => item.questionType === 'MCQ' && item.status === 'PUBLISHED' && item.isActive !== false);
  if (!q) throw new Error('No published MCQ in room ' + roomId);
  return q;
}

async function run() {
  console.log('\n========================================================================================');
  console.log('🧪 CHEMESCAPE — ANSWER VALIDATION TEST SUITE');
  console.log('========================================================================================\n');

  const ROOMS = {
    Tamil: 'room-tam4-1', English: 'room-eng4-1',
    Math: 'room-math4-1', Science: 'room-sci4-1', Social: 'room-soc4-1',
  };

  // ── Group 1: Per-Subject Correct + Wrong Validation ─────────────────────────
  console.log('--- Group 1: Per-Subject MCQ Validation ---');
  for (const [subject, roomId] of Object.entries(ROOMS)) {
    let q = null;
    try { q = await loadQ(roomId); } catch (e) {
      console.log('❌ FAIL | Setup ' + subject + ': ' + e.message); failed++; continue;
    }
    const correct = q.options.find(o => o.isCorrect === true);
    const wrongs = q.options.filter(o => o.isCorrect === false);
    if (!correct) { console.log('❌ FAIL | ' + subject + ': no correct option in DB'); failed++; continue; }

    await test(subject + ': correct answer (ID=' + correct.id + ') → correct=true', async () => {
      const r = await questionService.validateAnswer(q.id, roomId, correct.id);
      assert(r.correct === true, 'got correct=' + r.correct);
      assert(r.points > 0, 'expected points>0, got ' + r.points);
      // Security: response must not leak answer data
      assert(!('isCorrect' in r), 'isCorrect leaked in response');
      assert(!('correctOption' in r), 'correctOption leaked in response');
      assert(!('options' in r), 'options leaked in response');
    });

    if (wrongs[0]) {
      await test(subject + ': wrong answer [0] → correct=false', async () => {
        const r = await questionService.validateAnswer(q.id, roomId, wrongs[0].id);
        assert(r.correct === false, 'got correct=' + r.correct);
        assert(r.points === 0, 'expected points=0, got ' + r.points);
      });
    }
    if (wrongs[1]) {
      await test(subject + ': wrong answer [1] → correct=false', async () => {
        const r = await questionService.validateAnswer(q.id, roomId, wrongs[1].id);
        assert(r.correct === false, 'got correct=' + r.correct);
      });
    }
    if (wrongs[2]) {
      await test(subject + ': wrong answer [2] → correct=false', async () => {
        const r = await questionService.validateAnswer(q.id, roomId, wrongs[2].id);
        assert(r.correct === false, 'got correct=' + r.correct);
      });
    }
  }

  // ── Group 2: Room Isolation ──────────────────────────────────────────────────
  console.log('\n--- Group 2: Room & Subject Isolation ---');
  const tamQ = await loadQ('room-tam4-1').catch(() => null);
  if (tamQ) {
    await test('Tamil question submitted to Math room → 400 (room mismatch)', async () => {
      try {
        await questionService.validateAnswer(tamQ.id, 'room-math4-1', tamQ.options[0].id);
        throw new Error('Expected 400, none thrown');
      } catch (e) {
        assert(e.statusCode === 400 || e.message.includes('belong'), 'Got: ' + e.message);
      }
    });
  }

  // ── Group 3: Invalid Inputs ──────────────────────────────────────────────────
  console.log('\n--- Group 3: Invalid / Empty Inputs ---');
  if (tamQ) {
    await test('Empty string answer → 400', async () => {
      try {
        await questionService.validateAnswer(tamQ.id, 'room-tam4-1', '');
        throw new Error('Expected 400');
      } catch (e) { assert(e.statusCode === 400, 'Got: ' + e.message); }
    });

    await test('Null answer → 400', async () => {
      try {
        await questionService.validateAnswer(tamQ.id, 'room-tam4-1', null);
        throw new Error('Expected 400');
      } catch (e) { assert(e.statusCode === 400, 'Got: ' + e.message); }
    });
  }

  await test('Non-existent questionId → 404', async () => {
    try {
      await questionService.validateAnswer('q-DOES-NOT-EXIST-xyz', 'room-tam4-1', 'any');
      throw new Error('Expected 404');
    } catch (e) { assert(e.statusCode === 404, 'Got: ' + e.message); }
  });

  await test('Null roomId → 400', async () => {
    try {
      await questionService.validateAnswer('any-id', null, 'any');
      throw new Error('Expected 400');
    } catch (e) { assert(e.statusCode === 400, 'Got: ' + e.message); }
  });

  await test('Null questionId → 400', async () => {
    try {
      await questionService.validateAnswer(null, 'room-tam4-1', 'any');
      throw new Error('Expected 400');
    } catch (e) { assert(e.statusCode === 400, 'Got: ' + e.message); }
  });

  // ── Group 4: CALCULATION Questions ──────────────────────────────────────────
  console.log('\n--- Group 4: CALCULATION Type (Chemistry fallback data) ---');
  await test('Chemistry r3: correct answer "2" → correct=true', async () => {
    const r = await questionService.validateAnswer('q-chem-r3-1', 'room-3', '2');
    assert(r.correct === true, 'got ' + r.correct);
  });
  await test('Chemistry r3: wrong answer "99" → correct=false', async () => {
    const r = await questionService.validateAnswer('q-chem-r3-1', 'room-3', '99');
    assert(r.correct === false, 'got ' + r.correct);
  });
  await test('Chemistry r3: wrong answer "3" → correct=false', async () => {
    const r = await questionService.validateAnswer('q-chem-r3-1', 'room-3', '3');
    assert(r.correct === false, 'got ' + r.correct);
  });

  // ── Group 5: Chemistry MCQ Regression ───────────────────────────────────────
  console.log('\n--- Group 5: Chemistry MCQ Regression (DEFAULT_QUESTIONS) ---');
  await test('Chem r1 q1: opt-q1-2 (Sodium=correct) → true', async () => {
    const r = await questionService.validateAnswer('q-chem-r1-1', 'room-1', 'opt-q1-2');
    assert(r.correct === true, 'got ' + r.correct);
  });
  await test('Chem r1 q1: opt-q1-1 (Lithium=wrong) → false', async () => {
    const r = await questionService.validateAnswer('q-chem-r1-1', 'room-1', 'opt-q1-1');
    assert(r.correct === false, 'got ' + r.correct);
  });
  await test('Chem r1 q1: opt-q1-3 (Potassium=wrong) → false', async () => {
    const r = await questionService.validateAnswer('q-chem-r1-1', 'room-1', 'opt-q1-3');
    assert(r.correct === false, 'got ' + r.correct);
  });
  await test('Chem r1 q1: opt-q1-4 (Magnesium=wrong) → false', async () => {
    const r = await questionService.validateAnswer('q-chem-r1-1', 'room-1', 'opt-q1-4');
    assert(r.correct === false, 'got ' + r.correct);
  });

  // ── Summary ──────────────────────────────────────────────────────────────────
  const total = passed + failed;
  console.log('\n========================================================================================');
  console.log('📊 ANSWER VALIDATION TEST SUMMARY');
  console.log('========================================================================================');
  console.log('Total Tests Run: ' + total);
  console.log('Passed:          ' + passed);
  console.log('Failed:          ' + failed);
  console.log('Success Rate:    ' + Math.round((passed / total) * 100) + '%');
  console.log('');
  if (failed === 0) {
    console.log('🎉 ALL ANSWER VALIDATION TESTS PASSED!\n');
  } else {
    console.log('⚠️  ' + failed + ' TEST(S) FAILED — see above for details\n');
  }
}

run()
  .then(() => prisma.$disconnect())
  .catch(e => { console.error('Fatal error:', e); prisma.$disconnect(); process.exit(1); });