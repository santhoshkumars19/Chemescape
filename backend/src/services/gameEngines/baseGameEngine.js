/**
 * ChemEscape Base Game Engine Architecture
 * Inherited / utilized by all 15 ChemEscape Game Engines.
 */

const answerValidator = require('./validation/answerValidator');
const progressionValidator = require('./validation/progressionValidator');
const rewardValidator = require('./validation/rewardValidator');

class BaseGameEngine {
  constructor(gameType, totalStages = 5) {
    this.gameType = gameType;
    this.totalStages = totalStages;
    this.answerValidator = answerValidator;
    this.progressionValidator = progressionValidator;
    this.rewardValidator = rewardValidator;
  }

  /**
   * Format standard backend stage response
   */
  formatStageResponse({
    correct,
    stageCompleted,
    nextStage,
    score,
    lifeLost = false,
    livesRemaining,
    failed = false,
    feedback,
    sanitizedState = null,
    extraData = {},
  }) {
    return {
      correct: !!correct,
      stageCompleted: !!stageCompleted,
      nextStage: nextStage || null,
      score: score || 0,
      lifeLost: !!lifeLost,
      livesRemaining: livesRemaining !== undefined ? livesRemaining : 3,
      failed: !!failed,
      feedback: feedback || (correct ? 'Stage cleared!' : 'Incorrect submission.'),
      gameState: sanitizedState,
      ...extraData,
    };
  }

  /**
   * Universal error/rejection formatter
   */
  formatRejectionResponse(message, livesRemaining, failed = false) {
    return this.formatStageResponse({
      correct: false,
      stageCompleted: false,
      nextStage: null,
      score: 0,
      lifeLost: true,
      livesRemaining,
      failed,
      feedback: message,
    });
  }
}

module.exports = BaseGameEngine;
