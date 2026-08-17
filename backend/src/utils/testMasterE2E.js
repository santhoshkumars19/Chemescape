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

async function runMasterE2ETests() {
  console.log('==================================================');
  console.log('🚀 CHEMESCAPE COMPREHENSIVE E2E MASTER TEST SUITE');
  console.log('==================================================\n');

  const report = [];

  const record = (testName, expected, actual, passed, details = '') => {
    report.push({
      testName,
      expected: String(expected),
      actual: String(actual),
      status: passed ? 'PASS' : 'FAIL',
      details,
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName} | Status: ${actual} (Expected: ${expected})`);
  };

  // --------------------------------------------------
  // 1. AUTHENTICATION & SECURITY TESTS
  // --------------------------------------------------
  console.log('\n--- 1. Authentication & Security Tests ---');

  const badLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'WrongPassword123',
  });
  record('Auth: Invalid Password Rejected', 401, badLogin.status, badLogin.status === 401);

  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  record('Auth: Valid Student Login', 200, studentLogin.status, studentLogin.status === 200 && !!token);

  const unauthAccess = await request('GET', '/game/progress');
  record('Security: Unauthenticated API Access Blocked', 401, unauthAccess.status, unauthAccess.status === 401);

  const adminAccess = await request('POST', '/chapters', { title: 'Unauthorized Chapter', standardId: 'some-id' }, headers);
  record('Security: Student Accessing Teacher/Admin API Blocked', 403, adminAccess.status, adminAccess.status === 403);

  // --------------------------------------------------
  // 2. LEARNING CONTENT HIERARCHY TESTS
  // --------------------------------------------------
  console.log('\n--- 2. Learning Content Hierarchy Tests ---');

  const standardsRes = await request('GET', '/standards', null, headers);
  const rawStandards = standardsRes.body.data;
  const standardsData = Array.isArray(rawStandards) ? rawStandards : (rawStandards?.standards || []);
  record('Content: GET /api/standards', 200, standardsRes.status, standardsRes.status === 200 && standardsData.length >= 2);

  const std11 = standardsData.find((s) => s.name && s.name.includes('11')) || standardsData[0];

  let subjects = [];
  if (std11) {
    const subjRes = await request('GET', `/standards/${std11.id}/subjects`, null, headers);
    const rawSubj = subjRes.body.data;
    subjects = Array.isArray(rawSubj) ? rawSubj : (rawSubj?.subjects || []);
    record('Content: GET /api/standards/:id/subjects', 200, subjRes.status, subjRes.status === 200 && subjects.length > 0);
  }

  let chapters = [];
  if (std11) {
    const chapRes = await request('GET', `/standards/${std11.id}/chapters`, null, headers);
    const rawChap = chapRes.body.data;
    chapters = Array.isArray(rawChap) ? rawChap : (rawChap?.chapters || []);
    record('Content: GET /api/standards/:id/chapters', 200, chapRes.status, chapRes.status === 200 && chapters.length >= 1);
  }

  let ch1 = chapters[0];
  if (ch1) {
    const topicRes = await request('GET', `/chapters/${ch1.id}/topics`, null, headers);
    record('Content: GET /api/chapters/:id/topics', 200, topicRes.status, topicRes.status === 200);

    const roomRes = await request('GET', `/chapters/${ch1.id}/rooms`, null, headers);
    record('Content: GET /api/chapters/:id/rooms', 200, roomRes.status, roomRes.status === 200);
  }

  // --------------------------------------------------
  // 3. STRICT ANSWER VALIDATION & ANTI-CHEAT TESTS
  // --------------------------------------------------
  console.log('\n--- 3. Strict Answer Validation & Anti-Cheat Tests ---');

  // Test 3.1: Wrong Answer Rejection & Life Decrease
  await request('POST', '/game/calculation-heist/start', {}, headers);
  const wrongAnswerRes = await request('POST', '/game/calculation-heist/stage/1/submit', { answer: 999999 }, headers);
  const wrongData = wrongAnswerRes.body.data || wrongAnswerRes.body;
  const isWrongRejected = wrongData.correct === false && wrongData.livesRemaining === 2;
  record('Validation: Wrong Answer Rejected & Life Decreased', false, wrongData.correct, isWrongRejected);

  // Test 3.2: Stage Anti-Skip Protection (Submit Stage 4 on Stage 1)
  const stageSkipRes = await request('POST', '/game/calculation-heist/stage/4/submit', { answer: 'CH2O' }, headers);
  record('Security: Stage Anti-Skip Protection', 400, stageSkipRes.status, stageSkipRes.status === 400);

  // Test 3.3: Manipulated Payload Fields Ignored
  const cheatRes = await request('POST', '/game/calculation-heist/stage/1/submit', {
    answer: 999999,
    correct: true,
    score: 999999,
    xp: 999999,
    coins: 999999,
  }, headers);
  const cheatData = cheatRes.body.data || cheatRes.body;
  record('Security: Manipulated Payload Fields Ignored', false, cheatData.correct, cheatData.correct === false);

  // --------------------------------------------------
  // 4. FULL GAME PLAYTHROUGHS (UNITS 1 - 5)
  // --------------------------------------------------
  console.log('\n--- 4. Full Game Playthroughs (Units 1–5) ---');

  // UNIT 1: Chem Calculation Heist
  const u1Start = await request('POST', '/game/calculation-heist/start', {}, headers);
  record('Unit 1: Session Start', 200, u1Start.status, u1Start.status === 200);
  const u1Stages = u1Start.body.data?.gameState?.stages || [];

  const u1Given = u1Stages[0]?.givenMass || 36;
  const u1Molar = u1Stages[0]?.molarMass || 18;
  const u1S1Res = await request('POST', '/game/calculation-heist/stage/1/submit', { answer: u1Given / u1Molar }, headers);

  const u1Elem2 = u1Stages[1]?.elements;
  let u1S2Ans = 44;
  if (u1Elem2 && u1Elem2.length === 3) u1S2Ans = 100;
  const u1S2Res = await request('POST', '/game/calculation-heist/stage/2/submit', { answer: u1S2Ans }, headers);

  const u1Moles = u1Stages[2]?.givenMoles || 2;
  const u1S3Ans = u1Moles === 2 ? '1.204' : '1.807';
  const u1S3Res = await request('POST', '/game/calculation-heist/stage/3/submit', { answer: u1S3Ans }, headers);

  const u1Comp3 = u1Stages[3]?.composition;
  const u1S4Ans = u1Comp3 && u1Comp3.length === 3 ? 'CH2O' : 'CH2';
  const u1S4Res = await request('POST', '/game/calculation-heist/stage/4/submit', { answer: u1S4Ans }, headers);

  const u1CodeDigits = [
    u1S1Res.body.data?.codeDigit,
    u1S2Res.body.data?.codeDigit,
    u1S3Res.body.data?.codeDigit,
    u1S4Res.body.data?.codeDigit,
  ].filter((d) => d !== undefined && d !== null);

  const u1Final = await request('POST', '/game/calculation-heist/final-code', { code: u1CodeDigits.join(''), timeSpentSec: 120 }, headers);
  record('Unit 1: Full Playthrough & Completion', 200, u1Final.status, u1Final.status === 200 && (u1Final.body.data?.unlocked === true || u1Final.body.data?.correct === true));

  // UNIT 2: Quantum Orbital Architect
  const u2Start = await request('POST', '/game/quantum-architect/start', {}, headers);
  record('Unit 2: Session Start', 200, u2Start.status, u2Start.status === 200);
  const u2Stages = u2Start.body.data?.gameState?.stages || [];

  const u2Elem1 = u2Stages[0]?.element;
  let u2S1Ans = { K: 2, L: 6 };
  if (u2Elem1 === 'Sodium') u2S1Ans = { K: 2, L: 8, M: 1 };
  if (u2Elem1 === 'Carbon') u2S1Ans = { K: 2, L: 4 };
  await request('POST', '/game/quantum-architect/stage/1/submit', u2S1Ans, headers);

  const u2Elem2 = u2Stages[1]?.element;
  let u2S2Ans = { '1s': ['up', 'down'], '2s': ['up', 'down'], '2px': ['up', 'down'], '2py': ['up'], '2pz': ['up'] };
  if (u2Elem2?.includes('Nitrogen')) {
    u2S2Ans = { '1s': ['up', 'down'], '2s': ['up', 'down'], '2px': ['up'], '2py': ['up'], '2pz': ['up'] };
  }
  await request('POST', '/game/quantum-architect/stage/2/submit', u2S2Ans, headers);

  const u2Sub3 = u2Stages[2]?.subshell;
  let u2S3Ans = { n: 2, l: 1, ml: -1, ms: -0.5 };
  if (u2Sub3 === '3s') u2S3Ans = { n: 3, l: 0, ml: 0, ms: 0.5 };
  await request('POST', '/game/quantum-architect/stage/3/submit', u2S3Ans, headers);

  const u2Diag4 = u2Stages[3]?.diagramDescription;
  let u2S4Ans = 'Pauli Exclusion Principle';
  if (u2Diag4?.includes('2s [ ]')) u2S4Ans = 'Aufbau Principle';
  if (u2Diag4?.includes('2p [↑↓] [ ]')) u2S4Ans = 'Hund’s Rule';
  await request('POST', '/game/quantum-architect/stage/4/submit', { answer: u2S4Ans }, headers);

  const u2Elem5 = u2Stages[4]?.element;
  let u2S5Ans = '1s2 2s2 2p6 3s1';
  if (u2Elem5?.includes('Neon')) u2S5Ans = '1s2 2s2 2p6';

  const u2Final = await request('POST', '/game/quantum-architect/final-submit', { answer: u2S5Ans, timeSpentSec: 180 }, headers);
  record('Unit 2: Full Playthrough & Completion', 200, u2Final.status, u2Final.body.data?.completed === true || u2Final.body.data?.correct === true);

  // UNIT 3: Periodic Grid Reconstruction
  const u3Start = await request('POST', '/game/grid-reconstruction/start', {}, headers);
  record('Unit 3: Session Start', 200, u3Start.status, u3Start.status === 200);
  const u3Stages = u3Start.body.data?.gameState?.stages || [];

  const u3Elem1 = u3Stages[0]?.targetElement;
  let u3S1Ans = { z: 8 };
  if (u3Elem1 === 'Sodium') u3S1Ans = { z: 11 };
  await request('POST', '/game/grid-reconstruction/stage/1/submit', u3S1Ans, headers);

  await request('POST', '/game/grid-reconstruction/stage/2/submit', {
    placements: [
      { symbol: 'Li', group: 1, period: 2 },
      { symbol: 'C', group: 14, period: 2 },
      { symbol: 'F', group: 17, period: 2 },
    ],
  }, headers);

  await request('POST', '/game/grid-reconstruction/stage/3/submit', {
    group: 17,
    period: 3,
    block: 'p',
  }, headers);

  const u3Pair4 = u3Stages[3]?.pair;
  let u3S4Ans = { choice: 'Sodium (Na)' };
  if (u3Pair4?.[0]?.includes('Fluorine')) u3S4Ans = { choice: 'Fluorine (F)' };
  await request('POST', '/game/grid-reconstruction/stage/4/submit', u3S4Ans, headers);

  const u3Final = await request('POST', '/game/grid-reconstruction/final-submit', {
    alkali: ['Li', 'Na', 'K'],
    electronegativity: ['F', 'O', 'N', 'C'],
    timeSpentSec: 210,
  }, headers);
  record('Unit 3: Full Playthrough & Completion', 200, u3Final.status, u3Final.body.data?.completed === true || u3Final.body.data?.correct === true);

  // UNIT 4: Hydrogen Reactor
  const u4Start = await request('POST', '/game/hydrogen-reactor/start', {}, headers);
  record('Unit 4: Session Start', 200, u4Start.status, u4Start.status === 200);
  const u4Stages = u4Start.body.data?.gameState?.stages || [];

  const u4Sym = u4Stages[0]?.symbol;
  let u4Ans = { protons: 1, neutrons: 1, sorting: { '1H': 'Protium', '2H': 'Deuterium', '3H': 'Tritium' } };
  if (u4Sym === '3H') u4Ans.neutrons = 2;
  await request('POST', '/game/hydrogen-reactor/stage/1/submit', u4Ans, headers);

  await request('POST', '/game/hydrogen-reactor/stage/2/submit', { reactants: ['Zn', 'HCl'], products: ['ZnCl2', 'H2'] }, headers);

  await request('POST', '/game/hydrogen-reactor/stage/3/submit', { h2: 2, o2: 1, h2o: 2 }, headers);

  await request('POST', '/game/hydrogen-reactor/stage/4/submit', { actions: ['Open Safety Outlet', 'Cool Reactor'] }, headers);

  const u4Final = await request('POST', '/game/hydrogen-reactor/final-submit', {
    temp: 75,
    pressure: 1.5,
    h2Flow: 50,
    o2Flow: 25,
    timeSpentSec: 230,
  }, headers);
  record('Unit 4: Full Playthrough & Completion', 200, u4Final.status, u4Final.body.data?.completed === true || u4Final.body.data?.correct === true);

  // UNIT 5: Element Sorting Factory
  const u5Start = await request('POST', '/game/metal-sorting/start', {}, headers);
  record('Unit 5: Session Start', 200, u5Start.status, u5Start.status === 200);
  const u5Stages = u5Start.body.data?.gameState?.stages || [];

  const u5Clues = u5Stages[0]?.clues;
  let u5Sym = 'Na';
  if (u5Clues?.group === 2) u5Sym = 'Ca';
  await request('POST', '/game/metal-sorting/stage/1/submit', { symbol: u5Sym }, headers);

  await request('POST', '/game/metal-sorting/stage/2/submit', { groupSorting: { Li: 1, Na: 1, Mg: 2, Ca: 2 }, periodOrder: ['Li', 'Na', 'K'] }, headers);

  await request('POST', '/game/metal-sorting/stage/3/submit', { flameMatches: { 'Crimson Red': 'Li', 'Yellow': 'Na', 'Lilac': 'K', 'Brick Red': 'Ca', 'Apple Green': 'Ba' } }, headers);

  await request('POST', '/game/metal-sorting/stage/4/submit', { group1: ['Li', 'Na', 'K'], group2: ['Mg', 'Ca', 'Ba'], reactivityMap: { Na: 'High', K: 'Very High', Mg: 'Low' } }, headers);

  const u5Final = await request('POST', '/game/metal-sorting/final-submit', {
    allocations: [
      { sample: 'Na', targetLine: 'GROUP_1' },
      { sample: 'Ca', targetLine: 'GROUP_2' },
      { sample: 'K', targetLine: 'GROUP_1' },
      { sample: 'Ba', targetLine: 'GROUP_2' },
    ],
    safetyConfirmed: true,
    timeSpentSec: 230,
  }, headers);
  record('Unit 5: Full Playthrough & Completion', 200, u5Final.status, u5Final.body.data?.completed === true || u5Final.body.data?.correct === true);

  // UNIT 6: Gas Chamber Simulator
  const u6Start = await request('POST', '/game/gas-simulator/start', {}, headers);
  record('Unit 6: Session Start', 200, u6Start.status, u6Start.status === 200);

  await request('POST', '/game/gas-simulator/stage/1/submit', { value: 244 }, headers);
  await request('POST', '/game/gas-simulator/stage/2/submit', { pressure: 4.0 }, headers);
  await request('POST', '/game/gas-simulator/stage/3/submit', { volume: 6.0 }, headers);
  await request('POST', '/game/gas-simulator/stage/4/submit', { volume: 10.0 }, headers);

  const u6Final = await request('POST', '/game/gas-simulator/final-submit', {
    pressure: 2.0,
    volume: 10.0,
    temp: 300,
    timeSpentSec: 200,
  }, headers);
  record('Unit 6: Full Playthrough & Completion', 200, u6Final.status, u6Final.body.data?.completed === true || u6Final.body.data?.correct === true);

  // --------------------------------------------------
  // 5. PROGRESS & REPEAT COMPLETION CHECKS
  // --------------------------------------------------
  console.log('\n--- 5. Progress & Transaction Security Checks ---');

  const progressRes = await request('GET', '/game/progress', null, headers);
  const progressData = progressRes.body.data;
  record('Progress: User Progress API', 200, progressRes.status, progressRes.status === 200 && progressData?.totalXP >= 0);

  // Repeat completion test (Verify no duplicate badge or infinite rewards exploit)
  const repStart = await request('POST', '/game/calculation-heist/start', {}, headers);
  const repStages = repStart.body.data?.gameState?.stages || [];
  const r1Given = repStages[0]?.givenMass || 36;
  const r1Molar = repStages[0]?.molarMass || 18;
  const r1S1Res = await request('POST', '/game/calculation-heist/stage/1/submit', { answer: r1Given / r1Molar }, headers);

  const r1Elem2 = repStages[1]?.elements;
  let r1S2Ans = 44;
  if (r1Elem2 && r1Elem2.length === 3) r1S2Ans = 100;
  const r1S2Res = await request('POST', '/game/calculation-heist/stage/2/submit', { answer: r1S2Ans }, headers);

  const r1Moles = repStages[2]?.givenMoles || 2;
  const r1S3Ans = r1Moles === 2 ? '1.204' : '1.807';
  const r1S3Res = await request('POST', '/game/calculation-heist/stage/3/submit', { answer: r1S3Ans }, headers);

  const r1Comp3 = repStages[3]?.composition;
  const r1S4Ans = r1Comp3 && r1Comp3.length === 3 ? 'CH2O' : 'CH2';
  const r1S4Res = await request('POST', '/game/calculation-heist/stage/4/submit', { answer: r1S4Ans }, headers);

  const repDigits = [
    r1S1Res.body.data?.codeDigit,
    r1S2Res.body.data?.codeDigit,
    r1S3Res.body.data?.codeDigit,
    r1S4Res.body.data?.codeDigit,
  ].filter((d) => d !== undefined && d !== null);

  const repeatU1 = await request('POST', '/game/calculation-heist/final-code', { code: repDigits.join(''), timeSpentSec: 100 }, headers);
  const isFirstCompletion = repeatU1.body.data?.completionRewards?.isFirstCompletion;
  record('Security: Repeat Completion Duplicate Badge Prevention', false, isFirstCompletion, isFirstCompletion === false);

  // --------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------
  console.log('\n==================================================');
  console.log('📊 MASTER E2E TEST SUMMARY RESULTS');
  console.log('==================================================');
  const total = report.length;
  const passed = report.filter((r) => r.status === 'PASS').length;
  const failed = total - passed;
  console.log(`TOTAL TESTS RUN: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
    process.exit(1);
  } else {
    console.log('✅ ALL MASTER E2E TESTS PASSED 100% SUCCESSFULLY!');
  }
}

runMasterE2ETests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
