import { useCallback, useEffect, useState } from 'react';
import { orderService } from '../../services/OrderService'; // Điều chỉnh đường dẫn

/**
 * Hook để quản lý chi tiết một đơn hàng duy nhất (cho trang OrderDetailPage).
 * @param {string} orderId - ID của đơn hàng cần quản lý.
 */
export const useOrder = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true); // Bắt đầu loading ngay
    const [error, setError] = useState(null);

    // Hàm tải lại dữ liệu của đơn hàng
    const fetchOrderDetails = useCallback(async () => {
        if (!orderId) {
            setLoading(false);
            setError("Order ID is missing.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await orderService.getOrderById(orderId);
            setOrder(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    // Tự động fetch dữ liệu khi component mount hoặc orderId thay đổi
    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    /**
     * Duyệt hoặc từ chối đơn hàng.
     * @param {boolean} isApproved - True để duyệt (Processing), false để từ chối (Denied).
     */
    const reviewThisOrder = useCallback(async (isApproved) => {
        const newStatusId = isApproved ? 2 : 7; // 2: Processing, 7: Denied
        try {
            await orderService.reviewOrder(orderId, newStatusId);
            await fetchOrderDetails(); // Tải lại dữ liệu sau khi cập nhật thành công
        } catch (err) {
            setError(err.message); // Hiển thị lỗi nếu có
            throw err;
        }
    }, [orderId, fetchOrderDetails]);

    /**
     * Hủy đơn hàng.
     */
    const cancelThisOrder = useCallback(async () => {
        try {
            await orderService.cancelOrder(orderId);
            await fetchOrderDetails(); // Tải lại dữ liệu
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [orderId, fetchOrderDetails]);

    const shipThisOrder = useCallback(async () => {
        try {
            await orderService.shipOrder(orderId);
            await fetchOrderDetails();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [orderId, fetchOrderDetails]);

    const confirmReceivedOrder = useCallback(async () => {
        try {
            await orderService.confirmOrderReceived(orderId);
            await fetchOrderDetails(); // tải lại dữ liệu
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, [orderId, fetchOrderDetails]);

    return {
        order,
        loading,
        error,
        reviewThisOrder,
        cancelThisOrder,
        shipThisOrder,
        confirmReceivedOrder,
    };
};