import apiClient from './apiClient';

export const chapterService = {
  getChaptersByStandard: async (standardId) => {
    const res = await apiClient.get(`/standards/${standardId}/chapters`);
    return res.data || res;
  },
  getChapterById: async (chapterId) => {
    const res = await apiClient.get(`/chapters/${chapterId}`);
    return res.data || res;
  },
};

export default chapterService;
