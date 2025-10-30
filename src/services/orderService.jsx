/**
 * Tệp dịch vụ để tương tác với Order API.
 * Sử dụng apiClient đã được cấu hình (từ file riêng).
 */
import { apiClient } from './ApiClient'; // Import apiClient từ file riêng

// Tên controller (đường dẫn tương đối so với baseURL '/api')
const ORDER_API_PATH = '/Order';

/**
 * Xử lý lỗi tập trung từ Axios.
 * Đọc thông báo lỗi từ C# backend (nếu có) và ném ra một Error.
 * @param {Error} error - Lỗi do Axios ném ra.
 */
const handleAxiosError = (error) => {
    if (error.response && error.response.data) {
        // Ưu tiên lấy thông báo lỗi từ C# (thường là 'Message' hoặc 'message')
        const errorMessage = error.response.data.Message || error.response.data.message || error.response.statusText;
        throw new Error(errorMessage);
    } else if (error.request) {
        // Request đã được gửi nhưng không có phản hồi
        throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng.');
    } else {
        // Lỗi xảy ra khi thiết lập request
        throw new Error(error.message);
    }
};

/**
 * Lấy tất cả đơn hàng với các tùy chọn lọc, sắp xếp và phân trang.
 * @param {string | null} search - Từ khóa tìm kiếm.
 * @param {string | null} sort - Tiêu chí sắp xếp.
 * @param {number | null} statusId - ID trạng thái.
 * @param {number} page - Số trang (mặc định 0).
 * @param {number} size - Kích thước trang (mặc định 10).
 * @returns {Promise<any>} Dữ liệu phân trang của đơn hàng.
 */
const getAllOrders = async (search = null, sort = null, statusId = null, page = 0, size = 10) => {
    try {
        const params = { search, sort, statusId, page, size };
        // Axios tự động chuyển đổi 'params' thành query string
        const response = await apiClient.get(ORDER_API_PATH, { params });
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Lấy thông tin chi tiết của một đơn hàng bằng ID.
 * @param {string} orderId - GUID của đơn hàng.
 * @returns {Promise<any>} Dữ liệu chi tiết đơn hàng.
 */
const getOrderById = async (orderId) => {
    try {
        const response = await apiClient.get(`${ORDER_API_PATH}/${orderId}`);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Lấy tất cả đơn hàng của người dùng đang đăng nhập.
 * @returns {Promise<any>} Danh sách đơn hàng.
 */
const getMyOrders = async () => {
    try {
        const response = await apiClient.get(`${ORDER_API_PATH}/my-orders`);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Kiểm tra
 * @param {object} createOrderDto - DTO chứa thông tin sản phẩm cần kiểm tra.
 * @returns {Promise<any>} Thông báo từ server.
 */
const checkStockAvailability = async (createOrderDto) => {
    try {
        // Dữ liệu (createOrderDto) được tự động stringify khi dùng POST/PUT
        const response = await apiClient.post(`${ORDER_API_PATH}/check-stock`, createOrderDto);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Tạo một đơn hàng mới.
 * @param {object} createOrderDto - DTO chứa thông tin đơn hàng.
 * @returns {Promise<any>} Đơn hàng vừa được tạo.
 */
const createOrder = async (createOrderDto) => {
    try {
        const response = await apiClient.post(ORDER_API_PATH, createOrderDto);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Hủy một đơn hàng.
 * @param {string} orderId - GUID của đơn hàng.
 * @returns {Promise<any>} Thông báo từ server.
 */
const cancelOrder = async (orderId) => {
    try {
        // Request 'PUT' không cần body
        const response = await apiClient.put(`${ORDER_API_PATH}/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Duyệt hoặc từ chối đơn hàng (dành cho Staff/Admin).
 * @param {string} orderId - GUID của đơn hàng.
 * @param {boolean} isApproved - True nếu duyệt, false nếu từ chối.
 * @returns {Promise<any>} Thông báo từ server.
 */
const reviewOrder = async (orderId, isApproved) => {
    try {
        const reviewDto = { IsApproved: isApproved };
        const response = await apiClient.put(`${ORDER_API_PATH}/${orderId}/staff-review`, reviewDto);
        return response.data;
    } catch (error) {
        handleAxiosError(error);
    }
};

/**
 * Export đối tượng service chứa tất cả các hàm.
 */
export const orderService = {
    getAllOrders,
    getOrderById,
    getMyOrders,
    checkStockAvailability,
    createOrder,
    cancelOrder,
    reviewOrder,
};

