// src/services/VariationsService.jsx
import { apiClient } from './ApiClient';

/** GET /api/Variations/{id} */
export const getVariationById = async (id) => {
  const response = await apiClient.get(`/Variations/${id}`);
  return response.data;
};

/** POST /api/Variations/batch   Body: [1,2,3]  → found-only */
export const getVariationsBatch = async (ids = []) => {
  const response = await apiClient.post('/Variations/batch', ids);
  return response.data;
};

/** GET /api/Variations?search=&productId=&colorId=&sizeId= */
export const searchVariations = async (params = {}) => {
  const response = await apiClient.get('/Variations', { params });
  return response.data;
};