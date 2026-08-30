const http = require('http');
const { generateToken } = require('./jwt');

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

async function runRoomModuleTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE ROOM / MISSION MODULE COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  const report = [];
  const record = (testName, expected, actual, passed, details = '') => {
    report.push({
      testName,
      expected: String(expected),
      actual: String(actual),
      status: passed ? 'PASS' : 'FAIL',
      details,
    });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${testName} | Status: ${actual} (Expected: ${expected}) ${details ? `(${details})` : ''}`);
  };

  const studentToken = generateToken({ userId: 'test-student-1', role: 'STUDENT', name: 'Test Student', email: 'student@test.com' });
  const teacherToken = generateToken({ userId: 'test-teacher-1', role: 'TEACHER', name: 'Test Teacher', email: 'teacher@test.com' });
  const adminToken = generateToken({ userId: 'test-admin-1', role: 'ADMIN', name: 'Test Admin', email: 'admin@test.com' });

  // ── 1. UNAUTHENTICATED ACCESS ──
  try {
    const res = await request('GET', '/chapters/ch-3/rooms');
    record('1. Unauthenticated GET /api/chapters/:id/rooms blocked', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated GET /api/chapters/:id/rooms blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. GET 11TH CHEMISTRY CHAPTER 3 ROOMS (EXISTING PRESERVED) ──
  try {
    const res = await request('GET', '/chapters/ch-3/rooms', null, { Authorization: `Bearer ${studentToken}` });
    const rooms = res.body?.data?.rooms || [];
    const names = rooms.map(r => r.name);
    const has6 = rooms.length >= 6;
    record('2. GET 11th Chemistry rooms returns 6 mission rooms', true, has6, has6, `Count: ${rooms.length}`);

    // Check deterministic ordering
    let isSorted = true;
    for (let i = 1; i < rooms.length; i++) {
      if (rooms[i].roomNumber < rooms[i - 1].roomNumber) isSorted = false;
    }
    record('3. Rooms sorted deterministically by roomNumber', true, isSorted, isSorted);

    // Verify gameType and display names
    const hasGameTypes = rooms.every(r => r.gameType && r.gameTypeDisplayName);
    record('4. Rooms contain valid gameType and display information', true, hasGameTypes, hasGameTypes);
  } catch (err) {
    record('2-4. 11th Chemistry rooms', true, 'ERROR', false, err.message);
  }

  // ── 3. GET STANDARD 4 MATH CHAPTER 2 ROOMS ──
  try {
    const res = await request('GET', '/chapters/ch-math4-2/rooms', null, { Authorization: `Bearer ${studentToken}` });
    const rooms = res.body?.data?.rooms || [];
    const hasBakery = rooms.some(r => r.name === 'Fraction Bakery');
    record('5. GET Standard 4 Math Ch 2 rooms returns Fraction Bakery', true, hasBakery, hasBakery);
  } catch (err) {
    record('5. Standard 4 Math rooms', true, 'ERROR', false, err.message);
  }

  // ── 4. EMPTY ROOM LIST SUPPORT ──
  try {
    const res = await request('GET', '/chapters/ch-math4-1/rooms', null, { Authorization: `Bearer ${studentToken}` });
    record('6. Chapter with no rooms returns 200 OK and empty array', 200, res.status, res.status === 200 && Array.isArray(res.body?.data?.rooms));
  } catch (err) {
    record('6. Empty room list', 200, 'ERROR', false, err.message);
  }

  // ── 5. INVALID CHAPTER REJECTION ──
  try {
    const res = await request('GET', '/chapters/nonexistent-chap-999/rooms', null, { Authorization: `Bearer ${studentToken}` });
    record('7. Nonexistent chapter returns 404 Not Found', 404, res.status, res.status === 404);
  } catch (err) {
    record('7. Invalid chapter rejection', 404, 'ERROR', false, err.message);
  }

  // ── 6. GET ROOM BY ID & CONTEXT VALIDATION ──
  try {
    const res = await request('GET', '/rooms/room-1', null, { Authorization: `Bearer ${studentToken}` });
    record('8. GET /api/rooms/:id returns room details', 200, res.status, res.status === 200);

    // Mismatched context (asking for Chemistry room-1 under Math chapter ch-math4-2)
    const resMismatch = await request('GET', '/rooms/room-1?chapterId=ch-math4-2', null, { Authorization: `Bearer ${studentToken}` });
    record('9. Context mismatch rejected (400 Bad Request)', 400, resMismatch.status, resMismatch.status === 400);
  } catch (err) {
    record('8-9. Room by ID and context validation', 'Expected response', 'ERROR', false, err.message);
  }

  // ── 7. STUDENT ANSWER SECURITY (SANITIZATION) ──
  try {
    const res = await request('GET', '/rooms/room-1', null, { Authorization: `Bearer ${studentToken}` });
    const config = res.body?.data?.room?.gameConfig || {};
    const hasNoSecretAnswers =
      config.solutionKey === undefined &&
      config.expectedConfiguration === undefined &&
      config.correctMapping === undefined &&
      config.correctOrder === undefined;
    record('10. Student room response sanitizes answer keys and secrets', true, hasNoSecretAnswers, hasNoSecretAnswers);
  } catch (err) {
    record('10. Student answer security', true, 'ERROR', false, err.message);
  }

  // ── 8. RBAC: STUDENT MUTATION DENIED ──
  try {
    const resPost = await request('POST', '/rooms', { chapterId: 'ch-3', name: 'Hacked Room', roomNumber: 99 }, { Authorization: `Bearer ${studentToken}` });
    record('11. Student cannot POST /api/rooms (403 Forbidden)', 403, resPost.status, resPost.status === 403);

    const resPut = await request('PUT', '/rooms/room-1', { name: 'Hacked Room 1' }, { Authorization: `Bearer ${studentToken}` });
    record('12. Student cannot PUT /api/rooms/:id (403 Forbidden)', 403, resPut.status, resPut.status === 403);

    const resDel = await request('DELETE', '/rooms/room-1', null, { Authorization: `Bearer ${studentToken}` });
    record('13. Student cannot DELETE /api/rooms/:id (403 Forbidden)', 403, resDel.status, resDel.status === 403);
  } catch (err) {
    record('11-13. Student mutation denied', 403, 'ERROR', false, err.message);
  }

  // ── 9. TEACHER VALIDATION: DUPLICATE ROOM NUMBER REJECTED WITHIN SAME CHAPTER ──
  try {
    const resDup = await request(
      'POST',
      '/rooms',
      { chapterId: 'ch-3', name: 'Duplicate Room 1', roomNumber: 1, gameType: 'GRID_RECONSTRUCTION' },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('14. Duplicate room number within same chapter rejected (409 Conflict)', 409, resDup.status, resDup.status === 409);
  } catch (err) {
    record('14. Duplicate room number rejection', 409, 'ERROR', false, err.message);
  }

  // ── 10. TEACHER VALIDATION: INVALID CHAPTER ID REJECTED ──
  try {
    const resInvalidChap = await request(
      'POST',
      '/rooms',
      { chapterId: 'nonexistent-chap-xyz', name: 'Orphan Room', roomNumber: 1 },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('15. Nonexistent chapter creation rejected (404 Not Found)', 404, resInvalidChap.status, resInvalidChap.status === 404);
  } catch (err) {
    record('15. Invalid chapter creation rejection', 404, 'ERROR', false, err.message);
  }

  // ── 11. TEACHER UPDATE & SAFE ARCHIVE ──
  try {
    const resUpdate = await request(
      'PUT',
      '/rooms/room-1',
      { description: 'Updated mission description', xpReward: 150 },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('16. Teacher can update room (200 OK)', 200, resUpdate.status, resUpdate.status === 200);

    const resArchive = await request(
      'DELETE',
      '/rooms/room-1',
      null,
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('17. Teacher can safely archive room (200 OK)', 200, resArchive.status, resArchive.status === 200);
  } catch (err) {
    record('16-17. Teacher update and archive', 200, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 ROOM / MISSION MODULE TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL ROOM / MISSION MODULE TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runRoomModuleTests().catch(console.error);
}

module.exports = runRoomModuleTests;
