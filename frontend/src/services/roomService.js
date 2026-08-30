import apiClient from './apiClient';

export const roomService = {
  getRoomsByChapter: async (chapterId, params = {}) => {
    const res = await apiClient.get(`/chapters/${chapterId}/rooms`, { params });
    return res.data || res;
  },
  getRoomById: async (roomId, params = {}) => {
    const res = await apiClient.get(`/rooms/${roomId}`, { params });
    return res.data || res;
  },
  getQuestionsByRoom: async (roomId, params = {}) => {
    const res = await apiClient.get(`/rooms/${roomId}/questions`, { params });
    return res.data || res;
  },
};

export default roomService;
