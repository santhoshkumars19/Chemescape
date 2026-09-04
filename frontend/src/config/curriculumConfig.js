/**
 * curriculumConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all standard-to-subject and subject-to-chapter mappings.
 *
 * API-ready architecture:
 *   - getSubjectsForStandard(standardId)
 *   - getChaptersForStandardAndSubject(standardId, subjectId)
 *   - curriculumService.getSubjects(standardId)
 *   - curriculumService.getChapters(standardId, subjectId)
 */

export const CURRICULUM = {
  'grade-4': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Explore language, literature and rich cultural heritage.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Build vocabulary, grammar and communication skills.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Explore numbers, patterns and problem solving.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'science', name: 'Science',
      description: 'Discover the world through hands-on experiments.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Discover history, geography and society.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-5': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Prose, poetry and grammar in the classical tradition.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Reading, writing and spoken English fundamentals.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Fractions, geometry and logical reasoning.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'science', name: 'Science',
      description: 'States of matter, living organisms and simple machines.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Civics, maps and Indian history essentials.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-6': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Classical literature, poetry and advanced grammar.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Prose comprehension, vocabulary and essay writing.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Integers, algebra basics and data handling.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'science', name: 'Science',
      description: 'Periodic table basics, acids, bases and salts.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Ancient civilisations, Indian geography and governance.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-7': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Sangam literature and expressive writing.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Advanced reading comprehension and language use.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Rational numbers, linear equations and geometry.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'science', name: 'Science',
      description: 'Chemical changes, heat, metals and non-metals.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Medieval history, political geography and economics.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-8': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Epic literature, prose and creative composition.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Literary prose, letter writing and grammar mastery.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Exponents, algebraic expressions and mensuration.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'science', name: 'Science',
      description: 'Atoms, molecules, chemical reactions and combustion.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Modern India, civics and economic development.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-9': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Higher literature, grammar and critical writing.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Advanced prose, poetry and functional writing.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Number systems, polynomials and coordinate geometry.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'physics', name: 'Physics',
      description: 'Motion, force, work, energy and sound.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
      chapterCount: 5,
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Structure of atom, bonding and stoichiometry.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Cell structure, tissues and living systems.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Indian and world history, democracy and economy.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-10': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Board-level literature, grammar and essay skills.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
      chapterCount: 5,
    },
    {
      id: 'english', name: 'English',
      description: 'Board English — comprehension, grammar and writing.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
      chapterCount: 5,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Real numbers, trigonometry and probability.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'physics', name: 'Physics',
      description: 'Electricity, light, magnetism and modern physics.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
      chapterCount: 5,
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Periodic properties, equilibrium and carbon compounds.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 5,
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Life processes, reproduction and heredity.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
      chapterCount: 5,
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Nationalism, democracy, resources and economics.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-11': [
    {
      id: 'physics', name: 'Physics',
      description: 'Laws of motion, thermodynamics and optics.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
      chapterCount: 5,
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Thermodynamics, organic chemistry and electrochemistry.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 6,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Sets, relations, calculus and probability.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Cell biology, genetics and plant physiology.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
      chapterCount: 5,
    },
    {
      id: 'computer-science', name: 'Computer Science',
      description: 'Programming, data structures and algorithms.',
      icon: 'Terminal',
      color: '#A78BFA', borderColor: 'rgba(167,139,250,0.28)',
      glowColor: 'rgba(167,139,250,0.32)', gradientFrom: 'rgba(167,139,250,0.10)', gradientTo: 'rgba(167,139,250,0.02)',
      chapterCount: 5,
    },
  ],

  'grade-12': [
    {
      id: 'physics', name: 'Physics',
      description: 'Electrostatics, wave optics and semiconductor devices.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
      chapterCount: 5,
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Advanced organics, biomolecules and coordination chemistry.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 6,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Matrices, integrals, vectors and linear programming.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
      chapterCount: 6,
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Reproduction, biotechnology and ecology.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
      chapterCount: 5,
    },
    {
      id: 'computer-science', name: 'Computer Science',
      description: 'Networking, DBMS and advanced programming.',
      icon: 'Terminal',
      color: '#A78BFA', borderColor: 'rgba(167,139,250,0.28)',
      glowColor: 'rgba(167,139,250,0.32)', gradientFrom: 'rgba(167,139,250,0.10)', gradientTo: 'rgba(167,139,250,0.02)',
      chapterCount: 5,
    },
  ],
};

// ─── CHAPTER DEFINITIONS ───────────────────────────────────────────────────────
// Explicit chapter lists per standard & subject.
// Standard 11 Chemistry aligns precisely with existing EduNova escape room engines.

export const CHAPTERS_STORE = {
  // ── Standard 11 Chemistry (Existing 6 Units) ─────────────────────────────────
  'grade-11:chemistry': [
    {
      id: 'chap-1',
      chapterNumber: 1,
      title: 'Some Basic Concepts of Chemistry',
      description: 'Mole concept, stoichiometry, and empirical calculations in the Mole Scanner Vault.',
      difficulty: 'Beginner',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Chem Calculation Heist',
      missionCode: 'MSN-0011',
    },
    {
      id: 'chap-2',
      chapterNumber: 2,
      title: 'Structure of Atom',
      description: 'Quantum mechanical model, orbitals, Hund’s rule, and electron configuration chamber.',
      difficulty: 'Beginner',
      xpReward: 650,
      coinsReward: 160,
      gameType: 'Quantum Orbital Architect',
      missionCode: 'MSN-0022',
    },
    {
      id: 'chap-3',
      chapterNumber: 3,
      title: 'Classification of Elements and Periodicity',
      description: 'Periodic table reconstruction, groups, periods, and periodic trends matrix.',
      difficulty: 'Intermediate',
      xpReward: 700,
      coinsReward: 180,
      gameType: 'Periodic Grid Reconstruction',
      missionCode: 'MSN-0033',
    },
    {
      id: 'chap-4',
      chapterNumber: 4,
      title: 'Hydrogen',
      description: 'Isotopes, heavy water, and hydrogen fuel cell reactor control terminal.',
      difficulty: 'Intermediate',
      xpReward: 800,
      coinsReward: 200,
      gameType: 'Hydrogen Fuel Cell Reactor',
      missionCode: 'MSN-0044',
    },
    {
      id: 'chap-5',
      chapterNumber: 5,
      title: 's-Block Elements (Alkali & Alkaline Earth)',
      description: 'Group 1 & 2 metals, flame test identification, and metal sorting factory.',
      difficulty: 'Advanced',
      xpReward: 900,
      coinsReward: 240,
      gameType: 'Flame Test Metal Sorting Factory',
      missionCode: 'MSN-0055',
    },
    {
      id: 'chap-6',
      chapterNumber: 6,
      title: 'States of Matter: Gaseous State',
      description: 'Gas chamber simulator, Boyle’s Law, Charles’s Law, Combined Gas Law, and Ideal Gas equations.',
      difficulty: 'Expert',
      xpReward: 950,
      coinsReward: 250,
      gameType: 'Gas Chamber Simulator',
      missionCode: 'MSN-0066',
    },
  ],

  // ── Standard 4 Mathematics ──────────────────────────────────────────────────
  'grade-4:mathematics': [
    {
      id: 'ch-math4-1',
      chapterNumber: 1,
      title: 'Geometry & 2D Shapes',
      description: 'Properties of circles, rectangles, triangles, perimeter basics, and symmetrical patterns.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0401',
    },
    {
      id: 'g4-math-2',
      chapterNumber: 2,
      title: 'Fractions & Equal Parts',
      description: 'Understand halves, thirds, quarters, fraction representations, and simple comparisons.',
      difficulty: 'Beginner',
      xpReward: 450,
      coinsReward: 110,
      gameType: 'Fraction Slicer Challenge',
      missionCode: 'MTH-0402',
    },
    {
      id: 'g4-math-3',
      chapterNumber: 3,
      title: 'Multiplication & Division Adventures',
      description: 'Times table patterns, repeated grouping, multi-digit operations, and word problems.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Operation Escape Room',
      missionCode: 'MTH-0403',
    },
    {
      id: 'g4-math-4',
      chapterNumber: 4,
      title: 'Shapes, Patterns & Symmetry',
      description: 'Identify 2D and 3D shapes, lines of symmetry, angle basics, and geometric patterns.',
      difficulty: 'Intermediate',
      xpReward: 550,
      coinsReward: 130,
      gameType: 'Geometry Pattern Builder',
      missionCode: 'MTH-0404',
    },
    {
      id: 'g4-math-5',
      chapterNumber: 5,
      title: 'Measurement: Length, Weight & Capacity',
      description: 'Convert centimeters to meters, grams to kilograms, liters, and practical estimation.',
      difficulty: 'Advanced',
      xpReward: 600,
      coinsReward: 140,
      gameType: 'Measurement Scale Quest',
      missionCode: 'MTH-0405',
    },
    {
      id: 'g4-math-6',
      chapterNumber: 6,
      title: 'Time, Money & Data Handling',
      description: 'Reading analog and digital clocks, currency word problems, and pictographs.',
      difficulty: 'Advanced',
      xpReward: 650,
      coinsReward: 150,
      gameType: 'Time Vault & Cash Register',
      missionCode: 'MTH-0406',
    },
  ],

  // ── Standard 4 Science ──────────────────────────────────────────────────────
  'grade-4:science': [
    {
      id: 'ch-sci4-1',
      chapterNumber: 1,
      title: 'My Body & Internal Organs',
      description: 'Human brain, heart, lungs, stomach, kidneys, bones, and muscles.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SCI-0401',
    },
    {
      id: 'g4-sci-2',
      chapterNumber: 2,
      title: 'Animals & Their Habitats',
      description: 'Herbivores, carnivores, omnivores, animal adaptations, and life cycle stages.',
      difficulty: 'Beginner',
      xpReward: 450,
      coinsReward: 110,
      gameType: 'Habitat Explorer Simulator',
      missionCode: 'SCI-0402',
    },
    {
      id: 'g4-sci-3',
      chapterNumber: 3,
      title: 'States of Matter & Materials',
      description: 'Solids, liquids, gases, melting, freezing, evaporation, and material properties.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Matter Chamber Experiment',
      missionCode: 'SCI-0403',
    },
    {
      id: 'g4-sci-4',
      chapterNumber: 4,
      title: 'Air, Water & Weather',
      description: 'Properties of air, water filtration, the water cycle, and atmospheric weather.',
      difficulty: 'Intermediate',
      xpReward: 550,
      coinsReward: 130,
      gameType: 'Weather Station Simulator',
      missionCode: 'SCI-0404',
    },
    {
      id: 'g4-sci-5',
      chapterNumber: 5,
      title: 'Force, Work & Simple Machines',
      description: 'Push and pull, friction, gravity, levers, pulleys, wheels, and inclined planes.',
      difficulty: 'Advanced',
      xpReward: 600,
      coinsReward: 140,
      gameType: 'Physics Playground Mission',
      missionCode: 'SCI-0405',
    },
  ],

  // ── Standard 4 Tamil ────────────────────────────────────────────────────────
  'grade-4:tamil': [
    {
      id: 'ch-tam4-1',
      chapterNumber: 1,
      title: 'அன்னைத் தமிழே',
      description: 'தமிழ் மொழியின் இனிமை, சொல்வளம் மற்றும் கவிதை நயம்.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0401',
    },
    {
      id: 'ch-tam4-2',
      chapterNumber: 2,
      title: 'பனிமலைப் பயணம்',
      description: 'இயற்கை எழில், கதை வாசிப்பு மற்றும் சொல்லாக்கம்.',
      difficulty: 'Beginner',
      xpReward: 450,
      coinsReward: 110,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0402',
    },
    {
      id: 'g4-tam-3',
      chapterNumber: 3,
      title: 'ஏழாம் சுவை',
      description: 'சுவைகள், பண்பாடு மற்றும் இலக்கணப் பயிற்சிகள்.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'இலக்கண வினாடி வினா',
      missionCode: 'TAM-0403',
    },
    {
      id: 'g4-tam-4',
      chapterNumber: 4,
      title: 'நன்னெறி & நீதி நூல்கள்',
      description: 'ஒழுக்கம், சமூக அறம் மற்றும் ஆத்திசூடி நன்மொழிகள்.',
      difficulty: 'Advanced',
      xpReward: 550,
      coinsReward: 130,
      gameType: 'அறநெறி புதிர்',
      missionCode: 'TAM-0404',
    },
  ],

  // ── Standard 4 English ──────────────────────────────────────────────────────
  'grade-4:english': [
    {
      id: 'ch-eng4-1',
      chapterNumber: 1,
      title: 'A Feast for Rats',
      description: 'Reading comprehension, narrative voice, and contextual vocabulary exploration.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'ENG-0401',
    },
    {
      id: 'g4-eng-2',
      chapterNumber: 2,
      title: 'The Saving Habit',
      description: 'Passage comprehension, moral theme analysis, and sentence construction.',
      difficulty: 'Beginner',
      xpReward: 450,
      coinsReward: 110,
      gameType: 'Grammar Trail Quest',
      missionCode: 'ENG-0402',
    },
    {
      id: 'g4-eng-3',
      chapterNumber: 3,
      title: 'Grammar Explorer: Nouns & Verbs',
      description: 'Proper, common, collective nouns, action verbs, and subject-verb agreement.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Parts of Speech Sorter',
      missionCode: 'ENG-0403',
    },
    {
      id: 'g4-eng-4',
      chapterNumber: 4,
      title: 'Creative Storyteller',
      description: 'Paragraph writing, punctuation, dialog tags, and creative descriptive expression.',
      difficulty: 'Advanced',
      xpReward: 550,
      coinsReward: 130,
      gameType: 'Story Builder Challenge',
      missionCode: 'ENG-0404',
    },
  ],

  // ── Standard 4 Social Science ───────────────────────────────────────────────
  'grade-4:social-science': [
    {
      id: 'ch-soc4-1',
      chapterNumber: 1,
      title: 'Kingdoms of Rivers',
      description: 'Explore the ancient dynasties: Cheras, Cholas, Pandyas, and Pallavas along riverbanks.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SOC-0401',
    },
    {
      id: 'g4-soc-2',
      chapterNumber: 2,
      title: 'Five Types of Landforms (Thinai)',
      description: 'Kurinji (mountains), Mullai (forest), Marutham (plains), Neithal (sea), and Paalai (desert).',
      difficulty: 'Beginner',
      xpReward: 450,
      coinsReward: 110,
      gameType: 'Landform Map Expedition',
      missionCode: 'SOC-0402',
    },
    {
      id: 'g4-soc-3',
      chapterNumber: 3,
      title: 'Municipality & Civic Duties',
      description: 'Local government structure, duties of citizens, public services, and community care.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Civic City Builder',
      missionCode: 'SOC-0403',
    },
    {
      id: 'g4-soc-4',
      chapterNumber: 4,
      title: 'Our Natural Resources & Heritage',
      description: 'Forests, minerals, conservation, historical monuments, and environmental stewardship.',
      difficulty: 'Advanced',
      xpReward: 550,
      coinsReward: 130,
      gameType: 'Heritage Preservation Quest',
      missionCode: 'SOC-0404',
    },
  ],

  // ── Standard 5 Tamil ────────────────────────────────────────────────────────
  'grade-5:tamil': [
    {
      id: 'ch-tam5-1',
      chapterNumber: 1,
      title: 'Introduction to Tamil',
      description: 'Classical Tamil literature, poetry, and foundational grammar concepts.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0501',
    },
    {
      id: 'ch-tam5-2',
      chapterNumber: 2,
      title: 'Tamil Poetry & Prose',
      description: 'Explore Sangam poetry, rhyming meters, and proverbs.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0502',
    },
    {
      id: 'ch-tam5-3',
      chapterNumber: 3,
      title: 'Ancient Sangam Epics',
      description: 'Study legendary Tamil epics and classical drama.',
      difficulty: 'Advanced',
      xpReward: 600,
      coinsReward: 150,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0503',
    },
  ],

  // ── Standard 5 Mathematics ──────────────────────────────────────────────────
  'grade-5:mathematics': [
    {
      id: 'ch-math5-1',
      chapterNumber: 1,
      title: 'Fractions & Geometry',
      description: 'Master fractions, 2D shapes, perimeter, and area calculations.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0501',
    },
    {
      id: 'ch-math5-2',
      chapterNumber: 2,
      title: 'Decimals, Percentages & Data',
      description: 'Explore decimal arithmetic, percentages, bar graphs, and averages.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0502',
    },
    {
      id: 'ch-math5-3',
      chapterNumber: 3,
      title: 'Algebraic Patterns & Angles',
      description: 'Understand linear sequences, missing terms, and angular measurements.',
      difficulty: 'Advanced',
      xpReward: 600,
      coinsReward: 150,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0503',
    },
  ],

  // ── Standard 5 Science ──────────────────────────────────────────────────────
  'grade-5:science': [
    {
      id: 'ch-sci5-1',
      chapterNumber: 1,
      title: 'States of Matter & Simple Machines',
      description: 'Learn solids, liquids, gases, levers, pulleys, and basic mechanics.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SCI-0501',
    },
    {
      id: 'ch-sci5-2',
      chapterNumber: 2,
      title: 'Human Body Systems & Health',
      description: 'Circulatory, respiratory, and digestive organ systems of the human body.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SCI-0502',
    },
  ],

  // ── Standard 5 Social Science ───────────────────────────────────────────────
  'grade-5:social-science': [
    {
      id: 'ch-soc5-1',
      chapterNumber: 1,
      title: 'Introduction to Social science',
      description: 'Civics, Indian heritage, continents, and geographical maps.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SOC-0501',
    },
    {
      id: 'ch-soc5-2',
      chapterNumber: 2,
      title: 'Ancient Civilizations & Geography',
      description: 'Indus Valley, Mesopotamia, climate zones, and natural resources.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SOC-0502',
    },
  ],

  // ── Standard 5 English ──────────────────────────────────────────────────────
  'grade-5:english': [
    {
      id: 'ch-eng5-1',
      chapterNumber: 1,
      title: 'Introduction to English',
      description: 'Parts of speech, sentence formation, reading comprehension, and vocabulary.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'ENG-0501',
    },
    {
      id: 'ch-eng5-2',
      chapterNumber: 2,
      title: 'Storytelling & Composition',
      description: 'Essay writing, narrative voice, metaphors, and advanced vocabulary.',
      difficulty: 'Intermediate',
      xpReward: 500,
      coinsReward: 120,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'ENG-0502',
    },
  ],
  // ── Standard 6 Subjects ──────────────────────────────────────────────────────
  'grade-6:tamil': [
    {
      id: 'ch-tam6-1',
      chapterNumber: 1,
      title: 'இன்பத்தமிழ் (Inbathtamil)',
      description: 'பாரதிதாசனின் இன்பத்தமிழ், கவிதை நயம், மற்றும் தமிழ் மொழியின் பெருமை.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0601',
    },
  ],
  'grade-6:english': [
    {
      id: 'ch-eng6-1',
      chapterNumber: 1,
      title: 'Sea Turtles',
      description: 'Marine turtle biology, Olive Ridley nesting, vocabulary, and grammar.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'ENG-0601',
    },
  ],
  'grade-6:mathematics': [
    {
      id: 'ch-math6-1',
      chapterNumber: 1,
      title: 'Numbers & Number Operations',
      description: 'Large numbers, place value systems, estimation, BODMAS, and whole numbers.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0601',
    },
  ],
  'grade-6:science': [
    {
      id: 'ch-sci6-1',
      chapterNumber: 1,
      title: 'Measurements & Motion',
      description: 'SI units, measuring instruments, length, mass, time, volume, and parallax errors.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SCI-0601',
    },
  ],
  'grade-6:social-science': [
    {
      id: 'ch-soc6-1',
      chapterNumber: 1,
      title: 'What is History?',
      description: 'Prehistory, sources of history, rock paintings, Emperor Ashoka, and archaeological evidence.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SOC-0601',
    },
  ],

  // ── Standard 7 Subjects ──────────────────────────────────────────────────────
  'grade-7:tamil': [
    {
      id: 'ch-tam7-1',
      chapterNumber: 1,
      title: 'எங்கள் தமிழ் (Our Tamil)',
      description: 'நாமக்கல் கவிஞரின் எங்கள் தமிழ், உடுமலை நாராயணகவியின் ஒன்றல்ல இரண்டல்ல, மற்றும் குற்றியலுகரம்.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0701',
    },
  ],
  'grade-7:english': [
    {
      id: 'ch-eng7-1',
      chapterNumber: 1,
      title: 'Eidgah (Prose & Grammar)',
      description: 'Munshi Premchand classic tale of empathy, abstract nouns, and degrees of comparison.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'ENG-0701',
    },
  ],
  'grade-7:mathematics': [
    {
      id: 'ch-math7-1',
      chapterNumber: 1,
      title: 'Number System: Integers',
      description: 'Integer addition, subtraction, multiplication, division, and properties of operations.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0701',
    },
  ],
  'grade-7:science': [
    {
      id: 'ch-sci7-1',
      chapterNumber: 1,
      title: 'Measurement & Motion',
      description: 'Fundamental & derived quantities, area of irregular shapes, density, and astronomical units.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SCI-0701',
    },
  ],
  'grade-7:social-science': [
    {
      id: 'ch-soc7-1',
      chapterNumber: 1,
      title: 'Sources of Medieval India',
      description: 'Inscriptions, Chola land grants, medieval monuments, temple architecture, and foreign travelogues.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SOC-0701',
    },
  ],

  // ── Standard 8 Subjects ──────────────────────────────────────────────────────
  'grade-8:tamil': [
    {
      id: 'ch-tam8-1',
      chapterNumber: 1,
      title: 'தமிழ் இன்பம் (Tamil Inbam)',
      description: 'பாரதியாரின் தமிழ்மொழி வாழ்த்து, தொல்காப்பியரின் தமிழ்மொழி மரபு, வரிவடிவ வளர்ச்சி மற்றும் எழுத்துகளின் பிறப்பு.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'TAM-0801',
    },
  ],
  'grade-8:english': [
    {
      id: 'ch-eng8-1',
      chapterNumber: 1,
      title: 'The Nose-Jewel (Prose & Grammar)',
      description: 'C. Rajagopalachari classic tale on honesty, parts of speech, prepositions, and homophones.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'ENG-0801',
    },
  ],
  'grade-8:mathematics': [
    {
      id: 'ch-math8-1',
      chapterNumber: 1,
      title: 'Rational Numbers',
      description: 'Standard form, arithmetic operations, rational numbers between rationals, and algebraic properties.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'MTH-0801',
    },
  ],
  'grade-8:science': [
    {
      id: 'ch-sci8-1',
      chapterNumber: 1,
      title: 'Measurement',
      description: 'Base SI units, temperature conversions, electric current, mole, candela, and atomic clocks.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SCI-0801',
    },
  ],
  'grade-8:social-science': [
    {
      id: 'ch-soc8-1',
      chapterNumber: 1,
      title: 'Advent of the Europeans',
      description: 'Sea route discoveries, Portuguese, Dutch, British, Danish, and French settlements in India.',
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: 'Interactive Quiz Engine',
      missionCode: 'SOC-0801',
    },
  ],

};

/**
 * Get subjects for a given standard ID.
 * Returns [] if standard not found.
 */
export function getSubjectsForStandard(standardId) {
  return CURRICULUM[standardId] || [];
}

/**
 * Generate fallback realistic chapters for any standard/subject pair
 * if not explicitly present in CHAPTERS_STORE.
 */
function generateFallbackChapters(standardId, subjectId) {
  const stdNum = standardId ? standardId.replace(/[^0-9]/g, '') || '4' : '4';
  const cleanSubj = (subjectId || 'general').replace('-', ' ');
  const capitalizedSubj = cleanSubj.charAt(0).toUpperCase() + cleanSubj.slice(1);

  return [
    {
      id: `${standardId}-${subjectId}-1`,
      standardId,
      subjectId,
      chapterNumber: 1,
      title: `Introduction to ${capitalizedSubj}`,
      description: `Fundamental core principles and core concepts in Grade ${stdNum} ${capitalizedSubj}.`,
      difficulty: 'Beginner',
      xpReward: 400,
      coinsReward: 100,
      gameType: `${capitalizedSubj} Concept Quest`,
      missionCode: `MSN-${stdNum}01`,
    },
    {
      id: `${standardId}-${subjectId}-2`,
      standardId,
      subjectId,
      chapterNumber: 2,
      title: `${capitalizedSubj} Fundamentals & Practice`,
      description: `Intermediate applications, practical examples, and core analytical problems.`,
      difficulty: 'Intermediate',
      xpReward: 550,
      coinsReward: 130,
      gameType: `${capitalizedSubj} Challenge Lab`,
      missionCode: `MSN-${stdNum}02`,
    },
    {
      id: `${standardId}-${subjectId}-3`,
      standardId,
      subjectId,
      chapterNumber: 3,
      title: `Advanced ${capitalizedSubj} Applications`,
      description: `Applied topic analysis, problem solving, and comprehensive unit assessments.`,
      difficulty: 'Advanced',
      xpReward: 700,
      coinsReward: 180,
      gameType: `${capitalizedSubj} Escape Chamber`,
      missionCode: `MSN-${stdNum}03`,
    },
    {
      id: `${standardId}-${subjectId}-4`,
      standardId,
      subjectId,
      chapterNumber: 4,
      title: `${capitalizedSubj} Mastery & Integration`,
      description: `Capstone unit synthesis, complex problem solving, and comprehensive review.`,
      difficulty: 'Expert',
      xpReward: 850,
      coinsReward: 220,
      gameType: `${capitalizedSubj} Master Arena`,
      missionCode: `MSN-${stdNum}04`,
    },
  ];
}

/**
 * Get chapters for a given standard and subject.
 */
export function getChaptersForStandardAndSubject(standardId, subjectId) {
  if (!standardId || !subjectId) return [];

  // Normalize keys
  const stdKey = standardId.includes('grade-') ? standardId : `grade-${standardId.replace(/[^0-9]/g, '')}`;
  const subjKey = subjectId.toLowerCase().trim();
  const storeKey = `${stdKey}:${subjKey}`;

  if (CHAPTERS_STORE[storeKey]) {
    return CHAPTERS_STORE[storeKey].map(ch => ({
      ...ch,
      standardId: ch.standardId || stdKey,
      subjectId: ch.subjectId || subjKey,
    }));
  }

  // Also check aliases like 11th Chemistry
  if (stdKey === 'grade-11' && (subjKey === 'chemistry' || subjKey === 'chem')) {
    return CHAPTERS_STORE['grade-11:chemistry'].map(ch => ({
      ...ch,
      standardId: ch.standardId || stdKey,
      subjectId: ch.subjectId || subjKey,
    }));
  }

  return generateFallbackChapters(stdKey, subjKey);
}

/**
 * getChapterStatus
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized unlock/completion resolver.
 * Precedence:
 *   1. Backend-provided status/completion in progress data
 *   2. Match in local user completedRooms list
 *   3. Chapter 1 is always UNLOCKED initially
 *   4. Chapter N unlocks only if Chapter N-1 is COMPLETED
 *
 * Returns: 'LOCKED' | 'UNLOCKED' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED'
 */
export function getChapterStatus(chapter, index, allChapters, completedRooms = [], userProgressList = []) {
  if (!chapter) return { status: 'LOCKED', progress: 0, stars: 0, isUnlocked: false };

  const possibleIds = [
    chapter.id,
    `chap-${index + 1}`,
    `chap_${index + 1}`,
    `room${index + 1}`,
    `room-${index + 1}`,
    `unit${index + 1}`,
    `unit-${index + 1}`,
    String(index + 1),
    chapter.missionCode,
  ].filter(Boolean);

  // 1. Check completedRooms array
  const isLocallyCompleted = possibleIds.some(id => completedRooms.includes(id));

  // 2. Check backend userProgressList
  let backendProgress = null;
  if (Array.isArray(userProgressList)) {
    backendProgress = userProgressList.find(p => {
      const roomId = p.roomId || p.room?.id;
      const chapterId = p.chapterId || p.chapter?.id;
      const roomNum = p.room?.roomNumber;
      return (
        possibleIds.includes(roomId) ||
        possibleIds.includes(chapterId) ||
        roomNum === index + 1
      );
    });
  }

  const isBackendCompleted = backendProgress?.isCompleted || backendProgress?.status === 'COMPLETED' || backendProgress?.status === 'MASTERED';
  const isCompleted = isLocallyCompleted || isBackendCompleted;

  if (isCompleted) {
    const isMastered = backendProgress?.status === 'MASTERED' || backendProgress?.stars === 3 || backendProgress?.score >= 100;
    return {
      status: isMastered ? 'MASTERED' : 'COMPLETED',
      progress: 100,
      stars: backendProgress?.stars || 3,
      isUnlocked: true,
      isCompleted: true,
    };
  }

  // 3. Check if previous chapter is completed
  let isPreviousCompleted = false;
  if (index === 0) {
    isPreviousCompleted = true; // First chapter is always unlocked
  } else {
    const prevChapter = allChapters[index - 1];
    const prevStatus = getChapterStatus(prevChapter, index - 1, allChapters, completedRooms, userProgressList);
    isPreviousCompleted = prevStatus.isCompleted;
  }

  if (isPreviousCompleted) {
    // Check if in progress
    const partialProgress = backendProgress?.progress || (backendProgress?.currentStage > 1 ? Math.min(backendProgress.currentStage * 30, 80) : 0);
    if (partialProgress > 0) {
      return {
        status: 'IN_PROGRESS',
        progress: partialProgress,
        stars: backendProgress?.stars || 0,
        isUnlocked: true,
        isCompleted: false,
      };
    }
    return {
      status: 'UNLOCKED',
      progress: 0,
      stars: 0,
      isUnlocked: true,
      isCompleted: false,
    };
  }

  return {
    status: 'LOCKED',
    progress: 0,
    stars: 0,
    isUnlocked: false,
    isCompleted: false,
  };
}

/**
 * curriculumService abstraction layer
 */
export const curriculumService = {
  getSubjects: async (standardId) => {
    return getSubjectsForStandard(standardId);
  },
  getChapters: async (standardId, subjectId) => {
    return getChaptersForStandardAndSubject(standardId, subjectId);
  },
};

export default curriculumService;
