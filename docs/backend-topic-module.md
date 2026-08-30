# ChemEscape Backend Topic Module Documentation

## 1. Overview
The Topic Module represents the granular learning topics that belong to a single **Chapter** in the ChemEscape curriculum hierarchy.

---

## 2. Hierarchy Architecture

```
Standard (e.g. Standard 4 / Standard 11)
  └── Subject (e.g. Mathematics / Chemistry)
        └── Chapter (e.g. Chapter 2: Fractions / Chapter 3: Periodic Classification)
              └── Topic (e.g. Topic 1: Basic Fractions / Topic 1: Modern Periodic Law)
                    └── Room / Mission
                          └── Question / Game
```

---

## 3. Data Model (`prisma/schema.prisma`)

```prisma
model Topic {
  id          String   @id @default(uuid())
  chapterId   String
  title       String
  description String?  @db.Text
  orderNumber Int
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  questions   Question[]

  @@unique([chapterId, orderNumber])
  @@map("topics")
}
```

---

## 4. Key Constraints & Business Rules

1. **Strict Chapter Ownership**:
   - Every Topic belongs to exactly ONE Chapter (`chapterId`).
   - Same topic titles (e.g. "Introduction") can legitimately exist across different chapters without conflict.

2. **Per-Chapter Order Uniqueness**:
   - `orderNumber` is unique strictly within its parent chapter via `@@unique([chapterId, orderNumber])`.
   - Different chapters can each have `Topic 1`, `Topic 2`, etc. independently.

3. **Deterministic Ordering**:
   - Topics are always returned in deterministic ascending sequence by `orderNumber`.

4. **Safe Archiving**:
   - Deletions perform soft-archiving (`isActive: false`) to safeguard linked questions and user progression.

---

## 5. API Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/chapters/:chapterId/topics` | `STUDENT`, `TEACHER`, `ADMIN` | Returns active topics for the specified Chapter sorted by `orderNumber`. |
| `GET` | `/api/topics/:id` | `STUDENT`, `TEACHER`, `ADMIN` | Returns single topic details (with optional `?chapterId=` context validation). |
| `POST` | `/api/topics` | `TEACHER`, `ADMIN` | Creates new topic with Zod validation, chapter verification, and duplicate order checks. |
| `PUT` | `/api/topics/:id` | `TEACHER`, `ADMIN` | Updates topic title, description, or order. |
| `DELETE` | `/api/topics/:id` | `TEACHER`, `ADMIN` | Safely archives topic (`isActive: false`). |

---

## 6. Validation (Zod)

Payload validation is handled by `src/validators/topicValidator.js`:
- `chapterId`: Non-empty string.
- `title`: Non-empty string.
- `description`: Optional text.
- `orderNumber` / `displayOrder`: Positive integer ($> 0$).
- `isActive`: Boolean.

---

## 7. Role-Based Access Control (RBAC)

- **Students (`STUDENT`)**: Can view active topics for any valid chapter. Mutation attempts (`POST`, `PUT`, `DELETE`) return `403 Forbidden`.
- **Teachers (`TEACHER`)**: Can create, update, and safely archive topics.
- **Admins (`ADMIN`)**: Full administrative access.

---

## 8. Test Results (`src/utils/testTopicModule.js`)

```
====================================================
🧪 CHEMESCAPE TOPIC MODULE COMPREHENSIVE TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/chapters/:id/topics blocked | Status: 401 (Expected: 401)
[PASS] 2. GET 11th Chemistry topics returns 6 core topics | Status: true (Expected: true) (Count: 6)
[PASS] 3. Topics sorted deterministically by orderNumber | Status: true (Expected: true)
[PASS] 4. GET Standard 4 Math Ch 2 topics returns 3 topics | Status: true (Expected: true) (Titles: Basic Fractions, Equivalent Fractions, Comparing Fractions)
[PASS] 5. Chapter with no topics returns 200 OK and empty array | Status: 200 (Expected: 200)
[PASS] 6. Nonexistent chapter returns 404 Not Found | Status: 404 (Expected: 404)
[PASS] 7. GET /api/topics/:id returns topic details | Status: 200 (Expected: 200)
[PASS] 8. Context mismatch rejected (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 9. Student cannot POST /api/topics (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 10. Student cannot PUT /api/topics/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 11. Student cannot DELETE /api/topics/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 12. Duplicate topic order within same chapter rejected (409 Conflict) | Status: 409 (Expected: 409)
[PASS] 13. Nonexistent chapter creation rejected (404 Not Found) | Status: 404 (Expected: 404)
[PASS] 14. Teacher can update topic (200 OK) | Status: 200 (Expected: 200)
[PASS] 15. Teacher can safely archive topic (200 OK) | Status: 200 (Expected: 200)

TOTAL: 15 | PASSED: 15 | FAILED: 0
SUCCESS RATE: 100%
```

---

## 9. Backward Compatibility & Data Integrity
- Existing 11th Chemistry Chapter 3 topics (Modern Periodic Law, Groups & Periods, Periodic Trends, Atomic Radius, Ionization Energy, Electron Configuration) are preserved.
- Existing relations between Topics and Questions are preserved.
- No destructive migrations performed; Prisma schema validated cleanly.
