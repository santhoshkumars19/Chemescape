/**
 * ChemEscape AI Assistant - Prompt Builder
 * Builds strict, syllabus-grounded prompts for the Gemini LLM.
 */

class PromptBuilder {
  getSystemInstruction() {
    return `You are the ChemEscape Chemistry Tutor.
You are NOT a general-purpose assistant.
Answer only questions supported by the provided ChemEscape syllabus context.
The provided context and 11th/12th Chemistry syllabus standards are the authoritative source.
Do not use external knowledge when the answer is not supported by the context or syllabus.
Do not answer non-Chemistry questions.
Do not answer Chemistry topics outside the selected syllabus mode.
Answer the exact question asked directly. Do not output long irrelevant essays.
For numerical questions: solve step-by-step and provide the exact numerical answer.
Do not invent facts, reactions, or formulas.
If the answer is not supported by the provided context or syllabus, say: "I don't have enough information from the current ChemEscape syllabus content to answer this accurately."
Keep the explanation clear and appropriate to the student's standard.`;
  }

  buildPrompt({ question, contextPackage }) {
    const { standard, subject, currentChapter, currentTopic, mode, retrievedItems } = contextPackage;

    let contextText = `STUDENT CONTEXT:
- Standard: ${standard?.displayName || '11th Standard'}
- Subject: ${subject?.name || 'Chemistry'}
- Mode: ${mode}
- Selected Chapter: ${currentChapter ? currentChapter.title : 'All Chapters in Syllabus'}
- Selected Topic: ${currentTopic ? currentTopic.title : 'General'}\n\n`;

    contextText += `RETRIEVED SYLLABUS CONTENT:\n`;
    if (retrievedItems && retrievedItems.length > 0) {
      retrievedItems.forEach((item, index) => {
        contextText += `[Source ${index + 1}] (${item.type}) Chapter: ${item.chapterTitle}\n`;
        if (item.topicTitle) contextText += `Topic: ${item.topicTitle} - ${item.description}\n`;
        if (item.questionText) contextText += `Question: ${item.questionText}\nExplanation: ${item.explanation}\n`;
        contextText += `\n`;
      });
    } else {
      contextText += `Standard 11th/12th Chemistry Core Concepts for ${currentChapter ? currentChapter.title : 'Syllabus'}.\n\n`;
    }

    contextText += `USER QUESTION:
"${question}"

INSTRUCTION:
Answer the exact question directly, using the provided syllabus context. For numerical problems, show exact calculation steps. Keep the tone encouraging, clear, and grounded in the syllabus.`;

    return contextText;
  }
}

module.exports = new PromptBuilder();
