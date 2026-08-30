/**
 * curriculumConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all standard-to-subject mappings.
 *
 * Structure is intentionally API-ready:
 *   { gradeId: string, subjects: SubjectConfig[] }
 *
 * When the backend expands to serve GET /standards/:id/subjects for all
 * grades, replace the static arrays below with the API response — no
 * other component needs to change.
 *
 * Subject shape:
 *   id          — unique key (used in localStorage + NavigationContext)
 *   name        — display label
 *   description — one-liner shown on the card
 *   icon        — lucide icon name string (resolved in SubjectCard)
 *   color       — primary accent hex
 *   borderColor — card border rgba
 *   glowColor   — selection glow rgba
 *   gradientFrom/gradientTo — card background gradient stops
 *   chapterCount — optional hint (undefined = hidden)
 */

export const CURRICULUM = {
  'grade-4': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Explore language, literature and rich cultural heritage.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Build vocabulary, grammar and communication skills.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Explore numbers, patterns and problem solving.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'science', name: 'Science',
      description: 'Discover the world through hands-on experiments.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Discover history, geography and society.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-5': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Prose, poetry and grammar in the classical tradition.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Reading, writing and spoken English fundamentals.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Fractions, geometry and logical reasoning.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'science', name: 'Science',
      description: 'States of matter, living organisms and simple machines.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Civics, maps and Indian history essentials.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-6': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Classical literature, poetry and advanced grammar.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Prose comprehension, vocabulary and essay writing.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Integers, algebra basics and data handling.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'science', name: 'Science',
      description: 'Periodic table basics, acids, bases and salts.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Ancient civilisations, Indian geography and governance.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-7': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Sangam literature and expressive writing.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Advanced reading comprehension and language use.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Rational numbers, linear equations and geometry.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'science', name: 'Science',
      description: 'Chemical changes, heat, metals and non-metals.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Medieval history, political geography and economics.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-8': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Epic literature, prose and creative composition.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Literary prose, letter writing and grammar mastery.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Exponents, algebraic expressions and mensuration.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'science', name: 'Science',
      description: 'Atoms, molecules, chemical reactions and combustion.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Modern India, civics and economic development.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-9': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Higher literature, grammar and critical writing.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Advanced prose, poetry and functional writing.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Number systems, polynomials and coordinate geometry.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'physics', name: 'Physics',
      description: 'Motion, force, work, energy and sound.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Structure of atom, bonding and stoichiometry.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Cell structure, tissues and living systems.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Indian and world history, democracy and economy.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-10': [
    {
      id: 'tamil', name: 'Tamil',
      description: 'Board-level literature, grammar and essay skills.',
      icon: 'BookText',
      color: '#F87171', borderColor: 'rgba(248,113,113,0.28)',
      glowColor: 'rgba(248,113,113,0.32)', gradientFrom: 'rgba(248,113,113,0.10)', gradientTo: 'rgba(248,113,113,0.02)',
    },
    {
      id: 'english', name: 'English',
      description: 'Board English — comprehension, grammar and writing.',
      icon: 'Languages',
      color: '#FBBF24', borderColor: 'rgba(251,191,36,0.28)',
      glowColor: 'rgba(251,191,36,0.32)', gradientFrom: 'rgba(251,191,36,0.10)', gradientTo: 'rgba(251,191,36,0.02)',
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Real numbers, trigonometry and probability.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'physics', name: 'Physics',
      description: 'Electricity, light, magnetism and modern physics.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Periodic properties, equilibrium and carbon compounds.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Life processes, reproduction and heredity.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
    },
    {
      id: 'social-science', name: 'Social Science',
      description: 'Nationalism, democracy, resources and economics.',
      icon: 'Globe',
      color: '#34D399', borderColor: 'rgba(52,211,153,0.28)',
      glowColor: 'rgba(52,211,153,0.32)', gradientFrom: 'rgba(52,211,153,0.10)', gradientTo: 'rgba(52,211,153,0.02)',
    },
  ],

  'grade-11': [
    {
      id: 'physics', name: 'Physics',
      description: 'Laws of motion, thermodynamics and optics.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Thermodynamics, organic chemistry and electrochemistry.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 14,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Sets, relations, calculus and probability.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Cell biology, genetics and plant physiology.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
    },
    {
      id: 'computer-science', name: 'Computer Science',
      description: 'Programming, data structures and algorithms.',
      icon: 'Terminal',
      color: '#A78BFA', borderColor: 'rgba(167,139,250,0.28)',
      glowColor: 'rgba(167,139,250,0.32)', gradientFrom: 'rgba(167,139,250,0.10)', gradientTo: 'rgba(167,139,250,0.02)',
    },
  ],

  'grade-12': [
    {
      id: 'physics', name: 'Physics',
      description: 'Electrostatics, wave optics and semiconductor devices.',
      icon: 'Zap',
      color: '#818CF8', borderColor: 'rgba(129,140,248,0.28)',
      glowColor: 'rgba(129,140,248,0.32)', gradientFrom: 'rgba(129,140,248,0.10)', gradientTo: 'rgba(129,140,248,0.02)',
    },
    {
      id: 'chemistry', name: 'Chemistry',
      description: 'Advanced organics, biomolecules and coordination chemistry.',
      icon: 'FlaskConical',
      color: '#22D3EE', borderColor: 'rgba(34,211,238,0.28)',
      glowColor: 'rgba(34,211,238,0.32)', gradientFrom: 'rgba(34,211,238,0.10)', gradientTo: 'rgba(34,211,238,0.02)',
      chapterCount: 16,
    },
    {
      id: 'mathematics', name: 'Mathematics',
      description: 'Matrices, integrals, vectors and linear programming.',
      icon: 'Calculator',
      color: '#10B981', borderColor: 'rgba(16,185,129,0.28)',
      glowColor: 'rgba(16,185,129,0.32)', gradientFrom: 'rgba(16,185,129,0.10)', gradientTo: 'rgba(16,185,129,0.02)',
    },
    {
      id: 'biology', name: 'Biology',
      description: 'Reproduction, biotechnology and ecology.',
      icon: 'Leaf',
      color: '#4ADE80', borderColor: 'rgba(74,222,128,0.28)',
      glowColor: 'rgba(74,222,128,0.32)', gradientFrom: 'rgba(74,222,128,0.10)', gradientTo: 'rgba(74,222,128,0.02)',
    },
    {
      id: 'computer-science', name: 'Computer Science',
      description: 'Networking, DBMS and advanced programming.',
      icon: 'Terminal',
      color: '#A78BFA', borderColor: 'rgba(167,139,250,0.28)',
      glowColor: 'rgba(167,139,250,0.32)', gradientFrom: 'rgba(167,139,250,0.10)', gradientTo: 'rgba(167,139,250,0.02)',
    },
  ],
};

/**
 * Get subjects for a given standard ID.
 * Returns [] if the standard is not found (safe empty state).
 */
export function getSubjectsForStandard(standardId) {
  return CURRICULUM[standardId] || [];
}

/**
 * curriculumService — drop-in replacement point for future backend API.
 * Import and call curriculumService.getSubjects(standardId) from pages.
 * When backend is ready, swap the body of getSubjects() to call the API.
 */
export const curriculumService = {
  /**
   * Returns subjects for a standard.
   * Currently resolves from static config; replace with API call when ready:
   *   const res = await apiClient.get(`/standards/${standardId}/subjects`);
   *   return res.data || [];
   */
  getSubjects: async (standardId) => {
    // Future: return subjectService.getSubjectsByStandard(standardId)
    return getSubjectsForStandard(standardId);
  },
};

export default curriculumService;
