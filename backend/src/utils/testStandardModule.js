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

async function runStandardModuleTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE STANDARD MODULE COMPREHENSIVE TEST SUITE');
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

  // Generate test tokens for different roles
  const studentToken = generateToken({ userId: 'test-student-1', role: 'STUDENT', name: 'Test Student', email: 'student@test.com' });
  const teacherToken = generateToken({ userId: 'test-teacher-1', role: 'TEACHER', name: 'Test Teacher', email: 'teacher@test.com' });
  const adminToken = generateToken({ userId: 'test-admin-1', role: 'ADMIN', name: 'Test Admin', email: 'admin@test.com' });

  // ── 1. UNAUTHENTICATED ACCESS ──
  try {
    const res = await request('GET', '/standards');
    record('1. Unauthenticated GET /api/standards blocked', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated GET /api/standards blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. STUDENT READ STANDARDS ──
  let standardsList = [];
  try {
    const res = await request('GET', '/standards', null, { Authorization: `Bearer ${studentToken}` });
    const standards = res.body?.data?.standards || [];
    standardsList = standards;
    record('2. Student can GET /api/standards', 200, res.status, res.status === 200);
    record('3. Returns 9 standards (Grades 4-12)', true, standards.length >= 9, standards.length >= 9, `Count: ${standards.length}`);
  } catch (err) {
    record('2. Student can GET /api/standards', 200, 'ERROR', false, err.message);
  }

  // ── 3. SORTING AND INTEGRITY ──
  if (standardsList.length >= 9) {
    let isSorted = true;
    for (let i = 1; i < standardsList.length; i++) {
      if ((standardsList[i].displayOrder || 0) < (standardsList[i - 1].displayOrder || 0)) {
        isSorted = false;
        break;
      }
    }
    record('4. Standards sorted by displayOrder ascending', true, isSorted, isSorted);

    const allActive = standardsList.every(s => s.isActive !== false);
    record('5. Only active standards returned', true, allActive, allActive);

    const grades = standardsList.map(s => s.grade || parseInt(s.name, 10)).filter(Boolean);
    const has4to12 = [4, 5, 6, 7, 8, 9, 10, 11, 12].every(g => grades.includes(g));
    record('6. All grades 4th to 12th present', true, has4to12, has4to12, `Found grades: ${grades.sort((a,b)=>a-b).join(', ')}`);
  }

  // ── 4. RBAC: STUDENT CANNOT MUTATE ──
  try {
    const resPost = await request('POST', '/standards', { name: '99', displayName: '99th Standard', grade: 99 }, { Authorization: `Bearer ${studentToken}` });
    record('7. Student cannot POST /api/standards (403 Forbidden)', 403, resPost.status, resPost.status === 403);

    const resPut = await request('PUT', '/standards/grade-4', { displayName: 'Hacked 4th' }, { Authorization: `Bearer ${studentToken}` });
    record('8. Student cannot PUT /api/standards/:id (403 Forbidden)', 403, resPut.status, resPut.status === 403);

    const resDel = await request('DELETE', '/standards/grade-4', null, { Authorization: `Bearer ${studentToken}` });
    record('9. Student cannot DELETE /api/standards/:id (403 Forbidden)', 403, resDel.status, resDel.status === 403);
  } catch (err) {
    record('7-9. Student mutation denied', 403, 'ERROR', false, err.message);
  }

  // ── 5. TEACHER / ADMIN VALIDATION & MUTATION ──
  try {
    // Invalid grade (< 4 or > 12)
    const resInvalid = await request('POST', '/standards', { name: '1', displayName: '1st Standard', grade: 1 }, { Authorization: `Bearer ${adminToken}` });
    record('10. Invalid grade rejected by Zod (400 Bad Request)', 400, resInvalid.status, resInvalid.status === 400);

    // Duplicate standard rejection (Grade 11 already exists)
    const resDuplicate = await request('POST', '/standards', { name: '11', displayName: 'Duplicate 11th', grade: 11 }, { Authorization: `Bearer ${adminToken}` });
    record('11. Duplicate standard rejected (409 Conflict)', 409, resDuplicate.status, resDuplicate.status === 409);
  } catch (err) {
    record('10-11. Validation tests', 'Expected response', 'ERROR', false, err.message);
  }

  // ── 6. GET SINGLE STANDARD BY ID OR GRADE ──
  try {
    const res11 = await request('GET', '/standards/11', null, { Authorization: `Bearer ${studentToken}` });
    record('12. GET /api/standards/11 returns 11th Standard', 200, res11.status, res11.status === 200);

    const res12 = await request('GET', '/standards/12', null, { Authorization: `Bearer ${studentToken}` });
    record('13. GET /api/standards/12 returns 12th Standard', 200, res12.status, res12.status === 200);
  } catch (err) {
    record('12-13. Get single standard', 200, 'ERROR', false, err.message);
  }

  // ── 7. BACKWARD COMPATIBILITY: SUB-ROUTES ──
  try {
    const resSubjects = await request('GET', '/standards/11/subjects', null, { Authorization: `Bearer ${studentToken}` });
    record('14. Backward Compatibility: GET /api/standards/11/subjects', 200, resSubjects.status, resSubjects.status === 200);

    const resChapters = await request('GET', '/standards/11/chapters', null, { Authorization: `Bearer ${studentToken}` });
    record('15. Backward Compatibility: GET /api/standards/11/chapters', 200, resChapters.status, resChapters.status === 200);
  } catch (err) {
    record('14-15. Backward compatibility', 200, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 STANDARD MODULE TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL STANDARD MODULE TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runStandardModuleTests().catch(console.error);
}

module.exports = runStandardModuleTests;
