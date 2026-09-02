'use strict';
/**
 * testStandard5TamilChapter1.js
 *
 * Comprehensive verification suite for Standard 5 Subject Tamil Chapter 1:
 *  1. Standard 5 exists in curriculum system
 *  2. Tamil subject exists under Standard 5
 *  3. Standard 5 -> Tamil mapping is active and valid
 *  4. Standard 5 Tamil Chapter 1 exists (ch-tam5-1)
 *  5. Authentic topics exist for Chapter 1 (topic-tam5-1-1 to 4)
 *  6. Room exists for Chapter 1 (room-tam5-1)
 *  7. Room is configured for GENERIC_CHAPTER_QUIZ
 *  8. Exactly 10 questions configured for Standard 5 Tamil Chapter 1
 *  9. All 10 questions belong strictly to room-tam5-1
 * 10. All 10 questions have PUBLISHED status
 * 11. All 10 questions have isActive = true
 * 12. Each question maintains its own unique, question-specific hint
 * 13. Student question response strictly hides isCorrect, solutionKey, and answers
 * 14. All 10 questions are authentic Tamil language questions with Tamil script
 * 15. Server-side answer validation correctly validates right and wrong answers
 * 16. Regression: Standard 4 Tamil Chapter 1 remains untouched (10 questions)
 * 17. Regression: Standard 4 Tamil Chapter 2 remains untouched (10 questions)
 */

const http = require('http');
const API = 'http://localhost:5000/api';

function request(method, path, body, headers) {
  headers = headers || {};
  return new Promise(function(resolve, reject) {
    var url = new URL(API + path);
    var payload = body ? JSON.stringify(body) : null;
    var reqHeaders = { 'Content-Type': 'application/json' };
    if (payload) reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    Object.assign(reqHeaders, headers);
    var req = http.request(url, { method: method, headers: reqHeaders }, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        var parsed;
        try { parsed = JSON.parse(data); } catch(e) { parsed = data; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

var passed = 0;
var failed = 0;

function record(num, label, pass, details) {
  if (pass) {
    console.log('  ✅ PASS | Test ' + num + ': ' + label);
    passed++;
  } else {
    console.log('  ❌ FAIL | Test ' + num + ': ' + label + (details ? ' (' + details + ')' : ''));
    failed++;
  }
}

async function main() {
  console.log('\n================================================================================================');
  console.log('🧪 CHEMESCAPE STANDARD 5 TAMIL CHAPTER 1 VERIFICATION TEST SUITE');
  console.log('================================================================================================\n');

  var login = await request('POST', '/auth/login', { email: 'student@chemescape.com', password: 'Password123' });
  var token = login.body && login.body.data && login.body.data.token;
  if (!token) {
    console.error('❌ Login failed:', login.body);
    process.exit(1);
  }
  var H = { Authorization: 'Bearer ' + token };

  // 1. Standard 5 exists
  var stdRes = await request('GET', '/standards/grade-5', null, H);
  var std5 = (stdRes.body && stdRes.body.data && stdRes.body.data.standard) || (stdRes.body && stdRes.body.data);
  record(1, 'Standard 5 exists in curriculum system', Boolean(std5 && (std5.id === 'grade-5' || std5.name === '5')));

  // 2. Tamil subject exists under Standard 5
  var subjRes = await request('GET', '/standards/grade-5/subjects', null, H);
  var subjects = (subjRes.body && subjRes.body.data && subjRes.body.data.subjects) ||
                 (subjRes.body && Array.isArray(subjRes.body.data) ? subjRes.body.data : []);
  var tamilSubj = subjects.find(function(s) { return s.code === 'TAMIL' || s.name === 'Tamil'; });
  record(2, 'Tamil subject exists under Standard 5', Boolean(tamilSubj));

  // 3. Mapping is active
  record(3, 'Standard 5 -> Tamil mapping is active and valid', Boolean(tamilSubj && tamilSubj.isActive !== false));

  // 4. Chapter 1 exists (ch-tam5-1)
  var chRes = await request('GET', '/chapters/ch-tam5-1?standardId=grade-5&subjectId=tamil', null, H);
  var ch1 = (chRes.body && chRes.body.data && chRes.body.data.chapter) || (chRes.body && chRes.body.data);
  record(4, 'Standard 5 Tamil Chapter 1 exists (ch-tam5-1)', Boolean(ch1 && ch1.id === 'ch-tam5-1'));

  // 5. Authentic topics exist (>= 4 topics)
  var topRes = await request('GET', '/chapters/ch-tam5-1/topics', null, H);
  var topics = (topRes.body && topRes.body.data && topRes.body.data.topics) ||
               (topRes.body && Array.isArray(topRes.body.data) ? topRes.body.data : []);
  var topicsOk = topics.length >= 4 && topics.every(function(t) { return t.chapterId === 'ch-tam5-1'; });
  record(5, 'Authentic topics exist for Standard 5 Tamil Chapter 1 (found ' + topics.length + ' topics)', topicsOk);

  // 6. Room exists (room-tam5-1)
  var roomRes = await request('GET', '/chapters/ch-tam5-1/rooms', null, H);
  var rooms = (roomRes.body && roomRes.body.data && roomRes.body.data.rooms) ||
              (roomRes.body && Array.isArray(roomRes.body.data) ? roomRes.body.data : []);
  var room1 = rooms.find(function(r) { return r.id === 'room-tam5-1'; });
  record(6, 'Room exists for Standard 5 Tamil Chapter 1 (room-tam5-1)', Boolean(room1));

  // 7. Room is GENERIC_CHAPTER_QUIZ
  record(7, 'Room is configured for GENERIC_CHAPTER_QUIZ', Boolean(room1 && room1.gameType === 'GENERIC_CHAPTER_QUIZ'));

  // 8. Exactly 10 questions configured
  var qRes = await request('GET',
    '/rooms/room-tam5-1/questions?standardId=grade-5&subjectId=tamil&chapterId=ch-tam5-1',
    null, H);
  var questions = (qRes.body && qRes.body.data && qRes.body.data.questions) ||
                  (qRes.body && Array.isArray(qRes.body.data) ? qRes.body.data : []);
  record(8, 'Exactly 10 questions configured for Standard 5 Tamil Chapter 1', questions.length === 10, 'got: ' + questions.length);

  // 9. All 10 questions belong strictly to room-tam5-1
  var allRoomTam5 = questions.length === 10 && questions.every(function(q) { return q.roomId === 'room-tam5-1'; });
  record(9, 'All 10 questions belong strictly to room-tam5-1 without cross-room borrowing', allRoomTam5);

  // 10. All 10 questions have PUBLISHED status
  var allPublished = questions.length === 10 && questions.every(function(q) { return q.status === 'PUBLISHED'; });
  record(10, 'All 10 questions have PUBLISHED status', allPublished);

  // 11. All 10 questions have isActive = true
  var allActive = questions.length === 10 && questions.every(function(q) { return q.isActive === true; });
  record(11, 'All 10 questions have isActive = true', allActive);

  // 12. Each question maintains its own unique hint
  var hints = questions.map(function(q) { return (q.hint || '').trim(); });
  var hintsValid = hints.length === 10 && hints.every(function(h) { return h.length > 5; });
  var uniqueHints = new Set(hints);
  record(12, 'Each question maintains its own unique, question-specific hint (10 distinct hints)', hintsValid && uniqueHints.size === 10);

  // 13. Student question response strictly hides isCorrect, solutionKey, and answers
  var sanitized = questions.every(function(q) {
    var noAns = q.correctAnswer === undefined && q.solutionKey === undefined && q.answerKey === undefined;
    var optsOk = true;
    if (q.options) {
      optsOk = q.options.every(function(opt) {
        return opt.isCorrect === undefined && opt.correctAnswer === undefined;
      });
    }
    return noAns && optsOk;
  });
  record(13, 'Student question response strictly hides isCorrect, solutionKey, and answers', sanitized);

  // 14. All 10 questions are authentic Tamil language questions
  var allTamilText = questions.length === 10 && questions.every(function(q) {
    return /[\u0B80-\u0BFF]/.test(q.questionText);
  });
  record(14, 'All 10 questions are authentic Tamil language questions with Tamil script', allTamilText);

  // 15. Server-side answer validation correctly validates right vs wrong answers
  var valCorrect = await request('POST', '/game/questions/q-tam5-r1-1/answer', {
    roomId: 'room-tam5-1',
    answer: 'opt-tam5-1-2' // 12 is correct for Q1
  }, H);
  var valWrong = await request('POST', '/game/questions/q-tam5-r1-1/answer', {
    roomId: 'room-tam5-1',
    answer: 'opt-tam5-1-1' // 10 is wrong
  }, H);
  var validationWorking = valCorrect.body && valCorrect.body.data && valCorrect.body.data.correct === true &&
                          valWrong.body && valWrong.body.data && valWrong.body.data.correct === false;
  record(15, 'Server-side answer validation correctly validates right and wrong answers', Boolean(validationWorking));

  // 16. Regression: Standard 4 Tamil Chapter 1 remains untouched (10 questions)
  var qTam4Ch1 = await request('GET',
    '/rooms/room-tam4-1/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-1',
    null, H);
  var q4Ch1List = (qTam4Ch1.body && qTam4Ch1.body.data && qTam4Ch1.body.data.questions) || [];
  record(16, 'Regression: Standard 4 Tamil Chapter 1 remains untouched (10 questions)', q4Ch1List.length === 10);

  // 17. Regression: Standard 4 Tamil Chapter 2 remains untouched (10 questions)
  var qTam4Ch2 = await request('GET',
    '/rooms/room-tam4-2/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-2',
    null, H);
  var q4Ch2List = (qTam4Ch2.body && qTam4Ch2.body.data && qTam4Ch2.body.data.questions) || [];
  record(17, 'Regression: Standard 4 Tamil Chapter 2 remains untouched (10 questions)', q4Ch2List.length === 10);

  // Summary
  var total = passed + failed;
  console.log('\n================================================================================================');
  console.log('📊 TEST SUMMARY');
  console.log('================================================================================================');
  console.log('Total Tests:  ' + total);
  console.log('Passed:       ' + passed);
  console.log('Failed:       ' + failed);
  console.log('Success Rate: ' + Math.round((passed / total) * 100) + '%');

  if (failed === 0) {
    console.log('\n🎉 ALL 17 STANDARD 5 TAMIL CHAPTER 1 TESTS PASSED 100% SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    console.log('\n❌ ' + failed + ' TEST(S) FAILED.\n');
    process.exit(1);
  }
}

main().catch(function(err) {
  console.error('Fatal test error:', err);
  process.exit(1);
});
