// src/services/CategoriesService.jsx
import { apiClient } from './ApiClient';

/** GET /api/Categories  (PagedResult<CategoryDetailDTO>) */
export const getCategories = async (params = {}) => {
  const response = await apiClient.get('/Categories', { params });
  return response.data;
};

/** GET /api/Categories/{id} */
export const getCategory = async (id) => {
  const response = await apiClient.get(`/Categories/${id}`);
  return response.data;
};

/** POST /api/Categories */
export const createCategory = async (payload) => {
  const response = await apiClient.post('/Categories', payload);
  return response.data;
};

/** PUT /api/Categories/{id} */
export const updateCategory = async (id, payload) => {
  const response = await apiClient.put(`/Categories/${id}`, payload);
  return response.data;
};

/** DELETE /api/Categories/{id} */
export const deleteCategory = async (id) => {
  await apiClient.delete(`/Categories/${id}`);
};