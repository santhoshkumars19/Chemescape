/**
 * ChemEscape Progression & Stage Anti-Skip Validator
 */

class ProgressionValidator {
  /**
   * Validate stage progression sequence
   */
  validateStageProgression(currentStageInSession, submittedStageNumber, totalStages = 5) {
    const currentStage = parseInt(currentStageInSession, 10) || 1;
    const submittedStage = parseInt(submittedStageNumber, 10);

    if (isNaN(submittedStage) || submittedStage < 1 || submittedStage > totalStages + 1) {
      return { valid: false, error: 'Invalid stage number requested' };
    }

    // Student cannot submit a stage beyond their current unlocked stage
    if (submittedStage > currentStage) {
      return {
        valid: false,
        error: `Invalid stage progression. You are currently on Stage ${currentStage}, cannot jump to Stage ${submittedStage}.`,
      };
    }

    return { valid: true };
  }

  /**
   * Validate session active status
   */
  validateSessionActive(session) {
    if (!session) {
      return { valid: false, error: 'No active session found' };
    }
    if (session.status !== 'ACTIVE') {
      return { valid: false, error: 'Session is no longer active' };
    }
    if (session.livesRemaining <= 0) {
      return { valid: false, error: 'Session failed due to zero lives remaining' };
    }
    return { valid: true };
  }
}

module.exports = new ProgressionValidator();
