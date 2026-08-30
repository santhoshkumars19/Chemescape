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

async function runTopicModuleTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE TOPIC MODULE COMPREHENSIVE TEST SUITE');
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
    const res = await request('GET', '/chapters/ch-3/topics');
    record('1. Unauthenticated GET /api/chapters/:id/topics blocked', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated GET /api/chapters/:id/topics blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. GET 11TH CHEMISTRY CHAPTER 3 TOPICS (EXISTING PRESERVED) ──
  try {
    const res = await request('GET', '/chapters/ch-3/topics', null, { Authorization: `Bearer ${studentToken}` });
    const topics = res.body?.data?.topics || [];
    const titles = topics.map(t => t.title);
    const has6 = topics.length >= 6;
    record('2. GET 11th Chemistry topics returns 6 core topics', true, has6, has6, `Count: ${topics.length}`);

    // Check deterministic ordering
    let isSorted = true;
    for (let i = 1; i < topics.length; i++) {
      if (topics[i].orderNumber < topics[i - 1].orderNumber) isSorted = false;
    }
    record('3. Topics sorted deterministically by orderNumber', true, isSorted, isSorted);
  } catch (err) {
    record('2-3. 11th Chemistry topics', true, 'ERROR', false, err.message);
  }

  // ── 3. GET STANDARD 4 MATH CHAPTER 2 TOPICS ──
  try {
    const res = await request('GET', '/chapters/ch-math4-2/topics', null, { Authorization: `Bearer ${studentToken}` });
    const topics = res.body?.data?.topics || [];
    const titles = topics.map(t => t.title);
    const has3 = topics.length >= 3;
    record('4. GET Standard 4 Math Ch 2 topics returns 3 topics', true, has3, has3, `Titles: ${titles.join(', ')}`);
  } catch (err) {
    record('4. Standard 4 Math topics', true, 'ERROR', false, err.message);
  }

  // ── 4. EMPTY TOPIC LIST SUPPORT ──
  try {
    const res = await request('GET', '/chapters/ch-math4-1/topics', null, { Authorization: `Bearer ${studentToken}` });
    record('5. Chapter with no topics returns 200 OK and empty array', 200, res.status, res.status === 200 && Array.isArray(res.body?.data?.topics));
  } catch (err) {
    record('5. Empty topic list', 200, 'ERROR', false, err.message);
  }

  // ── 5. INVALID CHAPTER REJECTION ──
  try {
    const res = await request('GET', '/chapters/nonexistent-chap-999/topics', null, { Authorization: `Bearer ${studentToken}` });
    record('6. Nonexistent chapter returns 404 Not Found', 404, res.status, res.status === 404);
  } catch (err) {
    record('6. Invalid chapter rejection', 404, 'ERROR', false, err.message);
  }

  // ── 6. GET TOPIC BY ID & CONTEXT VALIDATION ──
  try {
    const res = await request('GET', '/topics/topic-1', null, { Authorization: `Bearer ${studentToken}` });
    record('7. GET /api/topics/:id returns topic details', 200, res.status, res.status === 200);

    // Mismatched context (asking for Chemistry topic-1 under Math chapter ch-math4-2)
    const resMismatch = await request('GET', '/topics/topic-1?chapterId=ch-math4-2', null, { Authorization: `Bearer ${studentToken}` });
    record('8. Context mismatch rejected (400 Bad Request)', 400, resMismatch.status, resMismatch.status === 400);
  } catch (err) {
    record('7-8. Topic by ID and context validation', 'Expected response', 'ERROR', false, err.message);
  }

  // ── 7. RBAC: STUDENT MUTATION DENIED ──
  try {
    const resPost = await request('POST', '/topics', { chapterId: 'ch-3', title: 'Hacked Topic', orderNumber: 99 }, { Authorization: `Bearer ${studentToken}` });
    record('9. Student cannot POST /api/topics (403 Forbidden)', 403, resPost.status, resPost.status === 403);

    const resPut = await request('PUT', '/topics/topic-1', { title: 'Hacked Topic 1' }, { Authorization: `Bearer ${studentToken}` });
    record('10. Student cannot PUT /api/topics/:id (403 Forbidden)', 403, resPut.status, resPut.status === 403);

    const resDel = await request('DELETE', '/topics/topic-1', null, { Authorization: `Bearer ${studentToken}` });
    record('11. Student cannot DELETE /api/topics/:id (403 Forbidden)', 403, resDel.status, resDel.status === 403);
  } catch (err) {
    record('9-11. Student mutation denied', 403, 'ERROR', false, err.message);
  }

  // ── 8. TEACHER VALIDATION: DUPLICATE ORDER REJECTED WITHIN SAME CHAPTER ──
  try {
    const resDup = await request(
      'POST',
      '/topics',
      { chapterId: 'ch-3', title: 'Duplicate Order 1', orderNumber: 1 },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('12. Duplicate topic order within same chapter rejected (409 Conflict)', 409, resDup.status, resDup.status === 409);
  } catch (err) {
    record('12. Duplicate order rejection', 409, 'ERROR', false, err.message);
  }

  // ── 9. TEACHER VALIDATION: INVALID CHAPTER ID REJECTED ──
  try {
    const resInvalidChap = await request(
      'POST',
      '/topics',
      { chapterId: 'nonexistent-chap-xyz', title: 'Orphan Topic', orderNumber: 1 },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('13. Nonexistent chapter creation rejected (404 Not Found)', 404, resInvalidChap.status, resInvalidChap.status === 404);
  } catch (err) {
    record('13. Invalid chapter creation rejection', 404, 'ERROR', false, err.message);
  }

  // ── 10. TEACHER UPDATE & SAFE ARCHIVE ──
  try {
    const resUpdate = await request(
      'PUT',
      '/topics/topic-1',
      { description: 'Updated topic description' },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('14. Teacher can update topic (200 OK)', 200, resUpdate.status, resUpdate.status === 200);

    const resArchive = await request(
      'DELETE',
      '/topics/topic-1',
      null,
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('15. Teacher can safely archive topic (200 OK)', 200, resArchive.status, resArchive.status === 200);
  } catch (err) {
    record('14-15. Teacher update and archive', 200, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 TOPIC MODULE TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL TOPIC MODULE TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runTopicModuleTests().catch(console.error);
}

module.exports = runTopicModuleTests;
