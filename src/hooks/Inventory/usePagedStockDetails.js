import { useState, useEffect, useCallback, useMemo } from 'react';
import { stockVariationService } from '../../services/stockVariationService';
import { getVariationsBatch } from '../../services/VariationsService';
import { getProductById } from '../../services/ProductsService';

const ITEMS_PER_PAGE = 5; // Reduced for a more detailed view per page

export function usePagedStockDetails(stockId) {
    const [allInventoryItems, setAllInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchStockDetails = useCallback(async () => {
        if (!stockId) { setLoading(false); return; }

        setLoading(true);
        setError(null);
        try {
            const stockVariations = await stockVariationService.getByStockId(stockId);
            if (!stockVariations || stockVariations.length === 0) {
                setAllInventoryItems([]);
                return;
            }

            const variationIds = stockVariations.map(sv => sv.variationId);
            const variationDetailsList = await getVariationsBatch(variationIds);
            const variationDetailsMap = new Map(variationDetailsList.map(v => [v.variationId, v]));

            const uniqueProductIds = [...new Set(variationDetailsList.map(v => v.productId).filter(Boolean))];
            const productDataList = await Promise.all(
                uniqueProductIds.map(id => getProductById(id))
            );
            const productDataMap = new Map(productDataList.map(p => [p.productId, p]));

            const mergedDetails = stockVariations.map(sv => {
                const variationDetail = variationDetailsMap.get(sv.variationId);
                const productDetail = variationDetail ? productDataMap.get(variationDetail.productId) : null;
                
                return {
                    ...sv, 
                    productId: variationDetail?.productId,
                    productName: productDetail?.productName || 'Unknown Product',
                    productCode: productDetail?.productCode || 'N/A',
                    brandName: productDetail?.brand?.brandName || 'Unbranded',
                    categories: productDetail?.categories?.map(c => c.categoryName) || [],
                    price: variationDetail?.variationPrice || 0,
                    imageUrl: variationDetail?.variationImage,
                    colorName: variationDetail?.color?.colorName || 'N/A',
                    colorHexCode: variationDetail?.color?.colorHexCode || '#808080',
                    sizeName: variationDetail?.size?.sizeName || 'N/A',
                };
            });
            
            setAllInventoryItems(mergedDetails);
        } catch (err) {
            console.error('Failed to fetch paged stock details:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [stockId]);

    useEffect(() => {
        fetchStockDetails();
    }, [fetchStockDetails]);
    
    const { paginatedGroups, totalPages, totalItems } = useMemo(() => {
        if (!allInventoryItems.length) {
            return { paginatedGroups: [], totalPages: 1, totalItems: 0 };
        }

        const groupedByProduct = allInventoryItems.reduce((acc, item) => {
            const key = item.productId || 'unknown';
            if (!acc[key]) {
                acc[key] = {
                    productId: item.productId,
                    productName: item.productName,
                    productCode: item.productCode,
                    brandName: item.brandName,
                    categories: item.categories,
                    variations: [],
                };
            }
            acc[key].variations.push(item);
            return acc;
        }, {});

        const allGroups = Object.values(groupedByProduct);
        const totalItemsCount = allInventoryItems.length;
        const totalPagesCount = Math.ceil(allGroups.length / ITEMS_PER_PAGE);

        const paginated = allGroups.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        return { paginatedGroups: paginated, totalPages: totalPagesCount, totalItems: totalItemsCount };
    }, [allInventoryItems, currentPage]);

    return {
        paginatedProductGroups: paginatedGroups,
        totalItems,
        loading,
        error,
        currentPage,
        totalPages,
        setCurrentPage,
        refetch: fetchStockDetails,
    };
}