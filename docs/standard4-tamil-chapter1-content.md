# Standard 4 Tamil Chapter 1 Content & Hierarchy Documentation

## 1. Curriculum Source & Authority
- **Curriculum Board**: Tamil Nadu State Board (Samacheer Kalvi)
- **Grade / Standard**: Class 4 (நான்காம் வகுப்பு தமிழ் - பருவம் 1)
- **Unit / Chapter 1**: **அன்னைத் தமிழே**
- **Author**: கவிஞர் நா. காமராசன் (Na. Kamarasan)
- **Core Themes**: தமிழின் பெருமை, இனிமை, சொல்லாக்கம், இலக்கணம் (எதுகை, மோனை, பிரித்தெழுதுதல்).

---

## 2. Curriculum Hierarchy

$$\text{Standard 4 (grade-4)} \longrightarrow \text{Subject: Tamil (subj-tamil)} \longrightarrow \text{Chapter 1: அன்னைத் தமிழே (ch-tam4-1)} \longrightarrow \text{Room: அன்னைத் தமிழ் அரங்கம் (room-tam4-1)} \longrightarrow \text{10 Questions}$$

---

## 3. Topics Configured (Chapter 1)

| Topic ID | Topic Title | Description | Order |
| :--- | :--- | :--- | :---: |
| `topic-tam4-1-1` | பாடல் வரிகளும் விளக்கமும் | அன்னைத் தமிழே பாடலின் வரிகள் மற்றும் அதன் பொருள் நயம் | 1 |
| `topic-tam4-1-2` | சொல் பொருள் & அகராதி | அன்னை, ஆவி, உலகம், வளர்பவள் போன்ற அருஞ்சொற்பொருள் | 2 |
| `topic-tam4-1-3` | பிரித்து & சேர்த்து எழுதுக | சொற்களைப் பிரித்தறிதல் மற்றும் புணர்ச்சி விதிகள் | 3 |
| `topic-tam4-1-4` | எதுகை, மோனை & நயங்கள் | செய்யுள் நயங்கள் மற்றும் எதுகை மோனை சொற்கள் | 4 |

---

## 4. Mission & Room Configuration
- **Room ID**: `room-tam4-1`
- **Room Name**: அன்னைத் தமிழ் அரங்கம் (Mother Tamil Chamber)
- **Game Engine**: `GENERIC_CHAPTER_QUIZ`
- **Question Count**: 10
- **Time Limit**: 300 seconds (5 minutes)
- **Rewards**: +400 XP, +100 Coins, ★★★ Rating, Badge: `அன்னைத் தமிழ் அறிஞர்`

---

## 5. 10 Authenticated Questions & Question-Specific Hints

| # | Question Text | Type | Hint | Authoritative Answer Key |
| :---: | :--- | :---: | :--- | :---: |
| 1 | 'அன்னைத் தமிழே' என்ற பாடலின் ஆசிரியர் யார்? | MCQ | கவிஞர் நா. காமராசன் அவர்களின் அழகிய பாடல் வரிகள். | நா. காமராசன் |
| 2 | 'ஆவி' என்ற சொல்லின் சரியான பொருள் என்ன? | MCQ | உடலில் கலந்து நிலைத்திருக்கும் உயிர். | உயிர் |
| 3 | "என்னை வளர்ப்பவளே, என்னில் _______" - விடுபட்ட சொல்? | MCQ | பாடல் வரியில் என்னில் வளர்பவளைப் போற்றுகிறார். | வளர்பவளே |
| 4 | 'உன்னையல்லால்' - இச்சொல்லைப் பிரித்து எழுதக் கிடைப்பது? | MCQ | உன்னை + அல்லால் என்று பிரியும். | உன்னை + அல்லால் |
| 5 | 'அன்னை' என்ற சொல்லுக்கு இணையான சொல் எது? | MCQ | நம்மைப் பெற்றெடுத்த அன்புத் தாய். | தாய் |
| 6 | 'தமிழ் + மொழி' - சேர்த்து எழுதக் கிடைக்கும் சொல்? | MCQ | இரு சொற்களும் சேரும்போது தமிழ்மொழி என வரும். | தமிழ்மொழி |
| 7 | 'புகழ்' என்ற சொல்லின் சரியான எதிர்ச்சொல் எது? | MCQ | புகழுக்கு எதிரான சொல் இகழ் / இகழ்ச்சி. | இகழ் |
| 8 | செய்யுளில் முதல் எழுத்து ஒன்றி வருவது எவ்வாறு அழைக்கப்படும்? | MCQ | முதல் எழுத்து ஒன்றி வருவது மோனை. | மோனை |
| 9 | செய்யுளில் இரண்டாம் எழுத்து ஒன்றி வருவது எவ்வாறு அழைக்கப்படும்? | MCQ | இரண்டாம் எழுத்து ஒன்றி வருவது எதுகை. | எதுகை |
| 10 | கவிஞர் நா. காமராசன் எதனைப் போற்றிப் புகழ வார்த்தைகள் போதவில்லை என்கிறார்? | MCQ | அன்னைத் தமிழின் பெருமையைச் சொல்ல வார்த்தைகளே போதவில்லை என்கிறார். | அன்னைத் தமிழ் |

---

## 6. Security & Student Answer Protection
- **Backend Sanitization (`toStudentQuestion`)**:
  - Authoritative answers (`isCorrect`, `correctAnswer`, `solutionKey`, `puzzleData.correctMapping`) are stripped before transmission to students.
  - Teacher/Admin views retain full authoring schema.
- **Zero Cross-Subject Fallback**: Queries strictly reject cross-subject or cross-standard leakage.

---

## 7. Verification & Automated Test Results

| Test Suite | Tests Run | Result | Pass Rate |
| :--- | :---: | :---: | :---: |
| **`testStandard4TamilChapter1.js`** | 15 | ✅ Passed | **100% (15/15)** |
| **`testChapterProgression.js`** | 15 | ✅ Passed | **100% (15/15)** |
| **`testMasterE2E.js`** | 26 | ✅ Passed | **100% (26/26)** |
| **Frontend Production Build (`vite build`)** | — | ✅ Passed | **0 Errors** |

### Output Log:
```text
================================================================
🧪 CHEMESCAPE STANDARD 4 TAMIL CHAPTER 1 TEST SUITE
================================================================
✅ PASS | Test 1: Standard 4 exists in curriculum system
✅ PASS | Test 2: Tamil subject exists under Standard 4
✅ PASS | Test 3: Standard 4 -> Tamil mapping is active and valid
✅ PASS | Test 4: Standard 4 Tamil Chapter 1 exists (அன்னைத் தமிழே)
✅ PASS | Test 5: Authentic topics exist for Standard 4 Tamil Chapter 1
✅ PASS | Test 6: Room exists for Standard 4 Tamil Chapter 1 (room-tam4-1)
✅ PASS | Test 7: Room is configured for GENERIC_CHAPTER_QUIZ
✅ PASS | Test 8: Exactly 10 questions configured for Standard 4 Tamil Chapter 1
✅ PASS | Test 9: All 10 questions belong strictly to room-tam4-1 without cross-room borrowing
✅ PASS | Test 10: All 10 questions have PUBLISHED status
✅ PASS | Test 11: All 10 questions have isActive = true
✅ PASS | Test 12: Each question maintains its own unique, question-specific hint
✅ PASS | Test 13: Student question response strictly hides isCorrect, solutionKey, and answers
✅ PASS | Test 14: Standard 4 Tamil questions contain ZERO Chemistry, Math, or Science leakage
✅ PASS | Test 15: Curriculum structure is idempotent and protects against duplicate entities
================================================================
📊 STANDARD 4 TAMIL CHAPTER 1 SUMMARY: 15/15 PASSED (100%)
================================================================
```

---

## 8. Known Limitations
- Standard 4 Tamil Chapters 2, 3, and 4 will be populated in subsequent curriculum sprints using official textbook lessons.
