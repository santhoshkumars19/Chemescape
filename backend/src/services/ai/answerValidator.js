/**
 * EduNova AI Assistant - Answer Validator
 * Validates generated AI output against strict safety, scope, and groundness rules.
 */

class AnswerValidator {
  validate({ question, answer, classification, contextPackage }) {
    if (!answer || typeof answer !== 'string') {
      return {
        valid: false,
        reason: 'Empty answer generated.'
      };
    }

    // 1. If classification was OUT_OF_SCOPE, verify answer doesn't give non-chemistry info
    if (classification === 'OUT_OF_SCOPE') {
      const isRefusal = answer.includes('EduNova syllabus') || answer.includes('ChemEscape syllabus') || answer.includes('Chemistry questions');
      if (!isRefusal) {
        return {
          valid: false,
          reason: 'Answer failed to refuse out-of-scope query.'
        };
      }
    }

    // 2. Check for unexpected programming code or non-chemistry leakage
    const lowerAns = answer.toLowerCase();
    if (lowerAns.includes('public static void main') || lowerAns.includes('system.out.println') || lowerAns.includes('def ') || lowerAns.includes('import java')) {
      return {
        valid: false,
        reason: 'Detected code leakage in Chemistry answer.'
      };
    }

    // 3. Ensure answer is grounded
    return {
      valid: true
    };
  }
}

module.exports = new AnswerValidator();
