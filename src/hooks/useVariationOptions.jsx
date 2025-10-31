import { useState, useEffect } from 'react';
import { getSizes, getColors, getProductStatuses } from '@/services/VariationsService';

export const useVariationOptions = () => {
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [productStatuses, setProductStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all options in parallel
                const [sizesRes, colorsRes, statusesRes] = await Promise.all([
                    getSizes(),
                    getColors(),
                    getProductStatuses()
                ]);

                setSizes(Array.isArray(sizesRes) ? sizesRes : []);
                setColors(Array.isArray(colorsRes) ? colorsRes : []);
                setProductStatuses(Array.isArray(statusesRes) ? statusesRes : []);
            } catch (err) {
                console.error('Failed to fetch variation options:', err);
                setError(err.message || 'Failed to load options');
                setSizes([]);
                setColors([]);
                setProductStatuses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, []);

    return { sizes, colors, productStatuses, loading, error };
};