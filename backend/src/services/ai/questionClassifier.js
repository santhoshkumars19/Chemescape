/**
 * EduNova AI Assistant - Question Classifier
 * Classifies incoming user queries into:
 * - IN_SCOPE: Valid Chemistry query within the syllabus
 * - OUT_OF_SCOPE: Non-chemistry questions (coding, general knowledge, jokes, news, etc.)
 * - NOT_IN_SYLLABUS: Chemistry topic outside 11th/12th EduNova syllabus
 * - AMBIGUOUS: Vague/incomplete query needing clarification
 */

const OUT_OF_SCOPE_KEYWORDS = [
  // Programming & Tech
  'java', 'python', 'javascript', 'c++', 'html', 'css', 'react', 'node', 'code', 'program', 'algorithm', 'website', 'software',
  // General Knowledge & Geography
  'capital of', 'prime minister', 'president of', 'country', 'population of', 'weather today', 'news today', 'who is', 'where is',
  // Entertainment & Casual
  'joke', 'funny', 'story', 'song', 'movie', 'game', 'business idea', 'recipe', 'food',
  // Other Subjects (unless chemistry context present)
  'newton', 'gravity', 'pythagoras', 'trigonometry', 'calculus', 'dna', 'cell wall', 'photosynthesis', 'mitosis'
];

const CHEMISTRY_KEYWORDS = [
  'atom', 'atomic', 'element', 'compound', 'molecule', 'molecular', 'reaction', 'periodic', 'electron',
  'proton', 'neutron', 'orbital', 'valence', 'bond', 'bonding', 'stoichiometry', 'mole', 'molar', 'mass',
  'acid', 'base', 'ph', 'titration', 'oxidation', 'reduction', 'redox', 'equilibrium', 'thermodynamics',
  'enthalpy', 'entropy', 'kinetics', 'organic', 'inorganic', 'alkane', 'alkene', 'alkyne', 'alcohol',
  'aldehyde', 'ketone', 'carboxylic', 'amine', 'isomer', 'solution', 'solute', 'solvent', 'molarity',
  'electrochemistry', 'anode', 'cathode', 'hybridization', 'electronegativity', 'ionization', 'radius',
  'avogadro', 'gas law', 'boyle', 'charles', 'ideal gas', 'pv=nrt', 'aufbau', 'hund', 'pauli', 'octet'
];

class QuestionClassifier {
  classify(question, availableSyllabusContext = null) {
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return {
        classification: 'AMBIGUOUS',
        reason: 'Empty or invalid question.'
      };
    }

    const normalized = question.trim().toLowerCase();

    // 1. Check for explicit Out-of-Scope triggers
    for (const word of OUT_OF_SCOPE_KEYWORDS) {
      // Escape regex special characters like '+' in 'c++'
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|\\b|\\s)${escaped}(?:$|\\b|\\s)`, 'i');
      if (regex.test(normalized)) {
        // Exception: if it contains strong chemistry terms as well (e.g., "python chemistry simulation" -> still out of scope programming)
        if (word === 'newton' || word === 'gravity') {
          if (!normalized.includes('gas') && !normalized.includes('liquid') && !normalized.includes('mass')) {
            return {
              classification: 'OUT_OF_SCOPE',
              reason: 'Physics topic outside Chemistry scope.'
            };
          }
        } else {
          return {
            classification: 'OUT_OF_SCOPE',
            reason: `Non-chemistry topic detected (${word}).`
          };
        }
      }
    }

    // 2. Check for Ambiguous / Vague queries (e.g., single word "equilibrium", "reaction", "explain")
    const words = normalized.split(/\s+/).filter(w => w.length > 0);
    if (words.length <= 2) {
      const vagueWords = ['equilibrium', 'reaction', 'explain', 'what is it', 'tell me', 'help', 'chemistry'];
      if (vagueWords.some(vw => normalized === vw || normalized === `explain ${vw}`)) {
        return {
          classification: 'AMBIGUOUS',
          reason: 'Query is too vague and requires chapter or topic context.',
          suggestion: 'Do you mean Physical and Chemical Equilibrium from 11th Chemistry?'
        };
      }
    }

    // 3. Check Chemistry relevance
    const isChemistryRelated = CHEMISTRY_KEYWORDS.some(term => normalized.includes(term)) ||
      /\b(h2o|co2|n2|o2|nac|hcl|h2so4|naoh|ch4|c2h5oh|z=\d+)\b/i.test(normalized) ||
      /\b(mol|moles|gram|g|kg|kelvin|k|pascal|atm|joule|j)\b/i.test(normalized) ||
      /\b(formula|structure|properties|configuration|trend|symbol)\b/i.test(normalized);

    if (!isChemistryRelated) {
      // If it doesn't match chemistry keywords and has non-chemistry intent
      return {
        classification: 'OUT_OF_SCOPE',
        reason: 'Question is not related to the Chemistry syllabus.'
      };
    }

    // 4. Check Advanced / Out of Syllabus topics
    const outOfSyllabusTerms = [
      'quantum electrodynamics', 'schrodinger 3d wave equation derivation',
      'string theory', 'nuclear magnetic resonance advanced 2d', 'x-ray crystallography brutal',
      'graduate level organic synthesis', 'supramolecular polymer chemistry'
    ];
    if (outOfSyllabusTerms.some(term => normalized.includes(term))) {
      return {
        classification: 'NOT_IN_SYLLABUS',
        reason: 'Topic is outside the 11th & 12th Chemistry syllabus.'
      };
    }

    return {
      classification: 'IN_SCOPE',
      reason: 'Valid Chemistry query.'
    };
  }
}

module.exports = new QuestionClassifier();
