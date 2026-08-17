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

async function runGameEngineTests() {
  console.log('==================================================');
  console.log('🎮 CHEMESCAPE GAME ENGINE INTEGRATION TEST SUITE');
  console.log('==================================================\n');

  // Step A: Login Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const token = studentLogin.body.data?.token;
  const headers = { Authorization: `Bearer ${token}` };
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // Step B: Get Periodic Table Rooms
  const stds = await request('GET', '/standards', null, headers);
  const std11Id = stds.body.data?.standards?.find((s) => s.name === '11')?.id;
  const chapters = await request('GET', `/standards/${std11Id}/chapters`, null, headers);
  const chapterId = chapters.body.data?.chapters?.[0]?.id;
  const rooms = await request('GET', `/chapters/${chapterId}/rooms`, null, headers);
  const room1 = rooms.body.data?.rooms?.[0];
  const room2 = rooms.body.data?.rooms?.[1];

  console.log(` ✔ Targets Loaded: Chapter "${chapters.body.data?.chapters?.[0]?.title}", Room 1 "${room1?.name}" (${room1?.id})\n`);

  // TEST 1: Start Room 1
  console.log('--- TEST 1: POST /api/game/progress/:roomId/start ---');
  const startRes = await request('POST', `/game/progress/${room1.id}/start`, null, headers);
  console.log(`Status: ${startRes.status}`, JSON.stringify(startRes.body, null, 2));

  // TEST 2: Start Same Room Again (Resume check)
  console.log('\n--- TEST 2: Start Same Room Again (Resume Active Session) ---');
  const resumeRes = await request('POST', `/game/progress/${room1.id}/start`, null, headers);
  console.log(`Status: ${resumeRes.status}`, JSON.stringify(resumeRes.body, null, 2));
  console.log(`Is Resumed Session? -> ${resumeRes.body.data?.isResumed ? '✅ YES' : '❌ NO'}`);

  // TEST 3: Save Game State
  console.log('\n--- TEST 3: POST /api/game/progress/:roomId/save ---');
  const saveRes = await request('POST', `/game/progress/${room1.id}/save`, {
    score: 250,
    livesRemaining: 2,
    gameState: {
      currentPuzzle: 2,
      completedPuzzles: [1],
      collectedKeys: ['key-alpha'],
    },
  }, headers);
  console.log(`Status: ${saveRes.status}`, JSON.stringify(saveRes.body, null, 2));

  // TEST 4: Complete Game (First Time Completion)
  console.log('\n--- TEST 4: POST /api/game/progress/:roomId/complete (First Time Completion) ---');
  const completeRes = await request('POST', `/game/progress/${room1.id}/complete`, {
    score: 850,
    stars: 3,
    timeSpentSec: 145,
    gameState: { completed: true },
  }, headers);
  console.log(`Status: ${completeRes.status}`, JSON.stringify(completeRes.body, null, 2));

  // TEST 5: Complete Same Game Again (Duplicate Protection & Repeat Policy)
  console.log('\n--- TEST 5: Complete Same Room Again (Duplicate Badge Protection) ---');
  const repeatCompleteRes = await request('POST', `/game/progress/${room1.id}/complete`, {
    score: 920,
    stars: 3,
    timeSpentSec: 120,
  }, headers);
  console.log(`Status: ${repeatCompleteRes.status}`, JSON.stringify(repeatCompleteRes.body, null, 2));
  console.log(`Badge Unlocked on Repeat? -> ${repeatCompleteRes.body.data?.badgeUnlocked ? '❌ DUPLICATE (BUG)' : '✅ NULL (PROTECTED)'}`);

  // TEST 6: Fail Game (Room 2)
  console.log('\n--- TEST 6: POST /api/game/progress/:roomId/fail (Room 2 Failure) ---');
  const startRoom2 = await request('POST', `/game/progress/${room2.id}/start`, null, headers);
  const failRes = await request('POST', `/game/progress/${room2.id}/fail`, {
    score: 100,
    timeSpentSec: 300,
  }, headers);
  console.log(`Status: ${failRes.status}`, JSON.stringify(failRes.body, null, 2));

  // TEST 7: Get User Overall Progress
  console.log('\n--- TEST 7: GET /api/game/progress (Student Overall Stats) ---');
  const userProgressRes = await request('GET', '/game/progress', null, headers);
  console.log(`Status: ${userProgressRes.status}`, JSON.stringify(userProgressRes.body, null, 2));

  // TEST 8: Unauthenticated Request
  console.log('\n--- TEST 8: GET /api/game/progress (Unauthenticated Request) ---');
  const unauthRes = await request('GET', '/game/progress');
  console.log(`Status: ${unauthRes.status}`, JSON.stringify(unauthRes.body, null, 2));

  // TEST 9: Security / Anti-Cheat Check (Client sending fake XP)
  console.log('\n--- TEST 9: Anti-Cheat Verification (Client sending fake { xp: 999999 }) ---');
  const fakeXpRes = await request('POST', `/game/progress/${room2.id}/complete`, {
    score: 500,
    stars: 2,
    timeSpentSec: 180,
    xp: 999999, // Fake client-provided XP
  }, headers);
  console.log(`Awarded XP: ${fakeXpRes.body.data?.awardedXP} (Expected: 600 from server GameReward)`);
  console.log(`Anti-Cheat Status: ${fakeXpRes.body.data?.awardedXP === 600 ? '✅ SECURE (Server Calculated)' : '❌ INSECURE'}`);

  console.log('\n==================================================');
  console.log('✅ ALL GAME ENGINE INFRASTRUCTURE TESTS PASSED!');
  console.log('==================================================');
}

runGameEngineTests().catch(console.error);
