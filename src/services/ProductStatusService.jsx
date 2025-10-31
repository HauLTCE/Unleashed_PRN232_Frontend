// src/services/ProductStatusService.jsx
import { apiClient } from './apiClient';

/**
 * GET /api/ProductStatus
 * Lấy danh sách trạng thái sản phẩm (ví dụ: Active, Inactive, ...)
 */
export const getProductStatuses = async (params = {}) => {
  const response = await apiClient.get('/ProductStatus', { params });
  return response.data;
};

/**
 * GET /api/ProductStatus/{id}
 * Lấy chi tiết 1 trạng thái
 */
export const getProductStatus = async (id) => {
  const response = await apiClient.get(`/ProductStatus/${id}`);
  return response.data;
};
