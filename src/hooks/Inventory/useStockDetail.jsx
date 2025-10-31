import { useState, useEffect, useCallback } from 'react';
import { stockVariationService } from '../../services/stockVariationService';
import { getVariationsBatch } from '../../services/VariationsService';

export function useStockDetail(stockId) {
    const [inventoryDetails, setInventoryDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDetails = useCallback(async () => {
        if (!stockId) {
            setLoading(false);
            return;
        };

        setLoading(true);
        setError(null);

        try {
            const stockVariations = await stockVariationService.getByStockId(stockId);

            if (!stockVariations || stockVariations.length === 0) {
                setInventoryDetails([]);
                setLoading(false);
                return;
            }

            const variationIds = stockVariations.map(sv => sv.variationId);
            
            // Fetch product details for these specific variations
            const productDetailsList = await getVariationsBatch(variationIds);
            const productDetailsMap = new Map(productDetailsList.map(p => [p.variationId, p]));

            // Merge the two datasets
            const mergedDetails = stockVariations.map(sv => {
                const product = productDetailsMap.get(sv.variationId);
                return {
                    ...sv,
                    productName: product?.product?.productName || 'Unknown Product',
                    category: product?.product?.categories?.[0]?.categoryName || 'Uncategorized',
                    price: product?.variationPrice || 0,
                    imageUrl: product?.variationImage || '/placeholder.png',
                };
            }).sort((a, b) => a.productName.localeCompare(b.productName));

            setInventoryDetails(mergedDetails);
        } catch (err) {
            console.error('Failed to fetch stock details:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [stockId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    return {
        inventoryDetails,
        loading,
        error,
        refetch: fetchDetails,
    };
}