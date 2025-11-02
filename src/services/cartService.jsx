import { apiClient } from './ApiClient'; // Đảm bảo đường dẫn đến file ApiClient là chính xác

/**
 * Lấy dữ liệu giỏ hàng của người dùng đang đăng nhập.
 * Tương ứng với endpoint: GET /api/cart
 * @returns {Promise<Array<Object>>} Một promise chứa dữ liệu giỏ hàng (mảng các GroupedCartDTO).
 */
export const getUserCart = async () => {
    try {
        const response = await apiClient.get('/cart');
        return response.data;
    } catch (error) {
        console.error("Error fetching user cart:", error.response?.data || error.message);
        // Ném lỗi ra ngoài để component hoặc hook có thể xử lý (ví dụ: hiển thị thông báo lỗi)
        throw error;
    }
};

/**
 * Thêm một sản phẩm vào giỏ hàng.
 * Tương ứng với endpoint: POST /api/cart/{variationId}?quantity={quantity}
 * @param {number} variationId - ID của biến thể sản phẩm (product variation).
 * @param {number} quantity - Số lượng sản phẩm cần thêm.
 * @returns {Promise<string>} Một promise chứa thông báo thành công từ server.
 */
export const addToCart = async (variationId, quantity) => {
    if (!variationId || quantity <= 0) {
        throw new Error('Variation ID và số lượng là bắt buộc và phải hợp lệ.');
    }

    try {
        // Gửi quantity dưới dạng query parameter như trong định nghĩa của Controller [FromQuery]
        const response = await apiClient.post(`/cart/${variationId}?quantity=${quantity}`);
        return response.data;
    } catch (error) {
        console.error("Error adding item to cart:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Xóa một sản phẩm khỏi giỏ hàng dựa vào variationId.
 * Tương ứng với endpoint: DELETE /api/cart/{variationId}
 * @param {number} variationId - ID của biến thể sản phẩm cần xóa.
 * @returns {Promise<string>} Một promise chứa thông báo thành công từ server.
 */
export const removeFromCart = async (variationId) => {
    if (!variationId) {
        throw new Error('Variation ID là bắt buộc.');
    }

    try {
        const response = await apiClient.delete(`/cart/${variationId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing item from cart:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Xóa tất cả các sản phẩm khỏi giỏ hàng của người dùng.
 * Tương ứng với endpoint: DELETE /api/cart/all
 * @returns {Promise<string>} Một promise chứa thông báo thành công từ server.
 */
export const clearCart = async () => {
    try {
        const response = await apiClient.delete('/cart/all');
        return response.data;
    } catch (error) {
        console.error("Error clearing cart:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
 * Tương ứng với endpoint: PUT /api/cart/{variationId}?quantity={quantity}
 * @param {number} variationId - ID của biến thể sản phẩm.
 * @param {number} newQuantity - Số lượng mới.
 * @returns {Promise<string>} Một promise chứa thông báo thành công.
 */
export const updateItemQuantity = async (variationId, newQuantity) => {
    if (!variationId || newQuantity <= 0) {
        throw new Error('Variation ID và số lượng mới phải hợp lệ.');
    }
    try {
        const response = await apiClient.put(`/cart/${variationId}?quantity=${newQuantity}`);
        return response.data;
    } catch (error) {
        console.error("Error updating item quantity:", error.response?.data || error.message);
        throw error;
    }
};