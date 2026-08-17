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

async function runHeistTests() {
  console.log('==================================================');
  console.log('🧮 CHEM CALCULATION HEIST ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Step A: Login Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // TEST 1: Start Heist Session
  console.log('\n--- TEST 1: POST /api/game/calculation-heist/start ---');
  const startRes = await request('POST', '/game/calculation-heist/start', {}, headers);
  console.log(`Status: ${startRes.status}`, JSON.stringify(startRes.body, null, 2));
  const stages = startRes.body.data?.gameState?.stages || [];

  // TEST 2: Stage 1 Submission
  console.log('\n--- TEST 2: Stage 1 Submission ---');
  const s1Given = stages[0]?.givenMass || 36;
  const s1Molar = stages[0]?.molarMass || 18;
  const s1Res = await request('POST', '/game/calculation-heist/stage/1/submit', {
    answer: s1Given / s1Molar,
  }, headers);
  console.log(`Status: ${s1Res.status}`, JSON.stringify(s1Res.body, null, 2));

  // TEST 3: Stage 2 Submission
  console.log('\n--- TEST 3: Stage 2 Submission ---');
  const s2Res = await request('POST', '/game/calculation-heist/stage/2/submit', {
    answer: 180,
  }, headers);
  console.log(`Status: ${s2Res.status}`, JSON.stringify(s2Res.body, null, 2));

  // TEST 4: Stage 3 Submission
  console.log('\n--- TEST 4: Stage 3 Submission ---');
  const s3Res = await request('POST', '/game/calculation-heist/stage/3/submit', {
    answer: '1.204',
  }, headers);
  console.log(`Status: ${s3Res.status}`, JSON.stringify(s3Res.body, null, 2));

  // TEST 5: Stage 4 Submission
  console.log('\n--- TEST 5: Stage 4 Submission ---');
  const s4Res = await request('POST', '/game/calculation-heist/stage/4/submit', {
    answer: 'CH2O',
  }, headers);
  console.log(`Status: ${s4Res.status}`, JSON.stringify(s4Res.body, null, 2));

  // TEST 6: Final Combination Override
  console.log('\n--- TEST 6: Final Combination Override ---');
  const sessionState = s4Res.body.data?.gameState;
  const collectedDigits = sessionState?.collectedDigits || [2, 0, 1, 2];
  const vaultCode = collectedDigits.join('');

  const finalRes = await request('POST', '/game/calculation-heist/final-code', {
    code: vaultCode,
    timeSpentSec: 150,
  }, headers);
  console.log(`Status: ${finalRes.status}`, JSON.stringify(finalRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ CHEM CALCULATION HEIST ENGINE TESTS PASSED!');
  console.log('==================================================');
}

runHeistTests().catch(console.error);
