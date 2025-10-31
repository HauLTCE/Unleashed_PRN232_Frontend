// src/services/SizeService.jsx
import { apiClient } from './apiClient';

// GET /api/Sizes
export const getSizes = async (params = {}) => {
  const response = await apiClient.get('/Sizes', { params });
  return response.data;
};

// GET /api/Sizes/available?onlyActiveProducts=true|false
export const getAvailableSizes = async (onlyActiveProducts = false) => {
  const response = await apiClient.get('/Sizes/available', {
    params: { onlyActiveProducts },
  });
  return response.data;
};

// GET /api/Sizes/{id}
export const getSize = async (id) => {
  const response = await apiClient.get(`/Sizes/${id}`);
  return response.data;
};
