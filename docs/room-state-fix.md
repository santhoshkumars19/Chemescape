# ChemEscape — Room State Resolution & Curriculum Isolation Architecture

## 1. Overview & Root Cause Diagnosis

### The Issue
Students selecting Standard 4 subjects (Tamil, English, Mathematics, Science, Social Science) Chapter 1 occasionally experienced a `"No questions are configured for this mission yet"` screen upon starting missions, despite the database possessing all 10 questions per subject.

### Root Cause
1. **Hardcoded Initial Room State**: `NavigationContext.jsx` had initialized `const [currentRoom, setCurrentRoomRaw] = useState('room1');` with `'room1'` (a Standard 11 Chemistry room).
2. **Stale Room ID Resolution**: In `InteractiveQuizEngine.jsx`, `targetRoomId` defaulted to `selectedRoomId || currentRoom`. Because `currentRoom` had `'room1'` as default in memory, the quiz engine attempted to fetch questions from `GET /api/rooms/room1/questions` under the Standard 4 chapter context (`ch-soc4-1`, `ch-tam4-1`, etc.).
3. **Strict Backend Hierarchy Isolation**: The backend anti-tamper security guard rejected the mismatched room query (`400/404`), returning an empty question list to the frontend.

---

## 2. Architectural Fixes & Hardening

### A. Safe Initial State
`NavigationContext.jsx` now initializes `currentRoom` and `selectedRoomId` strictly to `null`:
```javascript
const [selectedRoomId, setSelectedRoomIdRaw] = useState(null);
const [currentRoom, setCurrentRoomRaw]       = useState(null);
```

### B. Cascade-Safe State Reset Rules
Whenever a student switches context in the curriculum hierarchy, all downstream state is atomically reset to `null`:
- **Standard Switch**: Clears `selectedSubjectId`, `selectedSubject`, `selectedChapterId`, `selectedChapter`, `selectedRoomId`, `currentRoom`.
- **Subject Switch**: Clears `selectedChapterId`, `selectedChapter`, `selectedRoomId`, `currentRoom`.
- **Chapter Switch**: Clears `selectedRoomId`, `currentRoom`.
- **Room Switch**: Clears active question and quiz state.
- **Logout**: Clears all syllabus selections, room IDs, and user progress state.

### C. Authoritative Room Resolution Strategy
In `InteractiveQuizEngine.jsx`, `loadMissionQuestions()` resolves rooms deterministically:
1. **Primary**: Query `roomService.getRoomsByChapter(activeChapter.id)` to obtain the room(s) belonging to that exact chapter.
2. **Matching**: If `selectedRoomId` is provided, verify it belongs to the chapter's rooms; otherwise use the chapter's primary generic quiz room.
3. **Deterministic Fallback**: In offline resilience, convert standard chapter ID prefix to room ID prefix (`ch-soc4-1` $\rightarrow$ `room-soc4-1`).
4. **State Storage**: Store the resolved room in `loadedRoomId` state for downstream score submission and chapter progression recording.

---

## 3. Verified Standard 4 Question Availability

| Standard 4 Subject | Chapter 1 ID & Title | Authoritative Room ID | DB Questions | API Questions | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Tamil** | `ch-tam4-1` (அன்னைத் தமிழே) | `room-tam4-1` | 10 | 10 | ✅ READY |
| **English** | `ch-eng4-1` (A Feast for Rats) | `room-eng4-1` | 10 | 10 | ✅ READY |
| **Mathematics** | `ch-math4-1` (Geometry & 2D Shapes) | `room-math4-1` | 10 | 10 | ✅ READY |
| **Science** | `ch-sci4-1` (My Body & Internal Organs) | `room-sci4-1` | 10 | 10 | ✅ READY |
| **Social Science** | `ch-soc4-1` (Kingdoms of Rivers) | `room-soc4-1` | 10 | 10 | ✅ READY |

---

## 4. Verification & Regression Test Results

### 1. Automated Test Suites
- **`node src/utils/auditStandard4Questions.js`**: 5/5 subjects verified READY (50/50 questions).
- **`node src/utils/testStandard4AllSubjects.js`**: 41/41 tests PASSED (100%).
- **`node src/utils/testMasterE2E.js`**: 26/26 tests PASSED (100%).

### 2. Standard 11 Chemistry Regression
- Verified all Standard 11 Chemistry rooms (`room-1` through `room-6`) and specialized game engines (`CALCULATION_HEIST`, `QUANTUM_ARCHITECT`, `GRID_RECONSTRUCTION`, `HYDROGEN_REACTOR`, `METAL_SORTING`, `GAS_SIMULATOR`) remain 100% operational.
