# ChemEscape Backend Chapter Module Documentation

## 1. Overview
The Chapter Module defines the curriculum learning progression under a specific **Standard** and **Subject** hierarchy. Every Chapter strictly belongs to one Standard and one Subject.

---

## 2. Hierarchy Architecture

```
Standard (e.g. Standard 4 / Standard 11)
  └── Subject (e.g. Mathematics / Chemistry)
        └── Chapter (e.g. Chapter 1, Chapter 2, Chapter 3)
              └── Topic
                    └── Room / Mission
                          └── Question / Game
```

---

## 3. Data Model (`prisma/schema.prisma`)

```prisma
model Chapter {
  id               String     @id @default(uuid())
  standardId       String
  subjectId        String
  title            String
  description      String?    @db.Text
  chapterNumber    Int
  difficulty       Difficulty @default(MEDIUM)
  estimatedMinutes Int        @default(30)
  xpReward         Int        @default(500)
  coinReward       Int        @default(100)
  badgeName        String?
  isLocked         Boolean    @default(false)
  isActive         Boolean    @default(true)
  displayOrder     Int        @default(0)
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  standard         Standard   @relation(fields: [standardId], references: [id], onDelete: Cascade)
  subject          Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  topics           Topic[]
  rooms            Room[]
  questions        Question[]
  progress         UserGameProgress[]

  @@unique([standardId, subjectId, chapterNumber])
  @@map("chapters")
}
```

---

## 4. Key Constraints & Business Rules

1. **Standard + Subject Ownership**:
   - Chapters are strictly scoped by both `standardId` and `subjectId`.
   - `chapterNumber` is unique per `(standardId, subjectId)` via `@@unique([standardId, subjectId, chapterNumber])`.
   - Different subjects or standards can independently have `Chapter 1`, `Chapter 2`, etc.

2. **StandardSubject Validation**:
   - Creating or requesting chapters for an unmapped standard + subject combination (e.g. Standard 4 + Chemistry) is rejected with `400 Bad Request` ("*Subject is not available for the selected standard.*").

3. **Deterministic Ordering**:
   - Chapters are sorted by `chapterNumber` / `displayOrder` in ascending order.

4. **Safe Archiving**:
   - Deletion performs a soft-archive (`isActive: false`) to preserve historical user game progress and foreign key relationships.

---

## 5. API Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/standards/:standardId/chapters` | `STUDENT`, `TEACHER`, `ADMIN` | Returns chapters for the selected Standard. |
| `GET` | `/api/standards/:standardId/chapters?subjectId=:subjectId` | `STUDENT`, `TEACHER`, `ADMIN` | Returns chapters for the selected Standard + Subject. |
| `GET` | `/api/chapters/:chapterId` | `STUDENT`, `TEACHER`, `ADMIN` | Returns student-safe chapter details with ownership verification. |
| `POST` | `/api/chapters` | `TEACHER`, `ADMIN` | Creates new chapter with Zod validation, mapping validation, and duplicate conflict checks. |
| `PUT` | `/api/chapters/:id` | `TEACHER`, `ADMIN` | Updates chapter details. |
| `DELETE` | `/api/chapters/:id` | `TEACHER`, `ADMIN` | Safely archives chapter (`isActive: false`). |

---

## 6. Validation (Zod)

Payload validation is handled by `src/validators/chapterValidator.js`:
- `standardId`: Non-empty string.
- `subjectId`: Non-empty string.
- `chapterNumber`: Positive integer ($> 0$).
- `title`: Non-empty string.
- `description`: Optional text.
- `difficulty`: Enum `['EASY', 'MEDIUM', 'HARD', 'EXPERT']`.
- `estimatedMinutes`: Positive integer.
- `xpReward`: Non-negative integer.
- `coinReward`: Non-negative integer.
- `badgeName`: Optional string.
- `isActive`: Boolean.

---

## 7. Role-Based Access Control (RBAC)

- **Students (`STUDENT`)**: Can view active chapters for valid Standard/Subject selections. Any mutation attempts (`POST`, `PUT`, `DELETE`) return `403 Forbidden`.
- **Teachers (`TEACHER`)**: Can create, update, and safely archive chapters.
- **Admins (`ADMIN`)**: Full administrative access.

---

## 8. Test Results (`src/utils/testChapterModule.js`)

```
====================================================
🧪 CHEMESCAPE CHAPTER MODULE COMPREHENSIVE TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/standards/:id/chapters blocked | Status: 401 (Expected: 401)
[PASS] 2. GET Standard 4 Mathematics chapters returns 3 chapters | Status: true (Expected: true) (Titles: Numbers & Counting, Fractions & Decimals, Basic Shapes & Geometry)
[PASS] 3. Chapters sorted deterministically by chapterNumber | Status: true (Expected: true)
[PASS] 4. GET Standard 11 Chemistry returns Periodic Table chapter (Ch 3) | Status: true (Expected: true)
[PASS] 5. Standard with no chapters returns 200 OK and empty array | Status: 200 (Expected: 200)
[PASS] 6. Invalid Standard-Subject combination rejected (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 7. GET /api/chapters/:id returns chapter details | Status: 200 (Expected: 200)
[PASS] 8. Context mismatch rejected (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 9. Student cannot POST /api/chapters (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 10. Student cannot PUT /api/chapters/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 11. Student cannot DELETE /api/chapters/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 12. Teacher cannot create chapter for unmapped subject (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 13. Duplicate chapter number within same standard+subject rejected (409 Conflict) | Status: 409 (Expected: 409)
[PASS] 14. Invalid chapterNumber <= 0 rejected by Zod (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 15. Teacher can update chapter (200 OK) | Status: 200 (Expected: 200)
[PASS] 16. Teacher can safely archive chapter (200 OK) | Status: 200 (Expected: 200)

TOTAL: 16 | PASSED: 16 | FAILED: 0
SUCCESS RATE: 100%
```

---

## 9. Backward Compatibility & Data Integrity
- 11th Standard Chemistry Chapter 3 ("Periodic Table") and its 6 topics, rooms, and questions are preserved.
- No tables were dropped; no destructive migrations executed.
- Student progress, game engines, and rooms continue to function without disruption.
