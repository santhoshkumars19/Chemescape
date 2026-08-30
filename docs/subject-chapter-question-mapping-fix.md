# Subject + Standard + Chapter + Room + Question Mapping Fix & Content Resolution Architecture

## 1. Executive Summary & Root Cause
In ChemEscape, the learning hierarchy is authoritative and multi-layered:
$$\text{USER} \longrightarrow \text{STANDARD} \longrightarrow \text{SUBJECT} \longrightarrow \text{CHAPTER} \longrightarrow \text{ROOM / MISSION} \longrightarrow \text{QUESTION}$$

### Root Cause of Previous Cross-Subject Mappings:
1. **Unscoped Fallback Behaviors**: When a non-Chemistry standard or subject (e.g. Standard 5 Tamil, Social Science) was selected, fallback systems defaulted to legacy Chemistry unit IDs (`room-1`, `room-2`, `ch-3`) or loaded generic demonstration questions rather than enforcing strict hierarchy integrity.
2. **Missing Hierarchy Context in Frontend Queries**: Question fetch calls (`GET /api/rooms/:roomId/questions`) did not transmit the active `standardId`, `subjectId`, and `chapterId` context parameters, preventing server-side cross-standard/subject tampering validation.
3. **Absence of Subject-Specific Question Banks**: Non-Chemistry subjects lacked complete 10-question banks, leading to unsupported game screens or accidental cross-subject bleed.

---

## 2. Incorrect Mappings Discovered & Corrected
- **Discovered**: Standard 5 Tamil Room queries risked resolving to 11th Chemistry room definitions (`room-1`).
- **Discovered**: Standard 5 Social Science risked displaying "Interactive Mission Coming Soon" or falling back to general science questions.
- **Fixed**: Mapped distinct, authoritative room IDs:
  - `room-tam5-1` $\rightarrow$ Chapter `ch-tam5-1` (Tamil) $\rightarrow$ 10 authentic Tamil language/grammar questions.
  - `room-math5-1` $\rightarrow$ Chapter `ch-math5-1` (Math) $\rightarrow$ 10 authentic arithmetic, geometry, and fractions questions.
  - `room-sci5-1` $\rightarrow$ Chapter `ch-sci5-1` (Science) $\rightarrow$ 10 authentic states of matter and physics questions.
  - `room-soc5-1` $\rightarrow$ Chapter `ch-soc5-1` (Social Science) $\rightarrow$ 10 authentic geography, history, and civics questions.
  - `room-eng5-1` $\rightarrow$ Chapter `ch-eng5-1` (English) $\rightarrow$ 10 authentic grammar, parts of speech, and vocabulary questions.
  - `room-phy11-1` $\rightarrow$ Chapter `ch-phy11-1` (Physics) $\rightarrow$ 11th Physics measurement room.

---

## 3. Architecture & Strict No-Fallback Rule

### 3.1 Strict Hierarchy Enforcement
Every query is validated against the active curriculum context:
```
Room.chapterId === Chapter.id
Chapter.subjectId === Subject.id
Chapter.standardId === Standard.id
Question.roomId === Room.id
```

If a client attempts to supply a mismatched hierarchy (e.g. Requesting 11th Chemistry Room 1 with 5th Tamil Chapter ID), the backend immediately rejects the request with `400 Bad Request: Invalid curriculum context`.

### 3.2 Strict No-Fallback Policy
- **If 0 questions are published for a room**: Return `[]` with status `NO_CONTENT`. The frontend cleanly renders `"No questions are configured for this mission yet."` with `[Back to Chapters]` navigation.
- **NEVER fallback to**:
  - Chemistry questions
  - Previous subject or standard questions
  - Random or demo questions
  - Another user's session questions

---

## 4. Generic Interactive Chapter Quiz Engine (`InteractiveQuizEngine.jsx`)
- **Capacity**: Dynamically loads up to 10 questions strictly belonging to the requested room.
- **Question Types**:
  - `MCQ` / `SINGLE_CHOICE`: Interactive options (A, B, C, D) with letter keys and submit validation.
  - `CALCULATION`: Formula/numeric input with unit badges.
  - `UNSUPPORTED`: Gracefully renders a warning banner and allows skipping without crashing.
- **Per-Question Hints**: The `💡 Hint` button strictly toggles `currentQuestion.hint` belonging to the active question.
- **Student Question Sanitization**: Authoritative answer keys (`correctAnswer`, `isCorrect`, `solutionKey`, `puzzleData.correctMapping`) are stripped from student responses by backend `toStudentQuestion()`.

---

## 5. Cache & User Isolation
- **User-Scoped Local Storage**: `chemescape:user:<userId>:learning-context` ensures switching accounts never leaks session state.
- **Cascading Reset on Navigation**:
  - Standard switch $\rightarrow$ Clears `subject`, `chapter`, `room`, `questions`, and `quizState`.
  - Subject switch $\rightarrow$ Clears `chapter`, `room`, `questions`, and `quizState`.
  - Chapter switch $\rightarrow$ Clears `room`, `questions`, and `quizState`.
  - Logout $\rightarrow$ Flushes all in-memory quiz states and user progress.
- **Room-Keyed Cache**: Questions are keyed strictly by `questions:<roomId>` to eliminate stale cross-mission questions.

---

## 6. Automated Test Suites & Verification

### Test Suite Execution Summary
| Suite | Scope | Result | Pass Rate |
| :--- | :--- | :---: | :---: |
| **`testSubjectContentMapping.js`** | 17 Comprehensive Subject & Hierarchy Tests | ✅ PASSED | **100% (17/17)** |
| **`testInteractiveQuizEngine.js`** | 14 Engine Dispatch & Question Isolation Tests | ✅ PASSED | **100% (14/14)** |
| **`testGameAvailability.js`** | 18 Game Availability & Anti-Tampering Tests | ✅ PASSED | **100% (18/18)** |
| **`testMasterE2E.js`** | 26 Full Playthrough, Progress & Anti-Cheat Tests | ✅ PASSED | **100% (26/26)** |
| **Frontend Production Build** | `npm run build` via Vite v8.2.1 | ✅ PASSED | **0 Errors** |

---

## 7. Verification Logs
```text
================================================================
🧪 CHEMESCAPE SUBJECT & CONTENT HIERARCHY MAPPING TEST SUITE
================================================================
✅ PASS | Test 1: Standard 5 Tamil Chapter 1 loads 10 authentic Tamil questions
✅ PASS | Test 2: Standard 5 English Chapter 1 loads 10 authentic English questions
✅ PASS | Test 3: Standard 5 Mathematics Chapter 1 loads 10 authentic Mathematics questions
✅ PASS | Test 4: Standard 5 Science Chapter 1 loads 10 authentic Science questions
✅ PASS | Test 5: Standard 5 Social Science Chapter 1 loads 10 authentic Social Science questions
✅ PASS | Test 6: Standard 11 Chemistry Room 1 preserves authentic Chemistry content
✅ PASS | Test 7: Standard 11 Physics rooms belong strictly to Physics without Chemistry leakage
✅ PASS | Test 8: No cross-subject questions exist between Tamil, Math, and Chemistry
✅ PASS | Test 9: No cross-standard content (Standard 5 never receives Standard 11 content)
✅ PASS | Test 10: No cross-chapter questions (All questions belong strictly to requested room)
✅ PASS | Test 11: Curriculum hierarchy mismatch is strictly rejected with 400 Bad Request
✅ PASS | Test 12: Unconfigured room returns empty array with 0 questions (No fallback to other subjects)
✅ PASS | Test 13: Insufficient content returns only the room's exact questions without borrowing
✅ PASS | Test 14: Authoritative answer keys and solutions are stripped from student responses
✅ PASS | Test 15: Each question maintains its own unique, question-specific hint
✅ PASS | Test 16: User progress is strictly isolated by userId and never shared between users
✅ PASS | Test 17: Room-keyed queries prevent stale question cache leakage between missions
================================================================
📊 SUBJECT & CONTENT MAPPING SUMMARY RESULTS: 17/17 PASSED (100%)
================================================================
```
