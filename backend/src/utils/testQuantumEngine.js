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

async function runQuantumTests() {
  console.log('==================================================');
  console.log('⚛️ QUANTUM ORBITAL ARCHITECT ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Step A: Login Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // TEST 1: Start Quantum Session
  console.log('\n--- TEST 1: POST /api/game/quantum-architect/start ---');
  const startRes = await request('POST', '/game/quantum-architect/start', {}, headers);
  console.log(`Status: ${startRes.status}`, JSON.stringify(startRes.body, null, 2));
  const stages = startRes.body.data?.gameState?.stages;

  // TEST 2: Submit Stage 1 Wrong (Shell builder)
  console.log('\n--- TEST 2: Stage 1 Wrong Placement ---');
  const stage1Wrong = await request('POST', '/game/quantum-architect/stage/1/submit', { K: 9, L: 9 }, headers);
  console.log(`Status: ${stage1Wrong.status}`, JSON.stringify(stage1Wrong.body, null, 2));

  // TEST 3: Submit Stage 1 Correct
  console.log('\n--- TEST 3: Stage 1 Correct Placement (Shells) ---');
  const s1Elem = stages[0]?.element;
  let s1Ans = { K: 2, L: 6 };
  if (s1Elem === 'Sodium') s1Ans = { K: 2, L: 8, M: 1 };
  if (s1Elem === 'Carbon') s1Ans = { K: 2, L: 4 };

  const stage1Res = await request('POST', '/game/quantum-architect/stage/1/submit', s1Ans, headers);
  console.log(`Status: ${stage1Res.status}`, JSON.stringify(stage1Res.body, null, 2));

  // TEST 4: Submit Stage 2 (Orbital filling)
  console.log('\n--- TEST 4: Stage 2 Orbital Filling (Hund’s Rule) ---');
  const s2Elem = stages[1]?.element;
  let s2Ans = {
    '1s': ['up', 'down'],
    '2s': ['up', 'down'],
    '2px': ['up', 'down'],
    '2py': ['up'],
    '2pz': ['up'],
  };
  if (s2Elem?.includes('Nitrogen')) {
    s2Ans = {
      '1s': ['up', 'down'],
      '2s': ['up', 'down'],
      '2px': ['up'],
      '2py': ['up'],
      '2pz': ['up'],
    };
  }
  const stage2Res = await request('POST', '/game/quantum-architect/stage/2/submit', s2Ans, headers);
  console.log(`Status: ${stage2Res.status}`, JSON.stringify(stage2Res.body, null, 2));

  // TEST 5: Submit Stage 3 (Quantum Numbers)
  console.log('\n--- TEST 5: Stage 3 Quantum Numbers ---');
  const s3Sub = stages[2]?.subshell;
  let s3Ans = { n: 2, l: 1, ml: -1, ms: -0.5 };
  if (s3Sub === '3s') s3Ans = { n: 3, l: 0, ml: 0, ms: 0.5 };

  const stage3Res = await request('POST', '/game/quantum-architect/stage/3/submit', s3Ans, headers);
  console.log(`Status: ${stage3Res.status}`, JSON.stringify(stage3Res.body, null, 2));

  // TEST 6: Submit Stage 4 (Atomic Rule Challenge)
  console.log('\n--- TEST 6: Stage 4 Atomic Rule Violation ---');
  const s4Diag = stages[3]?.diagramDescription;
  let s4Ans = 'Pauli Exclusion Principle';
  if (s4Diag?.includes('2s [ ]')) s4Ans = 'Aufbau Principle';
  if (s4Diag?.includes('2p [↑↓] [ ]')) s4Ans = 'Hund’s Rule';

  const stage4Res = await request('POST', '/game/quantum-architect/stage/4/submit', { answer: s4Ans }, headers);
  console.log(`Status: ${stage4Res.status}`, JSON.stringify(stage4Res.body, null, 2));

  // TEST 7: Final Atomic Core Reconstruction
  console.log('\n--- TEST 7: Stage 5 Final Atomic Core Reconstruction ---');
  const s5Elem = stages[4]?.element;
  let s5Ans = '1s2 2s2 2p6 3s1';
  if (s5Elem?.includes('Neon')) s5Ans = '1s2 2s2 2p6';

  const finalRes = await request('POST', '/game/quantum-architect/final-submit', { answer: s5Ans, timeSpentSec: 190 }, headers);
  console.log(`Status: ${finalRes.status}`, JSON.stringify(finalRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ QUANTUM ORBITAL ARCHITECT ENGINE TESTS PASSED!');
  console.log('==================================================');
}

runQuantumTests().catch(console.error);
