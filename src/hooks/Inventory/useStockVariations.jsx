import { useState, useEffect, useCallback } from 'react';
import { stockVariationService } from '../../services/stockVariationService';

export function useStockVariations() {
    const [stockVariations, setStockVariations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ✅ Fetch all stock variations
    const fetchStockVariations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await stockVariationService.getAll();
            setStockVariations(data);
        } catch (err) {
            console.error('Failed to fetch stock variations:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ Get a specific stock variation
    const fetchStockVariationById = useCallback(async (stockId, variationId) => {
        try {
            return await stockVariationService.getById(stockId, variationId);
        } catch (err) {
            console.error('Failed to fetch stock variation:', err);
            throw err;
        }
    }, []);

    // ✅ Get stock by variation ID
    const fetchStockByVariationId = useCallback(async (variationId) => {
        try {
            return await stockVariationService.getStockByVariationId(variationId);
        } catch (err) {
            console.error('Failed to fetch stock by variation ID:', err);
            throw err;
        }
    }, []);

    // ✅ Get stock by multiple variation IDs
    const fetchStockByVariationIds = useCallback(async (variationIds) => {
        try {
            return await stockVariationService.getStockByIds(variationIds);
        } catch (err) {
            console.error('Failed to fetch stock by variation IDs:', err);
            throw err;
        }
    }, []);

    // ✅ Create new stock variation
    const createStockVariation = useCallback(async (stockVariation) => {
        try {
            const created = await stockVariationService.create(stockVariation);
            setStockVariations((prev) => [...prev, created]);
            return created;
        } catch (err) {
            console.error('Failed to create stock variation:', err);
            throw err;
        }
    }, []);

    // ✅ Update an existing stock variation
    const updateStockVariation = useCallback(async (stockId, variationId, stockVariation) => {
        try {
            await stockVariationService.update(stockId, variationId, stockVariation);
            setStockVariations((prev) =>
                prev.map((item) =>
                    item.stockId === stockId && item.variationId === variationId ? { ...item, ...stockVariation } : item
                )
            );
        } catch (err) {
            console.error('Failed to update stock variation:', err);
            throw err;
        }
    }, []);

    // ✅ Delete a stock variation
    const deleteStockVariation = useCallback(async (stockId, variationId) => {
        try {
            await stockVariationService.delete(stockId, variationId);
            setStockVariations((prev) =>
                prev.filter((item) => !(item.stockId === stockId && item.variationId === variationId))
            );
        } catch (err) {
            console.error('Failed to delete stock variation:', err);
            throw err;
        }
    }, []);

    // Auto-fetch when the hook mounts
    useEffect(() => {
        fetchStockVariations();
    }, [fetchStockVariations]);

    return {
        stockVariations,
        loading,
        error,
        fetchStockVariations,
        fetchStockVariationById,
        fetchStockByVariationId,
        fetchStockByVariationIds,
        createStockVariation,
        updateStockVariation,
        deleteStockVariation,
    };
}
