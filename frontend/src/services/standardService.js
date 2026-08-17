import apiClient from './apiClient';

export const standardService = {
  getAllStandards: async () => {
    const res = await apiClient.get('/standards');
    return res.data || res;
  },
  getStandardById: async (id) => {
    const res = await apiClient.get(`/standards/${id}`);
    return res.data || res;
  },
};

export default standardService;
