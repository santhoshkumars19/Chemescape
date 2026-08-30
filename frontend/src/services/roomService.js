import apiClient from './apiClient';

export const roomService = {
  getRoomsByChapter: async (chapterId) => {
    const res = await apiClient.get(`/chapters/${chapterId}/rooms`);
    return res.data || res;
  },
  getRoomById: async (roomId) => {
    const res = await apiClient.get(`/rooms/${roomId}`);
    return res.data || res;
  },
  getQuestionsByRoom: async (roomId) => {
    const res = await apiClient.get(`/rooms/${roomId}/questions`);
    return res.data || res;
  },
};

export default roomService;
