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
        // THAY ĐỔI Ở ĐÂY
        console.error("Full add to cart error object:", error); // Log toàn bộ object lỗi

        let errorMessage = 'Thêm sản phẩm vào giỏ hàng thất bại.';
        // Nếu server trả về một message lỗi cụ thể, hãy dùng nó
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        }

        // Dòng log cũ của bạn, bây giờ có thể kèm theo thông tin chi tiết hơn
        console.log('Add to cart error:', errorMessage);

        // ... phần còn lại giữ nguyên
        return { success: false, message: errorMessage };
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

export const getStockByVariationId = async (variationId) => {
    if (!variationId) throw new Error("Variation ID is required");

    try {
        const response = await apiClient.get(`https://localhost:7212/api/stockvariations/get-stock-by-variation/${variationId}`);
        console.log(response)
        const data = response.data;
        const available = data?.totalQuantity ?? 0;
        return { available, isOutOfStock: available <= 0 };
    } catch (error) {
        console.error("Error fetching stock variation:", error.response?.data || error.message);
        throw error;
    }
};