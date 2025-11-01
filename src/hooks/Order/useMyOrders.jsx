import { useEffect, useState, useCallback } from "react";
import { orderService } from "../../services/orderService";

export const useMyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMyOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await orderService.getMyOrders();
            setOrders(data || []);
        } catch (err) {
            setError(err.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    return {
        orders,
        loading,
        error,
        refresh: fetchMyOrders,
    };
};
