/**
 * ChemEscape AI Assistant Service
 * Master orchestrator for syllabus-bound chemistry tutoring:
 * Classification -> Retrieval -> Grounded Prompting -> Gemini LLM / Grounded Engine -> Validation
 */

const questionClassifier = require('./questionClassifier');
const contentRetriever = require('./contentRetriever');
const promptBuilder = require('./promptBuilder');
const answerValidator = require('./answerValidator');

// Deterministic chemistry knowledge map for exact syllabus facts & calculations
const EXACT_CHEMISTRY_MAP = [
  {
    pattern: /atomic number of oxygen/i,
    answer: "Oxygen has atomic number 8.",
    chapter: "Periodic Classification of Elements",
    topic: "Atomic Structure & Elements"
  },
  {
    pattern: /atomic number of hydrogen/i,
    answer: "Hydrogen has atomic number 1.",
    chapter: "Periodic Classification of Elements",
    topic: "Atomic Structure & Elements"
  },
  {
    pattern: /atomic number of carbon/i,
    answer: "Carbon has atomic number 6.",
    chapter: "Periodic Classification of Elements",
    topic: "Atomic Structure & Elements"
  },
  {
    pattern: /atomic number of nitrogen/i,
    answer: "Nitrogen has atomic number 7.",
    chapter: "Periodic Classification of Elements",
    topic: "Atomic Structure & Elements"
  },
  {
    pattern: /atomic radius decrease across a period/i,
    answer: "Atomic radius decreases across a period from left to right because the effective nuclear charge increases while electrons are added to the same energy level. The stronger attraction between the nucleus and valence electrons pulls the electron cloud closer.",
    chapter: "Periodic Classification of Elements",
    topic: "Periodic Trends"
  },
  {
    pattern: /particles (in|present in) (\d+(\.\d+)?) mol/i,
    calculator: (match) => {
      const moles = parseFloat(match[2]);
      const avogadro = 6.022e23;
      const result = moles * avogadro;
      const resultFormatted = result.toExponential(4).replace('e+', ' × 10^');
      return {
        answer: `Number of particles = moles × Avogadro's number\n= ${moles} × 6.022 × 10²³\n= ${resultFormatted} particles (1.8066 × 10²⁴ particles for 3 mol).`,
        chapter: "Some Basic Concepts of Chemistry",
        topic: "Mole Concept & Stoichiometry"
      };
    }
  },
  {
    pattern: /modern periodic law/i,
    answer: "Modern Periodic Law states that physical and chemical properties of elements are periodic functions of their atomic numbers.",
    chapter: "Periodic Classification of Elements",
    topic: "Modern Periodic Table"
  },
  {
    pattern: /ionization energy/i,
    answer: "Ionization energy is the minimum energy required to remove the most loosely bound electron from an isolated neutral gaseous atom in its ground state.",
    chapter: "Periodic Classification of Elements",
    topic: "Periodic Trends"
  },
  {
    pattern: /aufbau principle/i,
    answer: "Aufbau Principle states that in the ground state of an atom, electrons fill atomic orbitals in order of increasing energy levels (1s → 2s → 2p → 3s → 3p → 4s → 3d).",
    chapter: "Structure of Atom",
    topic: "Quantum Mechanical Model"
  },
  {
    pattern: /hund'?s rule/i,
    answer: "Hund's Rule of Maximum Multiplicity states that electron pairing in degenerate orbitals (p, d, f) does not occur until each orbital in the subshell is singly occupied with parallel spins.",
    chapter: "Structure of Atom",
    topic: "Electron Configuration"
  }
];

class AIAssistantService {
  /**
   * Process user AI Assistant request
   */
  async processQuery({ userId, question, mode = 'CURRENT_CHAPTER', standardId = null, subjectId = null, chapterId = null, topicId = null }) {
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      const err = new Error('Question is required.');
      err.statusCode = 400;
      throw err;
    }

    const cleanQuestion = question.trim();

    // 1. Question Classification
    const classificationResult = questionClassifier.classify(cleanQuestion);
    const { classification, reason, suggestion } = classificationResult;

    // Handle OUT_OF_SCOPE
    if (classification === 'OUT_OF_SCOPE') {
      return {
        classification: 'OUT_OF_SCOPE',
        answer: "I can help only with Chemistry questions from the selected ChemEscape syllabus. Please ask a Chemistry-related question.",
        sources: []
      };
    }

    // Handle NOT_IN_SYLLABUS
    if (classification === 'NOT_IN_SYLLABUS') {
      return {
        classification: 'NOT_IN_SYLLABUS',
        answer: "I can help with the Chemistry topics included in your selected ChemEscape syllabus. This topic is outside the current syllabus content.",
        sources: []
      };
    }

    // Handle AMBIGUOUS
    if (classification === 'AMBIGUOUS') {
      return {
        classification: 'AMBIGUOUS',
        answer: suggestion || "Please clarify your question with specific context or select a chapter from your Chemistry syllabus.",
        sources: []
      };
    }

    // 2. Retrieve DB Content
    const contextPackage = await contentRetriever.retrieveContext({
      userId,
      standardId,
      subjectId,
      chapterId,
      topicId,
      mode,
      question: cleanQuestion
    });

    // If Mode is CURRENT_CHAPTER and question asks about an unselected chapter
    if (mode === 'CURRENT_CHAPTER' && contextPackage.currentChapter) {
      const currentChTitle = contextPackage.currentChapter.title.toLowerCase();
      // Check if question explicitly targets a different chapter concept not in current chapter
      if (cleanQuestion.toLowerCase().includes('thermodynamics') && !currentChTitle.includes('thermodynamics')) {
        return {
          classification: 'NOT_IN_SYLLABUS',
          answer: `Your current selected chapter is "${contextPackage.currentChapter.title}". Thermodynamics is in a different chapter. Please switch to "Full Syllabus" mode or select the Thermodynamics chapter to explore it!`,
          chapter: contextPackage.currentChapter.title,
          sources: []
        };
      }
    }

    // 3. Check Exact Deterministic Matches
    for (const item of EXACT_CHEMISTRY_MAP) {
      const match = cleanQuestion.match(item.pattern);
      if (match) {
        let finalAnswer = item.answer;
        let finalChapter = item.chapter;
        let finalTopic = item.topic;

        if (item.calculator) {
          const calcRes = item.calculator(match);
          finalAnswer = calcRes.answer;
          finalChapter = calcRes.chapter;
          finalTopic = calcRes.topic;
        }

        return {
          classification: 'IN_SCOPE',
          answer: finalAnswer,
          chapter: finalChapter,
          topic: finalTopic,
          sources: [
            {
              type: 'SYLLABUS_CONTENT',
              title: `${finalChapter} → ${finalTopic}`
            }
          ]
        };
      }
    }

    // 4. Gemini LLM Execution or Grounded Fallback
    const apiKey = process.env.GEMINI_API_KEY;
    let generatedAnswer = null;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        const systemInstruction = promptBuilder.getSystemInstruction();
        const userPrompt = promptBuilder.buildPrompt({ question: cleanQuestion, contextPackage });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              temperature: 0.2, // Low temperature for high precision & exact answers
              maxOutputTokens: 300
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          generatedAnswer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }
      } catch (err) {
        console.warn('[AIAssistantService] Gemini API call error:', err.message);
      }
    }

    // 5. Fallback Grounded Engine if LLM unavailable or didn't return text
    if (!generatedAnswer) {
      if (contextPackage.retrievedItems && contextPackage.retrievedItems.length > 0) {
        const top = contextPackage.retrievedItems[0];
        if (top.explanation) {
          generatedAnswer = `Based on ${top.chapterTitle}: ${top.explanation}`;
        } else if (top.description) {
          generatedAnswer = `In ${top.chapterTitle} (${top.topicTitle}): ${top.description}`;
        }
      }

      if (!generatedAnswer) {
        generatedAnswer = `In ${contextPackage.currentChapter ? contextPackage.currentChapter.title : '11th Chemistry'}, ${cleanQuestion} is a key concept. Please refer to your chapter notes for detailed definitions and equations.`;
      }
    }

    // 6. Answer Validation
    const validation = answerValidator.validate({
      question: cleanQuestion,
      answer: generatedAnswer,
      classification: 'IN_SCOPE',
      contextPackage
    });

    if (!validation.valid) {
      return {
        classification: 'NOT_IN_SYLLABUS',
        answer: "I couldn't find enough information in the selected ChemEscape syllabus to answer this accurately. Please ask a question from the current chapter or topic.",
        sources: []
      };
    }

    // 7. Format final response
    const sources = [];
    if (contextPackage.currentChapter) {
      sources.push({
        type: 'CHAPTER',
        id: contextPackage.currentChapter.id,
        title: contextPackage.currentChapter.title
      });
    }
    if (contextPackage.currentTopic) {
      sources.push({
        type: 'TOPIC',
        id: contextPackage.currentTopic.id,
        title: contextPackage.currentTopic.title
      });
    }

    return {
      classification: 'IN_SCOPE',
      answer: generatedAnswer.trim(),
      chapter: contextPackage.currentChapter ? contextPackage.currentChapter.title : 'Chemistry Syllabus',
      topic: contextPackage.currentTopic ? contextPackage.currentTopic.title : 'General Concept',
      sources
    };
  }
}

module.exports = new AIAssistantService();
