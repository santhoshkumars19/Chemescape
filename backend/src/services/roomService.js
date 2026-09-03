const prisma = require('../config/db');
const chapterService = require('./chapterService');

// Human-friendly display names for game types
const GAME_TYPE_DISPLAY_NAMES = {
  CALCULATION_HEIST: 'Calculation Heist',
  QUANTUM_ARCHITECT: 'Quantum Architect',
  GRID_RECONSTRUCTION: 'Periodic Grid Reconstruction',
  HYDROGEN_REACTOR: 'Hydrogen Reactor',
  METAL_SORTING: 'Metal Sorting Challenge',
  GAS_SIMULATOR: 'Gas Law Simulator',
  ENERGY_CORE: 'Energy Core Reactor',
  EQUILIBRIUM_STABILIZER: 'Equilibrium Stabilizer',
  PRECISION_MIXING: 'Precision Solution Mixing',
  MOLECULAR_BUILDER: 'Molecular Builder',
  CARBON_DETECTIVE: 'Carbon Detective',
  REACTION_CIPHER: 'Reaction Cipher Decoder',
  PETROCHEMICAL_PIPELINE: 'Petrochemical Pipeline',
  STEREOCHEMICAL_VAULT: 'Stereochemical Vault',
  ECOLOGICAL_STRATEGY: 'Ecological Green Strategy',
};

// Authoritative default rooms
const DEFAULT_ROOMS = [
  // 11th Chemistry Chapter 3 Rooms (Units 1 - 6)
  {
    id: 'room-1',
    chapterId: 'ch-3',
    roomNumber: 1,
    name: 'Deconstruction Lab',
    title: 'Deconstruction Lab',
    description: 'Reconstruct the periodic grid fragments to restore the main chamber power.',
    roomType: 'PUZZLE',
    gameType: 'GRID_RECONSTRUCTION',
    gameConfig: { timeLimit: 300, targetScore: 1000 },
    difficulty: 'EASY',
    estimatedMinutes: 10,
    xpReward: 100,
    coinReward: 25,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-2',
    chapterId: 'ch-3',
    roomNumber: 2,
    name: 'Quantum Chamber',
    title: 'Quantum Chamber',
    description: 'Configure electron subshells according to Aufbau and Hund rules.',
    roomType: 'PUZZLE',
    gameType: 'QUANTUM_ARCHITECT',
    gameConfig: { timeLimit: 240, maxElectrons: 36 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 15,
    xpReward: 150,
    coinReward: 35,
    orderNumber: 2,
    isActive: true,
  },
  {
    id: 'room-3',
    chapterId: 'ch-3',
    roomNumber: 3,
    name: 'Trend Vault',
    title: 'Trend Vault',
    description: 'Crack the ionization enthalpy and electronegativity locks.',
    roomType: 'CHALLENGE',
    gameType: 'CALCULATION_HEIST',
    gameConfig: { timeLimit: 180, stages: 3 },
    difficulty: 'HARD',
    estimatedMinutes: 20,
    xpReward: 200,
    coinReward: 50,
    orderNumber: 3,
    isActive: true,
  },
  {
    id: 'room-4',
    chapterId: 'ch-3',
    roomNumber: 4,
    name: 'Reactor Core',
    title: 'Reactor Core',
    description: 'Stabilize the hydrogen isotopic reactor by balancing reaction pathways.',
    roomType: 'CHALLENGE',
    gameType: 'HYDROGEN_REACTOR',
    gameConfig: { timeLimit: 300 },
    difficulty: 'HARD',
    estimatedMinutes: 25,
    xpReward: 250,
    coinReward: 60,
    orderNumber: 4,
    isActive: true,
  },
  {
    id: 'room-5',
    chapterId: 'ch-3',
    roomNumber: 5,
    name: 'Metal Sorter',
    title: 'Metal Sorter',
    description: 'Sort alkali, alkaline earth, and transition metals by reactivity trends.',
    roomType: 'PUZZLE',
    gameType: 'METAL_SORTING',
    gameConfig: { timeLimit: 200 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 15,
    xpReward: 150,
    coinReward: 35,
    orderNumber: 5,
    isActive: true,
  },
  {
    id: 'room-6',
    chapterId: 'ch-3',
    roomNumber: 6,
    name: 'Gas Chamber Simulation',
    title: 'Gas Chamber Simulation',
    description: 'Final escape challenge: balance temperature, pressure, and volume before the chamber locks.',
    roomType: 'BOSS',
    gameType: 'GAS_SIMULATOR',
    gameConfig: { timeLimit: 360, boss: true },
    difficulty: 'EXPERT',
    estimatedMinutes: 30,
    xpReward: 500,
    coinReward: 100,
    orderNumber: 6,
    isActive: true,
  },
  // Standard 4 Math Chapter 1 Room (Geometry Dimension Vault)
  {
    id: 'room-math4-1',
    chapterId: 'ch-math4-1',
    roomNumber: 1,
    name: 'Geometry Dimension Vault',
    title: 'Geometry Dimension Vault',
    description: 'Construct 2D/3D shapes, circles, and solve geometry puzzles.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Math Chapter 2 Room (Fraction Bakery)
  {
    id: 'room-math4-2-1',
    chapterId: 'ch-math4-2',
    roomNumber: 1,
    name: 'Fraction Bakery',
    title: 'Fraction Bakery',
    description: 'Bake delicious fraction pies by calculating equivalent proportions.',
    roomType: 'PUZZLE',
    gameType: 'CALCULATION_HEIST',
    gameConfig: { timeLimit: 300, targetFractions: 5 },
    difficulty: 'EASY',
    estimatedMinutes: 10,
    xpReward: 100,
    coinReward: 25,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Math Chapter 3 Room (Shape Sanctuary)
  {
    id: 'room-math4-3-1',
    chapterId: 'ch-math4-3',
    roomNumber: 1,
    name: 'Shape Sanctuary',
    title: 'Shape Sanctuary',
    description: 'Construct 2D/3D shapes to solve geometry puzzles.',
    roomType: 'PUZZLE',
    gameType: 'CALCULATION_HEIST',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 15,
    xpReward: 150,
    coinReward: 35,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Science Chapter 1 Room (Anatomy Physiology Lab)
  {
    id: 'room-sci4-1',
    chapterId: 'ch-sci4-1',
    roomNumber: 1,
    name: 'Anatomy Physiology Lab',
    title: 'Anatomy Physiology Lab',
    description: 'Investigate internal human organs, brain, heart, lungs, and skeletal health.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Science Chapter 2 Room (Chlorophyll Lab)
  {
    id: 'room-sci4-2-1',
    chapterId: 'ch-sci4-2',
    roomNumber: 1,
    name: 'Chlorophyll Lab',
    title: 'Chlorophyll Lab',
    description: 'Synthesize nutrients using sunlight, water, and carbon dioxide.',
    roomType: 'PUZZLE',
    gameType: 'HYDROGEN_REACTOR',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 15,
    xpReward: 150,
    coinReward: 35,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Tamil Room 1
  {
    id: 'room-tam4-1',
    chapterId: 'ch-tam4-1',
    roomNumber: 1,
    name: 'அன்னைத் தமிழ் அரங்கம்',
    title: 'அன்னைத் தமிழ் அரங்கம்',
    description: 'அன்னைத் தமிழே பாடலின் நயங்கள், சொல்வளம் மற்றும் வினாடி வினா.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Tamil Room 2 (பனிமலைப் பயணம்)
  {
    id: 'room-tam4-2',
    chapterId: 'ch-tam4-2',
    roomNumber: 1,
    name: 'பனிமலை அரங்கம்',
    title: 'பனிமலை அரங்கம்',
    description: 'பனிமலைப் பயணம் கதை நயம், இயற்கை வருணனை, சொல்வளம் மற்றும் இலக்கண வினாடி வினா.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 20,
    xpReward: 450,
    coinReward: 110,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 English Rooms
  {
    id: 'room-eng4-1',
    chapterId: 'ch-eng4-1',
    roomNumber: 1,
    name: 'Storyteller Train Compartment',
    title: 'Storyteller Train Compartment',
    description: 'Explore A Feast for Rats comprehension, vocabulary, and grammar quests.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-eng4-2',
    chapterId: 'ch-eng4-2',
    roomNumber: 1,
    name: 'Grammar Trail Chamber',
    title: 'Grammar Trail Chamber',
    description: 'Passage comprehension, moral theme analysis, and sentence construction.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 4 Social Science Rooms
  {
    id: 'room-soc4-1',
    chapterId: 'ch-soc4-1',
    roomNumber: 1,
    name: 'Ancient Dynasties Chamber',
    title: 'Ancient Dynasties Chamber',
    description: 'Explore the kingdoms of Cheras, Cholas, Pandyas, Pallavas, and Kallanai Dam.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-soc4-2',
    chapterId: 'ch-soc4-2',
    roomNumber: 1,
    name: 'Five Landforms Expedition',
    title: 'Five Landforms Expedition',
    description: 'Kurinji, Mullai, Marutham, Neithal, and Paalai landscape exploration.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { questionCount: 10, timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  // Standard 5 Subject Rooms
  {
    id: 'room-tam5-1',
    chapterId: 'ch-tam5-1',
    roomNumber: 1,
    name: 'Tamil Language Vault',
    title: 'Tamil Language Vault',
    description: 'Classical Tamil vocabulary, poetry, and sentence structures.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-math5-1',
    chapterId: 'ch-math5-1',
    roomNumber: 1,
    name: 'Math Logic Arena',
    title: 'Math Logic Arena',
    description: 'Master fractions, area, perimeter, and logical math problems.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-sci5-1',
    chapterId: 'ch-sci5-1',
    roomNumber: 1,
    name: 'Science Lab Challenge',
    title: 'Science Lab Challenge',
    description: 'Explore states of matter, simple machines, and ecosystem dynamics.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-soc5-1',
    chapterId: 'ch-soc5-1',
    roomNumber: 1,
    name: 'Social Heritage Quest',
    title: 'Social Heritage Quest',
    description: 'Discover Indian civics, continents, ancient heritage, and maps.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-eng5-1',
    chapterId: 'ch-eng5-1',
    roomNumber: 1,
    name: 'English Grammar Chamber',
    title: 'English Grammar Chamber',
    description: 'Master parts of speech, reading comprehension, and sentence crafting.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-tam5-2',
    chapterId: 'ch-tam5-2',
    roomNumber: 1,
    name: 'Tamil Poetry Sanctum',
    title: 'Tamil Poetry Sanctum',
    description: 'Solve Sangam poetic meters and classical literature riddles.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-math5-2',
    chapterId: 'ch-math5-2',
    roomNumber: 1,
    name: 'Decimal & Data Dome',
    title: 'Decimal & Data Dome',
    description: 'Decimals, percentages, and data analysis challenges.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-sci5-2',
    chapterId: 'ch-sci5-2',
    roomNumber: 1,
    name: 'Human Biology Lab',
    title: 'Human Biology Lab',
    description: 'Explore human circulatory, respiratory, and digestive organ systems.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-soc5-2',
    chapterId: 'ch-soc5-2',
    roomNumber: 1,
    name: 'Ancient Civilizations Archive',
    title: 'Ancient Civilizations Archive',
    description: 'Discover Indus Valley, Mesopotamia, and physical geography.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-eng5-2',
    chapterId: 'ch-eng5-2',
    roomNumber: 1,
    name: 'Composition & Narrative Hall',
    title: 'Composition & Narrative Hall',
    description: 'Essay writing, narrative crafting, and advanced vocabulary.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 120,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-tam6-1',
    chapterId: 'ch-tam6-1',
    roomNumber: 1,
    name: 'Tamil Language & Literature Chamber',
    title: 'Tamil Language & Literature Chamber',
    description: 'Explore 6th Standard Tamil poetry, prose, and grammatical foundations.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-eng6-1',
    chapterId: 'ch-eng6-1',
    roomNumber: 1,
    name: 'Marine & Grammar Chamber',
    title: 'Marine & Grammar Chamber',
    description: 'Explore marine life reading comprehension, vocabulary, and grammar rules.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-math6-1',
    chapterId: 'ch-math6-1',
    roomNumber: 1,
    name: 'Numbers & BODMAS Vault',
    title: 'Numbers & BODMAS Vault',
    description: 'Master large numbers, place values, estimation, and order of operations.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-sci6-1',
    chapterId: 'ch-sci6-1',
    roomNumber: 1,
    name: 'Measurement & Physics Lab',
    title: 'Measurement & Physics Lab',
    description: 'Explore SI units, measuring devices, volume calculation, and parallax error prevention.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-soc6-1',
    chapterId: 'ch-soc6-1',
    roomNumber: 1,
    name: 'Historical Archives & Relics Hall',
    title: 'Historical Archives & Relics Hall',
    description: 'Uncover stone age rock paintings, historical sources, and the legacy of Emperor Ashoka.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-tam7-1',
    chapterId: 'ch-tam7-1',
    roomNumber: 1,
    name: 'Tamil Language Chamber 7',
    title: 'Tamil Language Chamber 7',
    description: 'Explore Tamil poems, prose, and Kutriyilugaram grammar rules.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-eng7-1',
    chapterId: 'ch-eng7-1',
    roomNumber: 1,
    name: 'Literature & Grammar Chamber 7',
    title: 'Literature & Grammar Chamber 7',
    description: 'Explore the Eidgah story, abstract nouns, and degrees of comparison.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-math7-1',
    chapterId: 'ch-math7-1',
    roomNumber: 1,
    name: 'Integer Arena 7',
    title: 'Integer Arena 7',
    description: 'Master positive & negative integer operations and properties.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-sci7-1',
    chapterId: 'ch-sci7-1',
    roomNumber: 1,
    name: 'Physics & Density Lab 7',
    title: 'Physics & Density Lab 7',
    description: 'Calculate density, irregular area, and astronomical distances.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-soc7-1',
    chapterId: 'ch-soc7-1',
    roomNumber: 1,
    name: 'Medieval Relics Vault 7',
    title: 'Medieval Relics Vault 7',
    description: 'Analyze Chola inscriptions, medieval temple monuments, and chronicles.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-tam8-1',
    chapterId: 'ch-tam8-1',
    roomNumber: 1,
    name: 'Tamil Language Chamber 8',
    title: 'Tamil Language Chamber 8',
    description: 'Explore Tamil poems, script evolution, and letter articulation rules.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-eng8-1',
    chapterId: 'ch-eng8-1',
    roomNumber: 1,
    name: 'Literature & Grammar Chamber 8',
    title: 'Literature & Grammar Chamber 8',
    description: 'Explore The Nose-Jewel, parts of speech, prepositions, and homophones.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-math8-1',
    chapterId: 'ch-math8-1',
    roomNumber: 1,
    name: 'Rational Numbers Arena 8',
    title: 'Rational Numbers Arena 8',
    description: 'Master rational number operations, reciprocal, and algebraic properties.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-sci8-1',
    chapterId: 'ch-sci8-1',
    roomNumber: 1,
    name: 'Measurement & Physics Lab 8',
    title: 'Measurement & Physics Lab 8',
    description: 'Calculate SI unit conversions, temperature, mole, and atomic clock precision.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-soc8-1',
    chapterId: 'ch-soc8-1',
    roomNumber: 1,
    name: 'Colonial Era Archives 8',
    title: 'Colonial Era Archives 8',
    description: 'Examine European trade settlements, treaties, and battles in India.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'EASY',
    estimatedMinutes: 15,
    xpReward: 400,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },

  {
    id: 'room-phy11-1',
    chapterId: 'ch-phy11-1',
    roomNumber: 1,
    name: 'Physics Measurement Chamber',
    title: 'Physics Measurement Chamber',
    description: 'Solve units, dimensions, and error analysis problems.',
    roomType: 'PUZZLE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'MEDIUM',
    estimatedMinutes: 20,
    xpReward: 500,
    coinReward: 100,
    orderNumber: 1,
    isActive: true,
  },
  {
    id: 'room-phy11-2',
    chapterId: 'ch-phy11-2',
    roomNumber: 1,
    name: 'Kinematics Arena',
    title: 'Kinematics Arena',
    description: 'Analyze velocity, acceleration, vectors, and projectile trajectories.',
    roomType: 'CHALLENGE',
    gameType: 'GENERIC_CHAPTER_QUIZ',
    gameConfig: { timeLimit: 300 },
    difficulty: 'HARD',
    estimatedMinutes: 25,
    xpReward: 600,
    coinReward: 150,
    orderNumber: 1,
    isActive: true,
  },
];

class RoomService {
  /**
   * Get all rooms for a specific chapter
   */
  async getRoomsByChapter(chapterId, options = {}) {
    const includeInactive = options.includeInactive || false;

    // 1. Validate chapter exists and matches context if passed
    let chapter;
    try {
      chapter = await chapterService.getChapterById(chapterId, {
        standardId: options.standardId,
        subjectId: options.subjectId,
      });
    } catch (err) {
      if (err.statusCode) throw err;
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
      const rooms = await prisma.room.findMany({
        where: {
          chapterId: chapter.id,
          ...(includeInactive ? {} : { isActive: true }),
        },
        orderBy: { roomNumber: 'asc' },
      });

      if (rooms && rooms.length > 0) {
        return rooms.map(r => this.sanitizeRoom(r, includeInactive));
      }
    } catch (dbErr) {
      /* fallback below */
    }

    // 3. Fallback matching rooms
    const matched = DEFAULT_ROOMS.filter(r => {
      const matchChap = r.chapterId === chapter.id || r.chapterId === chapterId;
      if (!matchChap) return false;
      if (!includeInactive && r.isActive === false) return false;
      return true;
    });

    matched.sort((a, b) => (a.roomNumber || 0) - (b.roomNumber || 0));
    return matched.map(r => this.sanitizeRoom(r, includeInactive));
  }

  /**
   * Get single room by ID
   */
  async getRoomById(roomId, options = {}) {
    let room;
    try {
      room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          chapter: {
            select: { id: true, title: true, chapterNumber: true, standardId: true, subjectId: true },
          },
        },
      });
    } catch {
      /* fallback below */
    }

    if (!room) {
      room = DEFAULT_ROOMS.find(r => r.id === roomId);
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    // Context validation if chapterId provided
    if (options.chapterId && room.chapterId !== options.chapterId) {
      let resolvedChapterId = options.chapterId;
      try {
        const chObj = await chapterService.getChapterById(options.chapterId);
        if (chObj) resolvedChapterId = chObj.id;
      } catch {}
      if (room.chapterId !== resolvedChapterId) {
        const error = new Error('Room does not belong to the specified chapter');
        error.statusCode = 400;
        throw error;
      }
    }

    return this.sanitizeRoom(room, options.includeInactive);
  }

  /**
   * Create a new Room (Teacher / Admin)
   */
  async createRoom(data) {
    const roomNumber = data.roomNumber || data.orderNumber || 1;

    // Validate chapter exists
    const chapter = await chapterService.getChapterById(data.chapterId);

    // Check duplicate roomNumber within same chapter
    try {
      const existing = await prisma.room.findFirst({
        where: {
          chapterId: chapter.id,
          roomNumber,
        },
      });

      if (existing) {
        const error = new Error('A room with this room number already exists in this chapter.');
        error.statusCode = 409;
        throw error;
      }

      const room = await prisma.room.create({
        data: {
          chapterId: chapter.id,
          roomNumber,
          name: data.name,
          title: data.title || data.name,
          description: data.description || null,
          roomType: data.roomType || 'PUZZLE',
          gameType: data.gameType || 'CALCULATION_HEIST',
          gameConfig: data.gameConfig || null,
          difficulty: data.difficulty || 'MEDIUM',
          estimatedMinutes: data.estimatedMinutes || data.estimatedTime || 15,
          xpReward: data.xpReward ?? 100,
          coinReward: data.coinReward ?? 25,
          orderNumber: data.orderNumber || roomNumber,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });

      return this.sanitizeRoom(room, true);
    } catch (error) {
      if (error.statusCode) throw error;
      // In offline mode
      const conflict = DEFAULT_ROOMS.find(
        r => r.chapterId === chapter.id && r.roomNumber === roomNumber
      );
      if (conflict) {
        const err = new Error('A room with this room number already exists in this chapter.');
        err.statusCode = 409;
        throw err;
      }

      return {
        id: `room-custom-${Date.now()}`,
        chapterId: chapter.id,
        roomNumber,
        name: data.name,
        title: data.title || data.name,
        description: data.description || null,
        roomType: data.roomType || 'PUZZLE',
        gameType: data.gameType || 'CALCULATION_HEIST',
        gameConfig: data.gameConfig || null,
        difficulty: data.difficulty || 'MEDIUM',
        estimatedMinutes: data.estimatedMinutes || data.estimatedTime || 15,
        xpReward: data.xpReward ?? 100,
        coinReward: data.coinReward ?? 25,
        orderNumber: data.orderNumber || roomNumber,
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Update an existing Room (Teacher / Admin)
   */
  async updateRoom(roomId, data) {
    const existing = await this.getRoomById(roomId, { includeInactive: true });
    const roomNumber = data.roomNumber || data.orderNumber;

    try {
      if (roomNumber && roomNumber !== existing.roomNumber) {
        const conflict = await prisma.room.findFirst({
          where: {
            id: { not: existing.id },
            chapterId: existing.chapterId,
            roomNumber,
          },
        });

        if (conflict) {
          const error = new Error('A room with this room number already exists in this chapter.');
          error.statusCode = 409;
          throw error;
        }
      }

      const updated = await prisma.room.update({
        where: { id: existing.id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && { description: data.description }),
          ...(roomNumber !== undefined && { roomNumber, orderNumber: roomNumber }),
          ...(data.roomType !== undefined && { roomType: data.roomType }),
          ...(data.gameType !== undefined && { gameType: data.gameType }),
          ...(data.gameConfig !== undefined && { gameConfig: data.gameConfig }),
          ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
          ...(data.estimatedMinutes !== undefined && { estimatedMinutes: data.estimatedMinutes }),
          ...(data.estimatedTime !== undefined && { estimatedMinutes: data.estimatedTime }),
          ...(data.xpReward !== undefined && { xpReward: data.xpReward }),
          ...(data.coinReward !== undefined && { coinReward: data.coinReward }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      return this.sanitizeRoom(updated, true);
    } catch (error) {
      if (error.statusCode) throw error;
      return {
        ...existing,
        ...data,
        ...(roomNumber !== undefined && { roomNumber, orderNumber: roomNumber }),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Safe archive / deactivate a Room (Teacher / Admin)
   */
  async deleteRoom(roomId) {
    const existing = await this.getRoomById(roomId, { includeInactive: true });

    try {
      await prisma.room.update({
        where: { id: existing.id },
        data: { isActive: false },
      });
      return { message: 'Room archived successfully' };
    } catch (error) {
      return { message: 'Room archived successfully' };
    }
  }

  /**
   * Sanitize room data for student consumption (strips secret answer keys)
   */
  sanitizeRoom(room, isTeacherOrAdmin = false) {
    if (!room) return null;

    let sanitizedConfig = null;
    if (room.gameConfig) {
      if (isTeacherOrAdmin) {
        sanitizedConfig = room.gameConfig;
      } else {
        // Strip sensitive validation/solution keys
        const raw = typeof room.gameConfig === 'object' ? { ...room.gameConfig } : {};
        delete raw.expectedConfiguration;
        delete raw.correctMapping;
        delete raw.correctOrder;
        delete raw.expectedCalculation;
        delete raw.solutionKey;
        delete raw.isCorrect;
        delete raw.correctAnswer;
        delete raw.answerKey;
        sanitizedConfig = raw;
      }
    }

    return {
      id: room.id,
      chapterId: room.chapterId,
      roomNumber: room.roomNumber,
      orderNumber: room.orderNumber ?? room.roomNumber,
      name: room.name,
      title: room.title || room.name,
      description: room.description,
      roomType: room.roomType,
      gameType: room.gameType,
      gameTypeDisplayName: GAME_TYPE_DISPLAY_NAMES[room.gameType] || room.gameType,
      gameConfig: sanitizedConfig,
      difficulty: room.difficulty,
      estimatedMinutes: room.estimatedMinutes,
      estimatedTime: room.estimatedMinutes,
      xpReward: room.xpReward,
      coinReward: room.coinReward,
      isActive: room.isActive !== false,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      ...(room.chapter ? { chapter: room.chapter } : {}),
    };
  }
}

module.exports = new RoomService();
