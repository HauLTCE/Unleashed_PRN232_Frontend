import { useCallback, useState } from 'react';
import { orderService } from '../../services/OrderService'; // Điều chỉnh đường dẫn

/**
 * Hook để quản lý danh sách đơn hàng (cho trang Admin) và tạo đơn hàng mới (cho trang Checkout).
 */
export const useOrders = () => {
    // State cho trang danh sách
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        hasPrevious: false,
        hasNext: false,
    });
    const [total, setTotal] = useState(0);

    // State chung
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Hàm bao bọc (wrapper) để thực thi một lời gọi API.
     */
    const handleRequest = useCallback(async (apiCall) => {
        setLoading(true);
        setError(null);
        try {
            const result = await apiCall();
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy danh sách tất cả đơn hàng (cho Admin).
     * @param {number} currentPage - Trang hiện tại (1-based).
     * @param {number} itemsPerPage - Số mục mỗi trang.
     * @param {object} filters - { search, sort, statusId }.
     */
    const fetchOrders = useCallback(async (currentPage, itemsPerPage, filters) => {
        const apiCall = () => orderService.getAllOrders(
            filters.search,
            filters.sort,
            filters.statusId,
            currentPage - 1, // API yêu cầu page 0-based
            itemsPerPage
        );

        const result = await handleRequest(apiCall);
        if (result) {
            setOrders(result.items || []);
            setTotal(result.totalCount || 0);
            setPagination({
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                pageSize: result.pageSize,
                hasPrevious: result.hasPrevious,
                hasNext: result.hasNext,
            });
        }
    }, [handleRequest]);

    /**
     * Tạo một đơn hàng mới (cho trang Checkout).
     * @param {object} createOrderDto - Dữ liệu để tạo đơn hàng.
     */
    const createOrder = useCallback((createOrderDto) => {
        return handleRequest(() => orderService.createOrder(createOrderDto));
    }, [handleRequest]);

    return {
        // Dành cho trang danh sách
        orders,
        pagination,
        total,
        fetchOrders,

        // Dành cho cả hai
        loading,
        error,

        // Dành cho trang checkout
        createOrder,
    };
};