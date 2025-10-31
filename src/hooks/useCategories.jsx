import { useState, useEffect } from 'react';
import { getCategories } from '@/services/CategoriesService';

export const useCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getCategories();
                // Lấy items từ PagedResult
                const categoriesData = response?.items || [];
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError(err.message || 'Failed to load categories');
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    return { categories, loading, error };
};