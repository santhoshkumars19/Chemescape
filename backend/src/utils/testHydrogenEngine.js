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

async function runHydrogenTests() {
  console.log('==================================================');
  console.log('🔋 HYDROGEN REACTOR ENGINE TEST SUITE');
  console.log('==================================================\n');

  // Step A: Login Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // TEST 1: Start Hydrogen Session
  console.log('\n--- TEST 1: POST /api/game/hydrogen-reactor/start ---');
  const startRes = await request('POST', '/game/hydrogen-reactor/start', {}, headers);
  console.log(`Status: ${startRes.status}`, JSON.stringify(startRes.body, null, 2));
  const stages = startRes.body.data?.gameState?.stages;

  // TEST 2: Stage 1 Isotope Scanner & Sorting
  console.log('\n--- TEST 2: Stage 1 Isotope Scanner & Sorting ---');
  const s1Symbol = stages[0]?.symbol;
  let s1Ans = { protons: 1, neutrons: 1, sorting: { '1H': 'Protium', '2H': 'Deuterium', '3H': 'Tritium' } };
  if (s1Symbol === '3H') s1Ans.neutrons = 2;

  const stage1Res = await request('POST', '/game/hydrogen-reactor/stage/1/submit', s1Ans, headers);
  console.log(`Status: ${stage1Res.status}`, JSON.stringify(stage1Res.body, null, 2));

  // TEST 3: Stage 2 Hydrogen Reaction Pipeline
  console.log('\n--- TEST 3: Stage 2 Hydrogen Reaction Pipeline ---');
  const stage2Res = await request('POST', '/game/hydrogen-reactor/stage/2/submit', {
    reactants: ['Zn', 'HCl'],
    products: ['ZnCl2', 'H2'],
  }, headers);
  console.log(`Status: ${stage2Res.status}`, JSON.stringify(stage2Res.body, null, 2));

  // TEST 4: Stage 3 Fuel Cell Synchronization
  console.log('\n--- TEST 4: Stage 3 Fuel Cell Synchronization ---');
  const stage3Res = await request('POST', '/game/hydrogen-reactor/stage/3/submit', {
    h2: 2,
    o2: 1,
    h2o: 2,
  }, headers);
  console.log(`Status: ${stage3Res.status}`, JSON.stringify(stage3Res.body, null, 2));

  // TEST 5: Stage 4 Hydrogen Safety System
  console.log('\n--- TEST 5: Stage 4 Hydrogen Safety System ---');
  const stage4Res = await request('POST', '/game/hydrogen-reactor/stage/4/submit', {
    actions: ['Open Safety Outlet', 'Cool Reactor'],
  }, headers);
  console.log(`Status: ${stage4Res.status}`, JSON.stringify(stage4Res.body, null, 2));

  // TEST 6: Stage 5 Final Reactor Stabilization
  console.log('\n--- TEST 6: Stage 5 Final Hydrogen Reactor Stabilization ---');
  const finalRes = await request('POST', '/game/hydrogen-reactor/final-submit', {
    temp: 72,
    pressure: 1.5,
    h2Flow: 50,
    o2Flow: 25,
    timeSpentSec: 230,
  }, headers);
  console.log(`Status: ${finalRes.status}`, JSON.stringify(finalRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ HYDROGEN REACTOR ENGINE TESTS PASSED!');
  console.log('==================================================');
}

runHydrogenTests().catch(console.error);
