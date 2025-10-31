// src/services/ColorService.jsx
import { apiClient } from './apiClient';

// GET /api/Colors
export const getColors = async (params = {}) => {
  const response = await apiClient.get('/Colors', { params });
  return response.data;
};

// GET /api/Colors/available?onlyActiveProducts=true|false
export const getAvailableColors = async (onlyActiveProducts = false) => {
  const response = await apiClient.get('/Colors/available', {
    params: { onlyActiveProducts },
  });
  return response.data;
};

// GET /api/Colors/{id}
export const getColor = async (id) => {
  const response = await apiClient.get(`/Colors/${id}`);
  return response.data;
};
