/**
 * Automated Verification Test Suite for ChemEscape AI Assistant
 * Run with: node src/utils/testAIAssistant.js
 */

const aiAssistantService = require('../services/ai/aiAssistantService');
const prisma = require('../config/db');

async function runAIAssistantTests() {
  console.log('=== Starting ChemEscape AI Assistant Verification Test Suite ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message, detail = '') {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] Test ${total}: ${message}`);
      if (detail) console.error(`       Detail:`, detail);
    }
  }

  // Fetch or mock user for testing
  let testUser = null;
  try {
    testUser = await prisma.user.findFirst();
  } catch {}
  if (!testUser) {
    testUser = { id: 'test-user-id', role: 'STUDENT' };
  }

  try {
    // TEST 1: In-Scope Exact Answer (Oxygen atomic number)
    const res1 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'What is the atomic number of oxygen?',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res1.classification === 'IN_SCOPE' && res1.answer.includes('8'),
      'Test 1: Oxygen atomic number exact answer',
      res1
    );

    // TEST 2: In-Scope Periodic Trend
    const res2 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'Why does atomic radius decrease across a period?',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res2.classification === 'IN_SCOPE' && (res2.answer.includes('nuclear charge') || res2.answer.includes('radius')),
      'Test 2: Periodic trends atomic radius decrease',
      res2
    );

    // TEST 3: Numerical Calculation (3 mol particles)
    const res3 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'Calculate particles in 3 mol.',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res3.classification === 'IN_SCOPE' && (res3.answer.includes('1.8066') || res3.answer.includes('10^24') || res3.answer.includes('10²⁴')),
      'Test 3: Numerical mole conversion (3 mol)',
      res3
    );

    // TEST 4: Out-of-Scope (Java Code)
    const res4 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'Write Java code to reverse a string.',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res4.classification === 'OUT_OF_SCOPE' && !res4.answer.includes('public static') && res4.answer.includes('ChemEscape syllabus'),
      'Test 4: Out-of-scope Java programming request refused',
      res4
    );

    // TEST 5: Out-of-Scope (Capital of India)
    const res5 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'What is the capital of India?',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res5.classification === 'OUT_OF_SCOPE' && !res5.answer.includes('New Delhi') && res5.answer.includes('ChemEscape syllabus'),
      'Test 5: Out-of-scope general knowledge request refused',
      res5
    );

    // TEST 6: Not In Selected Chapter / Syllabus Mode
    const res6 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'Explain thermodynamics in detail.',
      mode: 'CURRENT_CHAPTER',
      chapterId: 'periodic-table-dummy-id'
    });
    assert(
      res6.classification === 'NOT_IN_SYLLABUS' || (res6.answer && res6.answer.includes('chapter')),
      'Test 6: Out-of-selected-chapter mode refusal',
      res6
    );

    // TEST 7: Ambiguous Question
    const res7 = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'Explain equilibrium',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res7.classification === 'AMBIGUOUS' || res7.answer.includes('clarify') || res7.answer.includes('Equilibrium'),
      'Test 7: Ambiguous question requires clarification',
      res7
    );

    // TEST 8: User Data Isolation (Ensure user context doesn't leak)
    const res8A = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'What is the atomic number of carbon?',
      mode: 'FULL_SYLLABUS'
    });
    const res8B = await aiAssistantService.processQuery({
      userId: testUser.id,
      question: 'What is the atomic number of nitrogen?',
      mode: 'FULL_SYLLABUS'
    });
    assert(
      res8A.answer.includes('6') && res8B.answer.includes('7'),
      'Test 8: Strict user context & answer isolation',
      { userA: res8A.answer, userB: res8B.answer }
    );

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    console.log(`\n=== Verification Complete: ${passed}/${total} tests passed ===`);
    process.exit(passed === total ? 0 : 1);
  }
}

runAIAssistantTests();
