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
