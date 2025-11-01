// src/hooks/useCategories.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories } from '@/services/CategoriesService';

/**
 * Hook load danh sách categories, hỗ trợ refetch, tự load lại dữ liệu sau khi thao tác
 */
export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AbortController để chống race condition
    const abortRef = useRef(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Hủy request cũ nếu còn
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const response = await getCategories({ signal: controller.signal });
            // Nếu response có items (PagedResult), lấy items
            const categoriesData = response?.items || response || [];
            setCategories(categoriesData);
        } catch (err) {
            if (err?.name === 'AbortError') return;
            console.error('Failed to fetch categories:', err);
            setError(err.message || 'Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        return () => {
            if (abortRef.current) abortRef.current.abort();
        };
    }, [fetchCategories]);

    return { categories, loading, error, refetch: fetchCategories };
};
