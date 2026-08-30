# ChemEscape — Subject-Specific Mission & Game Content Mapping Fix

## Executive Summary

This document details the root cause analysis, systemic architectural fixes, and verification test suites implemented to resolve the subject-specific mission and game content mapping bug in ChemEscape.

---

## 1. Problem Statement & Root Cause Analysis

### Observed Issue
When a student selected a non-Chemistry curriculum context (such as **Standard 5 → Social Science → Chapter 1: Introduction to Social science**) and clicked **START MISSION**, the system incorrectly loaded the 2D Top-Down Chemistry Laboratory Escape Room or Mole Calculation Heist game instead of Social Science content.

### Root Causes Identified
1. **Unconstrained Pattern Matching in `MissionBriefPage.jsx`**:
   `MissionBriefPage.jsx` previously checked chapter IDs using substring checks like `cid.includes('chap-1') || cid.includes('ch-1')` without scoping to 11th Standard Chemistry. Since fallback chapter IDs for Grade 5 Social Science Chapter 1 (`grade-5-social-science-1` or `chap-1`) matched `ch-1`, it defaulted the target screen to `calculation-heist`.
2. **Permissive Fallback in `gameRegistry.js`**:
   In `frontend/src/games/gameRegistry.js`, `getGameComponentByGameType()` and `getGameEndpointByGameType()` defaulted unmatched game types to `LabGamePage` and `'lab'`, causing any unconfigured game to mount the 2D Chemistry Laboratory Escape Room.
3. **Stale State Leakage in `NavigationContext.jsx`**:
   `NavigationContext.jsx` did not automatically cascade-invalidate downstream selections (`selectedSubjectId`, `selectedChapterId`, `selectedRoomId`, `currentRoom`) when switching standards or subjects.
4. **Missing Curriculum Guard on Game Routes**:
   Game screens (e.g., `CalculationHeistPage`, `QuantumArchitectPage`, `LabGamePage`) lacked route-level curriculum context validation to detect and prevent cross-subject execution.

---

## 2. System-Wide Architectural Fixes Applied

### A. Authoritative Hierarchy Enforcement (`MissionBriefPage.jsx`)
- **Strict Scope Isolation**: Mission presets (Units 1–6) are strictly gated behind `isChemistry11` (`(resolvedStdId === 'grade-11' || resolvedStdId === 'std-11') && (resolvedSubjId === 'chemistry' || resolvedSubjId === 'subj-chem')`).
- **Zero Fallback Rule**: If a subject/chapter does not have an implemented game engine configured, the system **never** substitutes Chemistry or another subject's engine.
- **Availability State Model**:
  - `isPlayable === true`: Launches the authoritative game engine.
  - `isPlayable === false`: Renders `"Mission Content Coming Soon"` on the action button and displays a high-tech in-production alert and modal with options to return to chapters or explore other subjects.

### B. Strict Game Registry Validation (`frontend/src/games/gameRegistry.js`)
- Replaced fallback returns (`LabGamePage` / `'lab'`) with explicit `null`.
- Added standard and subject metadata to each registered game entry in `GAME_REGISTRY`.
- Added helper functions `isGameTypeSupported(gameType)` and subject-matched lookup.

### C. Cascade State Invalidation (`frontend/src/context/NavigationContext.jsx`)
- **Standard Switch (`setSelectedStandardId`)**: Automatically invalidates `selectedSubjectId`, `selectedSubject`, `selectedChapterId`, `selectedChapter`, `selectedRoomId`, and `currentRoom`.
- **Subject Switch (`setSelectedSubjectId`)**: Automatically invalidates `selectedChapterId`, `selectedChapter`, `selectedRoomId`, and `currentRoom`.
- **Chapter Switch (`setSelectedChapterId`)**: Automatically invalidates `selectedRoomId` and `currentRoom`.
- **User Progress Refresh & Logout**: Fully wipes previous user state to prevent cross-user contamination.

### D. Route-Level Curriculum Guard (`frontend/src/components/CurriculumMismatchGuard.jsx`)
- Built a wrapper component that verifies active `selectedStandardId` and `selectedSubjectId` against the expected curriculum context for each chemistry game.
- If a user navigates to a Chemistry game while in Standard 5 Social Science context, `CurriculumMismatchGuard` intercepts the render and displays a clean **Curriculum Context Mismatch** screen with a button to return to the active subject's chapters.
- Wrapped all 11th Chemistry game routes in `frontend/src/App.jsx`.

---

## 3. Verification & Automated Test Suites

### Automated Test Suite: `testSubjectContentMapping.js`
A dedicated test suite was implemented in `backend/src/utils/testSubjectContentMapping.js` to verify:
1. Standard 5 contains Social Science and does not leak Standard 11 Chemistry.
2. Standard 11 contains Chemistry and resolves all 6 units.
3. Filtering by non-existent subject returns zero chapters without falling back to Chemistry.
4. Chemistry Room 1 returns published questions belonging to Room 1.
5. Standard 4 Math rooms contain zero Chemistry questions.
6. Unconfigured chapters and rooms return empty arrays / 404 cleanly without fallback.
7. All 6 Chemistry game engines (`calculation-heist`, `quantum-architect`, `grid-reconstruction`, `hydrogen-reactor`, `metal-sorting`, `gas-simulator`) operate authoritatively.

### Test Results
| Test Suite | Tests Run | Passed | Failed | Success Rate |
| :--- | :---: | :---: | :---: | :---: |
| **Subject Content Mapping (`testSubjectContentMapping.js`)** | 17 | 17 | 0 | **100%** |
| **Master E2E (`testMasterE2E.js`)** | 26 | 26 | 0 | **100%** |
| **Curriculum Integration (`testCurriculumIntegration.js`)** | 20 | 20 | 0 | **100%** |
| **Question Module (`testQuestionModule.js`)** | 20 | 20 | 0 | **100%** |
| **User Progress & Unlock (`testUserProgressUnlock.js`)** | 18 | 18 | 0 | **100%** |
| **Frontend Production Build (`vite build`)** | — | — | 0 | **✓ Built in 9.02s** |

---

## 4. Summary

The content hierarchy `USER → STANDARD → SUBJECT → CHAPTER → TOPIC → ROOM / MISSION → QUESTION → GAME` is now authoritative across all standards (Grades 4–12) and subjects. Cross-subject leakage has been eliminated, unconfigured content displays clean coming-soon states, and all existing Unit 1–6 Chemistry games remain fully functional.
