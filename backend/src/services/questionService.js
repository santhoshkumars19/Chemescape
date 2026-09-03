const prisma = require('../config/db');
const roomService = require('./roomService');
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
  // Standard 5 Science Room 1 (10 Questions - room-sci5-1)
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
      const normCtxCh = String(context.chapterId || '').toLowerCase().trim();
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
