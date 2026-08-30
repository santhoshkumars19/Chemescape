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

async function runSubjectModuleTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE SUBJECT MODULE COMPREHENSIVE TEST SUITE');
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
    const res = await request('GET', '/standards/4/subjects');
    record('1. Unauthenticated GET /api/standards/:id/subjects blocked', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated GET /api/standards/:id/subjects blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. STANDARD 4 SUBJECTS ──
  try {
    const res = await request('GET', '/standards/4/subjects', null, { Authorization: `Bearer ${studentToken}` });
    const subjects = res.body?.data?.subjects || [];
    const codes = subjects.map(s => s.code);
    const expectedG4 = ['TAMIL', 'ENG', 'MATH', 'SCI', 'SOCIAL'];
    const matches = expectedG4.every(c => codes.includes(c)) && subjects.length === 5;
    record('2. GET /api/standards/4/subjects returns 5 primary subjects', true, matches, matches, `Got: ${codes.join(', ')}`);

    const hasNoChemOrPhysics = !codes.includes('CHEM') && !codes.includes('PHY');
    record('3. Standard 4 does NOT contain Chemistry or Physics', true, hasNoChemOrPhysics, hasNoChemOrPhysics);
  } catch (err) {
    record('2-3. Standard 4 subjects', true, 'ERROR', false, err.message);
  }

  // ── 3. STANDARD 11 SUBJECTS (EXISTING CHEMISTRY PRESERVED) ──
  try {
    const res = await request('GET', '/standards/11/subjects', null, { Authorization: `Bearer ${studentToken}` });
    const subjects = res.body?.data?.subjects || [];
    const codes = subjects.map(s => s.code);
    const expectedG11 = ['PHY', 'CHEM', 'MATH', 'BIO', 'CS'];
    const matches = expectedG11.every(c => codes.includes(c)) && subjects.length === 5;
    record('4. GET /api/standards/11/subjects returns 5 senior secondary subjects', true, matches, matches, `Got: ${codes.join(', ')}`);

    const hasChem = codes.includes('CHEM');
    record('5. Standard 11 includes existing Chemistry (CHEM)', true, hasChem, hasChem);
  } catch (err) {
    record('4-5. Standard 11 subjects', true, 'ERROR', false, err.message);
  }

  // ── 4. STANDARD 12 SUBJECTS ──
  try {
    const res = await request('GET', '/standards/12/subjects', null, { Authorization: `Bearer ${studentToken}` });
    const subjects = res.body?.data?.subjects || [];
    const codes = subjects.map(s => s.code);
    const expectedG12 = ['PHY', 'CHEM', 'MATH', 'BIO', 'CS'];
    const matches = expectedG12.every(c => codes.includes(c)) && subjects.length === 5;
    record('6. GET /api/standards/12/subjects returns 5 senior secondary subjects', true, matches, matches, `Got: ${codes.join(', ')}`);
  } catch (err) {
    record('6. Standard 12 subjects', true, 'ERROR', false, err.message);
  }

  // ── 5. INVALID STANDARD REJECTION ──
  try {
    const res = await request('GET', '/standards/999/subjects', null, { Authorization: `Bearer ${studentToken}` });
    record('7. Invalid Standard returns 404 Not Found', 404, res.status, res.status === 404);
  } catch (err) {
    record('7. Invalid Standard rejection', 404, 'ERROR', false, err.message);
  }

  // ── 6. DETERMINISTIC SORTING ──
  try {
    const res = await request('GET', '/standards/4/subjects', null, { Authorization: `Bearer ${studentToken}` });
    const subjects = res.body?.data?.subjects || [];
    const names = subjects.map(s => s.name);
    // Should be in display order: Tamil, English, Mathematics, Science, Social Science
    const expectedNames = ['Tamil', 'English', 'Mathematics', 'Science', 'Social Science'];
    const isSorted = names.join(',') === expectedNames.join(',');
    record('8. Standard 4 subjects sorted by displayOrder', true, isSorted, isSorted, `Got: ${names.join(', ')}`);
  } catch (err) {
    record('8. Deterministic sorting', true, 'ERROR', false, err.message);
  }

  // ── 7. RBAC: STUDENT MUTATION DENIED ──
  try {
    const resPost = await request('POST', '/subjects', { name: 'Astrophysics', code: 'ASTRO' }, { Authorization: `Bearer ${studentToken}` });
    record('9. Student cannot POST /api/subjects (403 Forbidden)', 403, resPost.status, resPost.status === 403);

    const resMap = await request('POST', '/subjects/map', { standardId: 'grade-4', subjectId: 'subj-chem' }, { Authorization: `Bearer ${studentToken}` });
    record('10. Student cannot POST /api/subjects/map (403 Forbidden)', 403, resMap.status, resMap.status === 403);

    const resPut = await request('PUT', '/subjects/subj-chem', { name: 'Hacked Chem' }, { Authorization: `Bearer ${studentToken}` });
    record('11. Student cannot PUT /api/subjects/:id (403 Forbidden)', 403, resPut.status, resPut.status === 403);

    const resDel = await request('DELETE', '/subjects/subj-chem', null, { Authorization: `Bearer ${studentToken}` });
    record('12. Student cannot DELETE /api/subjects/:id (403 Forbidden)', 403, resDel.status, resDel.status === 403);
  } catch (err) {
    record('9-12. Student mutation denied', 403, 'ERROR', false, err.message);
  }

  // ── 8. TEACHER / ADMIN VALIDATION & CONFLICTS ──
  try {
    // Duplicate subject creation (CHEM already exists)
    const resDup = await request('POST', '/subjects', { name: 'Chemistry', code: 'CHEM' }, { Authorization: `Bearer ${adminToken}` });
    record('13. Duplicate subject code/name rejected (409 Conflict)', 409, resDup.status, resDup.status === 409);

    // Zod invalid payload (empty code)
    const resInvalid = await request('POST', '/subjects', { name: 'Invalid Subj', code: '' }, { Authorization: `Bearer ${adminToken}` });
    record('14. Invalid payload rejected by Zod (400 Bad Request)', 400, resInvalid.status, resInvalid.status === 400);
  } catch (err) {
    record('13-14. Teacher/Admin validation', 'Expected response', 'ERROR', false, err.message);
  }

  // ── 9. GENERIC GET /api/subjects LIST ──
  try {
    const resAll = await request('GET', '/subjects', null, { Authorization: `Bearer ${studentToken}` });
    const allSubjects = resAll.body?.data?.subjects || [];
    record('15. GET /api/subjects returns all active subject definitions', 200, resAll.status, resAll.status === 200 && allSubjects.length >= 9, `Total: ${allSubjects.length}`);
  } catch (err) {
    record('15. Generic subject list', 200, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 SUBJECT MODULE TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL SUBJECT MODULE TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runSubjectModuleTests().catch(console.error);
}

module.exports = runSubjectModuleTests;
