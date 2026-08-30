/**
 * Central Game Progress & Pass Threshold Configuration
 *
 * Single source of truth for generic chapter quiz pass rules across
 * all standards and all subjects.
 */

'use strict';

const GAME_PROGRESS_CONFIG = {
  // Default values for standard 10-question chapter quizzes
  DEFAULT_TOTAL_QUESTIONS: 10,
  DEFAULT_MINIMUM_PASS_SCORE: 7, // 7 out of 10 (70% pass) required to unlock next chapter

  /**
   * Evaluate whether a mission attempt satisfies the pass threshold.
   *
   * @param {number} correctCount - Number of correctly answered questions
   * @param {number} totalQuestions - Total questions in the mission (default: 10)
   * @param {number|null} customMinPass - Optional custom threshold override
   * @returns {{passed: boolean, score: number, totalQuestions: number, minimumPassScore: number, accuracyPercent: number, retryRequired: boolean}}
   */
  evaluatePass(correctCount, totalQuestions = 10, customMinPass = null) {
    const total = totalQuestions > 0 ? totalQuestions : 10;
    const minPass = (customMinPass !== null && customMinPass !== undefined && customMinPass > 0)
      ? customMinPass
      : (total === 10 ? 7 : Math.ceil(total * 0.7));

    const correct = Math.max(0, Number(correctCount) || 0);
    const passed = correct >= minPass;


    return {
      passed,
      score: correct,
      totalQuestions: total,
      minimumPassScore: minPass,
      accuracyPercent: total > 0 ? Math.round((correct / total) * 100) : 0,
      retryRequired: !passed,
    };
  },
};


module.exports = GAME_PROGRESS_CONFIG;
