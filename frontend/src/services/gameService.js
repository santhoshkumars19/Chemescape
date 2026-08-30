import apiClient from './apiClient';

export const gameService = {
  getUserProgress: async () => {
    const res = await apiClient.get('/game/progress');
    return res.data || res;
  },
  getRoomProgress: async (roomId) => {
    const res = await apiClient.get(`/game/progress/${roomId}`);
    return res.data || res;
  },
  getUnlockedChapters: async (standardId, subjectId) => {
    const res = await apiClient.get('/game/unlocked', { params: { standardId, subjectId } });
    return res.data || res;
  },
  startRoomProgress: async (roomId) => {
    const res = await apiClient.post(`/game/progress/${roomId}/start`);
    return res.data || res;
  },
  saveRoomProgress: async (roomId, data) => {
    const res = await apiClient.post(`/game/progress/${roomId}/save`, data);
    return res.data || res;
  },
  completeRoom: async (roomId, data) => {
    const res = await apiClient.post(`/game/progress/${roomId}/complete`, data);
    return res.data || res;
  },

  /**
   * Server-authoritative per-question answer validation.
   * POST /api/game/questions/:questionId/answer
   *
   * @param {string} questionId   - The question's ID
   * @param {string} roomId       - The room this question belongs to
   * @param {string} answer       - The student's submitted optionId / value
   * @returns {{ correct: boolean, points: number, feedback: string }}
   */
  submitAnswer: async (questionId, roomId, answer) => {
    const res = await apiClient.post(`/game/questions/${questionId}/answer`, {
      answer,
      roomId,
    });
    // API shape: { success, data: { correct, points, feedback } }
    return res.data || res;
  },

  startGameSession: async (gameTypeEndpoint, roomId) => {
    const res = await apiClient.post(`/game/${gameTypeEndpoint}/start`, { roomId });
    return res.data || res;
  },
  submitStageAnswer: async (gameTypeEndpoint, stageNumber, answerData) => {
    const res = await apiClient.post(`/game/${gameTypeEndpoint}/stage/${stageNumber}/submit`, answerData);
    return res.data || res;
  },
  submitFinalGame: async (gameTypeEndpoint, finalData) => {
    const res = await apiClient.post(`/game/${gameTypeEndpoint}/final-submit`, finalData);
    return res.data || res;
  },
};

export default gameService;
