import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/orderService'; // Giả sử service ở đường dẫn này

/**
 * Hook để lấy và quản lý một đơn hàng cụ thể (by ID).
 * @param {string} orderId - ID của đơn hàng cần lấy.
 */
export const useOrder = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch chi tiết đơn hàng
    useEffect(() => {
        // Không fetch nếu không có orderId
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                // Giả sử bạn có hàm getOrderById trong service
                const data = await orderService.getOrderById(orderId);
                setOrder(data);
            } catch (err) {
                console.error("Failed to fetch order:", err);
                setError("Could not load order data.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]); // Chạy lại khi orderId thay đổi

    // 2. Hàm để hủy đơn hàng
    const cancelThisOrder = useCallback(async () => {
        if (!orderId) return false;

        setLoading(true);
        setError(null);
        try {
            // Giả sử bạn có hàm cancelOrder trong service
            await orderService.cancelOrder(orderId);

            // Fetch lại dữ liệu để cập nhật UI
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to cancel order.";
            setError(errorMessage);
            console.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [orderId]); // Dùng useCallback

    // 3. Hàm để Staff duyệt đơn hàng
    const reviewThisOrder = useCallback(async (isApproved) => {
        if (!orderId) return false;

        setLoading(true);
        setError(null);
        try {
            // Giả sử bạn có hàm reviewOrder trong service
            await orderService.reviewOrder(orderId, isApproved); // DTO { isApproved: true/false }

            // Fetch lại dữ liệu để cập nhật UI
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
            return true;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to review order.";
            setError(errorMessage);
            console.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, [orderId]);
    return {
        order,
        loading,
        error,
        cancelThisOrder,
        reviewThisOrder
    };
};
