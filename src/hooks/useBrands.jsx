// src/hooks/useBrands.js
import { useState, useEffect } from 'react';
import { getBrands } from '@/services/BrandsService';

export const useBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getBrands();
                // Lấy items từ PagedResult
                const brandsData = response?.items || [];
                setBrands(brandsData);
            } catch (err) {
                console.error('Failed to fetch brands:', err);
                setError(err.message || 'Failed to load brands');
                setBrands([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBrands();
    }, []);

    return { brands, loading, error };
};