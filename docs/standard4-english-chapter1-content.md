# Standard 4 English Chapter 1 Content & Isolation Documentation

## 1. Curriculum Source & Authority
- **Curriculum Board**: Tamil Nadu State Board (Samacheer Kalvi)
- **Grade / Standard**: Class 4 (4th Standard English - Term 1)
- **Unit / Chapter 1**: **A Feast for Rats** (Prose/Story adapted from Rabindranath Tagore)
- **Core Skills**: Reading comprehension, contextual vocabulary, synonyms & antonyms, parts of speech (proper, common, collective nouns), pronouns, and sentence punctuation.

---

## 2. Curriculum Hierarchy

$$\text{Standard 4 (grade-4)} \longrightarrow \text{Subject: English (subj-eng)} \longrightarrow \text{Chapter 1: A Feast for Rats (ch-eng4-1)} \longrightarrow \text{Room: Storyteller Train Compartment (room-eng4-1)} \longrightarrow \text{10 Questions}$$

---

## 3. Topics Configured (Chapter 1)

| Topic ID | Topic Title | Description | Order |
| :--- | :--- | :--- | :---: |
| `topic-eng4-1-1` | Story & Reading Comprehension | A Feast for Rats narrative, characters, and plot sequence | 1 |
| `topic-eng4-1-2` | Vocabulary & Word Meanings | Contextual vocabulary, synonyms, and antonyms from the story | 2 |
| `topic-eng4-1-3` | Nouns: Proper, Common & Collective | Identifying naming words, groups of things, and capitalization | 3 |
| `topic-eng4-1-4` | Sentence Formation & Punctuation | Crafting meaningful sentences with capital letters and punctuation | 4 |

---

## 4. Mission & Room Configuration
- **Room ID**: `room-eng4-1`
- **Room Name**: Storyteller Train Compartment
- **Game Engine**: `GENERIC_CHAPTER_QUIZ`
- **Question Count**: 10
- **Time Limit**: 300 seconds (5 minutes)
- **Rewards**: +400 XP, +100 Coins, ★★★ Rating, Badge: `Master Storyteller`

---

## 5. 10 Authenticated Questions & Question-Specific Hints

| # | Question Focus | Question Text | Hint | Authoritative Answer Key |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Story Comprehension | In the story 'A Feast for Rats', who were traveling together in the train compartment? | The story revolves around school students on their journey and an old Sanskrit teacher. | A group of school boys and an elderly passenger |
| 2 | Vocabulary Meaning | What is the meaning of the word 'Feast' in the context of the story? | A feast is a grand celebration involving delicious food and sweets. | A large and delightful meal |
| 3 | Antonyms | What is the antonym (opposite) of the word 'Delightful'? | Something delightful brings joy; its opposite causes discomfort or annoyance. | Unpleasant |
| 4 | Collective Nouns | Choose the correct collective noun: 'A _______ of keys was left on the train bench.' | We say a herd of cattle, a flock of birds, and a bunch of keys. | bunch |
| 5 | Proper Noun Identification | Identify the Proper Noun in the sentence: 'Rabindranath Tagore wrote timeless stories for children.' | A proper noun is the specific name of a person, place, or organization and starts with a capital letter. | Rabindranath Tagore |
| 6 | Synonyms | Which word is a synonym for 'Delicious'? | Food that is delicious has a rich, enjoyable flavor. | Tasty |
| 7 | Plural Forms | What is the correct plural form of the noun 'Box'? | Nouns ending in -x usually form their plural by adding -es. | Boxes |
| 8 | Punctuation | Which of the following sentences is punctuated correctly? | A direct question begins with a capital letter and concludes with a question mark. | Did the rats eat the mangoes and sweets? |
| 9 | Pronoun Replacement | Replace the underlined noun with the correct pronoun: 'The old man smiled kindly at the boys.' | Use the singular masculine subject pronoun for an elderly gentleman. | He |
| 10 | Moral & Message | What lesson did the schoolboys learn by the end of the journey? | The boys realized the true identity and benevolent nature of their new teacher. | To respect elders and appreciate their kindness |

---

## 6. Security & Answer Protection
- **Backend Sanitization (`toStudentQuestion`)**: Authoritative answers (`isCorrect`, `correctAnswer`, `solutionKey`, `puzzleData.correctMapping`) are stripped from student payloads.
- **Zero Cross-Subject Fallback**: If non-existent rooms are queried, the system cleanly returns 0 questions without falling back to Tamil, Math, Science, or Chemistry.
- **Progress & Unlock Flow**: Integrated with server-authoritative `POST /api/game/progress/:roomId/complete` and Chapter Unlock pipeline.

---

## 7. Verification & Automated Test Results

| Test Suite | Tests Run | Result | Pass Rate |
| :--- | :---: | :---: | :---: |
| **`testStandard4EnglishChapter1.js`** | 20 | ✅ Passed | **100% (20/20)** |
| **`testStandard4TamilChapter1.js`** | 15 | ✅ Passed | **100% (15/15)** |
| **`testChapterProgression.js`** | 15 | ✅ Passed | **100% (15/15)** |
| **`testMasterE2E.js`** | 26 | ✅ Passed | **100% (26/26)** |
| **Frontend Production Build (`vite build`)** | — | ✅ Passed | **0 Errors** |

### Output Log:
```text
================================================================
🧪 CHEMESCAPE STANDARD 4 ENGLISH CHAPTER 1 TEST SUITE
================================================================
✅ PASS | Test 1: Standard 4 exists in curriculum system
✅ PASS | Test 2: English subject exists under Standard 4
✅ PASS | Test 3: Standard 4 -> English mapping is active and valid
✅ PASS | Test 4: Standard 4 English Chapter 1 exists (A Feast for Rats)
✅ PASS | Test 5: Authentic topics exist for Standard 4 English Chapter 1
✅ PASS | Test 6: Room exists for Standard 4 English Chapter 1 (room-eng4-1)
✅ PASS | Test 7: Room is configured for GENERIC_CHAPTER_QUIZ
✅ PASS | Test 8: Exactly 10 questions configured for Standard 4 English Chapter 1
✅ PASS | Test 9: All 10 questions belong strictly to room-eng4-1 without cross-room borrowing
✅ PASS | Test 10: All 10 questions belong strictly to ch-eng4-1
✅ PASS | Test 11: Each English question maintains its own unique, question-specific hint
✅ PASS | Test 12: Student question response strictly hides isCorrect, solutionKey, and answers
✅ PASS | Test 13: Standard 4 English questions contain ZERO Tamil character leakage
✅ PASS | Test 14: Standard 4 English questions contain ZERO Mathematics leakage
✅ PASS | Test 15: Standard 4 English questions contain ZERO Science leakage
✅ PASS | Test 16: Standard 4 English questions contain ZERO Social Science leakage
✅ PASS | Test 17: Standard 4 English questions contain ZERO 11th Chemistry leakage
✅ PASS | Test 18: Curriculum structure is idempotent and protects against duplicate entities
✅ PASS | Test 19: Standard 4 Tamil Chapter 1 (அன்னைத் தமிழே) remains 100% intact and unaffected
✅ PASS | Test 20: 11th Chemistry Room 1 content remains 100% intact and unaffected
================================================================
📊 STANDARD 4 ENGLISH CHAPTER 1 SUMMARY: 20/20 PASSED (100%)
================================================================
```

---

## 8. Known Limitations
- Standard 4 English Chapters 2, 3, and 4 will be populated in subsequent curriculum sprints using official textbook lessons.
