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

async function runGasSimulatorE2ETests() {
  console.log('==================================================');
  console.log('🧪 UNIT 6: GAS CHAMBER SIMULATOR E2E TEST SUITE');
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

  // 1. Student Login/Authentication
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  record('1. Student Authentication', 200, studentLogin.status, studentLogin.status === 200 && !!token);

  // 21. Unauthorized Access Check
  const unauthAccess = await request('POST', '/game/gas-simulator/start');
  record('21. Unauthorized Access Blocked', 401, unauthAccess.status, unauthAccess.status === 401);

  // SECTION A: FULL CLEAN PLAYTHROUGH (SESSION A)
  console.log('\n--- Section A: Full Clean Playthrough ---');

  const startRes = await request('POST', '/game/gas-simulator/start', {}, headers);
  record('2. Start Gas Simulator Session', 200, startRes.status, startRes.status === 200 && startRes.body.data?.gameType === 'GAS_SIMULATOR');

  const sessionState = startRes.body.data?.gameState;
  const hasSecret = JSON.stringify(sessionState).includes('expectedValue') || JSON.stringify(sessionState).includes('expectedP');
  record('22. Answer Keys Sanitized from Payload', false, hasSecret, hasSecret === false);

  // Stage 1 Success
  const s1Success = await request('POST', '/game/gas-simulator/stage/1/submit', { value: 244 }, headers);
  record('3. Stage 1 Particle Kinetic Success', true, s1Success.body.data?.correct, s1Success.body.data?.correct === true && s1Success.body.data?.nextStage === 2);

  // Stage 2 Success
  const s2Success = await request('POST', '/game/gas-simulator/stage/2/submit', { pressure: 4.0 }, headers);
  record("5. Stage 2 Boyle's Law Success", true, s2Success.body.data?.correct, s2Success.body.data?.correct === true);

  // Stage 3 Success
  const s3Success = await request('POST', '/game/gas-simulator/stage/3/submit', { volume: 6.0 }, headers);
  record("7. Stage 3 Charles's Law Success", true, s3Success.body.data?.correct, s3Success.body.data?.correct === true);

  // Stage 4 Success
  const s4Success = await request('POST', '/game/gas-simulator/stage/4/submit', { volume: 10.0 }, headers);
  record('9. Stage 4 Combined Gas Reactor Success', true, s4Success.body.data?.correct, s4Success.body.data?.correct === true);

  // Final Chamber Success & Completion Rewards
  const finalSuccess = await request('POST', '/game/gas-simulator/final-submit', {
    pressure: 2.0,
    volume: 10.0,
    temp: 300,
    timeSpentSec: 200,
  }, headers);
  const finalData = finalSuccess.body.data || finalSuccess.body;
  record('11. Final Chamber Stabilization', true, finalData.correct, finalData.correct === true && finalData.completed === true);
  record('15. Correct Session Completion', true, finalData.completed, finalData.completed === true);

  const rewards = finalData.completionRewards || {};
  const isFirst = rewards.isFirstCompletion;
  record('16. Server-Calculated XP Reward', true, rewards.awardedXP > 0, rewards.awardedXP > 0);
  record('17. Server-Calculated Coins Reward', true, isFirst ? rewards.awardedCoins > 0 : rewards.awardedCoins === 0, isFirst ? rewards.awardedCoins > 0 : rewards.awardedCoins === 0);
  record('18. Server-Awarded Gas Controller Badge', true, isFirst ? !!rewards.badgeUnlocked : rewards.badgeUnlocked === null, isFirst ? !!rewards.badgeUnlocked : rewards.badgeUnlocked === null);

  // 19. Game Progress Saved
  const progressRes = await request('GET', '/game/progress', null, headers);
  record('19. Game Progress Saved to Database', 200, progressRes.status, progressRes.status === 200 && progressRes.body.data?.totalXP > 0);

  // SECTION B: REPEAT COMPLETION CHECK (SESSION B)
  console.log('\n--- Section B: Repeat Completion Check ---');
  await request('POST', '/game/gas-simulator/start', {}, headers);
  await request('POST', '/game/gas-simulator/stage/1/submit', { value: 244 }, headers);
  await request('POST', '/game/gas-simulator/stage/2/submit', { pressure: 4.0 }, headers);
  await request('POST', '/game/gas-simulator/stage/3/submit', { volume: 6.0 }, headers);
  await request('POST', '/game/gas-simulator/stage/4/submit', { volume: 10.0 }, headers);
  const repFinal = await request('POST', '/game/gas-simulator/final-submit', { pressure: 2.0, volume: 10.0, temp: 300, timeSpentSec: 150 }, headers);
  const isFirstComp = repFinal.body.data?.completionRewards?.isFirstCompletion;
  record('20. Duplicate Badge Prevention on Replay', false, isFirstComp, isFirstComp === false);

  // SECTION C: INCORRECT SUBMISSIONS & SECURITY CHECKS (SESSION C)
  console.log('\n--- Section C: Security & Validation Checks ---');
  await request('POST', '/game/gas-simulator/start', {}, headers);

  // Stage Skip Attempt
  const skipRes = await request('POST', '/game/gas-simulator/stage/4/submit', { volume: 10 }, headers);
  record('24. Stage Skip Attempt Blocked', 400, skipRes.status, skipRes.status === 400);

  // Client Payload Manipulation
  const cheatRes = await request('POST', '/game/gas-simulator/stage/1/submit', {
    value: 9999,
    correct: true,
    score: 999999,
    xp: 999999,
    coins: 999999,
    completed: true,
  }, headers);
  record('23. Client Reward Manipulation Ignored', false, cheatRes.body.data?.correct, cheatRes.body.data?.correct === false);
  record('14. Life Reduction on Wrong Answer', 2, cheatRes.body.data?.livesRemaining, cheatRes.body.data?.livesRemaining === 2);
  record('4. Stage 1 Failure Rejection', false, cheatRes.body.data?.correct, cheatRes.body.data?.correct === false);

  // Advance Stage 1
  await request('POST', '/game/gas-simulator/stage/1/submit', { value: 244 }, headers);

  // Stage 2 Wrong Answer
  const s2Wrong = await request('POST', '/game/gas-simulator/stage/2/submit', { pressure: 1.0 }, headers);
  record("6. Stage 2 Boyle's Law Wrong Answer", false, s2Wrong.body.data?.correct, s2Wrong.body.data?.correct === false);

  // Advance Stage 2
  await request('POST', '/game/gas-simulator/stage/2/submit', { pressure: 4.0 }, headers);

  // Stage 3 Wrong Answer
  const s3Wrong = await request('POST', '/game/gas-simulator/stage/3/submit', { volume: 2.0 }, headers);
  record("8. Stage 3 Charles's Law Wrong Answer", false, s3Wrong.body.data?.correct, s3Wrong.body.data?.correct === false);

  // Fresh active session for Stage 4 & Final Wrong State checks
  await request('POST', '/game/gas-simulator/start', {}, headers);
  await request('POST', '/game/gas-simulator/stage/1/submit', { value: 244 }, headers);
  await request('POST', '/game/gas-simulator/stage/2/submit', { pressure: 4.0 }, headers);
  await request('POST', '/game/gas-simulator/stage/3/submit', { volume: 6.0 }, headers);

  // Stage 4 Wrong Answer
  const s4Wrong = await request('POST', '/game/gas-simulator/stage/4/submit', { volume: 1.0 }, headers);
  record('10. Stage 4 Ideal Gas Wrong Answer', false, s4Wrong.body.data?.correct, s4Wrong.body.data?.correct === false);

  // Advance Stage 4
  await request('POST', '/game/gas-simulator/stage/4/submit', { volume: 10.0 }, headers);

  // Final Wrong State
  const finalWrong = await request('POST', '/game/gas-simulator/final-submit', { pressure: 99, volume: 99, temp: 99 }, headers);
  record('12. Wrong Final Chamber State Rejection', false, finalWrong.body.data?.correct, finalWrong.body.data?.correct === false);

  // SECTION D: LIFE DEPLETION SESSION FAILURE (SESSION D)
  console.log('\n--- Section D: Session Failure on Life Depletion ---');
  await request('POST', '/game/gas-simulator/final-submit', { pressure: 2.0, volume: 10.0, temp: 300, timeSpentSec: 10 }, headers);
  await request('POST', '/game/gas-simulator/start', {}, headers);
  await request('POST', '/game/gas-simulator/stage/1/submit', { value: 999 }, headers);
  await request('POST', '/game/gas-simulator/stage/1/submit', { value: 999 }, headers);
  const failSubmit = await request('POST', '/game/gas-simulator/stage/1/submit', { value: 999 }, headers);
  record('13. Session Failure on Depleted Lives', true, failSubmit.body.data?.failed, failSubmit.body.data?.failed === true);

  console.log('\n==================================================');
  console.log('📊 UNIT 6 TEST SUMMARY RESULTS');
  console.log('==================================================');
  const total = report.length;
  const passed = report.filter((r) => r.status === 'PASS').length;
  const failed = total - passed;
  console.log(`TOTAL TESTS RUN: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.error('❌ SOME UNIT 6 TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
    process.exit(1);
  } else {
    console.log('✅ ALL UNIT 6 GAS SIMULATOR E2E TESTS PASSED 100% SUCCESSFULLY!');
  }
}

runGasSimulatorE2ETests().catch((err) => {
  console.error('Fatal Gas Simulator Test Suite Error:', err);
  process.exit(1);
});
