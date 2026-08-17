import apiClient from './apiClient';

export const topicService = {
  getTopicsByChapter: async (chapterId) => {
    const res = await apiClient.get(`/chapters/${chapterId}/topics`);
    return res.data || res;
  },
};

export default topicService;
