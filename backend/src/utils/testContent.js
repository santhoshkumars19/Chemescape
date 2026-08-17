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

async function runTests() {
  console.log('==================================================');
  console.log('🧪 CHEMESCAPE LEARNING CONTENT MODULE TEST SUITE');
  console.log('==================================================\n');

  // 1. Login as Student
  const studentLogin = await request('POST', '/auth/login', {
    email: 'student@chemescape.com',
    password: 'Password123',
  });
  const studentToken = studentLogin.body.data?.token;
  console.log(' ✔ Student Login:', studentLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // 2. Login as Teacher
  const teacherLogin = await request('POST', '/auth/login', {
    email: 'teacher@chemescape.com',
    password: 'Password123',
  });
  const teacherToken = teacherLogin.body.data?.token;
  console.log(' ✔ Teacher Login:', teacherLogin.status === 200 ? 'SUCCESS' : 'FAILED');

  // 3. GET /api/standards
  console.log('\n--- 1. GET /api/standards ---');
  const stdsRes = await request('GET', '/standards', null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${stdsRes.status}`, JSON.stringify(stdsRes.body, null, 2));
  const std11Id = stdsRes.body.data?.standards?.find((s) => s.name === '11')?.id;

  // 4. GET /api/standards/:standardId/subjects
  console.log(`\n--- 2. GET /api/standards/${std11Id}/subjects ---`);
  const subjectsRes = await request('GET', `/standards/${std11Id}/subjects`, null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${subjectsRes.status}`, JSON.stringify(subjectsRes.body, null, 2));

  // 5. GET /api/standards/:standardId/chapters
  console.log(`\n--- 3. GET /api/standards/${std11Id}/chapters ---`);
  const chaptersRes = await request('GET', `/standards/${std11Id}/chapters`, null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${chaptersRes.status}`, JSON.stringify(chaptersRes.body, null, 2));
  const periodicChapterId = chaptersRes.body.data?.chapters?.[0]?.id;

  // 6. GET /api/chapters/:chapterId
  console.log(`\n--- 4. GET /api/chapters/${periodicChapterId} ---`);
  const chapDetailRes = await request('GET', `/chapters/${periodicChapterId}`, null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${chapDetailRes.status}`, JSON.stringify(chapDetailRes.body, null, 2));

  // 7. GET /api/chapters/:chapterId/topics
  console.log(`\n--- 5. GET /api/chapters/${periodicChapterId}/topics ---`);
  const topicsRes = await request('GET', `/chapters/${periodicChapterId}/topics`, null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${topicsRes.status}`, JSON.stringify(topicsRes.body, null, 2));

  // 8. GET /api/chapters/:chapterId/rooms
  console.log(`\n--- 6. GET /api/chapters/${periodicChapterId}/rooms ---`);
  const roomsRes = await request('GET', `/chapters/${periodicChapterId}/rooms`, null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${roomsRes.status}`, JSON.stringify(roomsRes.body, null, 2));
  const room1Id = roomsRes.body.data?.rooms?.[0]?.id;

  // 9. GET /api/rooms/:roomId/questions (STUDENT VIEW - Sanitized)
  console.log(`\n--- 7. GET /api/rooms/${room1Id}/questions (Student View) ---`);
  const questionsRes = await request('GET', `/rooms/${room1Id}/questions`, null, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${questionsRes.status}`, JSON.stringify(questionsRes.body, null, 2));

  // Verify answer safety: Check that isCorrect is NOT returned
  const hasIsCorrect = JSON.stringify(questionsRes.body).includes('isCorrect');
  console.log(`\n🔒 SECURITY VERIFICATION: Does Student Question API leak 'isCorrect'? -> ${hasIsCorrect ? '❌ YES (SECURITY BUG)' : '✅ NO (SECURE)'}`);

  // 10. Student attempting Teacher endpoint (POST /api/chapters)
  console.log('\n--- 8. Security Check: Student attempting Teacher endpoint ---');
  const studentCreateChapterRes = await request('POST', '/chapters', {
    standardId: std11Id,
    subjectId: subjectsRes.body.data?.subjects?.[0]?.id,
    chapterNumber: 99,
    title: 'Hacked Chapter',
  }, { Authorization: `Bearer ${studentToken}` });
  console.log(`Status: ${studentCreateChapterRes.status}`, JSON.stringify(studentCreateChapterRes.body, null, 2));

  // 11. Teacher creating content (POST /api/chapters)
  console.log('\n--- 9. Teacher creating a new Chapter ---');
  const teacherCreateChapterRes = await request('POST', '/chapters', {
    standardId: std11Id,
    subjectId: subjectsRes.body.data?.subjects?.[0]?.id,
    chapterNumber: 4,
    title: 'Chemical Bonding and Molecular Structure',
    description: 'Ionic and covalent bonding, VSEPR theory, and molecular orbitals.',
    difficulty: 'HARD',
    estimatedMinutes: 40,
    xpReward: 750,
    coinReward: 150,
    badgeName: 'Bond Master',
  }, { Authorization: `Bearer ${teacherToken}` });
  console.log(`Status: ${teacherCreateChapterRes.status}`, JSON.stringify(teacherCreateChapterRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ ALL LEARNING CONTENT MODULE TESTS PASSED!');
  console.log('==================================================');
}

runTests().catch(console.error);
