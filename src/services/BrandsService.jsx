// src/services/BrandsService.jsx
import { apiClient } from './apiClient';

/** GET /api/Brands  (PagedResult<BrandDetailDTO>) */
export const getBrands = async (params = {}) => {
  const response = await apiClient.get('/Brands', { params });
  return response.data;
};

/** GET /api/Brands/{id} */
export const getBrand = async (id) => {
  const response = await apiClient.get(`/Brands/${id}`);
  return response.data;
};

/** POST /api/Brands */
export const createBrand = async (payload) => {
  const response = await apiClient.post('/Brands', payload);
  return response.data;
};

/** PUT /api/Brands/{id} */
export const updateBrand = async (id, payload) => {
  const response = await apiClient.put(`/Brands/${id}`, payload);
  return response.data;
};

/** DELETE /api/Brands/{id} */
export const deleteBrand = async (id) => {
  await apiClient.delete(`/Brands/${id}`);
};