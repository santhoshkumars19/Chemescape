# Standard 4 Science Chapter 1 Content & Isolation Documentation

## 1. Curriculum Source & Authority
- **Curriculum Board**: Tamil Nadu State Board (Samacheer Kalvi)
- **Grade / Standard**: Class 4 (4th Standard Science - Term 1)
- **Unit / Chapter 1**: **My Body & Internal Organs** (எனது உடல் / மனித உறுப்புகள்)
- **Core Skills**: Internal organs (Brain, Heart, Lungs, Stomach, Kidneys), Skeletal and Muscular systems (bones, movement), Dental care & hygiene (teeth types, brushing habits), and Sensory organ protection (Skin).

---

## 2. Curriculum Hierarchy

$$\text{Standard 4 (grade-4)} \longrightarrow \text{Subject: Science (subj-sci)} \longrightarrow \text{Chapter 1: My Body \& Internal Organs (ch-sci4-1)} \longrightarrow \text{Room: Anatomy Physiology Lab (room-sci4-1)} \longrightarrow \text{10 Questions}$$

---

## 3. Topics Configured (Chapter 1)

| Topic ID | Topic Title | Description | Order |
| :--- | :--- | :--- | :---: |
| `topic-sci4-1-1` | Internal Organs: Brain & Heart | Functions of the human brain as command center and heart as blood pump | 1 |
| `topic-sci4-1-2` | Lungs, Stomach & Kidneys | Respiratory gas exchange, stomach digestion, and kidney blood filtration | 2 |
| `topic-sci4-1-3` | Bones, Muscles & Movement | Skeletal framework, muscular contractions, and joint locomotion | 3 |
| `topic-sci4-1-4` | Dental Hygiene & Personal Health | Tooth structure, oral hygiene routines, and balanced daily habits | 4 |

---

## 4. Mission & Room Configuration
- **Room ID**: `room-sci4-1`
- **Room Name**: Anatomy Physiology Lab
- **Game Engine**: `GENERIC_CHAPTER_QUIZ`
- **Question Count**: 10
- **Time Limit**: 300 seconds (5 minutes)
- **Rewards**: +400 XP, +100 Coins, ★★★ Rating, Badge: `Anatomy Explorer`

---

## 5. 10 Authenticated Questions & Question-Specific Hints

| # | Question Focus | Question Text | Hint | Authoritative Answer Key |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Nervous System (Brain) | Which organ acts as the control center of the human body, processing thoughts and directing actions? | This organ is protected inside the skull and sends signals through nerves. | Brain |
| 2 | Circulatory System (Heart) | What is the primary function of the human heart? | The heart beats rhythmically in the chest to circulate blood. | Pumping oxygenated blood throughout the body |
| 3 | Respiratory System (Lungs) | Which pair of spongy organs expands when we breathe in air to absorb oxygen? | Located inside the ribcage, these organs take in oxygen and exhale carbon dioxide. | Lungs |
| 4 | Digestive System (Stomach) | Which J-shaped organ breaks down food using digestive juices and acids? | Food from the esophagus enters this muscular sac where digestion occurs. | Stomach |
| 5 | Excretory System (Kidneys) | What do the bean-shaped kidneys filter from our blood to form urine? | Humans possess two kidneys on either side of the spine that remove liquid wastes. | Excess water and waste products |
| 6 | Skeletal System (Bones) | How many bones make up the adult human skeleton? | Babies are born with around 300 bones that fuse together to form 206 in adults. | 206 bones |
| 7 | Muscular System (Muscles) | How do muscles produce movement in our bones and joints? | Muscles can only pull when they contract; they work in pairs like biceps and triceps. | By contracting and pulling on bones |
| 8 | Dental Health (Brushing) | How many times a day should a person brush their teeth to maintain good dental health? | Dentists recommend brushing in the morning and before going to sleep at night. | At least twice a day |
| 9 | Tooth Anatomy (Incisors) | Which sharp, flat front teeth are specifically designed for biting and cutting food? | The four front teeth on top and bottom used to take bites of an apple. | Incisors |
| 10 | Sensory Protection (Skin) | Which organ is the largest sensory organ in the human body, protecting us from germs and regulating temperature? | It covers the entire exterior of our body and gives us the sense of touch. | Skin |

---

## 6. Security & Content Isolation
- **Backend Sanitization (`toStudentQuestion`)**: Authoritative answers (`isCorrect`, `correctAnswer`, `solutionKey`, `puzzleData.correctMapping`) are completely stripped from student payloads.
- **Zero Cross-Subject Contamination**: Verified 0 leakage from Tamil, English, Math, Social Science, or 11th Chemistry.
- **Progress & Unlock Integration**: Completing `ch-sci4-1` authoritatively unlocks `ch-sci4-2` for the active student only.

---

## 7. Verification & Automated Test Results

| Test Suite | Tests Run | Result | Pass Rate |
| :--- | :---: | :---: | :---: |
| **`testStandard4ScienceChapter1.js`** | 20 | ✅ Passed | **100% (20/20)** |
| **`testStandard4MathematicsChapter1.js`** | 20 | ✅ Passed | **100% (20/20)** |
| **`testStandard4EnglishChapter1.js`** | 20 | ✅ Passed | **100% (20/20)** |
| **`testStandard4TamilChapter1.js`** | 15 | ✅ Passed | **100% (15/15)** |
| **`testChapterProgression.js`** | 15 | ✅ Passed | **100% (15/15)** |
| **`testMasterE2E.js`** | 26 | ✅ Passed | **100% (26/26)** |
| **Frontend Production Build (`vite build`)** | — | ✅ Passed | **0 Errors** |

### Output Log:
```text
================================================================
🧪 CHEMESCAPE STANDARD 4 SCIENCE CHAPTER 1 TEST SUITE
================================================================
✅ PASS | Test 1: Standard 4 exists in curriculum system
✅ PASS | Test 2: Science subject exists under Standard 4
✅ PASS | Test 3: Standard 4 -> Science mapping is active and valid
✅ PASS | Test 4: Standard 4 Science Chapter 1 exists (My Body & Internal Organs)
✅ PASS | Test 5: Authentic topics exist for Standard 4 Science Chapter 1
✅ PASS | Test 6: Room exists for Standard 4 Science Chapter 1 (room-sci4-1)
✅ PASS | Test 7: Room is configured for GENERIC_CHAPTER_QUIZ
✅ PASS | Test 8: Exactly 10 questions configured for Standard 4 Science Chapter 1
✅ PASS | Test 9: All 10 questions belong strictly to room-sci4-1 without cross-room borrowing
✅ PASS | Test 10: All 10 questions belong strictly to ch-sci4-1
✅ PASS | Test 11: Each Science question maintains its own unique, question-specific hint
✅ PASS | Test 12: Student question response strictly hides isCorrect, solutionKey, and answers
✅ PASS | Test 13: Standard 4 Science questions contain ZERO Tamil character leakage
✅ PASS | Test 14: Standard 4 Science questions contain ZERO English literature leakage
✅ PASS | Test 15: Standard 4 Science questions contain ZERO Mathematics leakage
✅ PASS | Test 16: Standard 4 Science questions contain ZERO Social Science leakage
✅ PASS | Test 17: Standard 4 Science questions contain ZERO 11th Chemistry leakage
✅ PASS | Test 18: Standard 4 Science questions contain ZERO Standard 5 or 11 room leakage
✅ PASS | Test 19: Curriculum structure is idempotent and protects against duplicate entities
✅ PASS | Test 20: Existing Tamil, English, Math, and 11th Chemistry content remains 100% intact
================================================================
📊 STANDARD 4 SCIENCE CHAPTER 1 SUMMARY: 20/20 PASSED (100%)
================================================================
```

---

## 8. Known Limitations
- Standard 4 Science Chapters 2, 3, and 4 will be populated in subsequent curriculum sprints using official textbook lessons.
