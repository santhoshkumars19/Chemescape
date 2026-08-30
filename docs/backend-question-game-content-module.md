# ChemEscape Backend Question / Game Content Module Documentation

## 1. Overview
The Question / Game Content Module represents the interactive curriculum content, questions, and puzzle configurations linked to **Rooms** and **Topics**. The system is generic and supports all curriculum disciplines (Mathematics, Science, English, Tamil, Social Science, Physics, Chemistry, Biology, Computer Science).

---

## 2. Hierarchy Architecture

```
Standard (e.g. Standard 4 / Standard 11)
  └── Subject (e.g. Mathematics / Chemistry)
        └── Chapter (e.g. Chapter 2: Fractions / Chapter 3: Periodic Classification)
              └── Topic (e.g. Topic 1: Basic Fractions / Topic 1: Modern Periodic Law)
                    └── Room / Mission (e.g. Room 1: Fraction Bakery / Room 1: Deconstruction Lab)
                          └── Question / Game Content
                                └── Question Options / Puzzle Data
```

---

## 3. Data Models (`prisma/schema.prisma`)

```prisma
model Question {
  id             String         @id @default(uuid())
  chapterId      String
  topicId        String?
  roomId         String?
  questionNumber Int            @default(1)
  displayOrder   Int            @default(0)
  questionText   String         @db.Text
  description    String?        @db.Text
  questionType   QuestionType   @default(MCQ)
  difficulty     Difficulty     @default(MEDIUM)
  points         Int            @default(100)
  timeLimit      Int?           @default(60) // in seconds
  hint           String?        @db.Text
  explanation    String?        @db.Text
  puzzleData     Json?          // JSON data for DRAG_DROP, MATCHING, ELECTRON_CONFIG, ORDERING, CALCULATION, SIMULATION, etc.
  status         QuestionStatus @default(PUBLISHED)
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  chapter        Chapter        @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  topic          Topic?         @relation(fields: [topicId], references: [id], onDelete: SetNull)
  room           Room?          @relation(fields: [roomId], references: [id], onDelete: SetNull)
  options        QuestionOption[]

  @@map("questions")
}

model QuestionOption {
  id           String   @id @default(uuid())
  questionId   String
  optionKey    String?
  optionText   String   @db.Text
  optionValue  String?
  isCorrect    Boolean  @default(false)
  orderNumber  Int      @default(0)
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)

  question     Question @relation(fields: [questionId], references: [id], onDelete: Cascade)

  @@map("question_options")
}
```

---

## 4. Supported Question Types

| Type | Description | Answer Data Structure (Server-Only) |
|------|-------------|-------------------------------------|
| `MCQ` | Standard Multiple Choice Question | `options[].isCorrect: true/false` |
| `CALCULATION` | Numerical calculation with tolerance & units | `puzzleData.expectedCalculation`, `expectedValue` |
| `DRAG_DROP` | Drag elements/cards into target zones | `puzzleData.correctMapping` |
| `MATCHING` | Pairwise relation matching | `puzzleData.correctMapping` |
| `ORDERING` | Sequence rearrangement | `puzzleData.correctOrder` |
| `IDENTIFY` | Visual / concept identification | `puzzleData.solutionKey` |
| `ELECTRON_CONFIGURATION` | Subshell electron filling | `puzzleData.expectedConfiguration` |
| `SIMULATION` | Physics / chemistry parameter balance | `puzzleData.expectedVolume`, `targetPressure`, `tolerance` |
| `BOSS` | Multi-stage boss encounter challenge | Room engine state machine |

---

## 5. Security & Student Answer Protection

When questions are returned to students via `GET /api/rooms/:roomId/questions` or `GET /api/questions/:id`:
- **All `isCorrect` fields** are stripped from `options`.
- **All answer/solution keys** (`correctMapping`, `correctOrder`, `expectedConfiguration`, `expectedCalculation`, `expectedValue`, `solutionKey`, `correctAnswer`, `answerKey`, `solution`, `targetState`, `teacherNotes`) are stripped from `puzzleData`.
- **Explanation** is omitted from initial payloads so solutions are not spoiled before completion.

---

## 6. Role-Based Access Control (RBAC)

- **Students (`STUDENT`)**: Read-only access to published, active questions (`GET /api/rooms/:id/questions` and `GET /api/questions/:id`). Mutation attempts (`POST`, `PUT`, `DELETE`) return `403 Forbidden`.
- **Teachers (`TEACHER`)**: Full content management (create questions, update text, edit correct answers, configure puzzle data, archive questions).
- **Admins (`ADMIN`)**: Full administrative access.

---

## 7. API Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/rooms/:roomId/questions` | `STUDENT`, `TEACHER`, `ADMIN` | Returns questions for a specific Room (sanitized for students, complete for teachers). |
| `GET` | `/api/questions` | `TEACHER`, `ADMIN` | Search & filter questions across Standards, Subjects, Chapters, Topics, Rooms, and Status. |
| `GET` | `/api/questions/:id` | `STUDENT`, `TEACHER`, `ADMIN` | Single question lookup with role-based answer protection. |
| `POST` | `/api/questions` | `TEACHER`, `ADMIN` | Creates new question with Zod validation, publish rules, and duplicate check. |
| `PUT` | `/api/questions/:id` | `TEACHER`, `ADMIN` | Updates question text, difficulty, points, options, or correct answers. |
| `DELETE` | `/api/questions/:id` | `TEACHER`, `ADMIN` | Soft-archives question (`status: ARCHIVED`, `isActive: false`). |

---

## 8. Test Suite Verification (`src/utils/testQuestionModule.js`)

```
====================================================
🧪 CHEMESCAPE QUESTION / GAME CONTENT MODULE TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/rooms/:id/questions blocked | Status: 401 (Expected: 401)
[PASS] 2. Student can GET published questions for Room 1 | Status: true (Expected: true)
[PASS] 3. Questions sorted deterministically by questionNumber | Status: true (Expected: true)
[PASS] 4. Student question response strictly sanitizes all answer keys | Status: false (Expected: false)
[PASS] 5. Teacher can create MCQ question (201 Created) | Status: 201 (Expected: 201)
[PASS] 6. Teacher can create Calculation question (201 Created) | Status: 201 (Expected: 201)
[PASS] 7. Teacher can create Drag & Drop question (201 Created) | Status: 201 (Expected: 201)
[PASS] 8. Teacher can create Matching question (201 Created) | Status: 201 (Expected: 201)
[PASS] 9. Teacher can create Ordering question (201 Created) | Status: 201 (Expected: 201)
[PASS] 10. Teacher can create Electron Configuration question (201 Created) | Status: 201 (Expected: 201)
[PASS] 11. Teacher can create Simulation question (201 Created) | Status: 201 (Expected: 201)
[PASS] 12. Duplicate question number in same room rejected (409 Conflict) | Status: 409 (Expected: 409)
[PASS] 13. Nonexistent room question creation rejected (404 Not Found) | Status: 404 (Expected: 404)
[PASS] 14. Topic from different chapter rejected (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 15. Student cannot POST /api/questions (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 16. Student cannot PUT /api/questions/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 17. Student cannot DELETE /api/questions/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 18. Teacher can update question and correct answer (200 OK) | Status: 200 (Expected: 200)
[PASS] 19. Student receives updated question without answer key leaks | Status: true (Expected: true)
[PASS] 20. Teacher can safely archive question (200 OK) | Status: 200 (Expected: 200)

TOTAL: 20 | PASSED: 20 | FAILED: 0
SUCCESS RATE: 100%
```

---

## 9. Backward Compatibility & Data Integrity
- All existing questions for 11th Chemistry Units 1 to 6 are preserved.
- Existing relations with `Room`, `Topic`, and `Chapter` remain intact.
- No destructive migrations performed; Prisma schema validated cleanly.
