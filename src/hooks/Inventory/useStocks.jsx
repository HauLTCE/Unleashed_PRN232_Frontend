// src/hooks/useStocks.jsx
import { useState, useEffect, useCallback } from "react";
import stockService from "../../services/stockService";

export default function useStocks() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all stocks
    const fetchStocks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await stockService.getAllStocks();
            setStocks(data);
        } catch (err) {
            console.error("Failed to fetch stocks:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new stock
    const createStock = useCallback(async (stockDto) => {
        try {
            const created = await stockService.createStock(stockDto);
            setStocks((prev) => [...prev, created]);
            return created;
        } catch (err) {
            console.error("Failed to create stock:", err);
            throw err;
        }
    }, []);

    // Update existing stock
    const updateStock = useCallback(async (id, updateStockDto) => {
        try {
            const success = await stockService.updateStock(id, updateStockDto);
            if (success) {
                await fetchStocks(); // refresh list after update
            }
            return success;
        } catch (err) {
            console.error(`Failed to update stock ${id}:`, err);
            throw err;
        }
    }, [fetchStocks]);

    // Delete stock
    const deleteStock = useCallback(async (id) => {
        try {
            const success = await stockService.deleteStock(id);
            if (success) {
                setStocks((prev) => prev.filter((s) => s.stockId !== id));
            }
            return success;
        } catch (err) {
            console.error(`Failed to delete stock ${id}:`, err);
            throw err;
        }
    }, []);

    // Initial fetch on mount
    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    return {
        stocks,
        loading,
        error,
        fetchStocks,
        createStock,
        updateStock,
        deleteStock,
    };
}
