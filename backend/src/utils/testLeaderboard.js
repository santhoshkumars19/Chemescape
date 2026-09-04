'use strict';

const http = require('http');
const BASE_URL = 'http://localhost:5000/api';

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };
    if (payload) reqHeaders['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log('  ✅ PASS: ' + message);
    passed++;
  } else {
    console.error('  ❌ FAIL: ' + message);
    failed++;
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🏆 EDUNOVA LEADERBOARD AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  const res1 = await request('GET', '/leaderboard');
  assert(res1.status === 200, 'GET /api/leaderboard returns status 200');
  assert(res1.body && res1.body.success === true, 'Response has success: true');
  assert(Array.isArray(res1.body?.data?.rankings), 'Rankings is an array');
  assert(res1.body?.data?.rankings.length >= 10, 'Rankings contains at least 10 scholars');
  assert(res1.body?.data?.top3?.length === 3, 'Top 3 podium scholars provided');
  assert(res1.body?.data?.rankings[0].rank === 1, 'Top ranked scholar has rank 1');

  const resWeekly = await request('GET', '/leaderboard?timeframe=weekly');
  const resAllTime = await request('GET', '/leaderboard?timeframe=alltime');
  assert(resWeekly.body?.data?.timeframe === 'weekly', 'Weekly timeframe properly flagged');
  assert(resAllTime.body?.data?.timeframe === 'alltime', 'All-Time timeframe properly flagged');
  const weeklyTopXP = resWeekly.body?.data?.rankings[0].xp;
  const allTimeTopXP = resAllTime.body?.data?.rankings[0].xp;
  assert(weeklyTopXP < allTimeTopXP, 'Weekly XP is scaled proportionally compared to All-Time XP');

  const resStd = await request('GET', '/leaderboard?standardId=grade-8');
  assert(resStd.status === 200, 'Standard filtered query returns status 200');
  const stdScholars = resStd.body?.data?.rankings || [];
  assert(stdScholars.every(s => s.standardId === 'grade-8'), 'All returned scholars match grade-8');

  const resSubj = await request('GET', '/leaderboard?subjectId=tamil');
  assert(resSubj.status === 200, 'Subject filtered query returns status 200');
  const subjScholars = resSubj.body?.data?.rankings || [];
  assert(subjScholars.every(s => s.subjectId === 'tamil'), 'All returned scholars match tamil subject');

  const resSearch = await request('GET', '/leaderboard?search=Kavitha');
  assert(resSearch.status === 200, 'Search query returns status 200');
  assert(resSearch.body?.data?.rankings?.some(s => s.name.includes('Kavitha')), 'Search finds matching scholar');

  const loginRes = await request('POST', '/auth/login', {
    email: 'student@edunova.com',
    password: 'Password123'
  });
  const token = loginRes.body?.data?.token;
  assert(!!token, 'Student login successful to acquire JWT token');

  const resAuth = await request('GET', '/leaderboard', null, { Authorization: 'Bearer ' + token });
  assert(resAuth.status === 200, 'Authenticated leaderboard request returns status 200');
  assert(resAuth.body?.data?.userStanding !== undefined, 'User standing object is calculated');
  assert(resAuth.body?.data?.rankings.some(s => s.isUser === true), 'Current student is placed in live rankings with isUser: true');

  console.log('\n==================================================');
  console.log('TOTAL TESTS: ' + (passed + failed) + ' | PASSED: ' + passed + ' | FAILED: ' + failed);
  console.log('SUCCESS RATE: ' + Math.round((passed / (passed + failed)) * 100) + '%');
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
