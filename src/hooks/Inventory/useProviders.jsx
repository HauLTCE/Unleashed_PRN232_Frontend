// src/hooks/useProviders.jsx
import { useState, useEffect, useCallback } from 'react';
import providerService from '../../services/providerService';

export function useProviders() {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch all providers
    const fetchProviders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await providerService.getAllProviders();
            setProviders(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
            console.error('Failed to fetch providers:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Run on mount
    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    // Create a new provider
    const createProvider = useCallback(async (providerData) => {
        try {
            const newProvider = await providerService.createProvider(providerData);
            setProviders((prev) => [...prev, newProvider]);
            return newProvider;
        } catch (err) {
            console.error('Error creating provider:', err);
            throw err;
        }
    }, []);

    // Update an existing provider
    const updateProvider = useCallback(async (id, providerData) => {
        try {
            const success = await providerService.updateProvider(id, providerData);
            if (success) {
                setProviders((prev) =>
                    prev.map((p) => (p.providerId === id ? { ...p, ...providerData } : p))
                );
            }
            return success;
        } catch (err) {
            console.error('Error updating provider:', err);
            throw err;
        }
    }, []);

    // Delete a provider
    const deleteProvider = useCallback(async (id) => {
        try {
            const success = await providerService.deleteProvider(id);
            if (success) {
                setProviders((prev) => prev.filter((p) => p.providerId !== id));
            }
            return success;
        } catch (err) {
            console.error('Error deleting provider:', err);
            throw err;
        }
    }, []);

    return {
        providers,
        loading,
        error,
        fetchProviders,
        createProvider,
        updateProvider,
        deleteProvider,
    };
}
