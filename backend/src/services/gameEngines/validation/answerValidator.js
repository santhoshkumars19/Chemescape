/**
 * ChemEscape Universal Answer Validator
 * Authoritative backend validation helper for all chemistry game engines.
 */

class AnswerValidator {
  /**
   * Validate numeric answers with configurable tolerance
   */
  validateNumeric(submitted, expected, tolerance = 0.05) {
    if (submitted === null || submitted === undefined || submitted === '') return false;
    const numSub = parseFloat(submitted);
    const numExp = parseFloat(expected);
    if (isNaN(numSub) || isNaN(numExp)) return false;
    if (!isFinite(numSub)) return false;
    return Math.abs(numSub - numExp) <= tolerance;
  }

  /**
   * Validate normalized text answers
   */
  validateText(submitted, expected, caseSensitive = false) {
    if (!submitted || !expected) return false;
    const subStr = String(submitted).trim();
    const expStr = String(expected).trim();
    if (caseSensitive) {
      return subStr === expStr;
    }
    return subStr.toLowerCase() === expStr.toLowerCase();
  }

  /**
   * Validate chemical formula string (ignoring spaces & case)
   */
  validateFormula(submitted, expected) {
    if (!submitted || !expected) return false;
    const subNorm = String(submitted).replace(/\s+/g, '').toUpperCase();
    const expNorm = String(expected).replace(/\s+/g, '').toUpperCase();
    return subNorm === expNorm;
  }

  /**
   * Validate MCQ choice
   */
  validateMCQ(submitted, expected) {
    return this.validateText(submitted, expected, false);
  }

  /**
   * Validate sequence/ordering array
   */
  validateOrdering(submitted, expected) {
    if (!Array.isArray(submitted) || !Array.isArray(expected)) return false;
    if (submitted.length !== expected.length) return false;
    return submitted.every((val, idx) => this.validateText(val, expected[idx], false));
  }

  /**
   * Validate key-value matching pairs
   */
  validateMatching(submittedMap, expectedMap) {
    if (!submittedMap || !expectedMap) return false;
    const expKeys = Object.keys(expectedMap);
    if (expKeys.length === 0) return false;

    return expKeys.every((key) => {
      const subVal = submittedMap[key];
      const expVal = expectedMap[key];
      if (Array.isArray(expVal)) {
        if (!Array.isArray(subVal)) return false;
        return (
          subVal.length === expVal.length &&
          subVal.every((v, i) => this.validateText(v, expVal[i], false))
        );
      }
      return this.validateText(subVal, expVal, false);
    });
  }

  /**
   * Validate drag and drop placements array/map
   */
  validatePlacements(submittedPlacements, expectedPlacements) {
    if (!submittedPlacements || !expectedPlacements) return false;
    if (Array.isArray(expectedPlacements)) {
      if (!Array.isArray(submittedPlacements)) return false;
      return expectedPlacements.every((exp) => {
        return submittedPlacements.some((sub) => {
          const matchSym = !exp.symbol || this.validateText(sub.symbol, exp.symbol);
          const matchGrp = exp.group === undefined || sub.group === exp.group;
          const matchPer = exp.period === undefined || sub.period === exp.period;
          const matchLine = !exp.targetLine || this.validateText(sub.targetLine || sub.line, exp.targetLine);
          return matchSym && matchGrp && matchPer && matchLine;
        });
      });
    }
    return this.validateMatching(submittedPlacements, expectedPlacements);
  }

  /**
   * Validate simulation numerical state against target ranges with tolerance percentage
   */
  validateSimulationState(submittedValue, targetValue, allowedTolerancePct = 0.05) {
    if (submittedValue === null || submittedValue === undefined) return false;
    const subNum = parseFloat(submittedValue);
    const tarNum = parseFloat(targetValue);
    if (isNaN(subNum) || isNaN(tarNum)) return false;
    const diff = Math.abs(subNum - tarNum);
    const maxDiff = Math.abs(tarNum * allowedTolerancePct);
    return diff <= Math.max(maxDiff, 0.1);
  }
}

module.exports = new AnswerValidator();
