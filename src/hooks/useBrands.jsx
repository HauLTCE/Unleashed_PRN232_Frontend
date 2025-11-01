// src/hooks/useBrands.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { getBrands } from '@/services/BrandsService';

/**
 * Hook load danh sách brands, hỗ trợ refetch, tự load lại dữ liệu sau khi thao tác
 */
export const useBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AbortController để chống race condition
    const abortRef = useRef(null);

    const fetchBrands = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Hủy request cũ nếu còn
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await getBrands({ signal: controller.signal });
            // Nếu response có items (PagedResult), lấy items
            const brandsData = response?.items || response || [];
            setBrands(brandsData);
        } catch (err) {
            if (err?.name === 'AbortError') return;
            console.error('Failed to fetch brands:', err);
            setError(err.message || 'Failed to load brands');
            setBrands([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [fetchBrands]);

    return { brands, loading, error, refetch: fetchBrands };
};
