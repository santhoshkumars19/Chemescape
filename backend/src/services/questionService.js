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
    id: 'q-math4-r1-1',
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
  // ─────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'What is the sum of 3,450 and 2,550?', hint: 'Add hundreds and thousands systematically: 3450 + 2550.', opts: ['5,000', '6,000', '6,100', '5,900'], ans: 1 },
    { qn: 2, text: 'Which fraction is equal to 3/4?', hint: 'Multiply both numerator and denominator by 2 or 3.', opts: ['6/8', '4/3', '2/3', '5/8'], ans: 0 },
    { qn: 3, text: 'Calculate the perimeter of a rectangle with length 8 cm and breadth 5 cm.', hint: 'Perimeter = 2 * (length + breadth).', opts: ['13 cm', '26 cm', '40 cm', '52 cm'], ans: 1 },
    { qn: 4, text: 'What is the product of 25 and 16?', hint: 'Multiply 25 by 4 first (= 100), then multiply by 4.', opts: ['350', '375', '400', '425'], ans: 2 },
    { qn: 5, text: 'Find the area of a square with side 7 cm.', hint: 'Area of square = side * side (7 * 7).', opts: ['28 sq cm', '42 sq cm', '49 sq cm', '56 sq cm'], ans: 2 },
    { qn: 6, text: 'Convert 3.5 kilograms into grams.', hint: '1 kilogram = 1,000 grams.', opts: ['350 g', '3,000 g', '3,500 g', '35,000 g'], ans: 2 },
    { qn: 7, text: 'What is the Least Common Multiple (LCM) of 4 and 6?', hint: 'Find the smallest positive number that is a multiple of both 4 and 6.', opts: ['12', '18', '24', '2'], ans: 0 },
    { qn: 8, text: 'What is 15% of 200?', hint: 'Multiply 200 by 15 and divide by 100.', opts: ['20', '25', '30', '35'], ans: 2 },
    { qn: 9, text: 'How many right angles are inside a rectangle?', hint: 'Every corner of a rectangle is a 90-degree right angle.', opts: ['2', '3', '4', '6'], ans: 2 },
    { qn: 10, text: 'Solve: (12 + 8) / 4 * 3', hint: 'Follow BODMAS: solve brackets (20), divide by 4 (5), multiply by 3.', opts: ['10', '15', '20', '25'], ans: 1 },
  ].map((item) => ({
    id: `q-math5-r1-${item.qn}`,
    chapterId: 'ch-math5-1',
    roomId: 'room-math5-1',
    questionNumber: item.qn,
    displayOrder: item.qn,
    questionType: 'MCQ',
    questionText: item.text,
    description: `Standard 5 Math Question ${item.qn}`,
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
  // ─────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'Which state of matter has a definite volume but no fixed shape?', hint: 'Think of water taking the shape of its container.', opts: ['Solid', 'Liquid', 'Gas', 'Plasma'], ans: 1 },
    { qn: 2, text: 'What is the process of a liquid changing into a gas called?', hint: 'Water boiling into steam.', opts: ['Condensation', 'Evaporation', 'Freezing', 'Melting'], ans: 1 },
    { qn: 3, text: 'Which simple machine uses a wheel with a rope running around its groove?', hint: 'Used to draw water from wells.', opts: ['Lever', 'Pulley', 'Inclined Plane', 'Screw'], ans: 1 },
    { qn: 4, text: 'What gas do green plants absorb from the atmosphere for photosynthesis?', hint: 'Plants take in this gas and release oxygen.', opts: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], ans: 2 },
    { qn: 5, text: 'Which organ pumps blood throughout the human body?', hint: 'A muscular organ located in the chest cavity.', opts: ['Lungs', 'Stomach', 'Heart', 'Kidney'], ans: 2 },
    { qn: 6, text: 'What is the boiling point of pure water at sea level?', hint: 'Water boils at this standard Celsius temperature.', opts: ['0°C', '50°C', '100°C', '150°C'], ans: 2 },
    { qn: 7, text: 'Which of the following is a renewable source of energy?', hint: 'Energy harnessed from the sun.', opts: ['Coal', 'Petroleum', 'Solar Energy', 'Natural Gas'], ans: 2 },
    { qn: 8, text: 'Which part of the plant absorbs water and minerals from the soil?', hint: 'The underground structure that anchors the plant.', opts: ['Stem', 'Leaves', 'Flower', 'Roots'], ans: 3 },
    { qn: 9, text: 'What is the force that pulls objects toward the center of the Earth?', hint: 'The force discovered by Sir Isaac Newton.', opts: ['Friction', 'Gravity', 'Magnetism', 'Buoyancy'], ans: 1 },
    { qn: 10, text: 'Which vitamin is synthesized in the human skin upon exposure to sunlight?', hint: 'Often called the Sunshine Vitamin.', opts: ['Vitamin A', 'Vitamin B', 'Vitamin C', 'Vitamin D'], ans: 3 },
  ].map((item) => ({
    id: `q-sci5-r1-${item.qn}`,
    chapterId: 'ch-sci5-1',
    roomId: 'room-sci5-1',
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
  // ─────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'How many continents are there on Earth?', hint: 'Asia, Africa, North America, South America, Antarctica, Europe, Australia.', opts: ['5', '6', '7', '8'], ans: 2 },
    { qn: 2, text: 'Which is the largest ocean on Earth?', hint: 'The ocean located between Asia and the Americas.', opts: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'], ans: 2 },
    { qn: 3, text: 'What is the capital city of India?', hint: 'Located in northern India along the Yamuna River.', opts: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'], ans: 1 },
    { qn: 4, text: 'Who is known as the Father of the Indian Constitution?', hint: 'Dr. B. R. ...', opts: ['Mahatma Gandhi', 'Dr. B. R. Ambedkar', 'Jawaharlal Nehru', 'Sardar Patel'], ans: 1 },
    { qn: 5, text: 'What is the imaginary line dividing Earth into Northern and Southern Hemispheres?', hint: 'The 0° latitude line.', opts: ['Tropic of Cancer', 'Prime Meridian', 'Equator', 'Tropic of Capricorn'], ans: 2 },
    { qn: 6, text: 'Which ancient civilization flourished along the Indus River valley?', hint: 'Famous for cities Harappa and Mohenjo-Daro.', opts: ['Egyptian Civilization', 'Indus Valley Civilization', 'Mesopotamian Civilization', 'Chinese Civilization'], ans: 1 },
    { qn: 7, text: 'What does the blue color represent on physical maps and globes?', hint: 'Bodies of liquid covering Earth.', opts: ['Forests', 'Deserts', 'Water bodies', 'Mountains'], ans: 2 },
    { qn: 8, text: 'In which year did India gain independence from British rule?', hint: 'The historic 15th August year.', opts: ['1942', '1945', '1947', '1950'], ans: 2 },
    { qn: 9, text: 'Which is the national animal of India?', hint: 'A majestic striped big cat.', opts: ['Lion', 'Royal Bengal Tiger', 'Elephant', 'Peacock'], ans: 1 },
    { qn: 10, text: 'How many fundamental rights are guaranteed to Indian citizens by the Constitution?', hint: 'Six primary fundamental rights.', opts: ['4', '5', '6', '7'], ans: 2 },
  ].map((item) => ({
    id: `q-soc5-r1-${item.qn}`,
    chapterId: 'ch-soc5-1',
    roomId: 'room-soc5-1',
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

  // ───────────────────────────────────────────────────────────────────────────
  // Standard 5 English Room 1 (10 Questions - room-eng5-1)
  // ─────────────────────────────────────────────────────────────────────────
  ...[
    { qn: 1, text: 'Identify the noun in the sentence: "The brave astronaut explored the galaxy."', hint: 'A noun is a person, place, or thing.', opts: ['brave', 'astronaut', 'explored', 'the'], ans: 1 },
    { qn: 2, text: 'Choose the correct plural form of the word "Child".', hint: 'An irregular plural form.', opts: ['Childs', 'Children', 'Childrens', 'Childes'], ans: 1 },
    { qn: 3, text: 'Identify the verb in: "The swift cheetah ran across the savannah."', hint: 'A verb represents an action word.', opts: ['swift', 'cheetah', 'ran', 'across'], ans: 2 },
    { qn: 4, text: 'What is the antonym (opposite) of the word "Ancient"?', hint: 'Something belonging to present times.', opts: ['Old', 'Historic', 'Modern', 'Antique'], ans: 2 },
    { qn: 5, text: 'Fill in the blank with the correct article: "She saw ___ eagle soaring high in the sky."', hint: 'Use "an" before vowel sounds.', opts: ['a', 'an', 'the', 'no article'], ans: 1 },
    { qn: 6, text: 'Which adjective describes color or appearance in: "The crimson rose bloomed beautifully."', hint: 'An adjective describes a noun.', opts: ['crimson', 'bloomed', 'rose', 'beautifully'], ans: 0 },
    { qn: 7, text: 'Choose the correct preposition: "The book is placed ___ the wooden table."', hint: 'Position on top of a surface.', opts: ['at', 'on', 'in', 'underneath'], ans: 1 },
    { qn: 8, text: 'What is the past tense of the irregular verb "Write"?', hint: 'Past tense of write.', opts: ['Writed', 'Wrote', 'Written', 'Writing'], ans: 1 },
    { qn: 9, text: 'Identify the conjunction in: "I wanted to play outside, but it began to rain."', hint: 'A conjunction connects two clauses.', opts: ['wanted', 'outside', 'but', 'began'], ans: 2 },
    { qn: 10, text: 'Which sentence has the correct punctuation?', hint: 'A question must end with a question mark.', opts: ['Where are you going.', 'Where are you going!', 'Where are you going?', 'Where are you going,'], ans: 2 },
  ].map((item) => ({
    id: `q-eng5-r1-${item.qn}`,
    chapterId: 'ch-eng5-1',
    roomId: 'room-eng5-1',
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
];

class QuestionService {
  /**
   * Authoritative Student-Safe Question Sanitizer
   * Strips all answer keys, correct answers, and secret solutions
   */
  toStudentQuestion(question) {
    if (!question) return null;

    // Sanitize options
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
      if (normRoomCh && normCtxCh && normRoomCh !== normCtxCh) {
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
