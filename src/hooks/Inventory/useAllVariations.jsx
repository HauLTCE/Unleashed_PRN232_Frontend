import { useState, useEffect, useCallback } from 'react';
import { searchVariations } from '../../services/VariationsService';

// Fetches all product variations for use in selection dropdowns
export function useAllVariations() {
    const [variations, setVariations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllVariations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Call searchVariations with no params to get all items
            const data = await searchVariations();
            setVariations(data || []);
        } catch (err) {
            console.error('Failed to fetch all variations:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllVariations();
    }, [fetchAllVariations]);

    return { variations, loading, error };
}