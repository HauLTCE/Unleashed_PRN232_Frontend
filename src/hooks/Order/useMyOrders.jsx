// src/hooks/Order/useMyOrders.js

import { useCallback, useEffect, useState } from "react";
import { orderService } from "../../services/OrderService";

export const useMyOrders = (initialPage = 1, initialPageSize = 10) => {
    const [orders, setOrders] = useState([]);
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(true); // Bắt đầu loading ngay từ đầu
    const [error, setError] = useState(null);

    const fetchMyOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await orderService.getMyOrders(pageNumber, pageSize);
            console.log(response);
            if (response && Array.isArray(response.items)) {
                setOrders(response.items);
                setTotalItems(response.totalItems || 0);
                setTotalPages(Math.ceil((response.totalItems || 0) / pageSize));
            } else {
                setOrders([]);
                setTotalItems(0);
                setTotalPages(1);
            }

        } catch (err) {
            setError(err.message || "Failed to load orders");
            setOrders([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize]);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    const confirmReceivedOrder = async (orderId) => {
        try {
            await orderService.confirmOrderReceived(orderId); // 👈 gọi API backend
            await fetchOrders(); // refresh danh sách
            toast.success("Cảm ơn bạn! Đơn hàng đã được xác nhận là đã nhận.");
        } catch (err) {
            toast.error("Xác nhận thất bại. Vui lòng thử lại.");
            console.error(err);
        }
    };
    return {
        orders,
        loading,
        error,
        pageNumber,
        pageSize,
        totalPages,
        totalItems,
        setPageNumber,
        setPageSize,
        refresh: fetchMyOrders,
        confirmReceivedOrder,
    };
};