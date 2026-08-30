# ChemEscape Backend Subject Module Documentation

## 1. Overview
The Subject Module manages curriculum subjects and their many-to-many relationship with standards via the `StandardSubject` entity in ChemEscape.

---

## 2. Data Architecture

```
Standard (1) ────────< StandardSubject (N) >──────── (1) Subject
                       ├── displayOrder
                       └── createdAt
```

### Models (`prisma/schema.prisma`):

```prisma
model Subject {
  id           String   @id @default(uuid())
  name         String   // e.g. "Chemistry", "Mathematics"
  code         String   @unique // e.g. "CHEM", "MATH", "TAMIL", "ENG", "SCI", "SOCIAL", "PHY", "BIO", "CS"
  description  String?  @db.Text
  icon         String?  @default("🧪")
  displayOrder Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  standards    StandardSubject[]
  chapters     Chapter[]

  @@map("subjects")
}

model StandardSubject {
  id           String   @id @default(uuid())
  standardId   String
  subjectId    String
  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())

  standard     Standard @relation(fields: [standardId], references: [id], onDelete: Cascade)
  subject      Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)

  @@unique([standardId, subjectId])
  @@map("standard_subjects")
}
```

---

## 3. Supported Subject Definitions

| Code | Subject Name | Icon | Display Order | Status | Description |
|------|--------------|------|---------------|--------|-------------|
| `TAMIL` | Tamil | 📚 | 1 | Active | Language and Literature |
| `ENG` | English | 📖 | 2 | Active | English Language and Grammar |
| `MATH` | Mathematics | 📐 | 3 | Active | Mathematics and Problem Solving |
| `SCI` | Science | 🔬 | 4 | Active | General Science, Physics, Chemistry, Biology |
| `SOCIAL` | Social Science | 🌍 | 5 | Active | History, Geography, Civics, Economics |
| `PHY` | Physics | ⚡ | 1 | Active | Higher Secondary Mechanics, Electromagnetism, Optics |
| `CHEM` | Chemistry | 🧪 | 2 | Active | **Existing Chemistry preserved** |
| `BIO` | Biology | 🧬 | 4 | Active | Higher Secondary Botany and Zoology |
| `CS` | Computer Science | 💻 | 5 | Active | Programming, Data Structures, Python |

---

## 4. StandardSubject Structural Mappings

### Primary & Middle & Secondary (Standards 4 to 10):
1. **Tamil** (`TAMIL`)
2. **English** (`ENG`)
3. **Mathematics** (`MATH`)
4. **Science** (`SCI`)
5. **Social Science** (`SOCIAL`)

> Note: Standards 4–10 do **not** receive senior secondary subjects (Physics, Chemistry, Biology, Computer Science).

### Higher Secondary (Standards 11 and 12):
1. **Physics** (`PHY`)
2. **Chemistry** (`CHEM`)
3. **Mathematics** (`MATH`)
4. **Biology** (`BIO`)
5. **Computer Science** (`CS`)

---

## 5. API Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/standards/:standardId/subjects` | `STUDENT`, `TEACHER`, `ADMIN` | Returns active subjects mapped to the specified standard sorted by `displayOrder`. |
| `GET` | `/api/subjects` | `STUDENT`, `TEACHER`, `ADMIN` | Returns all active subject definitions. |
| `GET` | `/api/subjects/:id` | `STUDENT`, `TEACHER`, `ADMIN` | Returns single subject by ID or Code. |
| `POST` | `/api/subjects` | `TEACHER`, `ADMIN` | Creates new subject definition (Zod validated, unique code/name). |
| `PUT` | `/api/subjects/:id` | `TEACHER`, `ADMIN` | Updates existing subject definition. |
| `DELETE` | `/api/subjects/:id` | `ADMIN` | Deletes subject definition. |
| `POST` | `/api/subjects/map` | `TEACHER`, `ADMIN` | Maps subject to standard (`409` on duplicate mapping). |
| `DELETE` | `/api/subjects/map` | `TEACHER`, `ADMIN` | Unmaps subject from standard. |

---

## 6. Role-Based Access Control (RBAC)

- **Student (`STUDENT`)**: Can query `GET /api/standards/:standardId/subjects` and `GET /api/subjects`. Mutation endpoints return `403 Forbidden`.
- **Teacher (`TEACHER`)**: Can read, create, and update subjects and standard mappings (`GET`, `POST`, `PUT`, `POST /map`, `DELETE /map`).
- **Admin (`ADMIN`)**: Full administrative access including subject deletion (`DELETE`).

---

## 7. Validation (Zod)

Payload validation is handled by `src/validators/subjectValidator.js`:
- `name`: Non-empty string.
- `code`: Non-empty uppercase unique string.
- `displayOrder`: Non-negative integer.
- `isActive`: Boolean.
- `mapStandardSubjectSchema`: Requires valid `standardId` and `subjectId`.

---

## 8. Test Results (`src/utils/testSubjectModule.js`)

```
====================================================
🧪 CHEMESCAPE SUBJECT MODULE COMPREHENSIVE TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/standards/:id/subjects blocked | Status: 401 (Expected: 401)
[PASS] 2. GET /api/standards/4/subjects returns 5 primary subjects | Status: true (Expected: true) (Got: TAMIL, ENG, MATH, SCI, SOCIAL)
[PASS] 3. Standard 4 does NOT contain Chemistry or Physics | Status: true (Expected: true)
[PASS] 4. GET /api/standards/11/subjects returns 5 senior secondary subjects | Status: true (Expected: true) (Got: PHY, CHEM, MATH, BIO, CS)
[PASS] 5. Standard 11 includes existing Chemistry (CHEM) | Status: true (Expected: true)
[PASS] 6. GET /api/standards/12/subjects returns 5 senior secondary subjects | Status: true (Expected: true) (Got: PHY, CHEM, MATH, BIO, CS)
[PASS] 7. Invalid Standard returns 404 Not Found | Status: 404 (Expected: 404)
[PASS] 8. Standard 4 subjects sorted by displayOrder | Status: true (Expected: true) (Got: Tamil, English, Mathematics, Science, Social Science)
[PASS] 9. Student cannot POST /api/subjects (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 10. Student cannot POST /api/subjects/map (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 11. Student cannot PUT /api/subjects/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 12. Student cannot DELETE /api/subjects/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 13. Duplicate subject code/name rejected (409 Conflict) | Status: 409 (Expected: 409)
[PASS] 14. Invalid payload rejected by Zod (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 15. GET /api/subjects returns all active subject definitions | Status: 200 (Expected: 200) (Total: 9)

TOTAL: 15 | PASSED: 15 | FAILED: 0
SUCCESS RATE: 100%
```
