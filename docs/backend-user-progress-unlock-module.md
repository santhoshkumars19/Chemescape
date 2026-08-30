# ChemEscape Backend User Progress + Chapter Unlock Module Documentation

## 1. Overview
The User Progress & Chapter Unlock Module provides server-authoritative, user-isolated tracking of student gameplay, room completions, chapter unlocking, and badge/XP reward distributions across all supported Standards (4–12) and Subjects.

---

## 2. Core Ownership & Security Rules

1. **Server-Derived Identity**:
   - Every user-specific query, session creation, game save, and game completion strictly uses `req.user.id` derived from the verified JWT payload.
   - Any client-supplied user identifier (`req.body.userId`, `req.query.userId`, `req.params.userId`, headers, or localStorage) is strictly ignored.
2. **User Isolation**:
   - User A's gameplay progress, sessions, badges, and unlock statuses are completely isolated from User B.
   - Query parameter attacks (e.g. `GET /api/game/progress?userId=victim`) return only the authenticated caller's statistics.
   - Body injection attacks (e.g. `POST /api/game/progress/:roomId/complete` with `userId: victim`) do not modify the victim's data.

---

## 3. Data Architecture (`prisma/schema.prisma`)

```prisma
model UserGameProgress {
  id           String   @id @default(uuid())
  userId       String
  chapterId    String
  roomId       String
  highScore    Int      @default(0)
  starsEarned  Int      @default(0) // 0 to 3
  attempts     Int      @default(0)
  bestTimeSec  Int?
  isCompleted  Boolean  @default(false)
  gameState    Json?    // Resumable state
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  chapter      Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  room         Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@unique([userId, roomId])
  @@map("user_game_progress")
}

model GameSession {
  id             String        @id @default(uuid())
  userId         String
  roomId         String
  status         SessionStatus @default(ACTIVE)
  score          Int           @default(0)
  stars          Int           @default(0)
  livesRemaining Int           @default(3)
  startedAt      DateTime      @default(now())
  completedAt    DateTime?
  timeSpentSec   Int           @default(0)
  sessionState   Json?

  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  room           Room          @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([roomId])
  @@map("game_sessions")
}

model UserStats {
  id            String   @id @default(uuid())
  userId        String   @unique
  totalXP       Int      @default(0)
  totalCoins    Int      @default(0)
  currentLevel  Int      @default(1)
  currentStreak Int      @default(1)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_stats")
}

model UserBadge {
  id               String   @id @default(uuid())
  userId           String
  badgeName        String
  badgeDescription String?  @db.Text
  badgeIcon        String?  @default("🏆")
  unlockedAt       DateTime @default(now())

  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeName])
  @@map("user_badges")
}
```

---

## 4. Chapter Unlock & Progression Engine (`chapterUnlockService.js`)

### A. Sequential Unlocking
1. **First Active Chapter**: For any valid Standard + Subject combination, Chapter 1 (or lowest `chapterNumber`/`displayOrder`) is always `UNLOCKED` by default for a new user.
2. **Subsequent Chapters ($N > 1$)**: Chapter $N$ is `UNLOCKED` if and only if Chapter $N-1$ is `COMPLETED` by the authenticated user in the same Standard and Subject.
3. **Multi-Room Chapter Completion**: A chapter is marked `COMPLETED` only when all required active rooms inside that chapter have `isCompleted: true` for that user.

### B. Progression Scope & Isolation
- **Cross-Subject Isolation**: Completing Standard 4 Mathematics Chapter 1 never unlocks Standard 4 Science Chapter 2.
- **Cross-Standard Isolation**: Completing Standard 4 Mathematics Chapter 1 never unlocks Standard 11 Chemistry Chapter 2.
- **Subject Mastery**: When all active chapters in a `(Standard, Subject)` scope are completed by the user, `mastered: true` is returned.

---

## 5. Server-Authoritative Rewards, Transactions & Idempotency

- **Reward Calculations**: XP, Coins, and Badges are calculated exclusively on the server. Client-provided XP or coins are ignored.
- **Prisma Transactions (`$transaction`)**:
  - Updates `UserGameProgress` (sets `isCompleted: true`, updates high score and stars).
  - Updates `GameSession` status to `COMPLETED`.
  - Increments `UserStats` total XP, coins, and calculates new level.
  - Awards `UserBadge` with `@@unique([userId, badgeName])` ensuring no duplicate badges.
- **Duplicate Completion Policy**:
  - First-time completion: 100% XP reward, full coin reward, and unlocks chapter badge.
  - Repeat play / re-clear: 10% bonus XP, 0 repeat coins, 0 duplicate badges.

---

## 6. API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/game/unlocked?standardId=&subjectId=` | `STUDENT`, `TEACHER`, `ADMIN` | Returns sequential chapter unlock status, completion percentage, and subject mastery for caller. |
| `GET` | `/api/game/progress` | `STUDENT`, `TEACHER`, `ADMIN` | Returns aggregated gameplay statistics (XP, level, coins, completed rooms, badges). |
| `GET` | `/api/game/progress/:roomId` | `STUDENT`, `TEACHER`, `ADMIN` | Returns caller's specific room progress and active session. |
| `POST` | `/api/game/progress/:roomId/start` | `STUDENT`, `TEACHER`, `ADMIN` | Starts or resumes an active game session for caller. |
| `POST` | `/api/game/progress/:roomId/save` | `STUDENT`, `TEACHER`, `ADMIN` | Saves mid-game progress (score, lives, state). |
| `POST` | `/api/game/progress/:roomId/complete` | `STUDENT`, `TEACHER`, `ADMIN` | Atomically completes room, awards server rewards, and triggers next chapter unlock. |
| `POST` | `/api/game/progress/:roomId/fail` | `STUDENT`, `TEACHER`, `ADMIN` | Records failed attempt without unlocking chapters or completing rooms. |

---

## 7. Test Results (`testUserProgressUnlock.js`)

```
====================================================
🧪 CHEMESCAPE USER PROGRESS & CHAPTER UNLOCK TEST SUITE
====================================================

[PASS] 1. Unauthenticated GET /api/game/unlocked blocked (401) | Status: 401 (Expected: 401) 
[PASS] 2. New user: Chapter 1 is UNLOCKED | Status: true (Expected: true) 
[PASS] 3. New user: Chapter 2 and 3 are LOCKED | Status: true (Expected: true) 
[PASS] 4. User A can start game session | Status: 200 (Expected: 200) 
[PASS] 5. User A can save mid-game progress | Status: 200 (Expected: 200) 
[PASS] 6. User A completes Chapter 1 Room (200 OK) | Status: 200 (Expected: 200) 
[PASS] 7. User A: Chapter 1 is COMPLETED and Chapter 2 is UNLOCKED | Status: true (Expected: true) 
[PASS] 8. User B Isolation: Chapter 2 remains LOCKED for User B | Status: true (Expected: true) 
[PASS] 9. Client-supplied userId in body is strictly ignored | Status: true (Expected: true) 
[PASS] 10. Query param ?userId= attack ignored (returns caller stats) | Status: 0 (Expected: 0) 
[PASS] 11. Cross-Subject Isolation: Math completion does not unlock Science | Status: true (Expected: true) 
[PASS] 12. Cross-Standard Isolation: Std 4 completion does not unlock Std 11 | Status: true (Expected: true) 
[PASS] 13. Idempotency: Repeat completion awards 0 repeat coins and no duplicate badge | Status: false (Expected: false) 
[PASS] 14. Game fail records attempt without completing room | Status: FAILED (Expected: FAILED) 
[PASS] 15. Failed room does not unlock next chapter | Status: true (Expected: true) 
[PASS] 16. Unmapped Standard-Subject combination rejected (400 Bad Request) | Status: 400 (Expected: 400) 
[PASS] 17. Concurrent completion requests handled safely without errors | Status: 200 (Expected: 200) 
[PASS] 18. Invalid or expired token rejected (401 Unauthorized) | Status: 401 (Expected: 401) 

====================================================
📊 USER PROGRESS & CHAPTER UNLOCK TEST SUMMARY
====================================================
TOTAL: 18 | PASSED: 18 | FAILED: 0
SUCCESS RATE: 100%
```
