'use strict';
/**
 * testStandard4TamilRemainingChapters.js
 *
 * Tests Standard 4 Tamil Remaining Chapters (Chapter 2: ch-tam4-2 / room-tam4-2)
 *
 * 17 Assertions per chapter:
 *  1. Chapter exists
 *  2. Correct Standard (grade-4)
 *  3. Correct Subject (Tamil / subj-tamil)
 *  4. Topics belong to chapter (min 1, topic.chapterId matches)
 *  5. Exactly one playable generic Room (GENERIC_CHAPTER_QUIZ)
 *  6. Exactly 10 playable questions
 *  7. All 10 questions belong to that Room (room-tam4-2)
 *  8. All 10 resolve to Tamil subject
 *  9. All 10 resolve to Standard 4
 * 10. Questions are PUBLISHED (status === 'PUBLISHED')
 * 11. Questions are ACTIVE (isActive === true)
 * 12. Question order 1-10
 * 13. Hints are question-specific (non-empty, unique per question)
 * 14. Answer keys strictly stripped (no correctAnswer, isCorrect in options, etc.)
 * 15. No cross-chapter questions (zero questions from Chapter 1 or other chapters)
 * 16. No cross-subject questions (zero leakage from English, Math, Science, Social)
 * 17. No cross-standard questions (zero leakage from Standard 5, 11, etc.)
 *
 * Plus Regression Protection:
 * - Chapter 1 is untouched and retains 10 questions
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

var REMAINING_CHAPTERS = [
  {
    chNum: 2,
    chId: 'ch-tam4-2',
    roomId: 'room-tam4-2',
    title: 'பனிமலைப் பயணம்',
    standardId: 'grade-4',
    subjectId: 'tamil'
  }
];

async function main() {
  console.log('\n================================================================================================');
  console.log('🧪 CHEMESCAPE STANDARD 4 TAMIL REMAINING CHAPTERS TEST SUITE (17 ASSERTIONS PER CHAPTER)');
  console.log('================================================================================================\n');

  var login = await request('POST', '/auth/login', { email: 'student@chemescape.com', password: 'Password123' });
  var token = login.body && login.body.data && login.body.data.token;
  if (!token) {
    console.error('❌ Login failed');
    process.exit(1);
  }
  var H = { Authorization: 'Bearer ' + token };

  for (var c = 0; c < REMAINING_CHAPTERS.length; c++) {
    var ch = REMAINING_CHAPTERS[c];
    console.log('--- Validating Chapter ' + ch.chNum + ': ' + ch.title + ' (' + ch.chId + ') ---');

    // 1. Chapter exists
    var chRes = await request('GET', '/chapters/' + ch.chId + '?standardId=' + ch.standardId + '&subjectId=' + ch.subjectId, null, H);
    var chapter = (chRes.body && chRes.body.data && chRes.body.data.chapter) || (chRes.body && chRes.body.data) || null;
    record(1, 'Chapter exists (' + ch.chId + ')', Boolean(chapter && chapter.id === ch.chId));

    // 2. Correct Standard (grade-4)
    var stdId = chapter && (chapter.standardId || (chapter.standard && chapter.standard.id));
    record(2, 'Correct Standard is Standard 4 (grade-4)', stdId === 'grade-4', 'got: ' + stdId);

    // 3. Correct Subject (Tamil / subj-tamil)
    var subjId = chapter && (chapter.subjectId || (chapter.subject && chapter.subject.id));
    var isTamilSubj = subjId === 'subj-tamil' || subjId === 'tamil' ||
                      (chapter && chapter.subject && chapter.subject.name === 'Tamil');
    record(3, 'Correct Subject is Tamil', Boolean(isTamilSubj), 'got: ' + subjId);

    // 4. Topics belong to chapter (min 1)
    var topRes = await request('GET', '/chapters/' + ch.chId + '/topics', null, H);
    var topics = (topRes.body && topRes.body.data && topRes.body.data.topics) ||
                 (topRes.body && Array.isArray(topRes.body.data) ? topRes.body.data : []);
    var topicsValid = topics.length >= 1 && topics.every(function(t) { return t.chapterId === ch.chId; });
    record(4, 'Topics belong to chapter (found ' + topics.length + ' topics, all matching ' + ch.chId + ')', topicsValid);

    // 5. Exactly one playable generic Room (GENERIC_CHAPTER_QUIZ)
    var roomRes = await request('GET', '/chapters/' + ch.chId + '/rooms', null, H);
    var rooms = (roomRes.body && roomRes.body.data && roomRes.body.data.rooms) ||
                (roomRes.body && Array.isArray(roomRes.body.data) ? roomRes.body.data : []);
    var genericRooms = rooms.filter(function(r) { return r.gameType === 'GENERIC_CHAPTER_QUIZ'; });
    record(5, 'Exactly one playable GENERIC_CHAPTER_QUIZ room (' + ch.roomId + ')', genericRooms.length === 1 && genericRooms[0].id === ch.roomId);

    // 6. Exactly 10 playable questions
    var qRes = await request('GET',
      '/rooms/' + ch.roomId + '/questions?standardId=' + ch.standardId + '&subjectId=' + ch.subjectId + '&chapterId=' + ch.chId,
      null, H);
    var questions = (qRes.body && qRes.body.data && qRes.body.data.questions) ||
                    (qRes.body && Array.isArray(qRes.body.data) ? qRes.body.data : []);
    record(6, 'Exactly 10 playable questions configured', questions.length === 10, 'got: ' + questions.length);

    // 7. All 10 questions belong to that Room
    var allBelongToRoom = questions.length === 10 && questions.every(function(q) { return q.roomId === ch.roomId; });
    record(7, 'All 10 questions belong to ' + ch.roomId, allBelongToRoom);

    // 8. All 10 resolve to Tamil subject
    var allTamil = questions.every(function(q) {
      if (q.room && q.room.chapter) {
        return q.room.chapter.subjectId === 'subj-tamil' || q.room.chapter.subjectId === 'tamil';
      }
      return q.chapterId === ch.chId;
    });
    record(8, 'All 10 questions resolve to Tamil subject', allTamil);

    // 9. All 10 resolve to Standard 4
    var allStd4 = questions.every(function(q) {
      if (q.room && q.room.chapter) {
        return q.room.chapter.standardId === 'grade-4';
      }
      return q.chapterId === ch.chId;
    });
    record(9, 'All 10 questions resolve to Standard 4', allStd4);

    // 10. Questions are PUBLISHED (status = PUBLISHED)
    var allPublished = questions.length === 10 && questions.every(function(q) { return q.status === 'PUBLISHED'; });
    record(10, 'All questions have PUBLISHED status', allPublished);

    // 11. Questions are ACTIVE (isActive = true)
    var allActive = questions.length === 10 && questions.every(function(q) { return q.isActive === true; });
    record(11, 'All questions have isActive = true', allActive);

    // 12. Question order 1-10
    var orders = questions.map(function(q) { return q.questionNumber || q.displayOrder; }).sort(function(a, b) { return a - b; });
    var orderOk = orders.length === 10;
    for (var k = 0; k < 10; k++) {
      if (orders[k] !== k + 1) { orderOk = false; break; }
    }
    record(12, 'Questions sequentially ordered 1 to 10', orderOk, 'orders: ' + orders.join(','));

    // 13. Hints are question-specific (non-empty, unique)
    var hints = questions.map(function(q) { return (q.hint || '').trim(); });
    var allNonEmptyHints = hints.every(function(h) { return h.length > 5; });
    var uniqueHints = new Set(hints);
    record(13, 'Hints are question-specific and unique (10 distinct hints)', allNonEmptyHints && uniqueHints.size === 10);

    // 14. Answer keys strictly stripped
    var sanitized = questions.every(function(q) {
      var noAns = q.correctAnswer === undefined && q.solutionKey === undefined && q.answerKey === undefined;
      var optionsSanitized = true;
      if (q.options) {
        optionsSanitized = q.options.every(function(opt) {
          return opt.isCorrect === undefined && opt.correctAnswer === undefined;
        });
      }
      return noAns && optionsSanitized;
    });
    record(14, 'Student view strictly strips correct answers & isCorrect', sanitized);

    // 15. No cross-chapter questions (no questions from ch-tam4-1)
    var noCrossChapter = questions.every(function(q) {
      return q.chapterId === ch.chId && q.id.indexOf('q-tam4-r1') === -1;
    });
    record(15, 'Zero cross-chapter leakage (all belong to ' + ch.chId + ')', noCrossChapter);

    // 16. No cross-subject questions
    var noCrossSubject = questions.every(function(q) {
      var id = q.id || '';
      return id.indexOf('chem') === -1 && id.indexOf('math') === -1 &&
             id.indexOf('eng') === -1 && id.indexOf('sci') === -1 &&
             id.indexOf('soc') === -1;
    });
    record(16, 'Zero cross-subject leakage (no Math/Science/English/Social/Chem)', noCrossSubject);

    // 17. No cross-standard questions
    var noCrossStandard = questions.every(function(q) {
      var id = q.id || '';
      return id.indexOf('tam5') === -1 && id.indexOf('tam6') === -1 &&
             id.indexOf('tam7') === -1 && id.indexOf('tam8') === -1;
    });
    record(17, 'Zero cross-standard leakage (no Standard 5+ questions)', noCrossStandard);

    console.log('');
  }

  // ── Regression: Verify Chapter 1 is preserved intact ─────────────────────
  console.log('--- Regression: Verifying Standard 4 Tamil Chapter 1 Preservation ---');
  var q1Res = await request('GET',
    '/rooms/room-tam4-1/questions?standardId=grade-4&subjectId=tamil&chapterId=ch-tam4-1',
    null, H);
  var q1s = (q1Res.body && q1Res.body.data && q1Res.body.data.questions) ||
            (q1Res.body && Array.isArray(q1Res.body.data) ? q1Res.body.data : []);
  var ch1Preserved = q1s.length === 10 && q1s.every(function(q) { return q.roomId === 'room-tam4-1'; });
  record('REG-1', 'Chapter 1 (அன்னைத் தமிழே) preserved intact with exactly 10 questions in room-tam4-1', ch1Preserved);

  console.log('\n================================================================================================');
  console.log('📊 TEST SUMMARY');
  console.log('================================================================================================');
  console.log('Total Tests:  ' + (passed + failed));
  console.log('Passed:       ' + passed);
  console.log('Failed:       ' + failed);
  console.log('Success Rate: ' + Math.round((passed / (passed + failed)) * 100) + '%');

  if (failed === 0) {
    console.log('\n🎉 ALL STANDARD 4 TAMIL REMAINING CHAPTER TESTS PASSED 100% SUCCESSFULLY!\n');
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
