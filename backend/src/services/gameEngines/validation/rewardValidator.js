/**
 * ChemEscape Authoritative Reward & Score Validator
 * Calculates score, XP, coins, and stars server-side. Ignores client overrides.
 */

class RewardValidator {
  calculateStageScore(baseScore = 250, livesRemaining = 3, timeSpentSec = 60) {
    let score = baseScore;
    if (livesRemaining === 3) score += 50;
    if (timeSpentSec < 120) score += 50;
    return score;
  }

  calculateStars(score, livesRemaining, timeSpentSec, totalScoreThreshold = 1000) {
    if (livesRemaining === 3 && timeSpentSec <= 200 && score >= totalScoreThreshold) {
      return 3;
    }
    if (livesRemaining >= 2 && timeSpentSec <= 300) {
      return 2;
    }
    return 1;
  }

  /**
   * Determine reward payload for first vs repeat completion
   */
  calculateCompletionRewards(isFirstCompletion, roomRewardConfig = {}) {
    const baseXP = roomRewardConfig.xpReward || 500;
    const baseCoins = roomRewardConfig.coinReward || 100;

    if (isFirstCompletion) {
      return {
        isFirstCompletion: true,
        awardedXP: baseXP,
        awardedCoins: baseCoins,
        badgeName: roomRewardConfig.badgeName || 'Mission Master',
      };
    }

    // Repeat completion awards scaled XP, zero coins, and no duplicate badges
    return {
      isFirstCompletion: false,
      awardedXP: Math.round(baseXP * 0.2),
      awardedCoins: 0,
      badgeName: null,
    };
  }
}

module.exports = new RewardValidator();
