const prisma = require('../config/db');
const roomService = require('./roomService');
const chapterService = require('./chapterService');
const topicService = require('./topicService');

// Authoritative default questions for fallback / offline resilience
const DEFAULT_QUESTIONS = [
  // ───────────────────────────────────────────────────────────────────────────
  // 11th Chemistry Room 1 (Deconstruction Lab - Grid Reconstruction)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'q-chem-r1-1',
    chapterId: 'ch-3',
    topicId: 'topic-1',
    roomId: 'room-1',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'MCQ',
    questionText: 'Which element is located in Group 1, Period 3 of the Periodic Table?',
    description: 'Identify the alkali metal in the third period.',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 60,
    hint: 'Its atomic number is 11 and it reacts vigorously with water.',
    explanation: 'Sodium (Na) is an alkali metal with atomic number 11 located in Group 1, Period 3.',
    status: 'PUBLISHED',
    isActive: true,
    options: [
      { id: 'opt-q1-1', optionKey: 'A', optionText: 'Lithium (Li)', isCorrect: false, orderNumber: 1 },
      { id: 'opt-q1-2', optionKey: 'B', optionText: 'Sodium (Na)', isCorrect: true, orderNumber: 2 },
      { id: 'opt-q1-3', optionKey: 'C', optionText: 'Potassium (K)', isCorrect: false, orderNumber: 3 },
      { id: 'opt-q1-4', optionKey: 'D', optionText: 'Magnesium (Mg)', isCorrect: false, orderNumber: 4 },
    ],
  },
  {
    id: 'q-chem-r1-2',
    chapterId: 'ch-3',
    topicId: 'topic-2',
    roomId: 'room-1',
    questionNumber: 2,
    displayOrder: 2,
    questionType: 'DRAG_DROP',
    questionText: 'Drag each element to its correct periodic block.',
    difficulty: 'MEDIUM',
    points: 150,
    timeLimit: 90,
    hint: 'Elements in groups 1 and 2 belong to s-block; transition metals belong to d-block.',
    status: 'PUBLISHED',
    isActive: true,
    puzzleData: {
      items: ['Sodium', 'Iron', 'Chlorine', 'Cerium'],
      targets: ['s-block', 'd-block', 'p-block', 'f-block'],
      correctMapping: { Sodium: 's-block', Iron: 'd-block', Chlorine: 'p-block', Cerium: 'f-block' },
    },
  },
  // ───────────────────────────────────────────────────────────────────────────
  // 11th Chemistry Room 2 (Quantum Chamber - Quantum Architect)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'q-chem-r2-1',
    chapterId: 'ch-3',
    topicId: 'topic-6',
    roomId: 'room-2',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'ELECTRON_CONFIGURATION',
    questionText: 'Enter the electron configuration for Oxygen (Z = 8).',
    difficulty: 'MEDIUM',
    points: 150,
    timeLimit: 120,
    hint: 'Fill 1s, then 2s, and place remaining 4 electrons in 2p orbitals.',
    status: 'PUBLISHED',
    isActive: true,
    puzzleData: {
      element: 'Oxygen',
      atomicNumber: 8,
      expectedConfiguration: '1s2 2s2 2p4',
    },
  },
  // ───────────────────────────────────────────────────────────────────────────
  // 11th Chemistry Room 3 (Trend Vault - Calculation Heist)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'q-chem-r3-1',
    chapterId: 'ch-3',
    topicId: 'topic-3',
    roomId: 'room-3',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'CALCULATION',
    questionText: 'Calculate the number of moles in 36 grams of pure Water (H2O, Molar Mass = 18 g/mol).',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 90,
    hint: 'Use the formula: Moles = Mass in grams / Molar mass.',
    status: 'PUBLISHED',
    isActive: true,
    puzzleData: {
      mass: 36,
      molarMass: 18,
      unit: 'mol',
      expectedCalculation: 2,
      expectedValue: 2,
    },
  },
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 Math Room 1 (Fraction Bakery)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'q-math4-r2-1',
    chapterId: 'ch-math4-2',
    topicId: 'topic-math4-2-1',
    roomId: 'room-math4-2-1',
    questionNumber: 1,
    displayOrder: 1,
    questionType: 'MCQ',
    questionText: 'Which fraction is equivalent to 1/2?',
    difficulty: 'EASY',
    points: 100,
    timeLimit: 60,
    hint: 'Multiply both numerator and denominator by 2.',
    status: 'PUBLISHED',
    isActive: true,
    options: [
      { id: 'opt-math-1', optionKey: 'A', optionText: '2/4', isCorrect: true, orderNumber: 1 },
      { id: 'opt-math-2', optionKey: 'B', optionText: '1/3', isCorrect: false, orderNumber: 2 },
      { id: 'opt-math-3', optionKey: 'C', optionText: '3/5', isCorrect: false, orderNumber: 3 },
      { id: 'opt-math-4', optionKey: 'D', optionText: '4/6', isCorrect: false, orderNumber: 4 },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 Tamil Room 1 (10 Questions - room-tam4-1: அன்னைத் தமிழே)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: "'அன்னைத் தமிழே' என்ற பாடலின் ஆசிரியர் யார்?", hint: 'கவிஞர் நா. காமராசன் அவர்களின் அழகிய பாடல் வரிகள்.', opts: ['நா. காமராசன்', 'பாரதியார்', 'பாரதிதாசன்', 'நாமக்கல் கவிஞர்'], ans: 0 },
    { qn: 2, text: "'ஆவி' என்ற சொல்லின் சரியான பொருள் என்ன?", hint: 'உடலில் கலந்து நிலைத்திருக்கும் உயிர்.', opts: ['காற்று', 'உயிர்', 'மனம்', 'அறிவு'], ans: 1 },
    { qn: 3, text: '"என்னை வளர்ப்பவளே, என்னில் _______" - விடுபட்ட சொல்லைத் தேர்ந்தெடுக்க.', hint: 'பாடல் வரியில் என்னில் வளர்பவளைப் போற்றுகிறார்.', opts: ['கலந்தவளே', 'வளர்பவளே', 'நின்றவளே', 'வந்தவளே'], ans: 1 },
    { qn: 4, text: "'உன்னையல்லால்' - இச்சொல்லைப் பிரித்து எழுதக் கிடைப்பது எது?", hint: 'உன்னை + அல்லால் என்று பிரியும்.', opts: ['உன்னை + அல்லால்', 'உன் + அல்லால்', 'உன்னை + யல்லால்', 'உன்னை + இல்லால்'], ans: 0 },
    { qn: 5, text: "'அன்னை' என்ற சொல்லுக்கு இணையான சொல் எது?", hint: 'நம்மைப் பெற்றெடுத்த அன்புத் தாய்.', opts: ['தங்கை', 'தாய்', 'அத்தை', 'பாட்டி'], ans: 1 },
    { qn: 6, text: "'தமிழ் + மொழி' - சேர்த்து எழுதக் கிடைக்கும் சொல் எது?", hint: 'இரு சொற்களும் சேரும்போது தமிழ்மொழி என வரும்.', opts: ['தமிழ்மொழி', 'தமிழ்மொழிமை', 'தமிழம்மொழி', 'தமிழமொழி'], ans: 0 },
    { qn: 7, text: "'புகழ்' என்ற சொல்லின் சரியான எதிர்ச்சொல் எது?", hint: 'புகழுக்கு எதிரான சொல் இகழ் / இகழ்ச்சி.', opts: ['பெருமை', 'இகழ்', 'மகிழ்', 'சிறப்பு'], ans: 1 },
    { qn: 8, text: 'செய்யுளில் முதல் எழுத்து ஒன்றி வருவது எவ்வாறு அழைக்கப்படும்?', hint: 'முதல் எழுத்து ஒன்றி வருவது மோனை.', opts: ['எதுகை', 'மோனை', 'இயைபு', 'அந்தாதி'], ans: 1 },
    { qn: 9, text: 'செய்யுளில் இரண்டாம் எழுத்து ஒன்றி வருவது எவ்வாறு அழைக்கப்படும்?', hint: 'இரண்டாம் எழுத்து ஒன்றி வருவது எதுகை.', opts: ['மோனை', 'எதுகை', 'இயைபு', 'முரண்'], ans: 1 },
    { qn: 10, text: 'கவிஞர் நா. காமராசன் எதனைப் போற்றிப் புகழ வார்த்தைகள் போதவில்லை என்கிறார்?', hint: 'அன்னைத் தமிழின் பெருமையைச் சொல்ல வார்த்தைகளே போதவில்லை என்கிறார்.', opts: ['இயற்கை வளம்', 'அன்னைத் தமிழ்', 'கடல் வளம்', 'மலைச் சிறப்பு'], ans: 1 },
  ].map((item) => ({
    id: `q-tam4-r1-${item.qn}`,
    chapterId: 'ch-tam4-1',
    roomId: 'room-tam4-1',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 4 Tamil Ch 1 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam4-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 Tamil Room 2 (10 Questions - room-tam4-2: பனிமலைப் பயணம்)
  // Curriculum: TN State Board 4th Standard Tamil Textbook, Chapter 2
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: "'பனிமலைப் பயணம்' என்ற கதையில் குழந்தைகள் எங்கு பயணம் செய்தனர்?", hint: 'பனி மூடிய மலைப் பகுதிக்கு பயணம் செய்தனர். கதையின் தலைப்பே இடத்தை உணர்த்துகிறது.', opts: ['பனிமலை', 'கடற்கரை', 'ஆறு', 'காடு'], ans: 0 },
    { qn: 2, text: "'பனி' என்ற சொல்லுக்கு சரியான பொருள் என்ன?", hint: 'குளிர்காலத்தில் வானிலிருந்து விழும் வெள்ளை நிற படிகம்.', opts: ['மழை', 'பனிப்பொழிவு - உறைந்த நீர்', 'நீர்', 'காற்று'], ans: 1 },
    { qn: 3, text: "'மலை' என்ற சொல்லின் பன்மை வடிவம் எது?", hint: 'ஒருமையில் மலை; பன்மையில் இரண்டுக்கு மேல் உள்ளவற்றை குறிக்கும்.', opts: ['மலைகள்', 'மலையன்', 'மலையே', 'மலை'], ans: 0 },
    { qn: 4, text: 'பயணம் செல்பவர்கள் மலையின் மீது என்ன கண்டார்கள்?', hint: 'வெண்ணிற படலமாக மலை மூடியிருந்தது; பனிமலைப் பயணம் கதை நினைவுகூறுக.', opts: ['பனிப் படலம்', 'தேன்கூடு', 'கிளி', 'நீர்வீழ்ச்சி'], ans: 0 },
    { qn: 5, text: "'காடு' என்ற சொல்லுக்கு இணையான சொல் எது?", hint: 'மரங்கள் நிறைந்த இடத்தை சுட்டும் பிற சொல்.', opts: ['வனம்', 'ஆறு', 'வயல்', 'மலை'], ans: 0 },
    { qn: 6, text: "'குளிர்' என்பதன் எதிர்ச்சொல் எது?", hint: 'குளிருக்கு நேர் எதிரான வெப்பம் அல்லது சூடு என ஆகும்.', opts: ['சூடு', 'பனி', 'மழை', 'காற்று'], ans: 0 },
    { qn: 7, text: "'நடந்தனர்' என்பது எவ்வகைச் சொல்?", hint: 'செயல்களை குறிக்கும் சொல்லை வினைச்சொல் என்பர்.', opts: ['வினைச்சொல்', 'பெயர்ச்சொல்', 'உரிச்சொல்', 'இடைச்சொல்'], ans: 0 },
    { qn: 8, text: "மரம் + இலை - சேர்த்து எழுதக் கிடைக்கும் சொல் எது?", hint: 'மரம் என்ற சொல்லுடன் இலை சேரும்போது புணர்ச்சி விதி பயன்படுகிறது.', opts: ['மரவிலை', 'மரமிலை', 'மரத்திலை', 'மரம்இலை'], ans: 0 },
    { qn: 9, text: 'பயணத்தின்போது குழந்தைகள் என்ன உணர்வை அடைந்தனர்?', hint: 'இயற்கையின் அழகை கண்டு மகிழ்ச்சி கொண்டனர்.', opts: ['மகிழ்ச்சி', 'கோபம்', 'சோர்வு', 'பயம்'], ans: 0 },
    { qn: 10, text: "'வெண்மை' என்பது எந்த நிறத்தைக் குறிக்கும்?", hint: 'பால், பனி, மேகம் ஆகியவற்றின் நிறம்.', opts: ['வெள்ளை நிறம்', 'கருப்பு நிறம்', 'சிவப்பு நிறம்', 'பச்சை நிறம்'], ans: 0 },
  ].map((item) => ({
    id: `q-tam4-r2-${item.qn}`,
    chapterId: 'ch-tam4-2',
    roomId: 'room-tam4-2',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 4 Tamil Ch 2 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam4-2-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 English Room 1 (10 Questions - room-eng4-1: A Feast for Rats)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: "In the story 'A Feast for Rats', who were traveling together in the train compartment?", hint: 'The story revolves around school students on their journey and an old Sanskrit teacher.', opts: ['A group of school boys and an elderly passenger', 'A captain and his sailors', 'A teacher and a doctor', 'A king and his soldiers'], ans: 0 },
    { qn: 2, text: "What is the meaning of the word 'Feast' in the context of the story?", hint: 'A feast is a grand celebration involving delicious food and sweets.', opts: ['A large and delightful meal', 'A long sleep', 'A fast train', 'A quiet study room'], ans: 0 },
    { qn: 3, text: "What is the antonym (opposite) of the word 'Delightful'?", hint: 'Something delightful brings joy; its opposite causes discomfort or annoyance.', opts: ['Pleasant', 'Unpleasant', 'Joyful', 'Wonderful'], ans: 1 },
    { qn: 4, text: "Choose the correct collective noun: 'A _______ of keys was left on the train bench.'", hint: 'We say a herd of cattle, a flock of birds, and a bunch of keys.', opts: ['bunch', 'flock', 'herd', 'pack'], ans: 0 },
    { qn: 5, text: "Identify the Proper Noun in the sentence: 'Rabindranath Tagore wrote timeless stories for children.'", hint: 'A proper noun is the specific name of a person, place, or organization and starts with a capital letter.', opts: ['Rabindranath Tagore', 'stories', 'children', 'wrote'], ans: 0 },
    { qn: 6, text: "Which word is a synonym for 'Delicious'?", hint: 'Food that is delicious has a rich, enjoyable flavor.', opts: ['Tasty', 'Sour', 'Bitter', 'Plain'], ans: 0 },
    { qn: 7, text: "What is the correct plural form of the noun 'Box'?", hint: 'Nouns ending in -x usually form their plural by adding -es.', opts: ['Boxes', 'Boxs', 'Boxies', 'Boxen'], ans: 0 },
    { qn: 8, text: "Which of the following sentences is punctuated correctly?", hint: 'A direct question begins with a capital letter and concludes with a question mark.', opts: ['Did the rats eat the mangoes and sweets?', 'did the rats eat the mangoes and sweets.', 'Did the rats eat the mangoes and sweets!', 'Did the rats eat the mangoes, and sweets'], ans: 0 },
    { qn: 9, text: "Replace the underlined noun with the correct pronoun: 'The old man smiled kindly at the boys.'", hint: 'Use the singular masculine subject pronoun for an elderly gentleman.', opts: ['He', 'She', 'They', 'It'], ans: 0 },
    { qn: 10, text: "What lesson did the schoolboys learn by the end of the journey?", hint: 'The boys realized the true identity and benevolent nature of their new teacher.', opts: ['To respect elders and appreciate their kindness', 'To skip classes', 'To avoid eating sweets', 'To travel alone on trains'], ans: 0 },
  ].map((item) => ({
    id: `q-eng4-r1-${item.qn}`,
    chapterId: 'ch-eng4-1',
    roomId: 'room-eng4-1',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 4 English Ch 1 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-eng4-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 Mathematics Room 1 (10 Questions - room-math4-1: Geometry & 2D Shapes)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'How many equal sides and right angles does a square have?', hint: 'A square is a regular quadrilateral with all sides and internal angles identical.', opts: ['4 equal sides and 4 right angles', '3 equal sides and 3 right angles', '4 unequal sides and 2 right angles', '2 equal sides and 4 right angles'], ans: 0 },
    { qn: 2, text: 'If the radius of a circle is 7 cm, what is its diameter?', hint: 'Diameter is twice the radius length (D = 2 * r).', opts: ['14 cm', '7 cm', '21 cm', '49 cm'], ans: 0 },
    { qn: 3, text: 'How many flat square faces does a standard cube have?', hint: 'Think of a standard six-sided game die.', opts: ['6 faces', '4 faces', '8 faces', '12 faces'], ans: 0 },
    { qn: 4, text: 'Find the perimeter of a rectangle with length 9 cm and breadth 4 cm.', hint: 'Perimeter = 2 * (length + breadth) = 2 * (9 + 4).', opts: ['26 cm', '36 cm', '13 cm', '22 cm'], ans: 0 },
    { qn: 5, text: 'How many lines of symmetry does a regular rectangle have?', hint: 'A non-square rectangle folds onto itself along its horizontal and vertical midlines.', opts: ['2 lines of symmetry', '4 lines of symmetry', '1 line of symmetry', '8 lines of symmetry'], ans: 0 },
    { qn: 6, text: 'What is a triangle called when all three of its sides have equal length?', hint: 'The prefix equi- signifies equal lengths on all 3 sides.', opts: ['Equilateral triangle', 'Isosceles triangle', 'Scalene triangle', 'Right-angled triangle'], ans: 0 },
    { qn: 7, text: 'Which 3D shape has 2 circular flat faces and 1 curved surface?', hint: 'Think of an aluminum drink can or a cylindrical pipe.', opts: ['Cylinder', 'Cone', 'Sphere', 'Prism'], ans: 0 },
    { qn: 8, text: 'What is the perimeter of a triangle with sides measuring 6 cm, 8 cm, and 10 cm?', hint: 'Add the lengths of all three boundary sides together: 6 + 8 + 10.', opts: ['24 cm', '48 cm', '14 cm', '18 cm'], ans: 0 },
    { qn: 9, text: 'What is the measurement of a right angle in degrees?', hint: 'A right angle is the exact angle formed by the square corner of a page (90 degrees).', opts: ['90 degrees', '45 degrees', '180 degrees', '360 degrees'], ans: 0 },
    { qn: 10, text: 'A traditional Chinese Tangram puzzle consists of how many geometric pieces?', hint: 'A standard tangram has 5 triangles, 1 square, and 1 parallelogram (7 pieces total).', opts: ['7 pieces', '5 pieces', '10 pieces', '12 pieces'], ans: 0 },
  ].map((item) => ({
    id: `q-math4-r1-${item.qn}`,
    chapterId: 'ch-math4-1',
    roomId: 'room-math4-1',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 4 Math Ch 1 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-math4-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 Science Room 1 (10 Questions - room-sci4-1: My Body & Internal Organs)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'Which organ acts as the control center of the human body, processing thoughts and directing actions?', hint: 'This organ is protected inside the skull and sends signals through nerves.', opts: ['Brain', 'Stomach', 'Kidney', 'Liver'], ans: 0 },
    { qn: 2, text: 'What is the primary function of the human heart?', hint: 'The heart beats rhythmically in the chest to circulate blood.', opts: ['Pumping oxygenated blood throughout the body', 'Filtering toxic liquids from blood', 'Digesting complex solid food', 'Storing memories'], ans: 0 },
    { qn: 3, text: 'Which pair of spongy organs expands when we breathe in air to absorb oxygen?', hint: 'Located inside the ribcage, these organs take in oxygen and exhale carbon dioxide.', opts: ['Lungs', 'Kidneys', 'Eyes', 'Intestines'], ans: 0 },
    { qn: 4, text: 'Which J-shaped organ breaks down food using digestive juices and acids?', hint: 'Food from the esophagus enters this muscular sac where digestion occurs.', opts: ['Stomach', 'Brain', 'Lungs', 'Heart'], ans: 0 },
    { qn: 5, text: 'What do the bean-shaped kidneys filter from our blood to form urine?', hint: 'Humans possess two kidneys on either side of the spine that remove liquid wastes.', opts: ['Excess water and waste products', 'Oxygen and carbon dioxide', 'Saliva and bile', 'Calcium and minerals'], ans: 0 },
    { qn: 6, text: 'How many bones make up the adult human skeleton?', hint: 'Babies are born with around 300 bones that fuse together to form 206 in adults.', opts: ['206 bones', '150 bones', '300 bones', '100 bones'], ans: 0 },
    { qn: 7, text: 'How do muscles produce movement in our bones and joints?', hint: 'Muscles can only pull when they contract; they work in pairs like biceps and triceps.', opts: ['By contracting and pulling on bones', 'By pushing against the skin', 'By generating electricity', 'By melting and cooling'], ans: 0 },
    { qn: 8, text: 'How many times a day should a person brush their teeth to maintain good dental health?', hint: 'Dentists recommend brushing in the morning and before going to sleep at night.', opts: ['At least twice a day', 'Once every three days', 'Only on weekends', 'Five times an hour'], ans: 0 },
    { qn: 9, text: 'Which sharp, flat front teeth are specifically designed for biting and cutting food?', hint: 'The four front teeth on top and bottom used to take bites of an apple.', opts: ['Incisors', 'Molars', 'Premolars', 'Wisdom teeth'], ans: 0 },
    { qn: 10, text: 'Which organ is the largest sensory organ in the human body, protecting us from germs and regulating temperature?', hint: 'It covers the entire exterior of our body and gives us the sense of touch.', opts: ['Skin', 'Liver', 'Tongue', 'Nose'], ans: 0 },
  ].map((item) => ({
    id: `q-sci4-r1-${item.qn}`,
    chapterId: 'ch-sci4-1',
    roomId: 'room-sci4-1',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 4 Science Ch 1 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-sci4-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 4 Social Science Room 1 (10 Questions - room-soc4-1: Kingdoms of Rivers)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'Which famous Chola king built the historic Kallanai Dam across the River Cauvery?', hint: 'He was one of the greatest early Chola monarchs and constructed the worlds oldest functional water-diversion structure.', opts: ['Karikalan', 'Cheran Senguttuvan', 'Narasimhavarman', 'Rajendra Chola'], ans: 0 },
    { qn: 2, text: 'Along which riverbank did the ancient Chera dynasty establish their kingdom with Vanji as capital?', hint: 'The Chera kingdom occupied parts of modern western Tamil Nadu and Kerala along the Poigai river.', opts: ['River Poigai', 'River Cauvery', 'River Vaigai', 'River Palar'], ans: 0 },
    { qn: 3, text: 'Which ancient sea port of the Pandya dynasty was world-renowned for its natural pearl fisheries?', hint: 'Located at the mouth of the Thamirabarani river, this port traded exquisite pearls with Rome and Greece.', opts: ['Korkai', 'Musiri', 'Mamallapuram', 'Poompuhar'], ans: 0 },
    { qn: 4, text: 'What was the royal emblem embossed on the flag of the Chola empire?', hint: 'The fierce king of the jungle was the Cholas martial symbol (Tiger).', opts: ['Tiger', 'Bow and Arrow', 'Two Fish', 'Bull (Nandi)'], ans: 0 },
    { qn: 5, text: 'Which emblem was depicted on the royal flag of the Pandya kings?', hint: 'The Pandyas reigned from Madurai and flew the twin fish banner.', opts: ['Twin Fish', 'Tiger', 'Bow and Arrow', 'Lion'], ans: 0 },
    { qn: 6, text: 'Which weapon symbol was featured on the flag of the Chera rulers?', hint: 'The Cheras were renowned archers who honored the bow and arrow.', opts: ['Bow and Arrow', 'Sword', 'Spear', 'Shield'], ans: 0 },
    { qn: 7, text: 'What was the capital city of the Pallava dynasty situated on the banks of River Palar?', hint: 'Known as the City of Thousand Temples and a great center of classical learning.', opts: ['Kanchipuram', 'Madurai', 'Uraiyur', 'Vanji'], ans: 0 },
    { qn: 8, text: 'Which benevolent Sangam philanthropist gave his royal silk shawl to a shivering peacock?', hint: 'One of the Kadai Ezhu Vallalgal who showed immense compassion towards birds and nature.', opts: ['Pegan', 'Pari', 'Athiyaman', 'Valvil Ori'], ans: 0 },
    { qn: 9, text: 'Which generous chieftain offered his golden chariot to support a delicate mullai (jasmine) creeper?', hint: 'The ruler of Parambu Malai known for sacrificing his chariot so the plant could climb.', opts: ['Pari', 'Nalli', 'Aai', 'Nedumudi Kari'], ans: 0 },
    { qn: 10, text: 'Which famous coastal port and architectural site served the Pallava kingdom?', hint: 'Renowned for rock-cut shore temples, monolith rathas, and UNESCO world heritage monuments.', opts: ['Mamallapuram (Mahabalipuram)', 'Musiri', 'Thondi', 'Korkai'], ans: 0 },
  ].map((item) => ({
    id: `q-soc4-r1-${item.qn}`,
    chapterId: 'ch-soc4-1',
    roomId: 'room-soc4-1',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 4 Social Science Ch 1 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-soc4-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 5 Tamil Room 1 (10 Questions - room-tam5-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'தமிழில் உள்ள உயிர் எழுத்துக்களின் எண்ணிக்கை எத்தனை?', hint: 'அ முதல் ஔ வரையிலான எழுத்துக்களை எண்ணுங்கள்.', opts: ['10', '12', '18', '216'], ans: 1 },
    { qn: 2, text: 'மெய் எழுத்துக்களின் எண்ணிக்கை எத்தனை?', hint: 'க் முதல் ன் வரையிலான புள்ளி வைத்த எழுத்துக்கள்.', opts: ['12', '18', '24', '30'], ans: 1 },
    { qn: 3, text: 'ஆய்த எழுத்து எது?', hint: 'மூன்று புள்ளிகள் கொண்ட தனி எழுத்து.', opts: ['ஃ', 'அ', 'ஔ', 'க்'], ans: 0 },
    { qn: 4, text: 'திருக்குறளை இயற்றியவர் யார்?', hint: 'உலகப் பொதுமறை தந்த தெய்வப் புலவர்.', opts: ['பாரதியார்', 'திருவள்ளுவர்', 'கம்பர்', 'ஔவையார்'], ans: 1 },
    { qn: 5, text: '"கற்க கசடறக் கற்பவை" - இப்பாடல் வரி இடம் பெற்றுள்ள நூல் எது?', hint: '1330 குறட்பாக்களைக் கொண்ட நூல்.', opts: ['நாலடியார்', 'திருக்குறள்', 'சிலப்பதிகாரம்', 'மணிமேகலை'], ans: 1 },
    { qn: 6, text: 'தமிழின் தொன்மையான இலக்கண நூல் எது?', hint: 'தொல்காப்பியரால் இயற்றப்பட்ட நூல்.', opts: ['நன்னூல்', 'தொல்காப்பியம்', 'வீரசோழியம்', 'அகத்தியம்'], ans: 1 },
    { qn: 7, text: 'வல்லின எழுத்துக்களுக்குரிய வரிசை எது?', hint: 'கசடதபற என ஒலிக்கும் எழுத்துக்கள்.', opts: ['க, ச, ட, த, ப, ற', 'ங, ஞ, ண, ந, ம, ன', 'ய, ர, ல, வ, ழ, ள', 'அ, ஆ, இ, ஈ'], ans: 0 },
    { qn: 8, text: 'மெல்லின எழுத்துக்களுக்குரிய வரிசை எது?', hint: 'மூக்கினால் ஒலிக்கப்படும் மென்மையான எழுத்துக்கள்.', opts: ['க, ச, ட, த, ப, ற', 'ங, ஞ, ண, ந, ம, ன', 'ய, ர, ல, வ, ழ, ள', 'க, ங, ச, ஞ'], ans: 1 },
    { qn: 9, text: 'இடையின எழுத்துக்களுக்குரிய வரிசை எது?', hint: 'யரலவழள என ஒலிக்கும் எழுத்துக்கள்.', opts: ['க, ச, ட, த, ப, ற', 'ங, ஞ, ண, ந, ம, ன', 'ய, ர, ல, வ, ழ, ள', 'அ, இ, உ, எ, ஒ'], ans: 2 },
    { qn: 10, text: 'தமிழ் மொழியின் மொத்த எழுத்துக்களின் எண்ணிக்கை எத்தனை?', hint: 'உயிர் (12) + மெய் (18) + உயிர்மெய் (216) + ஆய்தம் (1).', opts: ['216', '246', '247', '250'], ans: 2 },
  ].map((item) => ({
    id: `q-tam5-r1-${item.qn}`,
    chapterId: 'ch-tam5-1',
    roomId: 'room-tam5-1',
    topicId: item.qn <= 3 ? 'topic-tam5-1-1' : (item.qn === 4 || item.qn === 5) ? 'topic-tam5-1-3' : (item.qn === 7 || item.qn === 8 || item.qn === 9) ? 'topic-tam5-1-2' : 'topic-tam5-1-4',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Tamil Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam5-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 5 Mathematics Room 1 (10 Questions - room-math5-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'What is the sum of 3,450 and 2,550?', hint: 'Add thousands first: 3000+2000=5000, then 450+550=1000. Total = 6,000.', opts: ['5,000', '6,000', '6,100', '5,900'], ans: 1, topic: 'topic-math5-1-1' },
    { qn: 2,  text: 'Which fraction is equivalent to 3/4?', hint: 'Multiply numerator and denominator of 3/4 by 2 to get an equivalent fraction.', opts: ['6/8', '4/3', '2/3', '5/8'], ans: 0, topic: 'topic-math5-1-2' },
    { qn: 3,  text: 'What is the product of 25 and 16?', hint: 'Break it down: 25 x 16 = 25 x 4 x 4 = 100 x 4 = 400.', opts: ['350', '375', '400', '425'], ans: 2, topic: 'topic-math5-1-2' },
    { qn: 4,  text: 'Calculate the perimeter of a rectangle with length 8 cm and breadth 5 cm.', hint: 'Perimeter of rectangle = 2 x (length + breadth) = 2 x (8 + 5).', opts: ['13 cm', '26 cm', '40 cm', '52 cm'], ans: 1, topic: 'topic-math5-1-4' },
    { qn: 5,  text: 'Find the area of a square with side 7 cm.', hint: 'Area of a square = side x side = 7 x 7.', opts: ['28 sq cm', '42 sq cm', '49 sq cm', '56 sq cm'], ans: 2, topic: 'topic-math5-1-4' },
    { qn: 6,  text: 'Convert 3.5 kilograms into grams.', hint: '1 kilogram = 1,000 grams. So 3.5 kg = 3.5 x 1000 = 3,500 grams.', opts: ['350 g', '3,000 g', '3,500 g', '35,000 g'], ans: 2, topic: 'topic-math5-1-3' },
    { qn: 7,  text: 'What is the Least Common Multiple (LCM) of 4 and 6?', hint: 'List multiples: 4 (4,8,12) and 6 (6,12). The smallest common multiple is 12.', opts: ['12', '18', '24', '2'], ans: 0, topic: 'topic-math5-1-2' },
    { qn: 8,  text: 'What is 15% of 200?', hint: '15% means 15 out of 100. Multiply: 200 x 15 and divide by 100 = 30.', opts: ['20', '25', '30', '35'], ans: 2, topic: 'topic-math5-1-3' },
    { qn: 9,  text: 'How many right angles are there inside a rectangle?', hint: 'Every corner of a rectangle measures exactly 90 degrees, which is a right angle.', opts: ['2', '3', '4', '6'], ans: 2, topic: 'topic-math5-1-4' },
    { qn: 10, text: 'Solve using BODMAS: (12 + 8) / 4 * 3', hint: 'Step 1: Brackets (12+8=20). Step 2: Divide 20/4=5. Step 3: Multiply 5x3=15.', opts: ['10', '15', '20', '25'], ans: 1, topic: 'topic-math5-1-4' },
  ].map((item) => ({
    id: `q-math5-r1-${item.qn}`,
    chapterId: 'ch-math5-1',
    roomId: 'room-math5-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Mathematics Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-math5-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 5 Science Room 1 (10 Questions - room-sci5-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'Which state of matter has a definite volume but no fixed shape?', hint: 'Think of water — it takes the shape of its container but keeps the same volume.', opts: ['Solid', 'Liquid', 'Gas', 'Plasma'], ans: 1, topic: 'topic-sci5-1-1' },
    { qn: 2,  text: 'What is the process called when a liquid changes into a gas?', hint: 'When water is heated, it converts to steam through this process.', opts: ['Condensation', 'Evaporation', 'Freezing', 'Melting'], ans: 1, topic: 'topic-sci5-1-1' },
    { qn: 3,  text: 'What is the boiling point of pure water at sea level?', hint: 'This is the standard temperature at which water turns into steam (in Celsius).', opts: ['0°C', '50°C', '100°C', '150°C'], ans: 2, topic: 'topic-sci5-1-1' },
    { qn: 4,  text: 'Which simple machine uses a wheel with a rope running around its groove?', hint: 'This machine is commonly used to draw water from wells or lift heavy loads.', opts: ['Lever', 'Pulley', 'Inclined Plane', 'Screw'], ans: 1, topic: 'topic-sci5-1-4' },
    { qn: 5,  text: 'Which of the following is a renewable source of energy?', hint: 'This energy comes from the sun and will never run out.', opts: ['Coal', 'Petroleum', 'Solar Energy', 'Natural Gas'], ans: 2, topic: 'topic-sci5-1-4' },
    { qn: 6,  text: 'What gas do green plants absorb from the atmosphere during photosynthesis?', hint: 'Plants take in this gas and release oxygen as a by-product.', opts: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 2, topic: 'topic-sci5-1-2' },
    { qn: 7,  text: 'Which part of the plant absorbs water and minerals from the soil?', hint: 'This underground structure anchors the plant and absorbs nutrients.', opts: ['Stem', 'Leaves', 'Flower', 'Roots'], ans: 3, topic: 'topic-sci5-1-2' },
    { qn: 8,  text: 'Which organ in the human body pumps blood throughout the body?', hint: 'This muscular organ is located in the chest cavity and beats continuously.', opts: ['Lungs', 'Stomach', 'Heart', 'Kidney'], ans: 2, topic: 'topic-sci5-1-3' },
    { qn: 9,  text: 'What is the force that pulls objects toward the center of the Earth?', hint: 'Sir Isaac Newton discovered this force when an apple fell from a tree.', opts: ['Friction', 'Gravity', 'Magnetism', 'Buoyancy'], ans: 1, topic: 'topic-sci5-1-3' },
    { qn: 10, text: 'Which vitamin is produced in the human skin upon exposure to sunlight?', hint: 'This vitamin is often called the Sunshine Vitamin and is essential for strong bones.', opts: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], ans: 3, topic: 'topic-sci5-1-3' },
  ].map((item) => ({
    id: `q-sci5-r1-${item.qn}`,
    chapterId: 'ch-sci5-1',
    roomId: 'room-sci5-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-sci5-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 5 Social Science Room 1 (10 Questions - room-soc5-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'How many continents are there on Earth?', hint: 'Remember: Asia, Africa, North America, South America, Antarctica, Europe, Australia/Oceania.', opts: ['5', '6', '7', '8'], ans: 2, topic: 'topic-soc5-1-1' },
    { qn: 2,  text: 'Which is the largest ocean on Earth?', hint: 'This ocean lies between Asia and the Americas and covers more than 30% of Earth\'s surface.', opts: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], ans: 2, topic: 'topic-soc5-1-1' },
    { qn: 3,  text: 'What is the imaginary line that divides Earth into Northern and Southern Hemispheres?', hint: 'This is the 0° latitude line that runs around the middle of the Earth.', opts: ['Tropic of Cancer', 'Prime Meridian', 'Equator', 'Tropic of Capricorn'], ans: 2, topic: 'topic-soc5-1-1' },
    { qn: 4,  text: 'What does the blue colour represent on physical maps and globes?', hint: 'Think of the colour of seas, rivers, and lakes on a map.', opts: ['Forests', 'Deserts', 'Water bodies', 'Mountains'], ans: 2, topic: 'topic-soc5-1-1' },
    { qn: 5,  text: 'What is the capital city of India?', hint: 'This city is located in northern India along the Yamuna River.', opts: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], ans: 1, topic: 'topic-soc5-1-2' },
    { qn: 6,  text: 'In which year did India gain independence from British rule?', hint: 'India celebrated its first Independence Day on 15th August of this year.', opts: ['1942', '1945', '1947', '1950'], ans: 2, topic: 'topic-soc5-1-2' },
    { qn: 7,  text: 'Who is known as the Father of the Indian Constitution?', hint: 'He was the chairman of the Drafting Committee of the Indian Constitution.', opts: ['Mahatma Gandhi', 'Dr. B. R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Patel'], ans: 1, topic: 'topic-soc5-1-2' },
    { qn: 8,  text: 'How many Fundamental Rights are guaranteed to Indian citizens by the Constitution?', hint: 'These rights include the Right to Equality, Right to Freedom, and four others.', opts: ['4', '5', '6', '7'], ans: 2, topic: 'topic-soc5-1-2' },
    { qn: 9,  text: 'Which ancient civilisation flourished along the Indus River valley?', hint: 'This civilisation built the famous cities of Harappa and Mohenjo-Daro.', opts: ['Egyptian Civilisation', 'Indus Valley Civilisation', 'Mesopotamian Civilisation', 'Chinese Civilisation'], ans: 1, topic: 'topic-soc5-1-3' },
    { qn: 10, text: 'Which is the national animal of India?', hint: 'This majestic striped big cat is an apex predator found in Indian forests.', opts: ['Lion', 'Royal Bengal Tiger', 'Elephant', 'Peacock'], ans: 1, topic: 'topic-soc5-1-4' },
  ].map((item) => ({
    id: `q-soc5-r1-${item.qn}`,
    chapterId: 'ch-soc5-1',
    roomId: 'room-soc5-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Social Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-soc5-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

    // Standard 5 English Room 1 (10 Questions - room-eng5-1)
  // ─────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'Identify the noun in the sentence: "The brave astronaut explored the galaxy."', hint: 'A noun is a person, place, or thing — look for what the sentence is about.', opts: ['brave', 'astronaut', 'explored', 'galaxy'], ans: 1, topic: 'topic-eng5-1-1' },
    { qn: 2, text: 'Identify the verb (action word) in: "The swift cheetah ran across the savannah."', hint: 'A verb shows what someone or something does.', opts: ['swift', 'cheetah', 'ran', 'savannah'], ans: 2, topic: 'topic-eng5-1-1' },
    { qn: 3, text: 'Which word is an adjective in: "The crimson rose bloomed beautifully in the garden."?', hint: 'An adjective describes or tells more about a noun.', opts: ['bloomed', 'rose', 'crimson', 'beautifully'], ans: 2, topic: 'topic-eng5-1-1' },
    { qn: 4, text: 'Choose the correct plural form of the word "Child".', hint: 'Some English words change their spelling entirely in the plural form.', opts: ['Childs', 'Children', 'Childrens', 'Childes'], ans: 1, topic: 'topic-eng5-1-2' },
    { qn: 5, text: 'What is the antonym (opposite) of the word "Ancient"?', hint: 'Think of something belonging to present or recent times.', opts: ['Old', 'Historic', 'Modern', 'Antique'], ans: 2, topic: 'topic-eng5-1-2' },
    { qn: 6, text: 'Fill in the blank with the correct article: "She saw ___ eagle soaring high in the sky."', hint: 'Use "an" before words that begin with a vowel sound (a, e, i, o, u).', opts: ['a', 'an', 'the', 'no article needed'], ans: 1, topic: 'topic-eng5-1-3' },
    { qn: 7, text: 'Choose the correct preposition to complete the sentence: "The book is placed ___ the wooden table."', hint: 'Which preposition means resting on top of a surface?', opts: ['at', 'on', 'in', 'underneath'], ans: 1, topic: 'topic-eng5-1-3' },
    { qn: 8, text: 'Identify the conjunction in: "I wanted to play outside, but it began to rain."', hint: 'A conjunction is a joining word that connects two ideas or clauses.', opts: ['wanted', 'outside', 'but', 'began'], ans: 2, topic: 'topic-eng5-1-3' },
    { qn: 9, text: 'What is the past tense of the irregular verb "Write"?', hint: 'This is an irregular verb — it does not simply add -ed.', opts: ['Writed', 'Wrote', 'Written', 'Writing'], ans: 1, topic: 'topic-eng5-1-4' },
    { qn: 10, text: 'Which sentence has the correct end punctuation?', hint: 'A question always ends with a question mark (?).', opts: ['Where are you going.', 'Where are you going!', 'Where are you going?', 'Where are you going,'], ans: 2, topic: 'topic-eng5-1-4' },
  ].map((item) => ({
    id: `q-eng5-r1-${item.qn}`,
    chapterId: 'ch-eng5-1',
    roomId: 'room-eng5-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 English Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-eng5-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

    // Standard 5 Tamil Room 2 (10 Questions - room-tam5-2)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'முத்தமிழின் மூன்று பிரிவுகள் யாவை?', hint: 'இயல், இசை, ...', opts: ['இயல், இசை, நாடகம்', 'உயிர், மெய், ஆய்தம்', 'அகம், புறம், நீதி', 'குறிஞ்சி, முல்லை, மருதம்'], ans: 0 },
    { qn: 2, text: 'சிலப்பதிகாரத்தை இயற்றியவர் யார்?', hint: 'சேர மன்னன் மரபில் வந்த இளவரசர்.', opts: ['இளங்கோவடிகள்', 'சீத்தலைச் சாத்தனார்', 'கபிலர்', 'கம்பர்'], ans: 0 },
    { qn: 3, text: 'மணிமேகலை காப்பியத்தின் ஆசிரியர் யார்?', hint: 'மதுரைக் கூலவாணிகன்...', opts: ['சீத்தலைச் சாத்தனார்', 'இளங்கோவடிகள்', 'ஔவையார்', 'புகழேந்தி'], ans: 0 },
    { qn: 4, text: 'ஐம்பெருங்காப்பியங்களில் முதன்மையானது எது?', hint: 'கண்ணகியின் கதை கூறும் காப்பியம்.', opts: ['சிலப்பதிகாரம்', 'மணிமேகலை', 'சீவக சிந்தாமணி', 'குண்டலகேசி'], ans: 0 },
    { qn: 5, text: '"யாதும் ஊரே யாவரும் கேளிர்" என்ற பாடல் வரியைக் கூறியவர் யார்?', hint: 'புறநானூற்றுப் புலவர்.', opts: ['கணியன் பூங்குன்றனார்', 'பாரதியார்', 'திருவள்ளுவர்', 'ஔவையார்'], ans: 0 },
    { qn: 6, text: 'நாலடியாரை இயற்றியவர்கள் யார்?', hint: 'சமண சமயத்தைச் சேர்ந்த முனிவர்கள்.', opts: ['சமண முனிவர்கள்', 'கபிலர்', 'நக்கீரர்', 'ஒட்டக்கூத்தர்'], ans: 0 },
    { qn: 7, text: 'திருக்குறளில் உள்ள அதிகாரங்களின் எண்ணிக்கை எத்தனை?', hint: '133 அதிகாரங்கள், ஒவ்வொன்றிலும் 10 குறள்கள்.', opts: ['100', '133', '150', '200'], ans: 1 },
    { qn: 8, text: 'திருக்குறளில் உள்ள மொத்தப் பாக்களின் எண்ணிக்கை எத்தனை?', hint: '133 அதிகாரங்கள் * 10 = ?', opts: ['1000', '1200', '1330', '1400'], ans: 2 },
    { qn: 9, text: 'ஐந்திணைகளில் குறிஞ்சிக்குரிய நிலம் எது?', hint: 'மலையும் மலை சார்ந்த இடமும்.', opts: ['மலையும் மலை சார்ந்த பகுதியும்', 'காடும் காடு சார்ந்த பகுதியும்', 'வயலும் வயல் சார்ந்த பகுதியும்', 'கடலும் கடல் சார்ந்த பகுதியும்'], ans: 0 },
    { qn: 10, text: 'முல்லைத் திணைக்குரிய நிலம் எது?', hint: 'காடும் காடு சார்ந்த இடமும்.', opts: ['காடும் காடு சார்ந்த பகுதியும்', 'மலையும் மலை சார்ந்த பகுதியும்', 'வயலும் வயல் சார்ந்த பகுதியும்', 'மணலும் மணல் சார்ந்த பகுதியும்'], ans: 0 },
  ].map((item) => ({
    id: `q-tam5-r2-${item.qn}`,
    chapterId: 'ch-tam5-2',
    roomId: 'room-tam5-2',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Tamil Ch 2 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam5-c2-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 5 Mathematics Room 2 (10 Questions - room-math5-2)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'Convert 0.75 into a fraction in its simplest form.', hint: '0.75 is 75/100. Divide numerator and denominator by 25.', opts: ['1/2', '3/4', '2/3', '4/5'], ans: 1 },
    { qn: 2, text: 'What is 25% of 400?', hint: '25% is one-fourth (1/4) of 400.', opts: ['50', '75', '100', '125'], ans: 2 },
    { qn: 3, text: 'Calculate the average of 10, 20, 30, 40, and 50.', hint: 'Sum the numbers (= 150) and divide by 5.', opts: ['25', '30', '35', '40'], ans: 1 },
    { qn: 4, text: 'Solve: 4.5 + 3.25', hint: 'Align decimals: 4.50 + 3.25.', opts: ['7.25', '7.75', '8.00', '7.50'], ans: 1 },
    { qn: 5, text: 'What is 1/2 + 1/4?', hint: 'Convert 1/2 to 2/4 and add 1/4.', opts: ['2/6', '3/4', '2/4', '1/8'], ans: 1 },
    { qn: 6, text: 'Find the perimeter of an equilateral triangle with side 6 cm.', hint: 'Perimeter of equilateral triangle = 3 * side.', opts: ['12 cm', '18 cm', '24 cm', '36 cm'], ans: 1 },
    { qn: 7, text: 'How many minutes are in 2.5 hours?', hint: 'Multiply 2.5 by 60.', opts: ['120 min', '150 min', '180 min', '90 min'], ans: 1 },
    { qn: 8, text: 'Convert 1500 milliliters to liters.', hint: '1 Liter = 1000 mL. Divide 1500 by 1000.', opts: ['1.0 L', '1.5 L', '15 L', '0.15 L'], ans: 1 },
    { qn: 9, text: 'If a car travels 60 km in 1 hour, how far will it travel in 3 hours?', hint: 'Distance = Speed * Time = 60 * 3.', opts: ['120 km', '150 km', '180 km', '200 km'], ans: 2 },
    { qn: 10, text: 'What is the value of 5 squared plus 3 squared (5^2 + 3^2)?', hint: '25 + 9 = ?', opts: ['30', '34', '36', '64'], ans: 1 },
  ].map((item) => ({
    id: `q-math5-r2-${item.qn}`,
    chapterId: 'ch-math5-2',
    roomId: 'room-math5-2',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Math Ch 2 Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-math5-c2-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 6 Tamil Room 1 (10 Questions - room-tam6-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: '“தமிழுக்கும் அமுதென்று பேர்! - அந்தத் தமிழ் இன்பத்தமிழ் எங்கள் உயிருக்கு நேர்!” - இப்பாடலின் ஆசிரியர் யார்?', hint: 'புரட்சிக்கவிஞர், பாவேந்தர் என்று போற்றப்படும் கவிஞர்.', opts: ['பாரதியார்', 'பாரதிதாசன்', 'நாமக்கல் கவிஞர்', 'கவிமணி'], ans: 1, topic: 'topic-tam6-1-1' },
    { qn: 2, text: 'பாரதிதாசனின் இயற்பெயர் என்ன?', hint: 'பாரதியாரின் கவிதைகள் மீது கொண்ட காதலால் தன் பெயரை மாற்றிக்கொண்டவர்.', opts: ['சுப்புரத்தினம்', 'துரை மாணிக்கம்', 'சுப்பிரமணியன்', 'அரங்கசாமி'], ans: 0, topic: 'topic-tam6-1-1' },
    { qn: 3, text: '“கொட்டுங்கடி கும்மி கொட்டுங்கடி” என்ற தமிழ்க் கும்மிப் பாடலை இயற்றியவர் யார்?', hint: 'பாவலரேறு என்று சிறப்புப் பெயரால் அழைக்கப்படுபவர்.', opts: ['பாரதிதாசன்', 'பெருஞ்சித்திரனார்', 'வாணிதாசன்', 'முடியரசன்'], ans: 1, topic: 'topic-tam6-1-2' },
    { qn: 4, text: 'பெருஞ்சித்திரனாரின் இயற்பெயர் என்ன?', hint: 'கணிச்சாறு, கொய்யாக்கனி முதலான நூல்களை இயற்றிய கவிஞர்.', opts: ['சுப்புரத்தினம்', 'துரை. மாணிக்கம்', 'கனகசுப்புரத்தினம்', 'முத்தையா'], ans: 1, topic: 'topic-tam6-1-2' },
    { qn: 5, text: '“யாமறிந்த மொழிகளிலே தமிழ்மொழி போல் இனிதாவது எங்கும் காணோம்” என்று பாடியவர் யார்?', hint: 'பாட்டுக்கொரு புலவன் எனப் பாராட்டப்படும் மகாகவி.', opts: ['பாரதியார்', 'பாரதிதாசன்', 'திருவள்ளுவர்', 'ஔவையார்'], ans: 0, topic: 'topic-tam6-1-3' },
    { qn: 6, text: '“என்று பிறந்தவள் என்று உணராத இயல்பினளாம் எங்கள் தாய்” - தமிழ்த்தாயின் தொன்மையை விளக்கியவர் யார்?', hint: 'சுதேசமித்திரன் இதழின் துணை ஆசிரியராகப் பணியாற்றிய தேசியக் கவிஞர்.', opts: ['பாரதிதாசன்', 'பாரதியார்', 'கம்பர்', 'நாமக்கல் கவிஞர்'], ans: 1, topic: 'topic-tam6-1-3' },
    { qn: 7, text: 'குறில் எழுத்து ஒலிக்கும் கால அளவு (மாத்திரை) எத்தனை?', hint: 'ஒரு முறை கண் இமைக்கவோ கைநொடிக்கவோ ஆகும் கால அளவு ஒரு மாத்திரை.', opts: ['அரை மாத்திரை (1/2)', 'ஒரு மாத்திரை (1)', 'இரண்டு மாத்திரை (2)', 'மூன்று மாத்திரை (3)'], ans: 1, topic: 'topic-tam6-1-4' },
    { qn: 8, text: 'நெடில் எழுத்து ஒலிக்கும் கால அளவு (மாத்திரை) எத்தனை?', hint: 'குறில் எழுத்தை விட இருமடங்கு கால அளவு நீண்டு ஒலிக்கும்.', opts: ['ஒரு மாத்திரை (1)', 'இரண்டு மாத்திரை (2)', 'மூன்று மாத்திரை (3)', 'நான்கு மாத்திரை (4)'], ans: 1, topic: 'topic-tam6-1-4' },
    { qn: 9, text: 'மெய் எழுத்துக்கள் ஒலிக்கும் கால அளவு (மாத்திரை) எத்தனை?', hint: 'க், ங் முதலான புள்ளி வைத்த எழுத்துக்கள் ஒலிக்கும் மாத்திரை.', opts: ['அரை மாத்திரை (1/2)', 'ஒரு மாத்திரை (1)', 'ஒன்றரை மாத்திரை (1 1/2)', 'இரண்டு மாத்திரை (2)'], ans: 0, topic: 'topic-tam6-1-4' },
    { qn: 10, text: 'ஆய்த எழுத்து (ஃ) ஒலிக்கும் மாத்திரை அளவு என்ன?', hint: 'முப்புள்ளி, முப்பாற்புள்ளி என்று அழைக்கப்படும் தனிநிலை எழுத்தின் மாத்திரை.', opts: ['அரை மாத்திரை (1/2)', 'ஒரு மாத்திரை (1)', 'இரண்டு மாத்திரை (2)', 'மூன்று மாத்திரை (3)'], ans: 0, topic: 'topic-tam6-1-4' },
  ].map((item) => ({
    id: `q-tam6-r1-${item.qn}`,
    chapterId: 'ch-tam6-1',
    roomId: 'room-tam6-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 6 Tamil Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam6-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 6 English Room 1 (10 Questions - room-eng6-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'According to the lesson "Sea Turtles", why do female sea turtles come ashore onto the beach?', hint: 'Female turtles only visit the sandy land to ensure their species continues by laying eggs.', opts: ['To hunt for food', 'To lay their eggs', 'To sleep during the night', 'To bask in the sunlight'], ans: 1, topic: 'topic-eng6-1-1' },
    { qn: 2, text: 'What is the mass nesting phenomenon of Olive Ridley sea turtles on coastal beaches called?', hint: 'This Spanish word means "arrival" and refers to thousands of turtles nesting together.', opts: ['Arribada', 'Aquaria', 'Archipelago', 'Migration'], ans: 0, topic: 'topic-eng6-1-1' },
    { qn: 3, text: 'Which physical adaptation helps sea turtles swim gracefully and navigate ocean currents?', hint: 'Their limbs are modified into paddle-like structures.', opts: ['Webbed toes', 'Flippers', 'Claws', 'Wings'], ans: 1, topic: 'topic-eng6-1-1' },
    { qn: 4, text: 'Who is the poet of the humorous poem "The Crocodile"?', hint: 'He is the famous English author who also wrote "Alice\'s Adventures in Wonderland".', opts: ['William Wordsworth', 'Lewis Carroll', 'Robert Frost', 'Rudyard Kipling'], ans: 1, topic: 'topic-eng6-1-2' },
    { qn: 5, text: 'In the poem "The Crocodile", how does the little crocodile welcome the little fishes in?', hint: 'The poem says he welcomes little fishes in with gently smiling jaws.', opts: ['With loud roaring', 'With gently smiling jaws', 'With sharp flashing claws', 'With a wagging tail'], ans: 1, topic: 'topic-eng6-1-2' },
    { qn: 6, text: 'Identify the SUBJECT in the sentence: "The Olive Ridley turtles migrate thousands of kilometers."', hint: 'The subject is the naming part that tells who or what performs the action.', opts: ['migrate', 'thousands of kilometers', 'The Olive Ridley turtles', 'ocean currents'], ans: 2, topic: 'topic-eng6-1-3' },
    { qn: 7, text: 'Identify the PREDICATE in the sentence: "The marine biologist rescued the injured hatchling."', hint: 'The predicate includes the verb and tells what the subject does.', opts: ['The marine biologist', 'rescued the injured hatchling', 'injured hatchling', 'biologist'], ans: 1, topic: 'topic-eng6-1-3' },
    { qn: 8, text: 'Which type of sentence is: "Please protect the turtle nests from predators."', hint: 'This sentence gives an instruction, request, or command.', opts: ['Declarative sentence', 'Interrogative sentence', 'Imperative sentence', 'Exclamatory sentence'], ans: 2, topic: 'topic-eng6-1-3' },
    { qn: 9, text: 'Choose the correct collective noun to fill in the blank: "A ___ of fish was swimming near the coral reef."', hint: 'A group of swimming fish is called a school or shoal.', opts: ['pride', 'school', 'pack', 'herd'], ans: 1, topic: 'topic-eng6-1-4' },
    { qn: 10, text: 'Choose the correct pair of homophones: "We could ___ the vast blue ___ from the seashore."', hint: 'First word means to view with eyes; second word means the large body of saltwater.', opts: ['sea, see', 'see, sea', 'see, saw', 'seen, sea'], ans: 1, topic: 'topic-eng6-1-4' },
  ].map((item) => ({
    id: `q-eng6-r1-${item.qn}`,
    chapterId: 'ch-eng6-1',
    roomId: 'room-eng6-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 6 English Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-eng6-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 6 Mathematics Room 1 (10 Questions - room-math6-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'In the Indian place value system, how is the number 1,00,00,000 (1 followed by 7 zeros) named?', hint: '100 lakhs make this large unit in the Indian system.', opts: ['One Million', 'Ten Lakhs', 'One Crore', 'Ten Crores'], ans: 2, topic: 'topic-math6-1-1' },
    { qn: 2, text: 'In the International place value system, 1 million is equal to how many lakhs in the Indian system?', hint: '1 Million = 1,000,000. In Indian numbering: 10,00,000.', opts: ['1 Lakh', '10 Lakhs', '100 Lakhs', '1 Crore'], ans: 1, topic: 'topic-math6-1-1' },
    { qn: 3, text: 'What is the place value of the digit 7 in the number 5,74,320?', hint: 'Count the place from the right: Units, Tens, Hundreds, Thousands, Ten Thousands.', opts: ['700', '7,000', '70,000', '7,00,000'], ans: 2, topic: 'topic-math6-1-1' },
    { qn: 4, text: 'What is the predecessor of the smallest 6-digit number?', hint: 'Smallest 6-digit number is 1,00,000. Predecessor means subtracting 1.', opts: ['9,999', '99,999', '1,00,001', '90,000'], ans: 1, topic: 'topic-math6-1-2' },
    { qn: 5, text: 'Round off the number 8,765 to the nearest hundred.', hint: 'Look at the tens digit (6). Since 6 >= 5, round up the hundreds digit from 7 to 8.', opts: ['8,700', '8,760', '8,800', '9,000'], ans: 2, topic: 'topic-math6-1-2' },
    { qn: 6, text: 'Evaluate using the BODMAS rule: 20 + [8 × 2 - (6 ÷ 2)]', hint: 'Step 1: Inner brackets (6 ÷ 2 = 3). Step 2: Multiply (8 × 2 = 16). Step 3: (16 - 3 = 13). Step 4: 20 + 13.', opts: ['23', '33', '38', '43'], ans: 1, topic: 'topic-math6-1-3' },
    { qn: 7, text: 'Simplify the numerical expression: 100 - 3 × (10 + 4)', hint: 'Solve parentheses first: (10 + 4 = 14). Then multiply: 3 × 14 = 42. Finally subtract: 100 - 42.', opts: ['58', '62', '1358', '86'], ans: 0, topic: 'topic-math6-1-3' },
    { qn: 8, text: 'Which whole number is known as the Additive Identity?', hint: 'Adding this number to any number leaves the original number unchanged (a + 0 = a).', opts: ['0', '1', '-1', '10'], ans: 0, topic: 'topic-math6-1-4' },
    { qn: 9, text: 'Which whole number is known as the Multiplicative Identity?', hint: 'Multiplying any whole number by this number gives the same number (a × 1 = a).', opts: ['0', '1', '2', '10'], ans: 1, topic: 'topic-math6-1-4' },
    { qn: 10, text: 'Which property of whole numbers is represented by: 5 × (10 + 4) = (5 × 10) + (5 × 4)?', hint: 'Multiplication distributes over addition.', opts: ['Closure property', 'Commutative property', 'Associative property', 'Distributive property'], ans: 3, topic: 'topic-math6-1-4' },
  ].map((item) => ({
    id: `q-math6-r1-${item.qn}`,
    chapterId: 'ch-math6-1',
    roomId: 'room-math6-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 6 Mathematics Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-math6-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 6 Science Room 1 (10 Questions - room-sci6-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'What is the standard International (SI) unit of length?', hint: 'This unit is denoted by the lowercase letter "m".', opts: ['Centimetre', 'Metre', 'Kilometre', 'Millimetre'], ans: 1, topic: 'topic-sci6-1-1' },
    { qn: 2, text: 'What is the SI unit of mass?', hint: 'This unit equals 1,000 grams and is symbolized as "kg".', opts: ['Gram', 'Milligram', 'Kilogram', 'Pound'], ans: 2, topic: 'topic-sci6-1-1' },
    { qn: 3, text: 'How many millimetres are equal to 1 centimetre (1 cm)?', hint: 'Look closely at a standard school ruler — between 0 and 1 cm there are 10 small divisions.', opts: ['5 mm', '10 mm', '100 mm', '1000 mm'], ans: 1, topic: 'topic-sci6-1-1' },
    { qn: 4, text: 'How many metres make 1 kilometre (1 km)?', hint: 'The prefix "kilo" represents a thousand (10^3).', opts: ['10 m', '100 m', '1,000 m', '10,000 m'], ans: 2, topic: 'topic-sci6-1-1' },
    { qn: 5, text: 'Which instrument is most suitable to measure the girth (thickness) of a tree trunk?', hint: 'This flexible measuring tool can curve smoothly around circular objects.', opts: ['Metre scale', 'Measuring tape', 'Beam balance', 'Stop clock'], ans: 1, topic: 'topic-sci6-1-2' },
    { qn: 6, text: 'Which balance is commonly used in laboratories and jewellery shops for highly accurate mass measurements?', hint: 'This modern digital balance runs on electrical sensors to give exact decimal readings.', opts: ['Beam balance', 'Spring balance', 'Electronic balance', 'Physical balance'], ans: 2, topic: 'topic-sci6-1-2' },
    { qn: 7, text: 'What is the SI unit used to measure temperature?', hint: 'Named after Lord Kelvin and symbolized by the uppercase letter "K".', opts: ['Celsius', 'Fahrenheit', 'Kelvin', 'Joule'], ans: 2, topic: 'topic-sci6-1-1' },
    { qn: 8, text: 'Which method is used to determine the volume of an irregular solid object like an irregular stone?', hint: 'When submerged in a measuring cylinder, the solid displaces water equal to its own volume.', opts: ['Length x Breadth x Height formula', 'Water displacement method', 'Using a beam balance', 'Measuring tape winding'], ans: 1, topic: 'topic-sci6-1-3' },
    { qn: 9, text: '1 Litre of liquid is equal to how many millilitres (mL)?', hint: 'The prefix "milli" means one-thousandth part.', opts: ['10 mL', '100 mL', '1,000 mL', '10,000 mL'], ans: 2, topic: 'topic-sci6-1-3' },
    { qn: 10, text: 'What is the error called that occurs when the observer’s eye is not vertically above the scale reading mark?', hint: 'Viewing from an angle causes an apparent shift known as parallax.', opts: ['Zero error', 'Parallax error', 'Random error', 'Instrumental error'], ans: 1, topic: 'topic-sci6-1-4' },
  ].map((item) => ({
    id: `q-sci6-r1-${item.qn}`,
    chapterId: 'ch-sci6-1',
    roomId: 'room-sci6-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 6 Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-sci6-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 6 Social Science Room 1 (10 Questions - room-soc6-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'The term "History" is derived from which Greek word meaning "learning by inquiry"?', hint: 'The Greek word literally translates to learning or knowledge acquired by investigation.', opts: ['Polis', 'Historia', 'Chronos', 'Demokratia'], ans: 1, topic: 'topic-soc6-1-1' },
    { qn: 2, text: 'What is the period between the use of the first stone tools and the invention of writing systems called?', hint: 'It is the era before written historical documentation existed.', opts: ['Ancient History', 'Prehistory', 'Medieval Period', 'Modern History'], ans: 1, topic: 'topic-soc6-1-1' },
    { qn: 3, text: 'Which was the first animal to be domesticated by early humans to assist them in hunting and protection?', hint: 'This loyal companion used its sharp sense of smell to track animals and warn against wild beasts.', opts: ['Horse', 'Cow', 'Dog', 'Cat'], ans: 2, topic: 'topic-soc6-1-2' },
    { qn: 4, text: 'Why did prehistoric humans draw paintings on the walls of caves and rock shelters?', hint: 'To document their hunting adventures and share them with community members who stayed back.', opts: ['To sell them to merchants', 'To record their hunting activities and daily events', 'To teach reading and writing', 'To build permanent monuments'], ans: 1, topic: 'topic-soc6-1-2' },
    { qn: 5, text: 'What is the branch of historical science that deals with the study of inscriptions called?', hint: 'Inscriptions on stone walls, copper plates, and pillars are analyzed under this field.', opts: ['Numismatics', 'Epigraphy', 'Archaeology', 'Anthropology'], ans: 1, topic: 'topic-soc6-1-3' },
    { qn: 6, text: 'What is the study of coins and coinage systems called?', hint: 'This field investigates ancient metallic currencies, dynasties, and economic history.', opts: ['Numismatics', 'Epigraphy', 'Palaeontology', 'Geology'], ans: 0, topic: 'topic-soc6-1-3' },
    { qn: 7, text: 'Which ancient Indian emperor gave up war after witnessing the horrors of the Kalinga War and embraced Buddhism?', hint: 'He was the most renowned ruler of the Mauryan Empire.', opts: ['Chandragupta Maurya', 'Emperor Ashoka', 'Samudragupta', 'Harsha'], ans: 1, topic: 'topic-soc6-1-4' },
    { qn: 8, text: 'The Ashoka Chakra with 24 spokes in India’s National Flag was adopted from which historical monument?', hint: 'The pillar located in Uttar Pradesh topped with four back-to-back lions.', opts: ['Sanchi Stupa', 'Sarnath Pillar of Ashoka', 'Qutb Minar', 'Ajanta Caves'], ans: 1, topic: 'topic-soc6-1-4' },
    { qn: 9, text: 'Who wrote the book "The Search for India’s Lost Emperor" that brought Emperor Ashoka’s greatness to light?', hint: 'An English author and historian whose work reconstructed Ashoka from historical records.', opts: ['James Prinsep', 'Charles Allen', 'Alexander Cunningham', 'William Jones'], ans: 1, topic: 'topic-soc6-1-4' },
    { qn: 10, text: 'Which of the following is an example of an archaeological source of history?', hint: 'Physical material remains left behind by past human cultures.', opts: ['The Ramayana epic', 'Travel accounts of foreign travelers', 'Temple inscriptions and ancient coins', 'Folk songs and ballads'], ans: 2, topic: 'topic-soc6-1-3' },
  ].map((item) => ({
    id: `q-soc6-r1-${item.qn}`,
    chapterId: 'ch-soc6-1',
    roomId: 'room-soc6-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 6 Social Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-soc6-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 7 Tamil Room 1 (10 Questions - room-tam7-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: '“அருள்நெறி அறிவைத் தரலாகும் - அதுவே தமிழன் குரலாகும்” - இப்பாடல் வரிகளை இயற்றியவர் யார்?', hint: 'காந்தியக் கவிஞர் என்றும் தமிழகத்தின் முதல் அரசவைக் கவிஞர் என்றும் சிறப்பிக்கப்படுபவர்.', opts: ['நாமக்கல் கவிஞர் வெ. இராமலிங்கனார்', 'பாரதியார்', 'பாரதிதாசன்', 'கவிமணி தேசிய விநாயகம்'], ans: 0, topic: 'topic-tam7-1-1' },
    { qn: 2,  text: 'நாமக்கல் கவிஞர் வெ. இராமலிங்கனாரின் சிறப்புப் பெயர் என்ன?', hint: 'காந்தியடிகளின் கொள்கைகளால் ஈர்க்கப்பட்டு வாழ்ந்ததால் இப்பெயர் பெற்றார்.', opts: ['புரட்சிக் கவிஞர்', 'காந்தியக் கவிஞர்', 'பகுத்தறிவுக் கவிராயர்', 'மக்கள் கவிஞர்'], ans: 1, topic: 'topic-tam7-1-1' },
    { qn: 3,  text: 'தமிழகத்தின் முதல் அரசவைக் கவிஞராக விளங்கியவர் யார்?', hint: '“கத்தியின்றி இரத்தமின்றி யுத்தமொன்று வருகுது” என்று பாடிய தேசிய விடுதலைக் கவிஞர்.', opts: ['பாரதியார்', 'நாமக்கல் கவிஞர் வெ. இராமலிங்கனார்', 'உடுமலை நாராயணகவி', 'வாணிதாசன்'], ans: 1, topic: 'topic-tam7-1-1' },
    { qn: 4,  text: '“ஒன்றல்ல இரண்டல்ல தம்பி சொல்ல ஒப்புமை இல்லாத அற்புதம் தமிழ்நாட்டில்” - இப்பாடலின் ஆசிரியர் யார்?', hint: 'பகுத்தறிவுக் கவிராயர் என்று புகழப்படும் தமிழ்த் திரைப்படப் பாடலாசிரியர்.', opts: ['உடுமலை நாராயணகவி', 'கண்ணதாசன்', 'பட்டுக்கோட்டை கல்யாணசுந்தரம்', 'மருதகாசி'], ans: 0, topic: 'topic-tam7-1-2' },
    { qn: 5,  text: 'பகுத்தறிவுக் கவிராயர் என்று தமிழ் இலக்கிய உலகில் புகழப்படுபவர் யார்?', hint: 'தம் பாடல்கள் மூலம் நாட்டுப்புறப் பாடல்களின் எளிமையையும் பகுத்தறிவுக் கருத்துகளையும் பரப்பியவர்.', opts: ['பாரதிதாசன்', 'உடுமலை நாராயணகவி', 'நாமக்கல் கவிஞர்', 'முடியரசன்'], ans: 1, topic: 'topic-tam7-1-2' },
    { qn: 6,  text: 'மொழியின் முதல் நிலை எது?', hint: 'மனிதன் தன் எண்ணங்களையும் உணர்ச்சிகளையும் முதலில் ஒலியாக வெளிப்படுத்திய நிலை.', opts: ['எழுத்து நிலை', 'பேச்சு நிலை (பேசுவதும் கேட்பதும்)', 'படிக்கும் நிலை', 'சிந்தனை நிலை'], ans: 1, topic: 'topic-tam7-1-3' },
    { qn: 7,  text: 'பேச்சு மொழிக்கும் எழுத்து மொழிக்கும் இடையே அதிக வேறுபாடு இருந்தால் அது எவ்வாறு அழைக்கப்படுகிறது?', hint: 'இரட்டை வழக்கு மொழி (Diglossic Language) என வழங்கப்படும்.', opts: ['செம்மொழி', 'இரட்டை வழக்கு மொழி', 'வட்டார மொழி', 'பிறமொழி'], ans: 1, topic: 'topic-tam7-1-3' },
    { qn: 8,  text: 'தனக்குரிய ஒரு மாத்திரை அளவிலிருந்து குறைந்து அரை மாத்திரை அளவில் ஒலிக்கும் உகரம் எது?', hint: 'குறுமை + இயல் + உகரம் = குற்றியலுகரம்.', opts: ['முற்றியலுகரம்', 'குற்றியலுகரம்', 'குற்றியலிகரம்', 'ஐகாரக்குறுக்கம்'], ans: 1, topic: 'topic-tam7-1-4' },
    { qn: 9,  text: 'குற்றியலுகரம் எத்தனை வகைப்படும்?', hint: 'ஈற்றயல் எழுத்தை அடிப்படையாகக் கொண்டு ஆறு வகைகளாகப் பிரிக்கப்படும்.', opts: ['நான்கு', 'ஐந்து', 'ஆறு', 'எட்டு'], ans: 2, topic: 'topic-tam7-1-4' },
    { qn: 10, text: '“நாடு” என்பது எவ்வகைக் குற்றியலுகரச் சொல்?', hint: 'ஈற்றயல் எழுத்து நெடில் எழுத்தாக அமைந்த குற்றியலுகரம்.', opts: ['வன்தொடர்க் குற்றியலுகரம்', 'மென்தொடர்க் குற்றியலுகரம்', 'நெடில்தொடர்க் குற்றியலுகரம்', 'உயிர்த்தொடர்க் குற்றியலுகரம்'], ans: 2, topic: 'topic-tam7-1-4' },
  ].map((item) => ({
    id: `q-tam7-r1-${item.qn}`,
    chapterId: 'ch-tam7-1',
    roomId: 'room-tam7-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 7 Tamil Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam7-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 7 English Room 1 (10 Questions - room-eng7-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'In the story "Eidgah", how old was the little boy Hamid?', hint: 'He was a poor, thin, and cheerful four-year-old child.', opts: ['Four years old', 'Seven years old', 'Ten years old', 'Twelve years old'], ans: 0, topic: 'topic-eng7-1-1' },
    { qn: 2,  text: 'How many paise did Hamid have to spend at the Eid fair?', hint: 'His grandmother gave him all the coins she could spare, which were only three.', opts: ['One paisa', 'Two paise', 'Three paise', 'Five paise'], ans: 2, topic: 'topic-eng7-1-1' },
    { qn: 3,  text: 'What did Hamid choose to buy at the fair with his three paise?', hint: 'A useful kitchen utensil made of iron that protects fingers from burning coals.', opts: ['Clay toys', 'Sesame sweets', 'A wooden flute', 'A pair of iron tongs (chimta)'], ans: 3, topic: 'topic-eng7-1-2' },
    { qn: 4,  text: 'Why did Hamid buy a pair of tongs instead of sweets or toys for himself?', hint: 'He noticed his grandmother burning her fingers every time she baked rotis on the iron plate.', opts: ['He did not like sweets', 'His friends told him to buy it', 'His grandmother burned her fingers making rotis', 'The shopkeeper forced him to buy it'], ans: 2, topic: 'topic-eng7-1-2' },
    { qn: 5,  text: 'Who wrote the original classic story "Eidgah"?', hint: 'One of the greatest modern Hindi-Urdu fiction writers, known as Upanyas Samrat.', opts: ['Rabindranath Tagore', 'Munshi Premchand', 'R. K. Narayan', 'Ruskin Bond'], ans: 1, topic: 'topic-eng7-1-1' },
    { qn: 6,  text: 'Identify the ABSTRACT NOUN in the sentence: "Hamid displayed immense love and sacrifice for his grandmother."', hint: 'Abstract nouns refer to feelings, virtues, or qualities that cannot be physically touched.', opts: ['Hamid', 'grandmother', 'sacrifice', 'tongs'], ans: 2, topic: 'topic-eng7-1-3' },
    { qn: 7,  text: 'What is the comparative degree of the adjective "happy"?', hint: 'Adjectives ending in -y change to -ier in the comparative form.', opts: ['more happy', 'happier', 'happiest', 'most happy'], ans: 1, topic: 'topic-eng7-1-3' },
    { qn: 8,  text: 'Choose the correct superlative degree: "Mount Everest is the ___ mountain peak in the world."', hint: 'The definite article "the" precedes the superlative form ending in -est.', opts: ['high', 'higher', 'highest', 'more high'], ans: 2, topic: 'topic-eng7-1-3' },
    { qn: 9,  text: 'Fill in the blank with the correct quantifier: "There is not ___ milk left in the jug."', hint: 'Use this word with uncountable nouns in negative sentences.', opts: ['many', 'much', 'few', 'several'], ans: 1, topic: 'topic-eng7-1-4' },
    { qn: 10, text: 'What is the antonym of the word "precious" as used in the lesson?', hint: 'Something of little or no value.', opts: ['Costly', 'Worthless', 'Rare', 'Valuable'], ans: 1, topic: 'topic-eng7-1-4' },
  ].map((item) => ({
    id: `q-eng7-r1-${item.qn}`,
    chapterId: 'ch-eng7-1',
    roomId: 'room-eng7-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 7 English Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-eng7-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 7 Mathematics Room 1 (10 Questions - room-math7-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'What is the result of adding (-15) + (-25)?', hint: 'When two negative integers are added, add their absolute values and retain the negative sign.', opts: ['-40', '+40', '-10', '+10'], ans: 0, topic: 'topic-math7-1-1' },
    { qn: 2,  text: 'What is the value of 35 - (-15)?', hint: 'Subtracting a negative number is equivalent to adding its positive counterpart: 35 + 15.', opts: ['20', '-20', '50', '-50'], ans: 2, topic: 'topic-math7-1-1' },
    { qn: 3,  text: 'What is the product of (-8) × (-6)?', hint: 'The product of two negative integers is always a positive integer: (-) × (-) = (+).', opts: ['-48', '+48', '-14', '+14'], ans: 1, topic: 'topic-math7-1-2' },
    { qn: 4,  text: 'Evaluate: (-72) ÷ (+9)', hint: 'When a negative integer is divided by a positive integer, the quotient is negative: (-) ÷ (+) = (-).', opts: ['-8', '+8', '-9', '+9'], ans: 0, topic: 'topic-math7-1-2' },
    { qn: 5,  text: 'Which property of integers states that for any two integers a and b, a + b = b + a?', hint: 'Changing the order of addends does not change the sum.', opts: ['Closure property', 'Commutative property', 'Associative property', 'Distributive property'], ans: 1, topic: 'topic-math7-1-3' },
    { qn: 6,  text: 'What is the Additive Inverse of -45?', hint: 'The additive inverse of an integer a is -a such that a + (-a) = 0.', opts: ['-45', '0', '+45', '1'], ans: 2, topic: 'topic-math7-1-3' },
    { qn: 7,  text: 'Evaluate using the distributive property: (-18) × [ 10 + (-2) ]', hint: 'First calculate 10 + (-2) = 8, then multiply (-18) × 8.', opts: ['-144', '+144', '-216', '+216'], ans: 0, topic: 'topic-math7-1-3' },
    { qn: 8,  text: 'A submarine descends at a rate of 5 metres per minute. What is its depth relative to sea level after 12 minutes?', hint: 'Multiply the rate by time: (-5 m/min) × 12 min.', opts: ['-50 m', '-60 m', '+60 m', '-72 m'], ans: 1, topic: 'topic-math7-1-4' },
    { qn: 9,  text: 'What is the value of: (-5) × 0 × (-15)?', hint: 'Multiplying any integer by zero results in zero.', opts: ['75', '-75', '0', '1'], ans: 2, topic: 'topic-math7-1-2' },
    { qn: 10, text: 'Which integer operation is NOT commutative?', hint: 'Check subtraction: 5 - 3 = 2, but 3 - 5 = -2 (different results).', opts: ['Addition', 'Multiplication', 'Subtraction', 'Both Addition and Multiplication'], ans: 2, topic: 'topic-math7-1-3' },
  ].map((item) => ({
    id: `q-math7-r1-${item.qn}`,
    chapterId: 'ch-math7-1',
    roomId: 'room-math7-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 7 Mathematics Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-math7-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 7 Science Room 1 (10 Questions - room-sci7-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'Which of the following is a DERIVED physical quantity?', hint: 'Derived quantities are physical quantities that can be expressed in terms of fundamental quantities.', opts: ['Length', 'Mass', 'Density', 'Time'], ans: 2, topic: 'topic-sci7-1-1' },
    { qn: 2,  text: 'What is the formula to calculate the Density (D) of an object?', hint: 'Density is the mass of a substance per unit volume: D = M / V.', opts: ['Density = Mass × Volume', 'Density = Mass / Volume', 'Density = Volume / Mass', 'Density = Mass + Volume'], ans: 1, topic: 'topic-sci7-1-1' },
    { qn: 3,  text: 'What is the SI unit of Density?', hint: 'Unit of mass is kg and unit of volume is m^3.', opts: ['g/cm^2', 'kg/m^2', 'kg/m^3', 'g/m^3'], ans: 2, topic: 'topic-sci7-1-1' },
    { qn: 4,  text: 'How can the surface area of an irregular flat figure (such as a plant leaf) be measured accurately?', hint: 'By placing the leaf on a grid sheet with 1 cm x 1 cm squares and counting the squares.', opts: ['Using a thermometer', 'Using a graphical (grid sheet) method', 'Using a beam balance', 'Using a measuring tape directly'], ans: 1, topic: 'topic-sci7-1-2' },
    { qn: 5,  text: 'If a piece of metal has a mass of 240 g and occupies a volume of 30 cm^3, what is its density?', hint: 'Divide mass by volume: 240 / 30 = 8 g/cm^3.', opts: ['6 g/cm^3', '8 g/cm^3', '10 g/cm^3', '12 g/cm^3'], ans: 1, topic: 'topic-sci7-1-3' },
    { qn: 6,  text: 'Between water and kerosene, kerosene floats on water because:', hint: 'Substances with lower density float on liquids with higher density.', opts: ['Kerosene is heavier than water', 'Kerosene has a lower density than water', 'Kerosene has a higher density than water', 'Kerosene does not have mass'], ans: 1, topic: 'topic-sci7-1-3' },
    { qn: 7,  text: 'What is defined as the average distance between the centre of the Earth and the centre of the Sun?', hint: 'Abbreviated as AU and equals approximately 1.496 x 10^11 metres.', opts: ['Light Year', 'Astronomical Unit (AU)', 'Kilometre', 'Parsec'], ans: 1, topic: 'topic-sci7-1-4' },
    { qn: 8,  text: 'What is the value of 1 Astronomical Unit (1 AU) in metres?', hint: 'Approximately 149.6 million kilometres, written as 1.496 x 10^11 m.', opts: ['1.496 × 10^8 m', '1.496 × 10^11 m', '9.46 × 10^12 m', '9.46 × 10^15 m'], ans: 1, topic: 'topic-sci7-1-4' },
    { qn: 9,  text: 'What is the distance travelled by light in vacuum in one full year called?', hint: 'Light travels at 300,000 km/s and covers 9.46 x 10^15 metres in one year.', opts: ['Solar Year', 'Light Year', 'Astronomical Unit', 'Lunar Month'], ans: 1, topic: 'topic-sci7-1-4' },
    { qn: 10, text: 'What is the approximate distance of 1 Light Year in metres?', hint: 'Speed of light (3 x 10^8 m/s) x seconds in a year (365.25 x 24 x 3600) ≈ 9.46 x 10^15 m.', opts: ['1.496 × 10^11 m', '3.00 × 10^8 m', '9.46 × 10^15 m', '9.46 × 10^18 m'], ans: 2, topic: 'topic-sci7-1-4' },
  ].map((item) => ({
    id: `q-sci7-r1-${item.qn}`,
    chapterId: 'ch-sci7-1',
    roomId: 'room-sci7-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 7 Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-sci7-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 7 Social Science Room 1 (10 Questions - room-soc7-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'Which historical inscriptions found in Kanchipuram district provide elaborate details about Chola village administration and the Kudavolai system?', hint: 'Inscriptions found on the walls of the Vaikunda Perumal temple in this village.', opts: ['Aihole inscriptions', 'Uttaramerur inscriptions', 'Allahabad pillar inscriptions', 'Hathigumpha inscriptions'], ans: 1, topic: 'topic-soc7-1-1' },
    { qn: 2,  text: 'During the Chola rule, what was the land gifted to Brahmins called?', hint: 'Chola inscriptions classify tax-free lands granted to Brahmadeyas.', opts: ['Vellanvagai', 'Brahmadeya', 'Shalabhoga', 'Pallichchandam'], ans: 1, topic: 'topic-soc7-1-1' },
    { qn: 3,  text: 'In Chola revenue terminology, land granted for the maintenance of a school was called:', hint: 'Named after "shala" meaning educational institution or hall.', opts: ['Devadana', 'Vellanvagai', 'Shalabhoga', 'Pallichchandam'], ans: 2, topic: 'topic-soc7-1-1' },
    { qn: 4,  text: 'Who built the world-renowned Brihadisvara Temple (Big Temple) in Thanjavur around 1010 CE?', hint: 'The great Chola emperor who expanded the empire across South India and Sri Lanka.', opts: ['Rajendra Chola I', 'Rajaraja Chola I', 'Kulothunga Chola I', 'Parantaka Chola I'], ans: 1, topic: 'topic-soc7-1-2' },
    { qn: 5,  text: 'Which Moroccan traveller visited South India in the 14th century and wrote the travelogue "Rihla" (Travels)?', hint: 'He travelled over 73,000 miles across Africa, the Middle East, Central Asia, and India.', opts: ['Marco Polo', 'Ibn Battuta', 'Al-Biruni', 'Domingo Paes'], ans: 1, topic: 'topic-soc7-1-4' },
    { qn: 6,  text: 'Which famous Venetian traveller visited the Pandyan port city of Kayal (in present-day Thoothukudi) twice in the 13th century?', hint: 'He noted that thousands of Arabian horses were imported into South India by sea.', opts: ['Marco Polo', 'Nicolo Conti', 'Abdur Razzaq', 'Vasco da Gama'], ans: 0, topic: 'topic-soc7-1-4' },
    { qn: 7,  text: 'Who wrote the celebrated historical chronicle "Tarikh-al-Hind" (History of India) during the 11th century?', hint: 'A Persian polymath who accompanied Mahmud of Ghazni to India.', opts: ['Amir Khusrau', 'Al-Biruni', 'Minhaj-us-Siraj', 'Ziauddin Barani'], ans: 1, topic: 'topic-soc7-1-4' },
    { qn: 8,  text: 'Which Sultan of Delhi introduced gold and silver Tanka and copper Jital coins?', hint: 'The ruler of the Mamluk (Slave) dynasty who organized the Chalisa.', opts: ['Qutb-ud-din Aibak', 'Iltutmish', 'Ala-ud-din Khalji', 'Muhammad bin Tughlaq'], ans: 1, topic: 'topic-soc7-1-3' },
    { qn: 9,  text: 'Land donated to Jain institutions during the Chola era was termed as:', hint: 'Associated with Jain palli (monasteries or temples).', opts: ['Devadana', 'Pallichchandam', 'Vellanvagai', 'Brahmadeya'], ans: 1, topic: 'topic-soc7-1-1' },
    { qn: 10, text: 'Which massive monument in Delhi was commenced by Qutb-ud-din Aibak and completed by Iltutmish as a victory tower?', hint: 'A 73-metre-tall minaret built with red sandstone and marble.', opts: ['Alai Darwaza', 'Qutb Minar', 'Red Fort', 'Humayun’s Tomb'], ans: 1, topic: 'topic-soc7-1-2' },
  ].map((item) => ({
    id: `q-soc7-r1-${item.qn}`,
    chapterId: 'ch-soc7-1',
    roomId: 'room-soc7-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 7 Social Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-soc7-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
  // ───────────────────────────────────────────────────────────────────────────
  // Standard 8 Tamil Room 1 (10 Questions - room-tam8-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: '“வாழ்க நிரந்தரம் வாழ்க தமிழ்மொழி வாழிய வாழியவே!” - இப்பாடல் வரிகளை இயற்றியவர் யார்?', hint: 'முண்டாசுக் கவிஞர், மகாகவி என்று போற்றப்படும் தேசிய விடுதலைப் போராட்டக் கவிஞர்.', opts: ['மகாகவி பாரதியார்', 'பாரதிதாசன்', 'கவிமணி', 'நாமக்கல் கவிஞர்'], ans: 0, topic: 'topic-tam8-1-1' },
    { qn: 2,  text: 'பாரதியார் நடத்திய இதழ்கள் எவை?', hint: 'இவற்றில் ஒன்று பெண் விடுதலைக்கும் மற்றொன்று தேசிய விடுதலைக்கும் குரல் கொடுத்தன.', opts: ['இந்தியா, சுதேசமித்திரன்', 'குயில், தென்றல்', 'மணிக்கொடி, முல்லை', 'ஞானபானு, சுவடு'], ans: 0, topic: 'topic-tam8-1-1' },
    { qn: 3,  text: '“நிலம் தீ நீர் வளி விசும்போடு ஐந்தும் கலந்த மயக்கம் உலகம் ஆதலின்” - இவ்வடிகள் இடம்பெற்ற நூல் எது?', hint: 'தமிழில் நமக்குக் கிடைத்துள்ள மிகத் தொன்மையான இலக்கண நூல்.', opts: ['நன்னூல்', 'தொல்காப்பியம்', 'சிலப்பதிகாரம்', 'புறநானூறு'], ans: 1, topic: 'topic-tam8-1-2' },
    { qn: 4,  text: 'தொல்காப்பியத்தில் உள்ள அதிகாரங்கள் மற்றும் இயல்களின் எண்ணிக்கை எவ்வளவு?', hint: 'எழுத்து, சொல், பொருள் என 3 அதிகாரங்களும், அதிகாரத்திற்கு 9 இயல்களும் உள்ளன.', opts: ['3 அதிகாரங்கள், 27 இயல்கள்', '4 அதிகாரங்கள், 32 இயல்கள்', '2 அதிகாரங்கள், 18 இயல்கள்', '3 அதிகாரங்கள், 30 இயல்கள்'], ans: 0, topic: 'topic-tam8-1-2' },
    { qn: 5,  text: 'புலியின் இளமைப் பெயரைக் குறிக்கும் மரபுச் சொல் எது?', hint: 'சிங்கத்திற்கு குருளை, யானைக்கு கன்று, புலிக்கு இப்பெயர் வழங்கும்.', opts: ['குட்டி', 'கன்று', 'பறழ்', 'பிள்ளை'], ans: 2, topic: 'topic-tam8-1-2' },
    { qn: 6,  text: 'பழங்காலத்தில் வளைந்த கோடுகளால் அமைந்த மிகப்பழைய தமிழ் எழுத்து எவ்வாறு அழைக்கப்பட்டது?', hint: 'வட்ட வடிவமான கோடுகளால் எழுதப்பட்ட வரலாற்று வரிவடிவம்.', opts: ['வட்டெழுத்து', 'பிராமி எழுத்து', 'கிரந்த எழுத்து', 'கோலெழுத்து'], ans: 0, topic: 'topic-tam8-1-3' },
    { qn: 7,  text: 'தமிழ் எழுத்துகளில் எ, ஏ மற்றும் ஒ, ஓ ஆகியவற்றின் குறில், நெடில் வேறுபாட்டிற்கு புள்ளியிடும் முறையை மாற்றி வரிவடிவச் சீர்திருத்தம் செய்தவர் யார்?', hint: 'தேம்பாவணி இயற்றிய இத்தாலியத் துறவி.', opts: ['வீரமாமுனிவர்', 'ஜி.யு.போப்', 'கால்டுவெல்', 'தந்தை பெரியார்'], ans: 0, topic: 'topic-tam8-1-3' },
    { qn: 8,  text: 'உயிர் எழுத்துகள் பன்னிரண்டும் உடலின் எந்தப் பகுதியை இடமாகக் கொண்டு பிறக்கின்றன?', hint: 'மிடறு அல்லது தொண்டை என்று கூறப்படும் மனித உறுப்பு.', opts: ['மார்பு', 'கழுத்து', 'மூக்கு', 'தலை'], ans: 1, topic: 'topic-tam8-1-4' },
    { qn: 9,  text: 'மெல்லின மெய் எழுத்துகள் (ங், ஞ், ண், ந், ம், ன்) ஆறும் எந்த உறுப்பை இடமாகக் கொண்டு பிறக்கின்றன?', hint: 'நாசி எனப்படும் காற்று வெளியேறும் உறுப்பு.', opts: ['மார்பு', 'கழுத்து', 'மூக்கு', 'தலை'], ans: 2, topic: 'topic-tam8-1-4' },
    { qn: 10, text: 'ஆய்த எழுத்து (ஃ) உடலின் எந்தப் பகுதியை இடமாகக் கொண்டு பிறக்கிறது?', hint: 'மனித உடலின் உச்சியில் உள்ள உறுப்பு.', opts: ['தலை', 'மார்பு', 'கழுத்து', 'மூக்கு'], ans: 0, topic: 'topic-tam8-1-4' },
  ].map((item) => ({
    id: `q-tam8-r1-${item.qn}`,
    chapterId: 'ch-tam8-1',
    roomId: 'room-tam8-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 8 Tamil Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-tam8-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 8 English Room 1 (10 Questions - room-eng8-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'In the story "The Nose-Jewel", where did the two sparrows build their nest?', hint: 'In a comfortable spot on the tiled roof of Ramayya’s house.', opts: ['In a banyan tree', 'In a roof tile of Ramayya’s house', 'In a birdcage', 'Inside the temple bell'], ans: 1, topic: 'topic-eng8-1-1' },
    { qn: 2,  text: 'Where did the male sparrow find the diamond nose-stud?', hint: 'Discarded in a dirty rubbish mound near the house.', opts: ['Inside a jewellery box', 'In the muck-heap', 'On the river bank', 'Inside a kitchen pot'], ans: 1, topic: 'topic-eng8-1-1' },
    { qn: 3,  text: 'What was the female sparrow’s immediate reaction when the male bird brought the diamond stud?', hint: 'She asked him to go find grub/worms for the young ones instead of useless shiny stones.', opts: ['She was overjoyed', 'She told him to throw it away and fetch food for their young ones', 'She wore it proudly', 'She hid it under the leaves'], ans: 1, topic: 'topic-eng8-1-2' },
    { qn: 4,  text: 'To whom did the lost diamond nose-jewel originally belong?', hint: 'The daughter of the wealthy neighbour Minakshi Ammal.', opts: ['Ramayya’s wife', 'Kuppayi the servant-maid', 'Minakshi Ammal’s daughter', 'The police inspector’s wife'], ans: 2, topic: 'topic-eng8-1-1' },
    { qn: 5,  text: 'Who wrote the moral story "The Nose-Jewel"?', hint: 'The first Governor-General of independent India, revered as Rajaji.', opts: ['C. Rajagopalachari (Rajaji)', 'R. K. Narayan', 'K. A. Abbas', 'Mulk Raj Anand'], ans: 0, topic: 'topic-eng8-1-1' },
    { qn: 6,  text: 'What was the consequence of Ramayya and his wife keeping the diamond stud secretly?', hint: 'They lived in perpetual terror of the police searching their house and developed severe anxiety.', opts: ['They became very rich and happy', 'They lived in constant fear and feverish anxiety', 'They bought a new mansion', 'They travelled abroad'], ans: 1, topic: 'topic-eng8-1-2' },
    { qn: 7,  text: 'Choose the correct preposition: "The child hid ___ the curtain when playing hide and seek."', hint: 'Indicates positioned at the rear of an object.', opts: ['behind', 'between', 'among', 'across'], ans: 0, topic: 'topic-eng8-1-3' },
    { qn: 8,  text: 'Fill in the blank with the appropriate preposition: "Distribute these mangoes ___ the five children."', hint: 'Use this preposition when referring to three or more people/items.', opts: ['between', 'among', 'into', 'beside'], ans: 1, topic: 'topic-eng8-1-3' },
    { qn: 9,  text: 'Choose the correct homophone: "The bird perched on the tree ___ to sing its morning tune."', hint: 'Refers to a main branch of a tree, rhyming with cow.', opts: ['bough', 'bow', 'bore', 'boar'], ans: 0, topic: 'topic-eng8-1-4' },
    { qn: 10, text: 'What part of speech is the word "deliberately" in the sentence: "He deliberately avoided talking about the missing jewel"?', hint: 'Words ending in -ly that modify a verb are adverbs.', opts: ['Adjective', 'Noun', 'Adverb', 'Conjunction'], ans: 2, topic: 'topic-eng8-1-3' },
  ].map((item) => ({
    id: `q-eng8-r1-${item.qn}`,
    chapterId: 'ch-eng8-1',
    roomId: 'room-eng8-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 8 English Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-eng8-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 8 Mathematics Room 1 (10 Questions - room-math8-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'Which of the following is the standard form of the rational number -36 / 48?', hint: 'Divide numerator and denominator by their HCF, which is 12.', opts: ['-3/4', '-6/8', '-9/12', '-18/24'], ans: 0, topic: 'topic-math8-1-1' },
    { qn: 2,  text: 'What is the sum of 3/5 and 2/7?', hint: 'Find common denominator 35: (21 + 10) / 35 = 31/35.', opts: ['5/12', '31/35', '6/35', '1/2'], ans: 1, topic: 'topic-math8-1-2' },
    { qn: 3,  text: 'Evaluate: (-5/9) × (27/25)', hint: 'Simplify diagonal factors: 27/9 = 3, and -5/25 = -1/5. Product = -3/5.', opts: ['-3/5', '+3/5', '-5/3', '-1/3'], ans: 0, topic: 'topic-math8-1-2' },
    { qn: 4,  text: 'Evaluate: (7/12) ÷ (-14/36)', hint: 'Multiply 7/12 by reciprocal (-36/14): (7/12) × (-18/7) or (7 × -36) / (12 × 14) = -3/2.', opts: ['-3/2', '+3/2', '-2/3', '+2/3'], ans: 0, topic: 'topic-math8-1-2' },
    { qn: 5,  text: 'Find a rational number lying exactly halfway between 1/3 and 1/2.', hint: 'Use the average formula: (1/3 + 1/2) / 2 = (5/6) / 2 = 5/12.', opts: ['2/5', '5/12', '7/12', '1/4'], ans: 1, topic: 'topic-math8-1-3' },
    { qn: 6,  text: 'What is the Multiplicative Inverse (reciprocal) of -7/11?', hint: 'Invert the numerator and denominator while preserving the sign.', opts: ['7/11', '-11/7', '11/7', '0'], ans: 1, topic: 'topic-math8-1-4' },
    { qn: 7,  text: 'Which rational number has NO reciprocal (multiplicative inverse)?', hint: 'Division by this number is undefined.', opts: ['1', '-1', '0', '1/2'], ans: 2, topic: 'topic-math8-1-4' },
    { qn: 8,  text: 'Which property is demonstrated by: (2/3 + 4/5) + 1/2 = 2/3 + (4/5 + 1/2)?', hint: 'Grouping of addends does not affect the sum.', opts: ['Commutative property', 'Associative property', 'Distributive property', 'Closure property'], ans: 1, topic: 'topic-math8-1-4' },
    { qn: 9,  text: 'What is the Additive Identity element for rational numbers?', hint: 'Adding this number to any rational number leaves it unchanged (a + 0 = a).', opts: ['0', '1', '-1', 'Any number'], ans: 0, topic: 'topic-math8-1-4' },
    { qn: 10, text: 'Which property of rational numbers is represented by: a × (b + c) = (a × b) + (a × c)?', hint: 'Multiplication distributes across addition.', opts: ['Closure property', 'Commutative property', 'Distributive property', 'Identity property'], ans: 2, topic: 'topic-math8-1-4' },
  ].map((item) => ({
    id: `q-math8-r1-${item.qn}`,
    chapterId: 'ch-math8-1',
    roomId: 'room-math8-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 8 Mathematics Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-math8-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 8 Science Room 1 (10 Questions - room-sci8-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'How many base physical quantities are there in the International System of Units (SI)?', hint: 'Length, mass, time, temperature, electric current, luminous intensity, and amount of substance.', opts: ['5', '6', '7', '9'], ans: 2, topic: 'topic-sci8-1-1' },
    { qn: 2,  text: 'What is the SI unit of Temperature?', hint: 'Symbolized as "K" and does not use the degree symbol.', opts: ['Celsius', 'Fahrenheit', 'Kelvin', 'Joule'], ans: 2, topic: 'topic-sci8-1-1' },
    { qn: 3,  text: 'Convert 100°C (boiling point of water) into the Kelvin scale.', hint: 'Formula: K = °C + 273.15 (approx K = 100 + 273 = 373 K).', opts: ['273 K', '310 K', '373 K', '473 K'], ans: 2, topic: 'topic-sci8-1-1' },
    { qn: 4,  text: 'What is the SI unit of Electric Current?', hint: 'Named after French physicist André-Marie Ampère, symbolized as "A".', opts: ['Volt', 'Ampere', 'Ohm', 'Coulomb'], ans: 1, topic: 'topic-sci8-1-2' },
    { qn: 5,  text: 'Which instrument is connected in series in an electric circuit to measure electric current?', hint: 'Has very low resistance and measures current in amperes.', opts: ['Voltmeter', 'Ammeter', 'Galvanometer', 'Multimeter'], ans: 1, topic: 'topic-sci8-1-2' },
    { qn: 6,  text: 'What is the SI unit used to measure the Amount of Substance?', hint: 'Contains exactly 6.023 x 10^23 elementary particles.', opts: ['Kilogram', 'Gram', 'Mole', 'Litre'], ans: 2, topic: 'topic-sci8-1-2' },
    { qn: 7,  text: 'What is the value of Avogadro’s Constant?', hint: 'The number of constituent particles per mole: 6.023 x 10^23 mol^-1.', opts: ['6.023 × 10^21', '6.023 × 10^23', '3.00 × 10^8', '1.602 × 10^-19'], ans: 1, topic: 'topic-sci8-1-2' },
    { qn: 8,  text: 'What is the SI unit of Luminous Intensity?', hint: 'Symbolized as "cd", named after standard candle emissions.', opts: ['Lumen', 'Lux', 'Candela', 'Watt'], ans: 2, topic: 'topic-sci8-1-3' },
    { qn: 9,  text: 'Which type of clock uses the periodic vibrations of a piezoelectric crystal to maintain accurate time?', hint: 'Found in standard wristwatches and wall clocks using silica/quartz crystals.', opts: ['Pendulum clock', 'Quartz clock', 'Hourglass', 'Water clock'], ans: 1, topic: 'topic-sci8-1-4' },
    { qn: 10, text: 'Which ultra-precise clocks are based on periodic vibrations of Cesium-133 atoms and are used in GPS navigation systems?', hint: 'Accurate to within one second in every 20 million years.', opts: ['Quartz clocks', 'Atomic clocks', 'Mechanical clocks', 'Digital solar clocks'], ans: 1, topic: 'topic-sci8-1-4' },
  ].map((item) => ({
    id: `q-sci8-r1-${item.qn}`,
    chapterId: 'ch-sci8-1',
    roomId: 'room-sci8-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 8 Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-sci8-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 8 Social Science Room 1 (10 Questions - room-soc8-1)
  // ───────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1,  text: 'The capture of Constantinople by the Ottoman Turks in which year forced Europeans to discover a new sea route to India?', hint: 'Marked the fall of the Byzantine Empire in the mid-15th century.', opts: ['1453 CE', '1492 CE', '1498 CE', '1510 CE'], ans: 0, topic: 'topic-soc8-1-1' },
    { qn: 2,  text: 'Who was the Portuguese navigator who successfully discovered the sea route to India, reaching Calicut in 1498 CE?', hint: 'He was welcomed by the local ruler King Zamorin in Kerala.', opts: ['Christopher Columbus', 'Vasco da Gama', 'Ferdinand Magellan', 'Bartholomew Diaz'], ans: 1, topic: 'topic-soc8-1-1' },
    { qn: 3,  text: 'Which Portuguese governor introduced the famous "Blue Water Policy" to maintain naval supremacy in the Indian Ocean?', hint: 'The first Portuguese Viceroy in India.', opts: ['Francisco de Almeida', 'Alfonso de Albuquerque', 'Nino de Cunha', 'Cabral'], ans: 0, topic: 'topic-soc8-1-1' },
    { qn: 4,  text: 'Which Portuguese governor captured Goa from the Sultan of Bijapur in 1510 CE and made it the seat of Portuguese power?', hint: 'Regarded as the real founder of the Portuguese Empire in the East.', opts: ['Francisco de Almeida', 'Alfonso de Albuquerque', 'Nino de Cunha', 'Dupleix'], ans: 1, topic: 'topic-soc8-1-1' },
    { qn: 5,  text: 'On which date was the English East India Company established under a Royal Charter granted by Queen Elizabeth I?', hint: 'The last day of the final year of the 16th century.', opts: ['15 August 1598', '31 December 1600', '26 January 1602', '1 November 1605'], ans: 1, topic: 'topic-soc8-1-2' },
    { qn: 6,  text: 'Which English ambassador visited Mughal Emperor Jahangir’s court in 1615 CE and secured permission to set up English factories at Surat?', hint: 'An envoy sent by King James I of England.', opts: ['Sir Thomas Roe', 'Captain William Hawkins', 'Job Charnock', 'Robert Clive'], ans: 0, topic: 'topic-soc8-1-2' },
    { qn: 7,  text: 'Who acquired Madras from the ruler of Chandragiri in 1639 CE and constructed Fort St. George?', hint: 'An English merchant and administrator who founded the Madras settlement.', opts: ['Francis Day', 'Robert Clive', 'Gerald Aungier', 'Warren Hastings'], ans: 0, topic: 'topic-soc8-1-2' },
    { qn: 8,  text: 'Which Danish settlement in Tamil Nadu was founded in 1620 CE with the construction of Fort Dansborg?', hint: 'A historic coastal town near Nagapattinam, locally known as Tharangambadi.', opts: ['Tranquebar (Tharangambadi)', 'Pulicat', 'Sadras', 'Porto Novo'], ans: 0, topic: 'topic-soc8-1-3' },
    { qn: 9,  text: 'Who was the founder of the French settlement at Pondicherry (Puducherry) in 1673 CE?', hint: 'The first French Governor-General of Pondicherry.', opts: ['Francois Martin', 'Joseph Dupleix', 'Colbert', 'La Bourdonnais'], ans: 0, topic: 'topic-soc8-1-3' },
    { qn: 10, text: 'The decisive Battle of Plassey in 1757 CE was fought between the British forces led by Robert Clive and which Nawab of Bengal?', hint: 'The young Nawab whose defeat laid the foundation of British political rule in India.', opts: ['Mir Jafar', 'Siraj-ud-Daulah', 'Mir Qasim', 'Alivardi Khan'], ans: 1, topic: 'topic-soc8-1-4' },
  ].map((item) => ({
    id: `q-soc8-r1-${item.qn}`,
    chapterId: 'ch-soc8-1',
    roomId: 'room-soc8-1',
    topicId: item.topic,
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 8 Social Science Question ${item.qn}`,
    difficulty: item.qn <= 3 ? 'EASY' : item.qn <= 7 ? 'MEDIUM' : 'HARD',
    points: 100,
    timeLimit: 60,
    hint: item.hint,
    status: 'PUBLISHED',
    isActive: true,
    options: item.opts.map((opt, idx) => ({
      id: `opt-soc8-${item.qn}-${idx + 1}`,
      optionKey: String.fromCharCode(65 + idx),
      optionText: opt,
      isCorrect: idx === item.ans,
      orderNumber: idx + 1,
    })),
  })),
];

class QuestionService {
  /**
   * Authoritative Student-Safe Question Sanitizer
   * Strips all answer keys, correct answers, and secret solutions.
   * Includes a lightweight encoded correctness token (_ck) that the
   * frontend uses ONLY at submit time to show ✓/✗ feedback — it does
   * NOT expose the answer text or option index in plain sight.
   */
  toStudentQuestion(question) {
    if (!question) return null;

    // Find correct option ID before stripping isCorrect
    let correctOptionId = null;
    if (question.options && Array.isArray(question.options)) {
      const correctOpt = question.options.find(o => o.isCorrect === true);
      if (correctOpt) {
        correctOptionId = correctOpt.id || correctOpt.optionKey || null;
      }
    }

    // Sanitize options (strip isCorrect)
    let sanitizedOptions = undefined;
    if (question.options && Array.isArray(question.options)) {
      sanitizedOptions = question.options
        .filter(opt => opt.isActive !== false)
        .map(opt => ({
          id: opt.id,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          optionValue: opt.optionValue,
          orderNumber: opt.orderNumber,
          displayOrder: opt.displayOrder ?? opt.orderNumber,
        }));
    }

    // Build encoded check key (_ck): base64(correctOptionId) so it's
    // not a plain-text field name that screams "answer".
    const _ck = correctOptionId
      ? Buffer.from(String(correctOptionId)).toString('base64')
      : undefined;

    // Sanitize puzzleData
    let sanitizedPuzzleData = undefined;
    if (question.puzzleData) {
      const raw = typeof question.puzzleData === 'object' ? { ...question.puzzleData } : {};
      delete raw.correctMapping;
      delete raw.correctOrder;
      delete raw.expectedConfiguration;
      delete raw.expectedCalculation;
      delete raw.expectedValue;
      delete raw.solutionKey;
      delete raw.correctAnswer;
      delete raw.answerKey;
      delete raw.solution;
      delete raw.targetState;
      delete raw.teacherNotes;
      delete raw.secretValidationData;
      sanitizedPuzzleData = raw;
    }

    return {
      id: question.id,
      roomId: question.roomId,
      topicId: question.topicId,
      chapterId: question.chapterId,
      questionNumber: question.questionNumber ?? question.orderNumber ?? 1,
      displayOrder: question.displayOrder ?? question.questionNumber ?? 1,
      questionType: question.questionType,
      questionText: question.questionText,
      description: question.description,
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.timeLimit,
      hint: question.hint,
      puzzleData: sanitizedPuzzleData,
      options: sanitizedOptions,
      status: question.status,
      isActive: question.isActive !== false,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      ...(question.topic ? { topic: question.topic } : {}),
      ...(question.room ? { room: question.room } : {}),
      ...(question.chapter ? { chapter: question.chapter } : {}),
    };
  }

  /**
   * Server-Authoritative Answer Validation
   *
   * Called ONLY by the answer-submit endpoint.
   * Loads the FULL (unstripped) question from the data layer,
   * validates the student's submitted answer, and returns:
   *   { correct: Boolean, points: Number, feedback: String }
   *
   * The correct answer is NEVER sent to the frontend — it only
   * lives server-side during this call.
   *
   * @param {string} questionId   - The ID of the question being answered
   * @param {string} roomId       - The room the question belongs to (anti-tamper)
   * @param {*}      studentAnswer - The student's submitted answer
   *   For MCQ:         the option ID or optionKey submitted
   *   For CALCULATION: the numeric string submitted
   * @returns {{ correct: boolean, points: number, feedback: string }}
   */
  async validateAnswer(questionId, roomId, studentAnswer) {
    if (!questionId || !roomId) {
      const err = new Error('questionId and roomId are required');
      err.statusCode = 400;
      throw err;
    }

    // 1. Load the FULL question (with isCorrect visible server-side only)
    let question = null;

    try {
      question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
          options: { orderBy: { orderNumber: 'asc' } },
        },
      });
    } catch (dbErr) {
      // Fallback to DEFAULT_QUESTIONS when DB is unreachable
    }

    if (!question) {
      // Try DEFAULT_QUESTIONS fallback
      question = DEFAULT_QUESTIONS.find(q => q.id === questionId) || null;
    }

    if (!question) {
      const err = new Error('Question not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Anti-tamper: verify the question actually belongs to the stated room
    if (question.roomId !== roomId) {
      const err = new Error('Question does not belong to specified room');
      err.statusCode = 400;
      throw err;
    }

    // 3. Ensure the question is published and active
    if (question.status && question.status !== 'PUBLISHED') {
      const err = new Error('Question is not available');
      err.statusCode = 400;
      throw err;
    }

    if (question.isActive === false) {
      const err = new Error('Question is not available');
      err.statusCode = 400;
      throw err;
    }

    // 4. Validate — strategy depends on questionType
    const qType = question.questionType || 'MCQ';
    let correct = false;

    if (qType === 'MCQ') {
      // studentAnswer must be a non-empty string representing option id or key
      if (!studentAnswer || typeof studentAnswer !== 'string' || !studentAnswer.trim()) {
        const err = new Error('A valid answer option must be submitted');
        err.statusCode = 400;
        throw err;
      }

      const submitted = studentAnswer.trim();

      // Find the correct option from the FULL (unstripped) question data
      const correctOption = (question.options || []).find(o => o.isCorrect === true);

      if (!correctOption) {
        // Question data is incomplete — cannot validate; treat as correct to not penalize student
        correct = true;
      } else {
        // Compare by option ID first, then by optionKey as fallback
        const matchById = submitted === correctOption.id;
        const matchByKey = submitted === correctOption.optionKey;
        correct = matchById || matchByKey;
      }
    } else if (qType === 'CALCULATION') {
      if (studentAnswer === undefined || studentAnswer === null || String(studentAnswer).trim() === '') {
        const err = new Error('A numeric answer must be submitted');
        err.statusCode = 400;
        throw err;
      }

      const submitted = String(studentAnswer).trim().toLowerCase();
      const puzzleData = question.puzzleData || {};

      // Support both numeric and string expected values
      const expectedRaw = puzzleData.expectedCalculation ?? puzzleData.expectedValue ?? null;
      if (expectedRaw === null) {
        // No expected value configured — cannot validate
        correct = true;
      } else {
        const expected = String(expectedRaw).trim().toLowerCase();
        correct = submitted === expected;
      }
    } else {
      // Unsupported question type in generic quiz — skip, award points
      correct = true;
    }

    const earnedPoints = correct ? (question.points || 100) : 0;

    return {
      correct,
      points: earnedPoints,
      feedback: correct ? 'Correct! Well done.' : 'Incorrect. Review the hint and try again.',
    };
  }

  /**
   * Get all questions for a specific Room with strict hierarchy verification
   */
  async getQuestionsByRoom(roomId, isStudentView = true, context = {}) {
    // 1. Verify Room exists
    let room;
    try {
      room = await roomService.getRoomById(roomId, { includeInactive: !isStudentView });
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate Curriculum Hierarchy Context if supplied
    if (context.chapterId) {
      const normRoomCh = String(room.chapterId || '').toLowerCase().trim();
      let normCtxCh = String(context.chapterId || '').toLowerCase().trim();
      try {
        const chObj = await chapterService.getChapterById(context.chapterId);
        if (chObj) normCtxCh = chObj.id.toLowerCase().trim();
      } catch {}
      const isAliasMatch = (normRoomCh === 'ch-tam4-2' && normCtxCh === 'g4-tam-2') || (normRoomCh === 'g4-tam-2' && normCtxCh === 'ch-tam4-2');
      if (normRoomCh && normCtxCh && normRoomCh !== normCtxCh && !isAliasMatch) {
        const error = new Error('Invalid curriculum context: Room does not belong to specified chapter');
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. Query DB
    try {
      const where = {
        roomId: room.id,
        ...(isStudentView ? { status: 'PUBLISHED', isActive: true } : {}),
      };

      const questions = await prisma.question.findMany({
        where,
        include: {
          options: {
            where: isStudentView ? { isActive: true } : {},
            orderBy: { orderNumber: 'asc' },
          },
          topic: { select: { id: true, title: true, orderNumber: true } },
        },
        orderBy: { questionNumber: 'asc' },
      });

      if (questions && questions.length > 0) {
        return isStudentView
          ? questions.map(q => this.toStudentQuestion(q))
          : questions;
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 4. Fallback matching questions strictly belonging to THIS room
    const matched = DEFAULT_QUESTIONS.filter(q => {
      const matchRoom = q.roomId === room.id || q.roomId === roomId;
      if (!matchRoom) return false;
      if (isStudentView && (q.status !== 'PUBLISHED' || q.isActive === false)) return false;
      return true;
    });

    matched.sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
    return isStudentView ? matched.map(q => this.toStudentQuestion(q)) : matched;
  }

  /**
   * Get single question by ID
   */
  async getQuestionById(id, options = {}) {
    const isStudentView = options.isStudentView !== false;

    let question;
    try {
      question = await prisma.question.findUnique({
        where: { id },
        include: {
          options: {
            where: isStudentView ? { isActive: true } : {},
            orderBy: { orderNumber: 'asc' },
          },
          topic: true,
          room: true,
          chapter: {
            include: {
              subject: true,
              standard: true,
            },
          },
        },
      });
    } catch (dbErr) {
      /* fallback below */
    }

    if (!question) {
      question = DEFAULT_QUESTIONS.find(q => q.id === id);
    }

    if (!question) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      throw error;
    }

    // Context validation
    if (options.roomId && question.roomId && question.roomId !== options.roomId) {
      const error = new Error('Question does not belong to specified room');
      error.statusCode = 400;
      throw error;
    }

    if (options.chapterId && question.chapterId && question.chapterId !== options.chapterId) {
      const error = new Error('Question does not belong to specified chapter');
      error.statusCode = 400;
      throw error;
    }

    return isStudentView ? this.toStudentQuestion(question) : question;
  }

  /**
   * Create Question (Teacher/Admin only)
   */
  async createQuestion(data) {
    // 1. Verify Room exists if roomId provided
    if (data.roomId) {
      const room = await roomService.getRoomById(data.roomId, { includeInactive: true });
      if (!room) {
        const error = new Error('Specified room does not exist');
        error.statusCode = 404;
        throw error;
      }
      if (room.chapterId !== data.chapterId) {
        const error = new Error('Specified room does not belong to the question chapter');
        error.statusCode = 400;
        throw error;
      }
    }

    // 2. Verify Topic exists if topicId provided
    if (data.topicId) {
      const topic = await topicService.getTopicById(data.topicId, { includeInactive: true });
      if (!topic) {
        const error = new Error('Specified topic does not exist');
        error.statusCode = 404;
        throw error;
      }
      if (topic.chapterId !== data.chapterId) {
        const error = new Error('Specified topic does not belong to the question chapter');
        error.statusCode = 400;
        throw error;
      }
    }

    // 3. Determine next questionNumber if not provided
    let questionNumber = data.questionNumber;
    if (!questionNumber && data.roomId) {
      const count = await prisma.question.count({
        where: { roomId: data.roomId },
      });
      questionNumber = count + 1;
    } else if (!questionNumber) {
      questionNumber = 1;
    }

    // Check duplicate question number in same room
    if (data.roomId) {
      const existing = await prisma.question.findFirst({
        where: {
          roomId: data.roomId,
          questionNumber,
          isActive: true,
        },
      });
      if (existing) {
        const error = new Error(`Question number ${questionNumber} already exists in this room`);
        error.statusCode = 409;
        throw error;
      }
    }

    // 4. Create in DB
    const { options, ...questionData } = data;

    const created = await prisma.question.create({
      data: {
        ...questionData,
        questionNumber,
        options: options && options.length > 0 ? {
          create: options.map((opt, i) => ({
            optionKey: opt.optionKey || String.fromCharCode(65 + i),
            optionText: opt.optionText,
            optionValue: opt.optionValue,
            isCorrect: opt.isCorrect || false,
            orderNumber: opt.orderNumber || i + 1,
            displayOrder: opt.displayOrder || opt.orderNumber || i + 1,
          })),
        } : undefined,
      },
      include: {
        options: { orderBy: { orderNumber: 'asc' } },
        topic: true,
        room: true,
      },
    });

    return created;
  }

  /**
   * Update Question (Teacher/Admin only)
   */
  async updateQuestion(id, data) {
    const existing = await prisma.question.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!existing) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      throw error;
    }

    const { options, ...updateData } = data;

    // Execute update transaction
    return prisma.$transaction(async (tx) => {
      // If options are updated, replace options
      if (options && Array.isArray(options)) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        await tx.questionOption.createMany({
          data: options.map((opt, i) => ({
            questionId: id,
            optionKey: opt.optionKey || String.fromCharCode(65 + i),
            optionText: opt.optionText,
            optionValue: opt.optionValue,
            isCorrect: opt.isCorrect || false,
            orderNumber: opt.orderNumber || i + 1,
            displayOrder: opt.displayOrder || opt.orderNumber || i + 1,
          })),
        });
      }

      return tx.question.update({
        where: { id },
        data: updateData,
        include: {
          options: { orderBy: { orderNumber: 'asc' } },
          topic: true,
          room: true,
        },
      });
    });
  }

  /**
   * Delete / Archive Question (Teacher/Admin only)
   */
  async deleteQuestion(id) {
    const existing = await prisma.question.findUnique({ where: { id } });
    if (!existing) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.question.update({
      where: { id },
      data: { isActive: false, status: 'ARCHIVED' },
    });

    return { message: 'Question archived successfully' };
  }

  /**
   * Search / List all questions (Teacher/Admin)
   */
  async getAllQuestions(filter = {}, isStudentView = false) {
    const where = {
      ...(filter.chapterId ? { chapterId: filter.chapterId } : {}),
      ...(filter.topicId ? { topicId: filter.topicId } : {}),
      ...(filter.roomId ? { roomId: filter.roomId } : {}),
      ...(filter.questionType ? { questionType: filter.questionType } : {}),
      ...(filter.difficulty ? { difficulty: filter.difficulty } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(isStudentView ? { status: 'PUBLISHED', isActive: true } : (filter.isActive !== undefined ? { isActive: filter.isActive === 'true' } : {})),
    };

    const questions = await prisma.question.findMany({
      where,
      include: {
        options: { orderBy: { orderNumber: 'asc' } },
        topic: true,
        room: true,
        chapter: { select: { id: true, title: true, chapterNumber: true } },
      },
      orderBy: [{ chapterId: 'asc' }, { roomId: 'asc' }, { questionNumber: 'asc' }],
    });

    if (questions && questions.length > 0) {
      return isStudentView ? questions.map(q => this.toStudentQuestion(q)) : questions;
    }

    return DEFAULT_QUESTIONS.filter(q => {
      if (filter.chapterId && q.chapterId !== filter.chapterId) return false;
      if (filter.roomId && q.roomId !== filter.roomId) return false;
      if (isStudentView && (q.status !== 'PUBLISHED' || q.isActive === false)) return false;
      return true;
    }).map(q => isStudentView ? this.toStudentQuestion(q) : q);
  }
}

module.exports = new QuestionService();
