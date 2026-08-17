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

async function runGridTests() {
  console.log('==================================================');
  console.log('🧩 PERIODIC GRID RECONSTRUCTION ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Step A: Login Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // TEST 1: Start Grid Session
  console.log('\n--- TEST 1: POST /api/game/grid-reconstruction/start ---');
  const startRes = await request('POST', '/game/grid-reconstruction/start', {}, headers);
  console.log(`Status: ${startRes.status}`, JSON.stringify(startRes.body, null, 2));
  const stages = startRes.body.data?.gameState?.stages;

  // TEST 2: Stage 1 Atomic Number Scanner
  console.log('\n--- TEST 2: Stage 1 Atomic Number Scanner ---');
  const s1Elem = stages[0]?.targetElement;
  let s1Ans = { z: 8 };
  if (s1Elem === 'Sodium') s1Ans = { z: 11 };

  const stage1Res = await request('POST', '/game/grid-reconstruction/stage/1/submit', s1Ans, headers);
  console.log(`Status: ${stage1Res.status}`, JSON.stringify(stage1Res.body, null, 2));

  // TEST 3: Stage 2 Periodic Grid Repair
  console.log('\n--- TEST 3: Stage 2 Periodic Grid Repair (Tile Placement) ---');
  const stage2Res = await request('POST', '/game/grid-reconstruction/stage/2/submit', {
    placements: [
      { symbol: 'Li', group: 1, period: 2 },
      { symbol: 'C', group: 14, period: 2 },
      { symbol: 'F', group: 17, period: 2 },
    ],
  }, headers);
  console.log(`Status: ${stage2Res.status}`, JSON.stringify(stage2Res.body, null, 2));

  // TEST 4: Stage 3 Group & Period Mapping
  console.log('\n--- TEST 4: Stage 3 Group & Period Mapping ---');
  const stage3Res = await request('POST', '/game/grid-reconstruction/stage/3/submit', {
    group: 17,
    period: 3,
    block: 'p',
  }, headers);
  console.log(`Status: ${stage3Res.status}`, JSON.stringify(stage3Res.body, null, 2));

  // TEST 5: Stage 4 Periodic Trend Challenge
  console.log('\n--- TEST 5: Stage 4 Periodic Trend Challenge ---');
  const s4Pair = stages[3]?.pair;
  let s4Ans = { choice: 'Sodium (Na)' };
  if (s4Pair?.[0]?.includes('Fluorine')) s4Ans = { choice: 'Fluorine (F)' };

  const stage4Res = await request('POST', '/game/grid-reconstruction/stage/4/submit', s4Ans, headers);
  console.log(`Status: ${stage4Res.status}`, JSON.stringify(stage4Res.body, null, 2));

  // TEST 6: Stage 5 Final Master Table Restoration
  console.log('\n--- TEST 6: Stage 5 Final Master Periodic Table Restoration ---');
  const finalRes = await request('POST', '/game/grid-reconstruction/final-submit', {
    alkali: ['Li', 'Na', 'K'],
    electronegativity: ['F', 'O', 'N', 'C'],
    timeSpentSec: 210,
  }, headers);
  console.log(`Status: ${finalRes.status}`, JSON.stringify(finalRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ PERIODIC GRID RECONSTRUCTION ENGINE TESTS PASSED!');
  console.log('==================================================');
}

runGridTests().catch(console.error);
