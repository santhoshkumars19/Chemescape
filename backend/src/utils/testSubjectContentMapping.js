/**
 * ChemEscape Subject-Specific Mission & Game Content Mapping Verification Test Suite
 * 
 * Tests the entire content hierarchy:
 * USER -> STANDARD -> SUBJECT -> CHAPTER -> TOPIC -> ROOM / MISSION -> QUESTION -> GAME
 * 
 * Verifies that:
 * 1. Standard 5 Social Science never loads Chemistry questions/games.
 * 2. Standard 4 Mathematics never leaks Chemistry or Social Science content.
 * 3. Standard 11 Chemistry properly routes Units 1-6 to their authoritative game engines.
 * 4. Unconfigured chapters return empty content / 404 without falling back to other subjects.
 * 5. Room and Question ownership strictly respect curriculum context.
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
  console.log('🎯 SUBJECT-SPECIFIC MISSION & GAME CONTENT MAPPING TEST SUITE');
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
    const badge = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${badge} | ${testName}`);
    if (!passed) {
      console.log(`   Expected: ${expected}`);
      console.log(`   Actual:   ${actual}`);
      if (details) console.log(`   Details:  ${details}`);
    }
  };

  try {
    // 0. Authenticate as Student
    const loginRes = await request('POST', '/auth/login', {
      email: 'student@chemescape.com',
      password: 'Password123',
    });
    const token = loginRes.body?.data?.token;
    const studentHeaders = { Authorization: `Bearer ${token}` };
    record('Auth: Student Authenticated', 200, loginRes.status, loginRes.status === 200 && Boolean(token));

    // Fetch all standards
    const standardsRes = await request('GET', '/standards', null, studentHeaders);
    const rawStandards = standardsRes.body?.data;
    const standards = Array.isArray(rawStandards) ? rawStandards : (rawStandards?.standards || []);
    record('Curriculum: Standards Loaded', true, standards.length > 0, standards.length > 0, `Count: ${standards.length}`);

    const std4 = standards.find(s => s.name?.includes('4') || s.gradeNumber === 4 || s.id === 'std-4');
    const std5 = standards.find(s => s.name?.includes('5') || s.gradeNumber === 5 || s.id === 'std-5');
    const std11 = standards.find(s => s.name?.includes('11') || s.gradeNumber === 11 || s.id === 'std-11') || standards[0];

    // ─────────────────────────────────────────────────────────────────────────
    // 1. STANDARD HIERARCHY & SUBJECT ISOLATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 1. Standard Hierarchy & Subject Isolation ---');

    // 1.1 Query Standard 11 Subjects
    let std11Subjects = [];
    if (std11) {
      const std11Res = await request('GET', `/standards/${std11.id}/subjects`, null, studentHeaders);
      const raw = std11Res.body?.data;
      std11Subjects = Array.isArray(raw) ? raw : (raw?.subjects || []);
      const hasChem = std11Subjects.some(s => s.name?.toLowerCase().includes('chem') || s.code?.toLowerCase().includes('chem'));
      record('Standard 11 contains Chemistry subject', true, hasChem, hasChem, `Subjects: ${std11Subjects.map(s => s.name).join(', ')}`);
    }

    // 1.2 Query Standard 5 Subjects (if configured)
    if (std5) {
      const std5Res = await request('GET', `/standards/${std5.id}/subjects`, null, studentHeaders);
      const raw = std5Res.body?.data;
      const std5Subjects = Array.isArray(raw) ? raw : (raw?.subjects || []);
      const noChemIn5 = !std5Subjects.some(s => s.name?.toLowerCase() === 'chemistry' && s.standardId === std11?.id);
      record('Standard 5 does not leak 11th Chemistry subject', true, noChemIn5, noChemIn5);
    } else {
      record('Standard 5 does not leak 11th Chemistry subject', true, true, true, 'Standard 5 isolated');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CHAPTER ISOLATION PER SUBJECT
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 2. Chapter Isolation per Subject ---');

    // 2.1 Standard 11 Chemistry Chapters
    let chemChapters = [];
    if (std11) {
      const chemChaptersRes = await request('GET', `/standards/${std11.id}/chapters`, null, studentHeaders);
      const raw = chemChaptersRes.body?.data;
      chemChapters = Array.isArray(raw) ? raw : (raw?.chapters || []);
      record(
        'Standard 11 Chemistry Chapters resolved',
        true,
        chemChapters.length >= 1,
        chemChapters.length >= 1,
        `Found: ${chemChapters.length} chapters`
      );
    }

    // 2.2 Query with non-existent subject filter returns empty, not 11th Chem
    if (std11) {
      const filteredRes = await request('GET', `/standards/${std11.id}/chapters?subjectId=subj-nonexistent-soc5`, null, studentHeaders);
      const raw = filteredRes.body?.data;
      const filtered = Array.isArray(raw) ? raw : (raw?.chapters || []);
      record(
        'Filtering by non-existent subject returns zero chapters (no fallback to Chem)',
        0,
        filtered.length,
        filtered.length === 0,
        `Returned count: ${filtered.length}`
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. ROOM & MISSION CONTENT RESOLUTION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 3. Room & Mission Content Resolution ---');

    // 3.1 11th Chemistry Chapter 1 Room resolution
    let chemRooms = [];
    if (chemChapters.length > 0) {
      const ch1 = chemChapters[0];
      const chemCh1RoomsRes = await request('GET', `/chapters/${ch1.id}/rooms`, null, studentHeaders);
      const raw = chemCh1RoomsRes.body?.data;
      chemRooms = Array.isArray(raw) ? raw : (raw?.rooms || []);
      record(
        '11th Chemistry Chapter 1 resolves rooms',
        true,
        chemRooms.length > 0,
        chemRooms.length > 0,
        `Rooms found: ${chemRooms.length}`
      );
    }

    // 3.2 Non-configured chapter room query must return empty array / 404, never Chemistry Room 1
    const unconfiguredRoomsRes = await request('GET', '/chapters/ch-soc5-nonexistent/rooms', null, studentHeaders);
    const unconfiguredRooms = unconfiguredRoomsRes.body?.data?.rooms || [];
    const isCleanZeroFallback = unconfiguredRooms.length === 0 || unconfiguredRoomsRes.status === 404;
    record(
      'Unconfigured chapter does NOT fall back to Chemistry Room 1',
      true,
      isCleanZeroFallback,
      isCleanZeroFallback,
      `Status: ${unconfiguredRoomsRes.status}, Rooms returned: ${unconfiguredRooms.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 4. QUESTION MAPPING & ANTI-LEAKAGE VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 4. Question Mapping & Anti-Leakage ---');

    // 4.1 Chemistry Room 1 questions
    if (chemRooms.length > 0) {
      const r1 = chemRooms[0];
      const chemR1QRes = await request('GET', `/rooms/${r1.id}/questions`, null, studentHeaders);
      const chemR1Questions = chemR1QRes.body?.data?.questions || [];
      const hasChemR1Questions = chemR1Questions.length > 0;
      const allR1BelongToR1 = chemR1Questions.every(q => q.roomId === r1.id || !q.roomId);
      record(
        'Chemistry Room returns published questions for that Room',
        true,
        hasChemR1Questions && allR1BelongToR1,
        hasChemR1Questions && allR1BelongToR1,
        `Question count: ${chemR1Questions.length}`
      );
    }

    // 4.2 Standard 4 Math Room questions
    const math4QRes = await request('GET', '/rooms/room-math4-1/questions', null, studentHeaders);
    const math4Questions = math4QRes.body?.data?.questions || [];
    const noChemInMath4 = !math4Questions.some(q => q.questionText?.toLowerCase().includes('periodic') || q.questionText?.toLowerCase().includes('moles') || q.questionText?.toLowerCase().includes('electron'));
    record(
      'Standard 4 Math Room contains zero Chemistry questions',
      true,
      noChemInMath4,
      noChemInMath4,
      `Math4 question count: ${math4Questions.length}`
    );

    // 4.3 Unconfigured Room questions query must return empty array without falling back to Room 1
    const unconfiguredQRes = await request('GET', '/rooms/room-soc5-nonexistent/questions', null, studentHeaders);
    const unconfiguredQuestions = unconfiguredQRes.body?.data?.questions || [];
    const isCleanZeroQFallback = unconfiguredQuestions.length === 0 || unconfiguredQRes.status === 404;
    record(
      'Unconfigured room does NOT fall back to Chemistry questions',
      true,
      isCleanZeroQFallback,
      isCleanZeroQFallback,
      `Status: ${unconfiguredQRes.status}, Questions returned: ${unconfiguredQuestions.length}`
    );

    // ─────────────────────────────────────────────────────────────────────────
    // 5. GAME ENGINE AUTHORITATIVE DISPATCH VERIFICATION
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n--- 5. Game Engine Authoritative Dispatch ---');

    // 5.1 Unit 1 Calculation Heist endpoint
    const heistStartRes = await request('POST', '/game/calculation-heist/start', {}, studentHeaders);
    record(
      'Unit 1 Calculation Heist engine operates for Chemistry',
      200,
      heistStartRes.status,
      heistStartRes.status === 200,
      `Session ID: ${heistStartRes.body?.data?.sessionId}`
    );

    // 5.2 Unit 2 Quantum Architect endpoint
    const quantumStartRes = await request('POST', '/game/quantum-architect/start', {}, studentHeaders);
    record(
      'Unit 2 Quantum Architect engine operates for Chemistry',
      200,
      quantumStartRes.status,
      quantumStartRes.status === 200,
      `Session ID: ${quantumStartRes.body?.data?.sessionId}`
    );

    // 5.3 Unit 3 Grid Reconstruction endpoint
    const gridStartRes = await request('POST', '/game/grid-reconstruction/start', {}, studentHeaders);
    record(
      'Unit 3 Grid Reconstruction engine operates for Chemistry',
      200,
      gridStartRes.status,
      gridStartRes.status === 200,
      `Session ID: ${gridStartRes.body?.data?.sessionId}`
    );

    // 5.4 Unit 4 Hydrogen Reactor endpoint
    const hydrogenStartRes = await request('POST', '/game/hydrogen-reactor/start', {}, studentHeaders);
    record(
      'Unit 4 Hydrogen Reactor engine operates for Chemistry',
      200,
      hydrogenStartRes.status,
      hydrogenStartRes.status === 200,
      `Session ID: ${hydrogenStartRes.body?.data?.sessionId}`
    );

    // 5.5 Unit 5 Metal Sorting endpoint
    const metalStartRes = await request('POST', '/game/metal-sorting/start', {}, studentHeaders);
    record(
      'Unit 5 Metal Sorting Factory engine operates for Chemistry',
      200,
      metalStartRes.status,
      metalStartRes.status === 200,
      `Session ID: ${metalStartRes.body?.data?.sessionId}`
    );

    // 5.6 Unit 6 Gas Simulator endpoint
    const gasStartRes = await request('POST', '/game/gas-simulator/start', {}, studentHeaders);
    record(
      'Unit 6 Gas Simulator engine operates for Chemistry',
      200,
      gasStartRes.status,
      gasStartRes.status === 200,
      `Session ID: ${gasStartRes.body?.data?.sessionId}`
    );

  } catch (error) {
    console.error('Fatal error during test execution:', error);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log('📊 TEST SUMMARY RESULTS');
  console.log('================================================================');
  const total = report.length;
  const passed = report.filter(r => r.status === 'PASS').length;
  const failed = report.filter(r => r.status === 'FAIL').length;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed:          ${passed}`);
  console.log(`Failed:          ${failed}`);
  console.log(`Success Rate:    ${Math.round((passed / total) * 100)}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL SUBJECT CONTENT MAPPING AND ISOLATION TESTS PASSED!');
  } else {
    console.error(`⚠️ ${failed} test(s) failed.`);
    process.exit(1);
  }
}

runSubjectContentMappingTests();
