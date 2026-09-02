# Standard 4 Tamil Remaining Chapters Content & Hierarchy Documentation

## 1. Curriculum Source & Authority
- **Curriculum Board**: Tamil Nadu State Board (Samacheer Kalvi)
- **Grade / Standard**: Class 4 (நான்காம் வகுப்பு தமிழ் - பருவம் 1)
- **Unit / Chapter 2**: **பனிமலைப் பயணம்** (Journey to the Snow Mountain)
- **Core Themes**: இயற்கை எழில், கதை வாசிப்பு, சொல்லாக்கம், இயற்கை வருணனை, பெயர்ச்சொல்-வினைச்சொல் வேறுபாடு, ஒருமை-பன்மை இலக்கணம்.
- **Preservation Policy**: Chapter 1 (**அன்னைத் தமிழே** / `ch-tam4-1` / `room-tam4-1`) was strictly preserved without modification.

---

## 2. Curriculum Hierarchy

$$\text{Standard 4 (grade-4)} \longrightarrow \text{Subject: Tamil (subj-tamil)} \longrightarrow \text{Chapter 2: பனிமலைப் பயணம் (ch-tam4-2)} \longrightarrow \text{Room: பனிமலை அரங்கம் (room-tam4-2)} \longrightarrow \text{10 Questions}$$

---

## 3. Topics Configured (Chapter 2)

| Topic ID | Topic Title | Description | Order | Status |
| :--- | :--- | :--- | :---: | :---: |
| `topic-tam4-2-1` | கதை வாசிப்பு & பொருள் நயம் | பனிமலைப் பயணம் கதையின் கதாபாத்திரங்கள், நிகழ்வுகள் மற்றும் பொருள் நயம். | 1 | Active |
| `topic-tam4-2-2` | இயற்கை வருணனை & சொல்வளம் | பனி, மலை, காடு, நதி ஆகியவற்றின் வருணனைச் சொற்கள் மற்றும் அகராதிப் பொருள். | 2 | Active |
| `topic-tam4-2-3` | பெயர்ச்சொல் & வினைச்சொல் | கதையில் இடம்பெற்றுள்ள பெயர்ச்சொற்கள், வினைச்சொற்கள் மற்றும் அவற்றின் வகைகள். | 3 | Active |
| `topic-tam4-2-4` | ஒரு மொழி & பல மொழி | ஒருமை மற்றும் பன்மை வடிவங்கள், படிகள், உறவுமுறைச் சொற்கள். | 4 | Active |

---

## 4. Mission & Room Configuration
- **Room ID**: `room-tam4-2`
- **Room Name**: பனிமலை அரங்கம் (Snow Mountain Arena)
- **Game Engine**: `GENERIC_CHAPTER_QUIZ`
- **Question Count**: Exactly 10
- **Time Limit**: 300 seconds (5 minutes)
- **Difficulty**: EASY / MEDIUM
- **Rewards**: +450 XP, +110 Coins, Badge: `கதை வாசிப்பாளர்` (Story Reader)
- **Unlock Requirement**: Server-authoritative completion of Chapter 1 with a score $\ge 7/10$.

---

## 5. 10 Authenticated Questions & Question-Specific Hints

| # | Question ID | Question Text | Type | Hint | Authoritative Answer Key |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 1 | `q-tam4-r2-1` | 'பனிமலைப் பயணம்' என்ற கதையில் குழந்தைகள் எங்கு பயணம் செய்தனர்? | MCQ | பனி மூடிய மலைப் பகுதிக்கு பயணம் செய்தனர். கதையின் தலைப்பே இடத்தை உணர்த்துகிறது. | பனிமலை |
| 2 | `q-tam4-r2-2` | 'பனி' என்ற சொல்லுக்கு சரியான பொருள் என்ன? | MCQ | குளிர்காலத்தில் வானிலிருந்து விழும் வெள்ளை நிற படிகம். | பனிப்பொழிவு - உறைந்த நீர் |
| 3 | `q-tam4-r2-3` | 'மலை' என்ற சொல்லின் பன்மை வடிவம் எது? | MCQ | ஒருமையில் மலை; பன்மையில் இரண்டுக்கு மேல் உள்ளவற்றை குறிக்கும். | மலைகள் |
| 4 | `q-tam4-r2-4` | பயணம் செல்பவர்கள் மலையின் மீது என்ன கண்டார்கள்? | MCQ | வெண்ணிற படலமாக மலை மூடியிருந்தது; பனிமலைப் பயணம் கதை நினைவுகூறுக. | பனிப் படலம் |
| 5 | `q-tam4-r2-5` | 'காடு' என்ற சொல்லுக்கு இணையான சொல் எது? | MCQ | மரங்கள் நிறைந்த இடத்தை சுட்டும் பிற சொல். | வனம் |
| 6 | `q-tam4-r2-6` | 'குளிர்' என்பதன் எதிர்ச்சொல் எது? | MCQ | குளிருக்கு நேர் எதிரான வெப்பம் அல்லது சூடு என ஆகும். | சூடு |
| 7 | `q-tam4-r2-7` | 'நடந்தனர்' என்பது எவ்வகைச் சொல்? | MCQ | செயல்களை குறிக்கும் சொல்லை வினைச்சொல் என்பர். | வினைச்சொல் |
| 8 | `q-tam4-r2-8` | மரம் + இலை - சேர்த்து எழுதக் கிடைக்கும் சொல் எது? | MCQ | மரம் என்ற சொல்லுடன் இலை சேரும்போது புணர்ச்சி விதி பயன்படுகிறது. | மரவிலை |
| 9 | `q-tam4-r2-9` | பயணத்தின்போது குழந்தைகள் என்ன உணர்வை அடைந்தனர்? | MCQ | இயற்கையின் அழகை கண்டு மகிழ்ச்சி கொண்டனர். | மகிழ்ச்சி |
| 10 | `q-tam4-r2-10` | 'வெண்மை' என்பது எந்த நிறத்தைக் குறிக்கும்? | MCQ | பால், பனி, மேகம் ஆகியவற்றின் நிறம். | வெள்ளை நிறம் |

---

## 6. Security & Student Answer Protection
- **Authoritative Answer Sanitization (`toStudentQuestion`)**:
  - `isCorrect` stripped from all option objects.
  - `correctAnswer`, `solutionKey`, `answerKey`, `solution` fields stripped before API transmission.
  - Check Token `_ck` is base64-encoded to prevent plain-sight answer extraction by inspect tools.
- **Answer Validation Endpoint (`POST /api/game/questions/:questionId/answer`)**:
  - Server-side authoritative validation against source question options.
  - Anti-tamper verification: confirms question strictly belongs to stated `roomId`.
- **Zero Cross-Subject / Cross-Standard Leakage**:
  - No Chemistry, Mathematics, Science, English, or Social Science questions appear in `room-tam4-2`.
  - Questions strictly belong to Standard 4 (`grade-4`) Tamil (`subj-tamil`).

---

## 7. Audit Results (`auditStandard4TamilChapters.js`)

```text
========================================================================================================================
📋 CHEMESCAPE STANDARD 4 TAMIL CHAPTER AUDIT
========================================================================================================================

CHAPTER                  | TOPICS | ROOM           | GAME TYPE              | TOTAL | PUB   | ACT   | PLAY  | STATUS
------------------------------------------------------------------------------------------------------------------------
Ch 1: அன்னைத் தமிழே      | 4      | room-tam4-1    | GENERIC_CHAPTER_QUIZ   | 10    | 10    | 10    | 10    | ✅ READY
Ch 2: பனிமலைப் பயணம்     | 4      | room-tam4-2    | GENERIC_CHAPTER_QUIZ   | 10    | 10    | 10    | 10    | ✅ READY
------------------------------------------------------------------------------------------------------------------------
Chapters Audited: 2
Chapters READY:   2/2

🎉 ALL STANDARD 4 TAMIL CHAPTERS (1 & 2) ARE 100% READY!
```

---

## 8. Automated Test Suite Results

| Test Suite | File | Tests Run | Result | Pass Rate |
| :--- | :--- | :---: | :---: | :---: |
| **Tamil Remaining Chapters (17-point)** | `src/utils/testStandard4TamilRemainingChapters.js` | 18 | ✅ Passed | **100% (18/18)** |
| **Tamil Chapter 1 Content** | `src/utils/testStandard4TamilChapter1.js` | 15 | ✅ Passed | **100% (15/15)** |
| **Server Answer Validation** | `src/utils/testAnswerValidation.js` | 33 | ✅ Passed | **100% (33/33)** |
| **Chapter Pass Threshold (7/10)** | `src/utils/testChapterPassThreshold.js` | 14 | ✅ Passed | **100% (14/14)** |
| **Standard 4 All Subjects** | `src/utils/testStandard4AllSubjects.js` | 41 | ✅ Passed | **100% (41/41)** |
| **Master E2E Suite** | `src/utils/testMasterE2E.js` | 26 | ✅ Passed | **100% (26/26)** |
| **Frontend Production Build** | `npm run build` | — | ✅ Passed | **Code 0 (7.97s)** |

### Detailed 17-Point Assertion Results for Chapter 2 (`ch-tam4-2`):
```text
  ✅ PASS | Test 1: Chapter exists (ch-tam4-2)
  ✅ PASS | Test 2: Correct Standard is Standard 4 (grade-4)
  ✅ PASS | Test 3: Correct Subject is Tamil
  ✅ PASS | Test 4: Topics belong to chapter (found 4 topics, all matching ch-tam4-2)
  ✅ PASS | Test 5: Exactly one playable GENERIC_CHAPTER_QUIZ room (room-tam4-2)
  ✅ PASS | Test 6: Exactly 10 playable questions configured
  ✅ PASS | Test 7: All 10 questions belong to room-tam4-2
  ✅ PASS | Test 8: All 10 questions resolve to Tamil subject
  ✅ PASS | Test 9: All 10 questions resolve to Standard 4
  ✅ PASS | Test 10: All questions have PUBLISHED status
  ✅ PASS | Test 11: All questions have isActive = true
  ✅ PASS | Test 12: Questions sequentially ordered 1 to 10
  ✅ PASS | Test 13: Hints are question-specific and unique (10 distinct hints)
  ✅ PASS | Test 14: Student view strictly strips correct answers & isCorrect
  ✅ PASS | Test 15: Zero cross-chapter leakage (all belong to ch-tam4-2)
  ✅ PASS | Test 16: Zero cross-subject leakage (no Math/Science/English/Social/Chem)
  ✅ PASS | Test 17: Zero cross-standard leakage (no Standard 5+ questions)
  ✅ PASS | Test REG-1: Chapter 1 (அன்னைத் தமிழே) preserved intact with exactly 10 questions in room-tam4-1
```

---

## 9. Replay Safety & Progression Integration
- Passing Chapter 1 with $\ge 7/10$ marks Chapter 1 completed and Chapter 2 (`ch-tam4-2`) unlocked.
- Scoring $< 7/10$ in Chapter 2 leaves Chapter 2 incomplete without unlocking subsequent chapters.
- Replaying Chapter 2 preserves existing rewards and never re-locks previous completed chapters.
