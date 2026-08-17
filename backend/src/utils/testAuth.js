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
  console.log('🧪 CHEMESCAPE AUTHENTICATION TEST SUITE');
  console.log('==================================================\n');

  // Test 1: Register New Student
  console.log('TEST 1: POST /api/auth/register (New Student)');
  const email = `student_${Date.now()}@test.com`;
  const regRes = await request('POST', '/auth/register', {
    name: 'Santhosh Kumar',
    email,
    password: 'Password123',
  });
  console.log(`Status: ${regRes.status}`, JSON.stringify(regRes.body, null, 2));

  // Test 2: Login
  console.log('\nTEST 2: POST /api/auth/login (Correct Credentials)');
  const loginRes = await request('POST', '/auth/login', {
    email,
    password: 'Password123',
  });
  console.log(`Status: ${loginRes.status}`, JSON.stringify(loginRes.body, null, 2));
  const token = loginRes.body.data?.token;

  // Test 3: GET /api/auth/me (Authenticated)
  console.log('\nTEST 3: GET /api/auth/me (With Bearer Token)');
  const meRes = await request('GET', '/auth/me', null, { Authorization: `Bearer ${token}` });
  console.log(`Status: ${meRes.status}`, JSON.stringify(meRes.body, null, 2));

  // Test 4: GET /api/auth/me (Unauthenticated)
  console.log('\nTEST 4: GET /api/auth/me (Without Token)');
  const noTokenRes = await request('GET', '/auth/me');
  console.log(`Status: ${noTokenRes.status}`, JSON.stringify(noTokenRes.body, null, 2));

  // Test 5: Login with Wrong Password
  console.log('\nTEST 5: POST /api/auth/login (Wrong Password)');
  const wrongPassRes = await request('POST', '/auth/login', {
    email,
    password: 'WrongPassword123',
  });
  console.log(`Status: ${wrongPassRes.status}`, JSON.stringify(wrongPassRes.body, null, 2));

  // Test 6: Duplicate Email Registration
  console.log('\nTEST 6: POST /api/auth/register (Duplicate Email)');
  const dupRes = await request('POST', '/auth/register', {
    name: 'Duplicate User',
    email,
    password: 'Password123',
  });
  console.log(`Status: ${dupRes.status}`, JSON.stringify(dupRes.body, null, 2));

  // Test 7: Student Accessing Teacher Endpoint
  console.log('\nTEST 7: GET /api/test/teacher (Student Accessing Teacher Route)');
  const teacherAccessRes = await request('GET', '/test/teacher', null, { Authorization: `Bearer ${token}` });
  console.log(`Status: ${teacherAccessRes.status}`, JSON.stringify(teacherAccessRes.body, null, 2));

  // Test 8: Student Accessing Student Endpoint
  console.log('\nTEST 8: GET /api/test/student (Student Accessing Student Route)');
  const studentAccessRes = await request('GET', '/test/student', null, { Authorization: `Bearer ${token}` });
  console.log(`Status: ${studentAccessRes.status}`, JSON.stringify(studentAccessRes.body, null, 2));

  // Test 9: Admin Seed Login & Admin Route Access
  console.log('\nTEST 9: POST /api/auth/login (Admin Seed Login)');
  const adminLoginRes = await request('POST', '/auth/login', {
    email: 'admin@chemescape.com',
    password: 'Password123',
  });
  const adminToken = adminLoginRes.body.data?.token;
  console.log(`Status: ${adminLoginRes.status}`, JSON.stringify(adminLoginRes.body, null, 2));

  console.log('\nTEST 10: GET /api/test/admin (Admin Accessing Admin Route)');
  const adminAccessRes = await request('GET', '/test/admin', null, { Authorization: `Bearer ${adminToken}` });
  console.log(`Status: ${adminAccessRes.status}`, JSON.stringify(adminAccessRes.body, null, 2));

  // Test 11: Zod Validation Error
  console.log('\nTEST 11: POST /api/auth/register (Zod Validation Failure)');
  const invalidRegRes = await request('POST', '/auth/register', {
    name: 'A',
    email: 'invalid-email',
    password: 'short',
  });
  console.log(`Status: ${invalidRegRes.status}`, JSON.stringify(invalidRegRes.body, null, 2));

  // Test 12: Logout
  console.log('\nTEST 12: POST /api/auth/logout');
  const logoutRes = await request('POST', '/auth/logout');
  console.log(`Status: ${logoutRes.status}`, JSON.stringify(logoutRes.body, null, 2));

  console.log('\n==================================================');
  console.log('✅ ALL AUTHENTICATION TESTS EXECUTED CLEANLY!');
  console.log('==================================================');
}

runTests().catch(console.error);
