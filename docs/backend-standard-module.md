# ChemEscape Backend Standard Module Documentation

## 1. Overview
The Standard Module provides a generic, centralized, and role-protected foundation for managing educational standards/grades ($4^{\text{th}}$ to $12^{\text{th}}$ Standard) in the ChemEscape platform.

---

## 2. Existing vs. Updated Standard Model

### Original Model (`prisma/schema.prisma`):
```prisma
model Standard {
  id          String   @id @default(uuid())
  name        String   @unique // e.g. "11", "12"
  displayName String   // e.g. "11th Standard"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subjects    StandardSubject[]
  chapters    Chapter[]

  @@map("standards")
}
```

### Enhanced Model:
```prisma
model Standard {
  id           String   @id @default(uuid())
  grade        Int?     @unique // e.g. 4, 5, 6, 7, 8, 9, 10, 11, 12
  name         String   @unique // e.g. "4", "5", ..., "11", "12"
  displayName  String   // e.g. "4th Standard", "11th Standard"
  description  String?  @db.Text
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  subjects     StandardSubject[]
  chapters     Chapter[]

  @@map("standards")
}
```

---

## 3. API Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/standards` | `STUDENT`, `TEACHER`, `ADMIN` | Returns all active standards sorted by `displayOrder` ascending. |
| `GET` | `/api/standards/:id` | `STUDENT`, `TEACHER`, `ADMIN` | Returns a specific standard by ID, Grade, or Name. |
| `POST` | `/api/standards` | `TEACHER`, `ADMIN` | Creates a new standard with Zod payload validation & duplicate prevention. |
| `PUT` | `/api/standards/:id` | `TEACHER`, `ADMIN` | Updates an existing standard. |
| `DELETE` | `/api/standards/:id` | `ADMIN` | Deletes a standard. |
| `GET` | `/api/standards/:standardId/subjects` | `STUDENT`, `TEACHER`, `ADMIN` | Backward compatible: returns subjects associated with standard. |
| `GET` | `/api/standards/:standardId/chapters` | `STUDENT`, `TEACHER`, `ADMIN` | Backward compatible: returns chapters associated with standard. |

---

## 4. Validation (Zod)

Payload validation is handled by `src/validators/standardValidator.js`:
- `grade`: Integer between $4$ and $12$.
- `name`: Non-empty trimmed string.
- `displayName`: Non-empty trimmed string.
- `description`: Optional text.
- `displayOrder`: Non-negative integer.
- `isActive`: Boolean.

---

## 5. Seed Results

The Prisma seed script (`backend/prisma/seed.js`) upserts all 9 standards idempotently without creating duplicate entries:

| Grade | Name | Display Name | Display Order | Status |
|-------|------|--------------|---------------|--------|
| 4 | `4` | 4th Standard | 1 | Active |
| 5 | `5` | 5th Standard | 2 | Active |
| 6 | `6` | 6th Standard | 3 | Active |
| 7 | `7` | 7th Standard | 4 | Active |
| 8 | `8` | 8th Standard | 5 | Active |
| 9 | `9` | 9th Standard | 6 | Active |
| 10 | `10` | 10th Standard | 7 | Active |
| 11 | `11` | 11th Standard | 8 | Active (Preserved with Chemistry content) |
| 12 | `12` | 12th Standard | 9 | Active (Preserved) |

---

## 6. Role-Based Access Control (RBAC)

- **Student (`STUDENT`)**: Can read active standards (`GET /api/standards`). Mutation attempts (`POST`, `PUT`, `DELETE`) return `403 Forbidden`.
- **Teacher (`TEACHER`)**: Can read and create/update standards (`GET`, `POST`, `PUT`).
- **Admin (`ADMIN`)**: Full access including deletion (`DELETE`).

---

## 7. Test Results (`src/utils/testStandardModule.js`)

```
====================================================
🧪 CHEMESCAPE STANDARD MODULE COMPREHENSIVE TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/standards blocked | Status: 401 (Expected: 401)
[PASS] 2. Student can GET /api/standards | Status: 200 (Expected: 200)
[PASS] 3. Returns 9 standards (Grades 4-12) | Status: true (Expected: true) (Count: 9)
[PASS] 4. Standards sorted by displayOrder ascending | Status: true (Expected: true)
[PASS] 5. Only active standards returned | Status: true (Expected: true)
[PASS] 6. All grades 4th to 12th present | Status: true (Expected: true) (Found grades: 4, 5, 6, 7, 8, 9, 10, 11, 12)
[PASS] 7. Student cannot POST /api/standards (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 8. Student cannot PUT /api/standards/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 9. Student cannot DELETE /api/standards/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 10. Invalid grade rejected by Zod (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 11. Duplicate standard rejected (409 Conflict) | Status: 409 (Expected: 409)
[PASS] 12. GET /api/standards/11 returns 11th Standard | Status: 200 (Expected: 200)
[PASS] 13. GET /api/standards/12 returns 12th Standard | Status: 200 (Expected: 200)
[PASS] 14. Backward Compatibility: GET /api/standards/11/subjects | Status: 200 (Expected: 200)
[PASS] 15. Backward Compatibility: GET /api/standards/11/chapters | Status: 200 (Expected: 200)

TOTAL: 15 | PASSED: 15 | FAILED: 0
SUCCESS RATE: 100%
```

---

## 8. Migration Status & Safety
- Validated with `npx prisma validate` $\to$ Valid.
- Generated with `npx prisma generate` $\to$ Generated successfully.
- No existing tables dropped, no reset performed. Backward compatibility fully preserved for 11th and 12th Chemistry modules.
