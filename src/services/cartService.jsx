// src/services/CartService.js
import { apiClient } from './ApiClient';

/**
 * Lấy giỏ hàng của người dùng hiện tại.
 * GET /api/cart
 * @returns {Promise<object>} Giỏ hàng của người dùng.
 */
export const getUserCart = async () => {
    const response = await apiClient.get('/cart');
    return response.data;
};

/**
 * Thêm một sản phẩm (variation) vào giỏ hàng.
 * POST /api/cart/{variationId}
 * @param {number} variationId - ID của biến thể sản phẩm.
 * @param {number} quantity - Số lượng cần thêm.
 * @returns {Promise<string>} Tin nhắn xác nhận từ server.
 */
export const addToCart = async (variationId, quantity) => {
    // Gắn quantity vào URL và không cần gửi body cho request POST này
    const response = await apiClient.post(`/cart/${variationId}?quantity=${quantity}`);
    return response.data;
};

/**
 * Xóa một sản phẩm (variation) khỏi giỏ hàng.
 * DELETE /api/cart/{variationId}
 * @param {number} variationId - ID của biến thể sản phẩm cần xóa.
 * @returns {Promise<string>} Tin nhắn xác nhận từ server.
 */
export const removeFromCart = async (variationId) => {
    const response = await apiClient.delete(`/cart/${variationId}`);
    return response.data;
};

/**
 * Xóa tất cả các sản phẩm khỏi giỏ hàng của người dùng.
 * DELETE /api/cart/all
 * @returns {Promise<string>} Tin nhắn xác nhận từ server.
 */
export const removeAllFromCart = async () => {
    const response = await apiClient.delete('/cart/all');
    return response.data;
};