// src/hooks/useVariations.jsx
import { useState, useEffect } from 'react';
import { searchVariations } from '@/services/VariationsService';

export function useVariations(productId) {
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVariations = async () => {
      setLoading(true);
      setError(null);
      try {
        const variationData = await searchVariations({ search: '', productId });
        setVariations(variationData);
      } catch (err) {
        setError('Failed to fetch variations');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchVariations();
    }
  }, [productId]);

  return { variations, loading, error };
}
