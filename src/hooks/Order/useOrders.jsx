import { useState, useCallback } from 'react';
import { orderService } from '../../services/orderService';

/**
 * Custom hook để quản lý state của Order (đơn hàng).
 * Được thiết kế theo cấu trúc của useNotifications.
 */
export const useOrders = () => {
    // State cho dữ liệu
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalCount: 0,
        hasPrevious: false,
        hasNext: false,
    });
    const [total, setTotal] = useState(0); // Giống cấu trúc useNotifications

    // State cho trạng thái
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Lấy danh sách đơn hàng (phân trang và lọc).
     * @param {number} page - Trang hiện tại (UI thường là 1-based).
     * @param {number} size - Kích thước trang.
     * @param {object} filters - Các bộ lọc (ví dụ: { search, sort, statusId }).
     */
    const fetchOrders = useCallback(async (page = 1, size = 10, filters = {}) => {
        setLoading(true);
        setError(null);

        // Tách các filter
        const { search = null, sort = null, statusId = null } = filters;

        try {
            // API service (C#) dùng page 0-based, hook (UI) dùng 1-based
            const apiPage = page > 0 ? page - 1 : 0;

            // Giả định orderService.getAllOrders trả về cấu trúc giống như notificationService
            const data = await orderService.getAllOrders(search, sort, statusId, apiPage, size);

            // Cập nhật state
            setOrders(data.items || []);
            setPagination({
                // API có thể trả về 0-based, chúng ta chuẩn hóa lại 1-based cho UI
                currentPage: data.currentPage + 1, // Nếu API trả về 0-based
                totalPages: data.totalPages,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
                hasPrevious: data.hasPrevious,
                hasNext: data.hasNext,
            });
            setTotal(data.totalCount);

        } catch (err) {
            console.error("Failed to fetch orders:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [orderService]); // Phụ thuộc vào orderService

    /**
     * Tạo một đơn hàng mới.
     * Component tự gọi lại fetchOrders nếu cần.
     * @param {object} createOrderDto - DTO để tạo đơn hàng.
     */
    const createNewOrder = useCallback(async (createOrderDto) => {
        try {
            const newOrder = await orderService.createOrder(createOrderDto);
            return newOrder; // Trả về đơn hàng mới (nếu cần)
        } catch (err) {
            console.error("Failed to create order:", err);
            setError(err); // Đặt lỗi
            throw err; // Ném lỗi ra để component xử lý
            S
        }
    }, [orderService]);

    /**
     * Hủy một đơn hàng.
     * @param {string} orderId - ID của đơn hàng cần hủy.
     */
    const cancelExistingOrder = useCallback(async (orderId) => {
        try {
            await orderService.cancelOrder(orderId);
        } catch (err) {
            console.error("Failed to cancel order:", err);
            setError(err);
            throw err;
        }
    }, [orderService]);

    /**
        * Duyệt (hoặc từ chối) một đơn hàng.
        * @param {string} orderId - ID của đơn hàng.
        * @param {boolean} isApproved - Trạng thái duyệt.
        */
    const reviewExistingOrder = useCallback(async (orderId, isApproved) => {
        try {
            await orderService.reviewOrder(orderId, isApproved);
        } catch (err) {
            console.error("Failed to review order:", err);
            setError(err);
            throw err;
        }
    }, [orderService]);


    // Trả về state và các hàm
    return {
        orders,
        pagination,
        total,
        loading,
        error,
        fetchOrders,
        createNewOrder,
        cancelExistingOrder,
        reviewExistingOrder,
    };
};
