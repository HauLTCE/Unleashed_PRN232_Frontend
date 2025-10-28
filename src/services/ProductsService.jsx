import { apiClient } from './apiClient';

/**
 * GET /api/Products
 * @param {{ pageNumber?:number, pageSize?:number, search?:string }} params
 * @param {{ signal?: AbortSignal }} config
 */
export const getProducts = async (params = {}, config = {}) => {
  const response = await apiClient.get('/Products', { params, ...config });
  return response.data; // PagedResult<ProductDetailDTO>
};

/** GET /api/Products/{id} */
export const getProductById = async (id) => {
  const response = await apiClient.get(`/Products/${id}`);
  return response.data; // ProductDetailDTO
};

/** POST /api/Products */
export const createProduct = async (payload) => {
  const response = await apiClient.post('/Products', payload);
  return response.data;
};

/** PUT /api/Products/{id}  (id route phải khớp payload.productId BE đang check) */
export const updateProduct = async (id, payload) => {
  const response = await apiClient.put(`/Products/${id}`, payload);
  return response.data;
};

/** DELETE /api/Products/{id} */
export const deleteProduct = async (id) => {
  await apiClient.delete(`/Products/${id}`);
};
