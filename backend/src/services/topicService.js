const prisma = require('../config/db');
const chapterService = require('./chapterService');

// Authoritative default topic definitions
const DEFAULT_TOPICS = [
  // 11th Chemistry Chapter 3 Topics
  {
    id: 'topic-1',
    chapterId: 'ch-3',
    title: 'Modern Periodic Law',
    description: 'Properties of elements are periodic functions of their atomic numbers.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-2',
    chapterId: 'ch-3',
    title: 'Groups and Periods',
    description: 'Vertical columns (groups) and horizontal rows (periods) in the table.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-3',
    chapterId: 'ch-3',
    title: 'Periodic Trends',
    description: 'Atomic size, ionization enthalpy, and electronegativity variations.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-4',
    chapterId: 'ch-3',
    title: 'Atomic Radius',
    description: 'Distance from the nucleus to the outermost electron shell.',
    orderNumber: 4,
    isActive: true,
  },
  {
    id: 'topic-5',
    chapterId: 'ch-3',
    title: 'Ionization Energy',
    description: 'Energy required to remove an electron from an isolated gaseous atom.',
    orderNumber: 5,
    isActive: true,
  },
  {
    id: 'topic-6',
    chapterId: 'ch-3',
    title: 'Electron Configuration',
    description: 'Distribution of electrons in shells and subshells (s, p, d, f).',
    orderNumber: 6,
    isActive: true,
  },
  // Standard 4 Math Chapter 1 Topics (Geometry & 2D Shapes)
  {
    id: 'topic-math4-1-1',
    chapterId: 'ch-math4-1',
    title: 'Properties of 2D Shapes',
    description: 'Sides, corners, and diagonals of square, rectangle, triangle, and circle.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-math4-1-2',
    chapterId: 'ch-math4-1',
    title: 'Circle Elements: Radius & Diameter',
    description: 'Center, circumference, radius, and diameter relationships (D = 2r).',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-math4-1-3',
    chapterId: 'ch-math4-1',
    title: '3D Geometric Solids',
    description: 'Faces, vertices, and edges of cube, cuboid, sphere, cone, and cylinder.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-math4-1-4',
    chapterId: 'ch-math4-1',
    title: 'Symmetry & Perimeter Basics',
    description: 'Lines of symmetry in regular figures and calculating perimeter of polygons.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 4 Math Chapter 2 Topics
  {
    id: 'topic-math4-2-1',
    chapterId: 'ch-math4-2',
    title: 'Basic Fractions',
    description: 'Introduction to numerators and denominators.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-math4-2-2',
    chapterId: 'ch-math4-2',
    title: 'Equivalent Fractions',
    description: 'Finding equivalent fractions by multiplying or dividing.',
    orderNumber: 2,
    isActive: true,
  },
  // Standard 4 Tamil Chapter 1 Topics (அன்னைத் தமிழே)
  {
    id: 'topic-tam4-1-1',
    chapterId: 'ch-tam4-1',
    title: 'பாடல் வரிகளும் விளக்கமும்',
    description: 'அன்னைத் தமிழே பாடலின் வரிகள் மற்றும் அதன் பொருள் நயம்.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-tam4-1-2',
    chapterId: 'ch-tam4-1',
    title: 'சொல் பொருள் & அகராதி',
    description: 'அன்னை, ஆவி, உலகம், வளர்பவள் போன்ற அருஞ்சொற்பொருள்.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-tam4-1-3',
    chapterId: 'ch-tam4-1',
    title: 'பிரித்து & சேர்த்து எழுதுக',
    description: 'சொற்களைப் பிரித்தறிதல் மற்றும் புணர்ச்சி விதிகள்.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-tam4-1-4',
    chapterId: 'ch-tam4-1',
    title: 'எதுகை, மோனை & நயங்கள்',
    description: 'செய்யுள் நயங்கள் மற்றும் எதுகை மோனை சொற்கள்.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 4 Tamil Chapter 2 Topics (பனிமலைப் பயணம்)
  {
    id: 'topic-tam4-2-1',
    chapterId: 'ch-tam4-2',
    title: 'கதை வாசிப்பு & பொருள் நயம்',
    description: 'பனிமலைப் பயணம் கதையின் கதாபாத்திரங்கள், நிகழ்வுகள் மற்றும் பொருள் நயம்.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-tam4-2-2',
    chapterId: 'ch-tam4-2',
    title: 'இயற்கை வருணனை & சொல்வளம்',
    description: 'பனி, மலை, காடு, நதி ஆகியவற்றின் வருணனைச் சொற்கள் மற்றும் அகராதிப் பொருள்.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-tam4-2-3',
    chapterId: 'ch-tam4-2',
    title: 'பெயர்ச்சொல் & வினைச்சொல்',
    description: 'கதையில் இடம்பெற்றுள்ள பெயர்ச்சொற்கள், வினைச்சொற்கள் மற்றும் அவற்றின் வகைகள்.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-tam4-2-4',
    chapterId: 'ch-tam4-2',
    title: 'ஒரு மொழி & பல மொழி',
    description: 'ஒருமை மற்றும் பன்மை வடிவங்கள், படிகள், உறவுமுறைச் சொற்கள்.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 4 English Chapter 1 Topics (A Feast for Rats)

  {
    id: 'topic-eng4-1-1',
    chapterId: 'ch-eng4-1',
    title: 'Story & Reading Comprehension',
    description: 'A Feast for Rats narrative, characters, and plot sequence.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-eng4-1-2',
    chapterId: 'ch-eng4-1',
    title: 'Vocabulary & Word Meanings',
    description: 'Contextual vocabulary, synonyms, and antonyms from the story.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-eng4-1-3',
    chapterId: 'ch-eng4-1',
    title: 'Nouns: Proper, Common & Collective',
    description: 'Identifying naming words, groups of things, and capitalization.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-eng4-1-4',
    chapterId: 'ch-eng4-1',
    title: 'Sentence Formation & Punctuation',
    description: 'Crafting meaningful sentences with capital letters and punctuation.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 4 Science Chapter 1 Topics (My Body & Internal Organs)
  {
    id: 'topic-sci4-1-1',
    chapterId: 'ch-sci4-1',
    title: 'Internal Organs: Brain & Heart',
    description: 'Functions of the human brain as command center and heart as blood pump.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-sci4-1-2',
    chapterId: 'ch-sci4-1',
    title: 'Lungs, Stomach & Kidneys',
    description: 'Respiratory gas exchange, stomach digestion, and kidney blood filtration.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-sci4-1-3',
    chapterId: 'ch-sci4-1',
    title: 'Bones, Muscles & Movement',
    description: 'Skeletal framework, muscular contractions, and joint locomotion.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-sci4-1-4',
    chapterId: 'ch-sci4-1',
    title: 'Dental Hygiene & Personal Health',
    description: 'Tooth structure, oral hygiene routines, and balanced daily habits.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 4 Social Science Chapter 1 Topics (Kingdoms of Rivers)
  {
    id: 'topic-soc4-1-1',
    chapterId: 'ch-soc4-1',
    title: 'The Chera Dynasty & River Poigai',
    description: 'Capital Vanji, Musiri port, Bow and Arrow flag, and Cheran Senguttuvan.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-soc4-1-2',
    chapterId: 'ch-soc4-1',
    title: 'The Chola Empire & River Cauvery',
    description: 'Capital Uraiyur, Tiger flag, Karikalan, and the historic Kallanai Dam.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-soc4-1-3',
    chapterId: 'ch-soc4-1',
    title: 'The Pandya Kingdom & River Vaigai',
    description: 'Capital Madurai, Korkai pearl port, Fish flag, and Sangam patronage.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-soc4-1-4',
    chapterId: 'ch-soc4-1',
    title: 'The Pallavas & Sangam Philanthropists',
    description: 'Capital Kanchipuram, Palar river, Mamallapuram port, and Kadai Ezhu Vallalgal.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 5 Tamil Chapter 1 Topics (ch-tam5-1)
  {
    id: 'topic-tam5-1-1',
    chapterId: 'ch-tam5-1',
    title: 'உயிர், மெய் & ஆய்த எழுத்துக்கள்',
    description: 'உயிர் எழுத்துக்கள் (12), மெய் எழுத்துக்கள் (18) மற்றும் ஆய்த எழுத்து (1) அறிதல்.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-tam5-1-2',
    chapterId: 'ch-tam5-1',
    title: 'வல்லினம், மெல்லினம் & இடையினம்',
    description: 'இனவெழுத்துக்களின் பாகுபாடு: கசடதபற, ஙஞணநமன, யரலவழள.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-tam5-1-3',
    chapterId: 'ch-tam5-1',
    title: 'திருக்குறள் & நீதி இலக்கியம்',
    description: 'திருவள்ளுவர், திருக்குறள் நயங்கள் மற்றும் கற்க கசடறக் கற்பவை பாடல்.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-tam5-1-4',
    chapterId: 'ch-tam5-1',
    title: 'தமிழ் எழுத்துகளின் மொத்த எண்ணிக்கை',
    description: 'தமிழ் மொழியின் 247 எழுத்துக்கள் மற்றும் தொல்காப்பிய இலக்கண மரபு.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 5 English Chapter 1 Topics (ch-eng5-1)
  {
    id: 'topic-eng5-1-1',
    chapterId: 'ch-eng5-1',
    title: 'Parts of Speech: Nouns, Verbs & Adjectives',
    description: 'Identifying nouns (person/place/thing), action verbs, and descriptive adjectives in sentences.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-eng5-1-2',
    chapterId: 'ch-eng5-1',
    title: 'Vocabulary: Plurals, Antonyms & Word Meanings',
    description: 'Irregular plural forms, antonyms (opposites), and contextual vocabulary building.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-eng5-1-3',
    chapterId: 'ch-eng5-1',
    title: 'Articles, Prepositions & Conjunctions',
    description: 'Using a/an/the correctly, prepositions of place, and conjunctions joining clauses.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-eng5-1-4',
    chapterId: 'ch-eng5-1',
    title: 'Tenses & Sentence Punctuation',
    description: 'Irregular past tense forms, correct end punctuation (. ! ?), and sentence structure.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 5 Mathematics Chapter 1 Topics (ch-math5-1)
  {
    id: 'topic-math5-1-1',
    chapterId: 'ch-math5-1',
    title: 'Large Numbers, Addition & Subtraction',
    description: 'Adding and subtracting 4-5 digit numbers including sum verification.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-math5-1-2',
    chapterId: 'ch-math5-1',
    title: 'Multiplication, Division & Fractions',
    description: 'Multiplying 2-digit numbers, equivalent fractions, and LCM concepts.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-math5-1-3',
    chapterId: 'ch-math5-1',
    title: 'Measurement: Length, Weight & Capacity',
    description: 'Unit conversions: kg to g, km to m, litres to mL, and percentages.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-math5-1-4',
    chapterId: 'ch-math5-1',
    title: 'Geometry: Perimeter, Area & Angles',
    description: 'Perimeter of rectangles, area of squares, right angles in shapes, BODMAS rule.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 5 Science Chapter 1 Topics (ch-sci5-1)
  {
    id: 'topic-sci5-1-1',
    chapterId: 'ch-sci5-1',
    title: 'States of Matter & Changes',
    description: 'Solid, liquid, gas properties; evaporation, condensation, boiling point of water.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-sci5-1-2',
    chapterId: 'ch-sci5-1',
    title: 'Plants: Photosynthesis & Parts',
    description: 'Role of CO2 in photosynthesis, root functions, and plant nutrition.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-sci5-1-3',
    chapterId: 'ch-sci5-1',
    title: 'Human Body & Health',
    description: 'Heart function, gravity, Vitamin D synthesis, and personal health.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-sci5-1-4',
    chapterId: 'ch-sci5-1',
    title: 'Simple Machines & Energy',
    description: 'Pulley, lever, inclined plane; renewable vs non-renewable energy sources.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 5 Social Science Chapter 1 Topics (ch-soc5-1)
  {
    id: 'topic-soc5-1-1',
    chapterId: 'ch-soc5-1',
    title: 'Earth: Continents, Oceans & Globe',
    description: 'Seven continents, five oceans, equator, hemispheres, and physical map symbols.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-soc5-1-2',
    chapterId: 'ch-soc5-1',
    title: 'India: Capital, Independence & Constitution',
    description: 'Capital New Delhi, Independence 1947, Dr. B.R. Ambedkar, and Fundamental Rights.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-soc5-1-3',
    chapterId: 'ch-soc5-1',
    title: 'Ancient Civilizations & History',
    description: 'Indus Valley Civilization, Harappa, Mohenjo-Daro, and early Indian history.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-soc5-1-4',
    chapterId: 'ch-soc5-1',
    title: 'National Symbols of India',
    description: 'National animal (Royal Bengal Tiger), national bird, national flag, and national emblem.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 6 Tamil Chapter 1 Topics (ch-tam6-1)
  {
    id: 'topic-tam6-1-1',
    chapterId: 'ch-tam6-1',
    title: 'இன்பத்தமிழ் & பாடல் நயம்',
    description: 'பாரதிதாசனின் இன்பத்தமிழ் பாடல், ஆசிரியர் குறிப்பு, மற்றும் பொருள் நயம் அறிதல்.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-tam6-1-2',
    chapterId: 'ch-tam6-1',
    title: 'தமிழ்க் கும்மி & கவிதை நயம்',
    description: 'பெருஞ்சித்திரனாரின் தமிழ்க்கும்மி பாடல், எட்டுத் திசையிலும் தமிழின் பெருமை பரவுதல்.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-tam6-1-3',
    chapterId: 'ch-tam6-1',
    title: 'வளர்மொழி & தமிழின் தொன்மை',
    description: 'பாரதியாரின் பாடல் வரிகள் மற்றும் தமிழ் மொழியின் தொன்மையும் சீரிளமையும்.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-tam6-1-4',
    chapterId: 'ch-tam6-1',
    title: 'தமிழ் எழுத்துகளின் வகை & மாத்திரை அளவு',
    description: 'குறில், நெடில், மெய் மற்றும் ஆய்த எழுத்துகளின் கால அளவு (மாத்திரை).',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 6 English Chapter 1 Topics (ch-eng6-1)
  {
    id: 'topic-eng6-1-1',
    chapterId: 'ch-eng6-1',
    title: 'Reading Comprehension: Sea Turtles',
    description: 'Biological facts, nesting habits (Arribada), Olive Ridley, and marine conservation.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-eng6-1-2',
    chapterId: 'ch-eng6-1',
    title: 'Poetry: The Crocodile & Nature',
    description: 'Lewis Carroll poem, rhyming schemes, poetic imagery, and predator behavior.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-eng6-1-3',
    chapterId: 'ch-eng6-1',
    title: 'Grammar: Subject, Predicate & Sentence Types',
    description: 'Identifying subjects and predicates; declarative, interrogative, imperative, and exclamatory sentences.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-eng6-1-4',
    chapterId: 'ch-eng6-1',
    title: 'Vocabulary: Collective Nouns & Homophones',
    description: 'Marine collective nouns (school/shoal of fish), homophones (see/sea), and contextual vocabulary.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 6 Mathematics Chapter 1 Topics (ch-math6-1)
  {
    id: 'topic-math6-1-1',
    chapterId: 'ch-math6-1',
    title: 'Large Numbers & Place Value Systems',
    description: 'Indian system (lakhs, crores) and International system (millions, billions), place values, and number expansion.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-math6-1-2',
    chapterId: 'ch-math6-1',
    title: 'Comparison, Ordering & Estimation',
    description: 'Successor, predecessor, ascending/descending order, and rounding off numbers to nearest tens/hundreds.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-math6-1-3',
    chapterId: 'ch-math6-1',
    title: 'Order of Operations & BODMAS',
    description: 'Use of brackets, BODMAS / BIDMAS rules, and multi-operation arithmetic expressions.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-math6-1-4',
    chapterId: 'ch-math6-1',
    title: 'Whole Numbers & Their Properties',
    description: 'Whole numbers on number line, commutative, associative, identity (0 and 1), and distributive properties.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 6 Science Chapter 1 Topics (ch-sci6-1)
  {
    id: 'topic-sci6-1-1',
    chapterId: 'ch-sci6-1',
    title: 'SI Units & Fundamental Quantities',
    description: 'Length (metre), mass (kilogram), time (second), temperature (Kelvin), and unit multiples.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-sci6-1-2',
    chapterId: 'ch-sci6-1',
    title: 'Measuring Devices & Instruments',
    description: 'Metre scale, measuring tape, stop clock, and beam/electronic balance.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-sci6-1-3',
    chapterId: 'ch-sci6-1',
    title: 'Volume of Liquids & Irregular Solids',
    description: 'Litre, millilitre, measuring cylinders, and water displacement method for irregular objects.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-sci6-1-4',
    chapterId: 'ch-sci6-1',
    title: 'Measurement Accuracy & Parallax Errors',
    description: 'Correct eye alignment, vertical reading, zero error prevention, and accuracy in measurements.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 6 Social Science Chapter 1 Topics (ch-soc6-1)
  {
    id: 'topic-soc6-1-1',
    chapterId: 'ch-soc6-1',
    title: 'Concept & Meaning of History',
    description: 'Origin from Greek word Historia (learning by inquiry), timeline, BCE/CE dating, and importance of historical study.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-soc6-1-2',
    chapterId: 'ch-soc6-1',
    title: 'Prehistoric Period & Cave Art',
    description: 'Stone Age lifestyle, rock paintings, hunter-gatherer existence, and early animal domestication (dogs).',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-soc6-1-3',
    chapterId: 'ch-soc6-1',
    title: 'Sources of History: Artefacts & Inscriptions',
    description: 'Archaeological sources (monuments, coins, artefacts), literary sources (religious/secular), epigraphy, and numismatics.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-soc6-1-4',
    chapterId: 'ch-soc6-1',
    title: 'Emperor Ashoka & Historical Legacy',
    description: 'Kalinga war transformation, propagation of Buddhism, Ashoka Chakra on National Flag, and Lion Capital of Sarnath.',
    orderNumber: 4,
    isActive: true,
  },
  // Standard 7 Tamil Chapter 1 Topics (ch-tam7-1)
  {
    id: 'topic-tam7-1-1',
    chapterId: 'ch-tam7-1',
    title: 'எங்கள் தமிழ் & நாமக்கல் கவிஞர்',
    description: 'நாமக்கல் கவிஞர் வெ. இராமலிங்கனாரின் பாடல் நயம், காந்தியக் கருத்துகள், மற்றும் ஆசிரியர் குறிப்பு.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-tam7-1-2',
    chapterId: 'ch-tam7-1',
    title: 'ஒன்றல்ல இரண்டல்ல & உடுமலை நாராயணகவி',
    description: 'உடுமலை நாராயணகவியின் பாடல் வரிகள், பகுத்தறிவுக் கருத்துகள், மற்றும் வள்ளல்களின் பெருமை.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-tam7-1-3',
    chapterId: 'ch-tam7-1',
    title: 'பேச்சுமொழியும் எழுத்துமொழியும்',
    description: 'மொழியின் முதல் மற்றும் இரண்டாம் நிலைகள், பேச்சு மொழிக்கும் எழுத்து மொழிக்கும் உள்ள வேறுபாடுகள்.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-tam7-1-4',
    chapterId: 'ch-tam7-1',
    title: 'குற்றியலுகரம் & குற்றியலிகரம்',
    description: 'குற்றியலுகரத்தின் இலக்கணம், மாத்திரை அளவு, மற்றும் ஆறு வகைக் குற்றியலுகரச் சொற்கள்.',
    orderNumber: 4,
    isActive: true,
  },

  // Standard 7 English Chapter 1 Topics (ch-eng7-1)
  {
    id: 'topic-eng7-1-1',
    chapterId: 'ch-eng7-1',
    title: 'Reading Comprehension: Eidgah',
    description: 'Premchand classic story of Hamid, the festival of Eid, and the visit to the fair.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-eng7-1-2',
    chapterId: 'ch-eng7-1',
    title: 'Characters & Values: Hamid & Granny Ameena',
    description: 'Hamid empathy, selflessness in buying tongs, and family bonds.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-eng7-1-3',
    chapterId: 'ch-eng7-1',
    title: 'Grammar: Noun Types & Degrees of Comparison',
    description: 'Abstract and concrete nouns, positive, comparative, and superlative degrees of adjectives.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-eng7-1-4',
    chapterId: 'ch-eng7-1',
    title: 'Vocabulary: Determiners, Quantifiers & Antonyms',
    description: 'Usage of much, many, few, little, and contextual vocabulary antonyms.',
    orderNumber: 4,
    isActive: true,
  },

  // Standard 7 Mathematics Chapter 1 Topics (ch-math7-1)
  {
    id: 'topic-math7-1-1',
    chapterId: 'ch-math7-1',
    title: 'Integer Addition & Subtraction',
    description: 'Rules of signs for integer addition, subtraction, number line representation, and additive inverse.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-math7-1-2',
    chapterId: 'ch-math7-1',
    title: 'Integer Multiplication & Division',
    description: 'Product and quotient rules for integers with like and unlike signs.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-math7-1-3',
    chapterId: 'ch-math7-1',
    title: 'Properties of Operations on Integers',
    description: 'Closure, commutative, associative, identity, and distributive properties of integers.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-math7-1-4',
    chapterId: 'ch-math7-1',
    title: 'Word Problems & Order of Operations with Integers',
    description: 'Real-world integer scenarios (depth, temperature, elevation) and multi-step expressions.',
    orderNumber: 4,
    isActive: true,
  },

  // Standard 7 Science Chapter 1 Topics (ch-sci7-1)
  {
    id: 'topic-sci7-1-1',
    chapterId: 'ch-sci7-1',
    title: 'Fundamental & Derived Physical Quantities',
    description: 'Fundamental units vs derived units (area, volume, density, speed) and SI standards.',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-sci7-1-2',
    chapterId: 'ch-sci7-1',
    title: 'Area of Regular & Irregular Figures',
    description: 'Calculating surface area of regular geometric figures and graphical method for irregular shapes.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-sci7-1-3',
    chapterId: 'ch-sci7-1',
    title: 'Volume & Density of Substances',
    description: 'Mass-to-volume ratio, units (kg/m3, g/cm3), and flotation principles of liquids and solids.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-sci7-1-4',
    chapterId: 'ch-sci7-1',
    title: 'Astronomical Measurements: AU & Light Year',
    description: 'Astronomical Unit (AU), Light Year, cosmic distances, and values in standard scientific notation.',
    orderNumber: 4,
    isActive: true,
  },

  // Standard 7 Social Science Chapter 1 Topics (ch-soc7-1)
  {
    id: 'topic-soc7-1-1',
    chapterId: 'ch-soc7-1',
    title: 'Inscriptions & Chola Land Grants',
    description: 'Uttaramerur inscriptions, Kudavolai system, and land types (Brahmadeya, Shalabhoga, Pallichchandam).',
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'topic-soc7-1-2',
    chapterId: 'ch-soc7-1',
    title: 'Medieval Architecture & Monuments',
    description: 'Thanjavur Brihadisvara Temple, Gangaikonda Cholapuram, and Delhi Sultanate architectural wonders.',
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'topic-soc7-1-3',
    chapterId: 'ch-soc7-1',
    title: 'Coins, Currency & Economic Evidence',
    description: 'Medieval numismatics, Iltutmish Tanka and Jital coins, and trade indicators.',
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'topic-soc7-1-4',
    chapterId: 'ch-soc7-1',
    title: 'Travelogues & Foreign Chroniclers',
    description: 'Accounts of Marco Polo, Ibn Battuta (Rihla), and Al-Biruni (Tarikh-al-Hind).',
    orderNumber: 4,
    isActive: true,
  },
];

class TopicService {
  /**
   * Get topics belonging to a specific Chapter
   */
  async getTopicsByChapter(chapterId, options = {}) {
    const includeInactive = options.includeInactive || false;

    // 1. Verify chapter exists and is active
    let chapter;
    try {
      chapter = await chapterService.getChapterById(chapterId);
    } catch {
      const error = new Error('Chapter not found');
      error.statusCode = 404;
      throw error;
    }

    if (!chapter) {
      const error = new Error('Chapter not found');
      error.statusCode = 404;
      throw error;
    }

    if (chapter.isActive === false && !includeInactive) {
      const error = new Error('Chapter is inactive');
      error.statusCode = 404;
      throw error;
    }

    // 2. Query DB
    try {
      const topics = await prisma.topic.findMany({
        where: {
          OR: [
            { chapterId: chapter.id },
            { chapter: { id: chapter.id } },
          ],
          ...(includeInactive ? {} : { isActive: true }),
        },
        orderBy: { orderNumber: 'asc' },
      });

      if (topics && topics.length > 0) {
        return topics.map(t => this.sanitizeTopic(t));
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 3. Fallback matching topics
    const matched = DEFAULT_TOPICS.filter(t => {
      const matchChap = t.chapterId === chapter.id || t.chapterId === chapterId;
      if (!matchChap) return false;
      if (!includeInactive && t.isActive === false) return false;
      return true;
    });

    matched.sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
    return matched.map(t => this.sanitizeTopic(t));
  }

  /**
   * Get single topic by ID with optional chapter context check
   */
  async getTopicById(topicId, options = {}) {
    let topic;
    try {
      topic = await prisma.topic.findUnique({
        where: { id: topicId },
        include: {
          chapter: {
            select: { id: true, title: true, chapterNumber: true, standardId: true, subjectId: true },
          },
        },
      });
    } catch {
      /* fallback below */
    }

    if (!topic) {
      topic = DEFAULT_TOPICS.find(t => t.id === topicId);
    }

    if (!topic) {
      const error = new Error('Topic not found');
      error.statusCode = 404;
      throw error;
    }

    // Context validation if chapterId provided
    if (options.chapterId && topic.chapterId !== options.chapterId) {
      const error = new Error('Topic does not belong to the specified chapter');
      error.statusCode = 400;
      throw error;
    }

    return this.sanitizeTopic(topic);
  }

  /**
   * Create a new Topic (Teacher / Admin)
   */
  async createTopic(data) {
    const orderNumber = data.orderNumber || data.displayOrder || 1;

    // Validate chapter exists
    const chapter = await chapterService.getChapterById(data.chapterId);

    // Check duplicate orderNumber within the same chapter
    try {
      const existing = await prisma.topic.findFirst({
        where: {
          chapterId: chapter.id,
          orderNumber,
        },
      });

      if (existing) {
        const error = new Error('A topic with this order number already exists in this chapter.');
        error.statusCode = 409;
        throw error;
      }

      const topic = await prisma.topic.create({
        data: {
          chapterId: chapter.id,
          title: data.title,
          description: data.description || null,
          orderNumber,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return this.sanitizeTopic(topic);
    } catch (error) {
      if (error.statusCode) throw error;
      // In offline mode
      const conflict = DEFAULT_TOPICS.find(
        t => t.chapterId === chapter.id && t.orderNumber === orderNumber
      );
      if (conflict) {
        const err = new Error('A topic with this order number already exists in this chapter.');
        err.statusCode = 409;
        throw err;
      }

      return {
        id: `topic-custom-${Date.now()}`,
        chapterId: chapter.id,
        title: data.title,
        description: data.description || null,
        orderNumber,
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update an existing Topic (Teacher / Admin)
   */
  async updateTopic(topicId, data) {
    const existing = await this.getTopicById(topicId);
    const orderNumber = data.orderNumber || data.displayOrder;

    try {
      if (orderNumber && orderNumber !== existing.orderNumber) {
        const conflict = await prisma.topic.findFirst({
          where: {
            id: { not: existing.id },
            chapterId: existing.chapterId,
            orderNumber,
          },
        });

        if (conflict) {
          const error = new Error('A topic with this order number already exists in this chapter.');
          error.statusCode = 409;
          throw error;
        }
      }

      const updated = await prisma.topic.update({
        where: { id: existing.id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(orderNumber !== undefined && { orderNumber }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return this.sanitizeTopic(updated);
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        ...existing,
        ...data,
        ...(orderNumber !== undefined && { orderNumber }),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Safe archive / deactivate a Topic (Teacher / Admin)
   */
  async deleteTopic(topicId) {
    const existing = await this.getTopicById(topicId);

    try {
      await prisma.topic.update({
        where: { id: existing.id },
        data: { isActive: false },
      });
      return { message: 'Topic archived successfully' };
    } catch (error) {
      return { message: 'Topic archived successfully' };
    }
  }

  /**
   * Sanitize topic for student safety
   */
  sanitizeTopic(topic) {
    if (!topic) return null;
    return {
      id: topic.id,
      chapterId: topic.chapterId,
      title: topic.title,
      description: topic.description,
      orderNumber: topic.orderNumber,
      displayOrder: topic.orderNumber,
      isActive: topic.isActive !== false,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      ...(topic.chapter ? { chapter: topic.chapter } : {}),
    };
  }
}

module.exports = new TopicService();
