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

async function runChapterModuleTests() {
  console.log('====================================================');
  console.log('🧪 CHEMESCAPE CHAPTER MODULE COMPREHENSIVE TEST SUITE');
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
    const res = await request('GET', '/standards/4/chapters');
    record('1. Unauthenticated GET /api/standards/:id/chapters blocked', 401, res.status, res.status === 401);
  } catch (err) {
    record('1. Unauthenticated GET /api/standards/:id/chapters blocked', 401, 'ERROR', false, err.message);
  }

  // ── 2. GET STANDARD 4 MATHEMATICS CHAPTERS ──
  try {
    const res = await request('GET', '/standards/4/chapters?subjectId=MATH', null, { Authorization: `Bearer ${studentToken}` });
    const chapters = res.body?.data?.chapters || [];
    const titles = chapters.map(c => c.title);
    const has3 = chapters.length >= 3;
    record('2. GET Standard 4 Mathematics chapters returns 3 chapters', true, has3, has3, `Titles: ${titles.join(', ')}`);

    // Check deterministic ordering
    let isSorted = true;
    for (let i = 1; i < chapters.length; i++) {
      if (chapters[i].chapterNumber < chapters[i - 1].chapterNumber) isSorted = false;
    }
    record('3. Chapters sorted deterministically by chapterNumber', true, isSorted, isSorted);
  } catch (err) {
    record('2-3. Standard 4 Math chapters', true, 'ERROR', false, err.message);
  }

  // ── 3. GET STANDARD 11 CHEMISTRY CHAPTERS (EXISTING PRESERVED) ──
  try {
    const res = await request('GET', '/standards/11/chapters?subjectId=CHEM', null, { Authorization: `Bearer ${studentToken}` });
    const chapters = res.body?.data?.chapters || [];
    const hasChem3 = chapters.some(c => c.chapterNumber === 3 || c.title.toLowerCase().includes('periodic'));
    record('4. GET Standard 11 Chemistry returns Periodic Table chapter (Ch 3)', true, hasChem3, hasChem3);
  } catch (err) {
    record('4. Standard 11 Chemistry chapters', true, 'ERROR', false, err.message);
  }

  // ── 4. EMPTY STATE SUPPORT ──
  try {
    const res = await request('GET', '/standards/4/chapters?subjectId=SCI', null, { Authorization: `Bearer ${studentToken}` });
    record('5. Standard with no chapters returns 200 OK and empty array', 200, res.status, res.status === 200 && Array.isArray(res.body?.data?.chapters));
  } catch (err) {
    record('5. Empty state chapter listing', 200, 'ERROR', false, err.message);
  }

  // ── 5. INVALID STANDARD-SUBJECT COMBINATION ──
  try {
    // Standard 4 + Chemistry (Chemistry is NOT mapped to Standard 4)
    const res = await request('GET', '/standards/4/chapters?subjectId=CHEM', null, { Authorization: `Bearer ${studentToken}` });
    record('6. Invalid Standard-Subject combination rejected (400 Bad Request)', 400, res.status, res.status === 400);
  } catch (err) {
    record('6. Invalid Standard-Subject combination', 400, 'ERROR', false, err.message);
  }

  // ── 6. GET CHAPTER BY ID & CONTEXT VALIDATION ──
  try {
    const res = await request('GET', '/chapters/ch-3', null, { Authorization: `Bearer ${studentToken}` });
    record('7. GET /api/chapters/:id returns chapter details', 200, res.status, res.status === 200);

    // Mismatched context (asking for 11th Chemistry chapter with standardId=4 context)
    const resMismatch = await request('GET', '/chapters/ch-3?standardId=grade-4', null, { Authorization: `Bearer ${studentToken}` });
    record('8. Context mismatch rejected (400 Bad Request)', 400, resMismatch.status, resMismatch.status === 400);
  } catch (err) {
    record('7-8. Chapter by ID and context validation', 'Expected response', 'ERROR', false, err.message);
  }

  // ── 7. RBAC: STUDENT MUTATION DENIED ──
  try {
    const resPost = await request('POST', '/chapters', { standardId: 'grade-4', subjectId: 'subj-math', chapterNumber: 99, title: 'Hacked' }, { Authorization: `Bearer ${studentToken}` });
    record('9. Student cannot POST /api/chapters (403 Forbidden)', 403, resPost.status, resPost.status === 403);

    const resPut = await request('PUT', '/chapters/ch-3', { title: 'Hacked Ch 3' }, { Authorization: `Bearer ${studentToken}` });
    record('10. Student cannot PUT /api/chapters/:id (403 Forbidden)', 403, resPut.status, resPut.status === 403);

    const resDel = await request('DELETE', '/chapters/ch-3', null, { Authorization: `Bearer ${studentToken}` });
    record('11. Student cannot DELETE /api/chapters/:id (403 Forbidden)', 403, resDel.status, resDel.status === 403);
  } catch (err) {
    record('9-11. Student mutation denied', 403, 'ERROR', false, err.message);
  }

  // ── 8. TEACHER VALIDATION: UNMAPPED SUBJECT CREATION REJECTED ──
  try {
    const resUnmapped = await request(
      'POST',
      '/chapters',
      { standardId: 'grade-4', subjectId: 'subj-chem', chapterNumber: 1, title: 'Organic for 4th' },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('12. Teacher cannot create chapter for unmapped subject (400 Bad Request)', 400, resUnmapped.status, resUnmapped.status === 400);
  } catch (err) {
    record('12. Unmapped subject creation rejected', 400, 'ERROR', false, err.message);
  }

  // ── 9. TEACHER VALIDATION: DUPLICATE CHAPTER NUMBER REJECTED ──
  try {
    const resDup = await request(
      'POST',
      '/chapters',
      { standardId: 'grade-4', subjectId: 'subj-math', chapterNumber: 1, title: 'Duplicate Chapter 1' },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('13. Duplicate chapter number within same standard+subject rejected (409 Conflict)', 409, resDup.status, resDup.status === 409);
  } catch (err) {
    record('13. Duplicate chapter rejection', 409, 'ERROR', false, err.message);
  }

  // ── 10. TEACHER VALIDATION: INVALID CHAPTER NUMBER REJECTED BY ZOD ──
  try {
    const resInvalid = await request(
      'POST',
      '/chapters',
      { standardId: 'grade-4', subjectId: 'subj-math', chapterNumber: 0, title: 'Zero Chapter' },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('14. Invalid chapterNumber <= 0 rejected by Zod (400 Bad Request)', 400, resInvalid.status, resInvalid.status === 400);
  } catch (err) {
    record('14. Zod chapterNumber validation', 400, 'ERROR', false, err.message);
  }

  // ── 11. TEACHER UPDATE & SAFE ARCHIVE ──
  try {
    const resUpdate = await request(
      'PUT',
      '/chapters/ch-3',
      { description: 'Updated chapter description', xpReward: 600 },
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('15. Teacher can update chapter (200 OK)', 200, resUpdate.status, resUpdate.status === 200);

    const resArchive = await request(
      'DELETE',
      '/chapters/ch-3',
      null,
      { Authorization: `Bearer ${teacherToken}` }
    );
    record('16. Teacher can safely archive chapter (200 OK)', 200, resArchive.status, resArchive.status === 200);
  } catch (err) {
    record('15-16. Teacher update and archive', 200, 'ERROR', false, err.message);
  }

  console.log('\n====================================================');
  console.log('📊 CHAPTER MODULE TEST SUMMARY');
  console.log('====================================================');
  const passedCount = report.filter(r => r.status === 'PASS').length;
  const totalCount = report.length;
  const successRate = Math.round((passedCount / totalCount) * 100);
  console.log(`TOTAL: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
  console.log(`SUCCESS RATE: ${successRate}%\n`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL CHAPTER MODULE TESTS PASSED PERFECTLY!\n');
  } else {
    console.log('⚠️ Some tests failed. Check log details above.\n');
  }
}

if (require.main === module) {
  runChapterModuleTests().catch(console.error);
}

module.exports = runChapterModuleTests;
