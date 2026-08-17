import apiClient from './apiClient';

export const subjectService = {
  getSubjectsByStandard: async (standardId) => {
    const res = await apiClient.get(`/standards/${standardId}/subjects`);
    return res.data || res;
  },
  getSubjectById: async (id) => {
    const res = await apiClient.get(`/subjects/${id}`);
    return res.data || res;
  },
};

export default subjectService;
