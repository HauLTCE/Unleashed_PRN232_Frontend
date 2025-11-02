import { useEffect, useState, useCallback } from "react";
import { orderService } from "../../services/orderService";

export const useMyOrders = (initialPage = 1, initialPageSize = 10) => {
    const [orders, setOrders] = useState([]);
    const [pageNumber, setPageNumber] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await orderService.getMyOrders(pageNumber, pageSize);

            setOrders(response.items || []);
            setTotalPages(Math.ceil(response.totalItems / pageSize));
            setTotalItems(response.totalItems);
        } catch (err) {
            setError(err.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize]);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

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
    };
};
