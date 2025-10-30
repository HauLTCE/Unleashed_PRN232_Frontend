// src/services/DiscountService.js
import { apiClient } from './ApiClient';

// ===================================
// === Endpoints cho Admin/Staff ===
// ===================================

/**
 * Tạo một mã giảm giá mới.
 * POST /api/discounts
 * @param {object} createDto - DTO chứa thông tin để tạo mã giảm giá.
 * @returns {Promise<object>} Mã giảm giá vừa được tạo.
 */
export const createDiscount = async (createDto) => {
  const response = await apiClient.post('/discounts', createDto);
  return response.data;
};

/**
 * Cập nhật một mã giảm giá đã có.
 * PUT /api/discounts/{id}
 * @param {number} id - ID của mã giảm giá cần cập nhật.
 * @param {object} updateDto - DTO chứa thông tin cập nhật.
 * @returns {Promise<object>} Mã giảm giá sau khi cập nhật.
 */
export const updateDiscount = async (id, updateDto) => {
  const response = await apiClient.put(`/discounts/${id}`, updateDto);
  return response.data;
};

/**
 * Xóa một mã giảm giá.
 * DELETE /api/discounts/{id}
 * @param {number} id - ID của mã giảm giá cần xóa.
 * @returns {Promise<void>}
 */
export const deleteDiscount = async (id) => {
  await apiClient.delete(`/discounts/${id}`);
};

/**
 * Lấy tất cả mã giảm giá với tùy chọn tìm kiếm và lọc.
 * GET /api/discounts
 * @param {object} params - Các tham số truy vấn (search, statusId, typeId).
 * @param {object} options - Các tùy chọn bổ sung, ví dụ { signal }.
 * @returns {Promise<Array<object>>} Danh sách các mã giảm giá.
 */
export const getAllDiscounts = async (params = {}, options = {}) => {
  const { signal } = options;
  // Truyền signal vào config của apiClient (axios)
  const response = await apiClient.get('/discounts', { params, signal });
  return response.data;
};

/**
 * Thêm danh sách người dùng vào một mã giảm giá cụ thể.
 * POST /api/discounts/{discountId}/users
 * @param {number} discountId - ID của mã giảm giá.
 * @param {Array<string>} userIds - Mảng các ID của người dùng.
 * @returns {Promise<string>} Tin nhắn xác nhận.
 */
export const addUsersToDiscount = async (discountId, userIds) => {
  const response = await apiClient.post(`/discounts/${discountId}/users`, userIds);
  return response.data;
};

/**
 * Xóa một người dùng khỏi mã giảm giá.
 * DELETE /api/discounts/{discountId}/users
 * @param {number} discountId - ID của mã giảm giá.
 * @param {string} userId - ID của người dùng cần xóa.
 * @returns {Promise<void>}
 */
export const removeUserFromDiscount = async (discountId, userId) => {
  await apiClient.delete(`/discounts/${discountId}/users`, { params: { userId } });
};

/**
 * Lấy danh sách người dùng được áp dụng một mã giảm giá.
 * GET /api/discounts/{discountId}/users
 * @param {number} discountId - ID của mã giảm giá.
 * @returns {Promise<Array<object>>} Danh sách người dùng.
 */
export const getUsersByDiscountId = async (discountId) => {
  const response = await apiClient.get(`/discounts/${discountId}/users`);
  return response.data;
};


// ===============================
// === Endpoints cho Customer ===
// ===============================

/**
 * Lấy các mã giảm giá của người dùng hiện tại.
 * GET /api/discounts/me
 * @param {object} params - Các tham số truy vấn (search, statusId, typeId, sortBy, sortOrder).
 * @returns {Promise<Array<object>>} Danh sách mã giảm giá của tôi.
 */
export const getMyDiscounts = async (params = {}) => {
  const response = await apiClient.get('/discounts/me', { params });
  return response.data;
};

/**
 * Lấy chi tiết một mã giảm giá của người dùng hiện tại.
 * GET /api/discounts/me/{discountId}
 * @param {number} discountId - ID của mã giảm giá.
 * @returns {Promise<object>} Chi tiết mã giảm giá.
 */
export const getMyDiscountById = async (discountId) => {
  const response = await apiClient.get(`/discounts/me/${discountId}`);
  return response.data;
};

/**
 * Lấy các mã giảm giá tốt nhất cho giỏ hàng hiện tại.
 * GET /api/discounts/best-for-checkout
 * @param {number} cartTotal - Tổng giá trị giỏ hàng.
 * @returns {Promise<Array<object>>} Danh sách các mã giảm giá phù hợp.
 */
export const getBestDiscountsForCheckout = async (cartTotal) => {
  const response = await apiClient.get('/discounts/best-for-checkout', { params: { cartTotal } });
  return response.data;
};

/**
 * Kiểm tra tính hợp lệ của một mã giảm giá cho người dùng và giỏ hàng.
 * GET /api/discounts/check-user-discount
 * @param {string} discountCode - Mã giảm giá cần kiểm tra.
 * @param {number} subTotal - Tổng giá trị đơn hàng trước khi giảm giá.
 * @returns {Promise<object>} Kết quả kiểm tra.
 */
export const checkUserDiscount = async (discountCode, subTotal) => {
  const response = await apiClient.get('/discounts/check-user-discount', { params: { discountCode, subTotal } });
  return response.data;
};


// ================================
// === Endpoints công khai (Public) ===
// ================================

/**
 * Lấy thông tin chi tiết của một mã giảm giá bằng ID.
 * GET /api/discounts/{id}
 * @param {number} id - ID của mã giảm giá.
 * @returns {Promise<object>} Chi tiết mã giảm giá.
 */
export const getDiscountById = async (id) => {
  const response = await apiClient.get(`/discounts/${id}`);
  return response.data;
};

/**
 * Lấy tất cả các trạng thái của mã giảm giá.
 * GET /api/discounts/statuses
 * @returns {Promise<Array<object>>} Danh sách trạng thái.
 */
export const getAllDiscountStatuses = async () => {
  const response = await apiClient.get('/discounts/statuses');
  return response.data;
};

/**
 * Lấy tất cả các loại mã giảm giá.
 * GET /api/discounts/types
 * @returns {Promise<Array<object>>} Danh sách loại mã giảm giá.
 */
export const getAllDiscountTypes = async () => {
  const response = await apiClient.get('/discounts/types');
  return response.data;
};

/**
 * Kiểm tra xem một mã code giảm giá có tồn tại hay không.
 * GET /api/discounts/check-code
 * @param {string} code - Mã code cần kiểm tra.
 * @returns {Promise<boolean>} True nếu tồn tại, ngược lại là false.
 */
export const checkDiscountCodeExists = async (code) => {
  const response = await apiClient.get('/discounts/check-code', { params: { code } });
  return response.data;
};