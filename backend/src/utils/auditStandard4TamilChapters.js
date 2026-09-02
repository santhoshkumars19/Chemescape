'use strict';
/**
 * auditStandard4TamilChapters.js
 *
 * Audits ALL Standard 4 Tamil chapters via the live API.
 * Table format:
 * CHAPTER | TOPICS | ROOM | GAME TYPE | TOTAL | PUBLISHED | ACTIVE | PLAYABLE | STATUS
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

function fmt(val, w) { return String(val).padEnd(w); }

var TAMIL_CHAPTERS = [
  { chNum: 1, chId: 'ch-tam4-1', expectedRoomId: 'room-tam4-1', title: 'அன்னைத் தமிழே' },
  { chNum: 2, chId: 'ch-tam4-2', expectedRoomId: 'room-tam4-2', title: 'பனிமலைப் பயணம்' },
];

async function main() {
  console.log('\n========================================================================================================================');
  console.log('📋 CHEMESCAPE STANDARD 4 TAMIL CHAPTER AUDIT');
  console.log('========================================================================================================================\n');

  var login = await request('POST', '/auth/login', { email: 'student@chemescape.com', password: 'Password123' });
  var token = login.body && login.body.data && login.body.data.token;
  if (!token) {
    console.error('❌ Login failed:', login.body);
    process.exit(1);
  }
  var H = { Authorization: 'Bearer ' + token };

  console.log(
    fmt('CHAPTER', 24) + ' | ' +
    fmt('TOPICS', 6) + ' | ' +
    fmt('ROOM', 14) + ' | ' +
    fmt('GAME TYPE', 22) + ' | ' +
    fmt('TOTAL', 5) + ' | ' +
    fmt('PUB', 5) + ' | ' +
    fmt('ACT', 5) + ' | ' +
    fmt('PLAY', 5) + ' | ' +
    'STATUS'
  );
  console.log('-'.repeat(120));

  var results = [];

  for (var i = 0; i < TAMIL_CHAPTERS.length; i++) {
    var cfg = TAMIL_CHAPTERS[i];

    // 1. Fetch Topics
    var topRes = await request('GET', '/chapters/' + cfg.chId + '/topics', null, H);
    var topics = (topRes.body && topRes.body.data && topRes.body.data.topics) ||
                 (topRes.body && Array.isArray(topRes.body.data) ? topRes.body.data : []);
    var topicCount = topics.length;

    // 2. Fetch Rooms
    var roomRes = await request('GET', '/chapters/' + cfg.chId + '/rooms', null, H);
    var rooms = (roomRes.body && roomRes.body.data && roomRes.body.data.rooms) ||
                (roomRes.body && Array.isArray(roomRes.body.data) ? roomRes.body.data : []);
    var primaryRoom = rooms[0] || null;
    var roomId = primaryRoom ? primaryRoom.id : '-';
    var gameType = primaryRoom ? (primaryRoom.gameType || '-') : '-';

    // 3. Fetch Questions
    var questions = [];
    if (primaryRoom && primaryRoom.id) {
      var qRes = await request('GET',
        '/rooms/' + primaryRoom.id + '/questions?standardId=grade-4&subjectId=tamil&chapterId=' + cfg.chId,
        null, H);
      questions = (qRes.body && qRes.body.data && qRes.body.data.questions) ||
                  (qRes.body && Array.isArray(qRes.body.data) ? qRes.body.data : []);
    }

    var total = questions.length;
    var published = questions.filter(function(q) { return q.status === 'PUBLISHED'; }).length;
    var active = questions.filter(function(q) { return q.isActive === true; }).length;
    var playable = questions.filter(function(q) { return q.status === 'PUBLISHED' && q.isActive === true; }).length;

    var isReady = topicCount >= 1 &&
                  primaryRoom !== null &&
                  gameType === 'GENERIC_CHAPTER_QUIZ' &&
                  playable === 10;

    var status = isReady ? '✅ READY' : '❌ INCOMPLETE';

    console.log(
      fmt('Ch ' + cfg.chNum + ': ' + cfg.title, 24) + ' | ' +
      fmt(topicCount, 6) + ' | ' +
      fmt(roomId, 14) + ' | ' +
      fmt(gameType, 22) + ' | ' +
      fmt(total, 5) + ' | ' +
      fmt(published, 5) + ' | ' +
      fmt(active, 5) + ' | ' +
      fmt(playable, 5) + ' | ' +
      status
    );

    results.push({
      chNum: cfg.chNum,
      title: cfg.title,
      topicCount: topicCount,
      roomId: roomId,
      gameType: gameType,
      total: total,
      published: published,
      active: active,
      playable: playable,
      isReady: isReady
    });
  }

  console.log('-'.repeat(120));
  var allReady = results.every(function(r) { return r.isReady; });
  console.log('Chapters Audited: ' + results.length);
  console.log('Chapters READY:   ' + results.filter(function(r) { return r.isReady; }).length + '/' + results.length);

  if (allReady) {
    console.log('\n🎉 ALL STANDARD 4 TAMIL CHAPTERS (1 & 2) ARE 100% READY!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ SOME CHAPTERS ARE NOT READY.\n');
    process.exit(1);
  }
}

main().catch(function(err) {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
