# Chapter Progression, Save & Unlock Architecture Flow

## 1. 10-Question Mission Lifecycle
The interactive quiz engine executes a strictly structured, server-validated 10-question flow for every supported Standard + Subject + Chapter:

$$\text{Select Standard/Subject/Chapter} \longrightarrow \text{Start Mission} \longrightarrow \text{Q1/10} \longrightarrow \dots \longrightarrow \text{Q10/10} \longrightarrow \text{Server Completion} \longrightarrow \text{Chapter Complete} \longrightarrow \text{Next Chapter Unlock}$$

### Key Milestones:
- **Questions Scoped to Current Room**: Only the 10 published questions belonging to the active room/mission are loaded (`room-tam5-1`, `room-math5-1`, etc.).
- **Progress Tracking**: Real-time counter (`Question 1 / 10` ... `Question 10 / 10`) and progress bar ($10\% \rightarrow 100\%$).
- **Zero Cross-Subject Substitution**: If a room has insufficient questions ($< 10$), the mission renders `"Mission content is incomplete."` and prevents false completions without borrowing content.

---

## 2. Answer Validation & Anti-Cheat
- **Option Evaluation**: Student selections are submitted and checked against the sanitized question data.
- **Correct Flow**: Awards XP, increments correct count, renders `✓ Correct!`, and unlocks the next question.
- **Wrong Flow**: Displays `✕ Incorrect`, tracks wrong count, decrements life if enabled, and enforces retry rules before mission completion.
- **Sanitized Secrets**: Student payloads never receive authoritative answer keys or solution mappings.

---

## 3. Hint Flow
- **Question-Specific Hints**: Clicking `💡 Hint` reveals only `currentQuestion.hint`.
- **Usage Tracking**: Increments `hintsUsed` without revealing the answer key or applying global fallback hints.

---

## 4. Progress Save & Mid-Game Persistence
- **Endpoint**: `POST /api/game/progress/:roomId/save`
- **Identity Enforcement**: Progress is bound strictly to `req.user.id` extracted from the verified JWT bearer token. Client-supplied `userId` parameters are discarded.

---

## 5. Completion & Server-Authoritative Rewards
- **Endpoint**: `POST /api/game/progress/:roomId/complete`
- **Payload**:
  ```json
  {
    "score": 1000,
    "stars": 3,
    "timeSpentSec": 180,
    "gameState": {
      "answeredQuestions": 10,
      "correctAnswers": 10,
      "wrongAnswers": 0,
      "hintsUsed": 1
    }
  }
  ```
- **Server Calculation**: The backend determines whether this is a first-time completion, awards XP and Coins accordingly, records high scores, and calculates star ratings.

---

## 6. Chapter Completion & Multi-Room Chapters
- **Room Resolution**: `chapterUnlockService.isChapterCompleted(userId, chapterId)` checks that every active room in the chapter is completed by `userId`.
- **Single-Room Chapter**: Completing Room 1 immediately marks the chapter as `COMPLETED`.
- **Multi-Room Chapter**: Chapter remains `IN_PROGRESS` until all required rooms are completed.

---

## 7. Unlock Rules & Scope
- **Chapter 1**: Always `UNLOCKED` by default for all users.
- **Chapter N+1**: Transitions from `LOCKED` to `UNLOCKED` once Chapter N reaches `COMPLETED`.
- **Chapter N+2**: Remains `LOCKED` until Chapter N+1 is completed.
- **Strict Scope**:
  - Completing Standard 5 Tamil Chapter 1 unlocks Standard 5 Tamil Chapter 2.
  - Does **not** unlock Standard 5 Mathematics Chapter 2 (Cross-subject isolation).
  - Does **not** unlock Standard 6 Tamil Chapter 2 (Cross-standard isolation).
- **Subject Mastery**: When all chapters of a subject are completed, the subject reports `mastered: true` and 100% progress.

---

## 8. User Isolation
- All database queries and fallback in-memory records are keyed by `userId + roomId`.
- User A's progress has zero influence on User B's unlocked status.

---

## 9. Duplicate Protection & Idempotency
- Double-clicking or retrying completion does not award duplicate XP, duplicate coins, duplicate badges, or duplicate unlocks.
- Repeat completions award 10% bonus XP, 0 coins, and preserve existing badge records.

---

## 10. Transaction Safety
- Database operations are wrapped in atomic transactions (`prisma.$transaction`) ensuring `userGameProgress`, `gameSession`, `userStats`, and `badge` updates succeed or fail atomically.

---

## 11. Error Handling & Offline Resilience
- If network connection is interrupted during completion, error handling preserves quiz state and allows `[Retry]` without data loss.
- Fallback in-memory progress caches preserve functionality during database connectivity interruptions.

---

## 12. Automated Test Verification Results

All automated test suites executed with **100% pass rates**:

| Suite | Scope | Result | Pass Rate |
| :--- | :--- | :---: | :---: |
| **`testChapterProgression.js`** | 15 Chapter Progression, Save & Unlock Tests | ✅ PASSED | **100% (15/15)** |
| **`testSubjectContentMapping.js`** | 17 Comprehensive Subject & Hierarchy Tests | ✅ PASSED | **100% (17/17)** |
| **`testMasterE2E.js`** | 26 Master E2E, Unit 1–6 Playthrough & Progress Tests | ✅ PASSED | **100% (26/26)** |
| **`testInteractiveQuizEngine.js`** | 14 Engine Dispatch & Question Isolation Tests | ✅ PASSED | **100% (14/14)** |
| **`testGameAvailability.js`** | 18 Game Availability & Anti-Tampering Tests | ✅ PASSED | **100% (18/18)** |
| **Frontend Production Build** | Vite v8.2.1 Production Build (`npm run build`) | ✅ PASSED | **0 Errors** |

### Detailed Chapter Progression Test Output:
```text
================================================================
🧪 CHEMESCAPE CHAPTER PROGRESSION & UNLOCK TEST SUITE
================================================================
✅ PASS | Test 1: New user Chapter 1 is UNLOCKED by default
✅ PASS | Test 2: Chapter 2 is LOCKED before completing Chapter 1
✅ PASS | Test 3: Complete Chapter 1 via 10 questions / room completion
✅ PASS | Test 4: Chapter 2 unlocks after Chapter 1 is COMPLETED
✅ PASS | Test 5: Chapter 3 remains LOCKED while Chapter 2 is not completed
✅ PASS | Test 6: User B Chapter 2 remains LOCKED (User progress isolation)
✅ PASS | Test 7: Cross-subject unlock blocked (Tamil/English completion never unlocks Math Chapter 2)
✅ PASS | Test 8: Cross-standard unlock blocked (Standard 5 completion does not unlock Standard 6 Chapter 2)
✅ PASS | Test 9: Duplicate completion is safe and idempotent (Returns 200 without error)
✅ PASS | Test 10: Completion reward not duplicated (0 coins on repeat completion)
✅ PASS | Test 11: Final chapter completion produces Subject Mastery (mastered: true, 100% progress)
✅ PASS | Test 12: Insufficient / empty room questions returns 0 questions and cannot falsely complete
✅ PASS | Test 13: Invalid room completion request is strictly rejected with 404 Not Found
✅ PASS | Test 14: Without successful chapter completion, Chapter 2 remains strictly LOCKED
✅ PASS | Test 15: User identity is derived strictly from JWT req.user.id, ignoring spoofed body userId
================================================================
📊 CHAPTER PROGRESSION SUMMARY: 15/15 PASSED (100%)
================================================================
```
