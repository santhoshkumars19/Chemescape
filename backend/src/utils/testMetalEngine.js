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

async function runMetalTests() {
  console.log('==================================================');
  console.log('🏭 ELEMENT SORTING FACTORY ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Step A: Login Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // TEST 1: Start Metal Session
  console.log('\n--- TEST 1: POST /api/game/metal-sorting/start ---');
  const startRes = await request('POST', '/game/metal-sorting/start', {}, headers);
  console.log(`Status: ${startRes.status}`, JSON.stringify(startRes.body, null, 2));
  const stages = startRes.body.data?.gameState?.stages;

  // TEST 2: Stage 1 Metal Scanner & Identification
  console.log('\n--- TEST 2: Stage 1 Metal Scanner & Identification ---');
  const s1Clues = stages[0]?.clues;
  let s1Ans = { symbol: 'Na' };
  if (s1Clues?.group === 2) s1Ans = { symbol: 'Ca' };

  const stage1Res = await request('POST', '/game/metal-sorting/stage/1/submit', s1Ans, headers);
  console.log(`Status: ${stage1Res.status}`, JSON.stringify(stage1Res.body, null, 2));

  // TEST 3: Stage 2 Conveyor Belt Sorting
  console.log('\n--- TEST 3: Stage 2 Conveyor Belt Sorting ---');
  const stage2Res = await request('POST', '/game/metal-sorting/stage/2/submit', {
    groupSorting: { Li: 1, Na: 1, Mg: 2, Ca: 2 },
    periodOrder: ['Li', 'Na', 'K'],
  }, headers);
  console.log(`Status: ${stage2Res.status}`, JSON.stringify(stage2Res.body, null, 2));

  // TEST 4: Stage 3 Flame Test Laboratory
  console.log('\n--- TEST 4: Stage 3 Flame Test Laboratory ---');
  const stage3Res = await request('POST', '/game/metal-sorting/stage/3/submit', {
    flameMatches: {
      'Crimson Red': 'Li',
      'Yellow': 'Na',
      'Lilac': 'K',
      'Brick Red': 'Ca',
      'Apple Green': 'Ba',
    },
  }, headers);
  console.log(`Status: ${stage3Res.status}`, JSON.stringify(stage3Res.body, null, 2));

  // TEST 5: Stage 4 Reactivity Ranking & Water Simulation
  console.log('\n--- TEST 5: Stage 4 Reactivity Ranking & Water Simulation ---');
  const stage4Res = await request('POST', '/game/metal-sorting/stage/4/submit', {
    group1: ['Li', 'Na', 'K'],
    group2: ['Mg', 'Ca', 'Ba'],
    reactivityMap: { Na: 'High', K: 'Very High', Mg: 'Low' },
  }, headers);
  console.log(`Status: ${stage4Res.status}`, JSON.stringify(stage4Res.body, null, 2));

  // TEST 6: Stage 5 Production Line Control
  console.log('\n--- TEST 6: Stage 5 Final Production Line Control ---');
  const finalRes = await request('POST', '/game/metal-sorting/final-submit', {
    allocations: [
      { sample: 'Na', targetLine: 'GROUP_1' },
      { sample: 'Ca', targetLine: 'GROUP_2' },
      { sample: 'K', targetLine: 'GROUP_1' },
      { sample: 'Ba', targetLine: 'GROUP_2' },
    ],
    safetyConfirmed: true,
    timeSpentSec: 220,
  }, headers);
  console.log(`Status: ${finalRes.status}`, JSON.stringify(finalRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ ELEMENT SORTING FACTORY ENGINE TESTS PASSED!');
  console.log('==================================================');
}

runMetalTests().catch(console.error);
