# ChemEscape Backend Room / Mission Module Documentation

## 1. Overview
The Room Module defines the **Missions and Game Stages** belonging to a specific **Chapter** in the ChemEscape learning hierarchy. Each Room connects curriculum objectives to an interactive Game Engine with customizable stage parameters.

---

## 2. Hierarchy Architecture

```
Standard (e.g. Standard 4 / Standard 11)
  └── Subject (e.g. Mathematics / Chemistry)
        └── Chapter (e.g. Chapter 2: Fractions / Chapter 3: Periodic Classification)
              └── Topic
                    └── Room / Mission (e.g. Room 1: Fraction Bakery / Room 1: Deconstruction Lab)
                          └── Question / Game Content
```

---

## 3. Data Model (`prisma/schema.prisma`)

```prisma
model Room {
  id               String             @id @default(uuid())
  chapterId        String
  roomNumber       Int
  name             String
  title            String?
  description      String?            @db.Text
  roomType         RoomType           @default(PUZZLE)
  gameType         GameType           @default(CALCULATION_HEIST)
  gameConfig       Json?
  difficulty       Difficulty         @default(MEDIUM)
  estimatedMinutes Int                @default(15)
  xpReward         Int                @default(100)
  coinReward       Int                @default(25)
  orderNumber      Int                @default(0)
  isActive         Boolean            @default(true)
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  chapter          Chapter            @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  questions        Question[]
  progress         UserGameProgress[]
  sessions         GameSession[]
  reward           GameReward?

  @@unique([chapterId, roomNumber])
  @@map("rooms")
}
```

---

## 4. Supported Game Types (`GameType` Enum)

| GameType Enum | Display Name | Category |
|---------------|--------------|----------|
| `CALCULATION_HEIST` | Calculation Heist | Arithmetic & Stoichiometric puzzle solving |
| `QUANTUM_ARCHITECT` | Quantum Architect | Electron orbital filling & atomic configuration |
| `GRID_RECONSTRUCTION` | Periodic Grid Reconstruction | Periodic table layout & element recovery |
| `HYDROGEN_REACTOR` | Hydrogen Reactor | Gas kinetics & nuclear/molecular stability |
| `METAL_SORTING` | Metal Sorting Challenge | Element property classification & reactivity |
| `GAS_SIMULATOR` | Gas Law Simulator | Pressure, Volume, and Temperature physics engine |
| `ENERGY_CORE` | Energy Core Reactor | Thermodynamics & enthalpy balancing |
| `EQUILIBRIUM_STABILIZER` | Equilibrium Stabilizer | Le Chatelier's principle & dynamic equilibrium |
| `PRECISION_MIXING` | Precision Solution Mixing | Molarity, dilution, and volumetric titration |
| `MOLECULAR_BUILDER` | Molecular Builder | 3D covalent bonding & Lewis structures |
| `CARBON_DETECTIVE` | Carbon Detective | Organic functional group identification |
| `REACTION_CIPHER` | Reaction Cipher Decoder | Chemical equation balancing cipher |
| `PETROCHEMICAL_PIPELINE` | Petrochemical Pipeline | Hydrocarbon distillation & polymerization |
| `STEREOCHEMICAL_VAULT` | Stereochemical Vault | Chirality, enantiomers, and isomerism |
| `ECOLOGICAL_STRATEGY` | Ecological Green Strategy | Environmental chemistry & waste reduction |

---

## 5. Key Constraints & Business Rules

1. **Chapter Ownership**:
   - Every Room strictly belongs to exactly ONE Chapter (`chapterId`).
   - `roomNumber` uniqueness is scoped strictly within the chapter via `@@unique([chapterId, roomNumber])`.
   - Different chapters can independently have `Room 1`, `Room 2`, etc.

2. **Deterministic Ordering**:
   - Rooms are always returned sorted by `roomNumber` ascending.

3. **Student Security & Answer Sanitization**:
   - When returning room details or configurations to students, server-side sanitization strips all answer keys and secret validation data (`expectedConfiguration`, `correctMapping`, `correctOrder`, `expectedCalculation`, `solutionKey`, `isCorrect`, `correctAnswer`).

4. **Safe Archiving**:
   - Deletions perform soft-archiving (`isActive: false`) to safeguard historical game sessions, badges, and progression data.

---

## 6. API Endpoints

| Method | Endpoint | Authorization | Description |
|--------|----------|---------------|-------------|
| `GET` | `/api/chapters/:chapterId/rooms` | `STUDENT`, `TEACHER`, `ADMIN` | Returns active rooms for the specified Chapter sorted by `roomNumber`. |
| `GET` | `/api/rooms/:id` | `STUDENT`, `TEACHER`, `ADMIN` | Returns single room details (with optional `?chapterId=` context validation and student sanitization). |
| `POST` | `/api/rooms` | `TEACHER`, `ADMIN` | Creates a new room with Zod validation, chapter verification, and duplicate room number checks. |
| `PUT` | `/api/rooms/:id` | `TEACHER`, `ADMIN` | Updates room metadata, difficulty, rewards, and game configuration. |
| `DELETE` | `/api/rooms/:id` | `TEACHER`, `ADMIN` | Safely archives room (`isActive: false`). |

---

## 7. Validation (Zod)

Payload validation is handled by `src/validators/roomValidator.js`:
- `chapterId`: Non-empty string.
- `roomNumber`: Positive integer ($> 0$).
- `name`: Non-empty string.
- `roomType`: Enum `['INTRO', 'PUZZLE', 'CHALLENGE', 'BOSS']`.
- `gameType`: Enum (15 supported GameTypes).
- `difficulty`: Enum `['EASY', 'MEDIUM', 'HARD', 'EXPERT']`.
- `estimatedMinutes` / `estimatedTime`: Positive integer ($> 0$).
- `xpReward`: Non-negative integer ($\ge 0$).
- `coinReward`: Non-negative integer ($\ge 0$).
- `gameConfig`: Valid JSON object / record.
- `isActive`: Boolean.

---

## 8. Role-Based Access Control (RBAC)

- **Students (`STUDENT`)**: Can view active rooms and start mission stages (`GET /api/chapters/:id/rooms` and `GET /api/rooms/:id`). Mutation attempts (`POST`, `PUT`, `DELETE`) return `403 Forbidden`.
- **Teachers (`TEACHER`)**: Can create, update, and safely archive rooms.
- **Admins (`ADMIN`)**: Full administrative access.

---

## 9. Test Results (`src/utils/testRoomModule.js`)

```
====================================================
🧪 CHEMESCAPE ROOM / MISSION MODULE COMPREHENSIVE TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/chapters/:id/rooms blocked | Status: 401 (Expected: 401)
[PASS] 2. GET 11th Chemistry rooms returns 6 mission rooms | Status: true (Expected: true) (Count: 6)
[PASS] 3. Rooms sorted deterministically by roomNumber | Status: true (Expected: true)
[PASS] 4. Rooms contain valid gameType and display information | Status: true (Expected: true)
[PASS] 5. GET Standard 4 Math Ch 2 rooms returns Fraction Bakery | Status: true (Expected: true)
[PASS] 6. Chapter with no rooms returns 200 OK and empty array | Status: 200 (Expected: 200)
[PASS] 7. Nonexistent chapter returns 404 Not Found | Status: 404 (Expected: 404)
[PASS] 8. GET /api/rooms/:id returns room details | Status: 200 (Expected: 200)
[PASS] 9. Context mismatch rejected (400 Bad Request) | Status: 400 (Expected: 400)
[PASS] 10. Student room response sanitizes answer keys and secrets | Status: true (Expected: true)
[PASS] 11. Student cannot POST /api/rooms (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 12. Student cannot PUT /api/rooms/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 13. Student cannot DELETE /api/rooms/:id (403 Forbidden) | Status: 403 (Expected: 403)
[PASS] 14. Duplicate room number within same chapter rejected (409 Conflict) | Status: 409 (Expected: 409)
[PASS] 15. Nonexistent chapter creation rejected (404 Not Found) | Status: 404 (Expected: 404)
[PASS] 16. Teacher can update room (200 OK) | Status: 200 (Expected: 200)
[PASS] 17. Teacher can safely archive room (200 OK) | Status: 200 (Expected: 200)

TOTAL: 17 | PASSED: 17 | FAILED: 0
SUCCESS RATE: 100%
```

---

## 10. Backward Compatibility & Data Integrity
- Existing 11th Chemistry Chapter 3 rooms (Units 1 to 6) and Chapter 6 gas simulation room are preserved with all engine configurations.
- Relations to `Question`, `UserGameProgress`, `GameSession`, and `GameReward` are preserved.
- No destructive migrations performed; Prisma schema validated cleanly.
