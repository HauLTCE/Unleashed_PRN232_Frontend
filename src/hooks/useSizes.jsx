// src/hooks/useSizes.jsx
import { useState, useEffect } from 'react';
import { getSizes } from '@/services/SizeService';

export function useSizes(sizeId) {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSizes = async () => {
      setLoading(true);
      setError(null);
      try {
        const sizeData = await getSizes({ params: { sizeId } });
        setSizes(sizeData);
      } catch (err) {
        setError('Failed to fetch sizes');
      } finally {
        setLoading(false);
      }
    };

    if (sizeId) {
      fetchSizes();
    }
  }, [sizeId]);

  return { sizes, loading, error };
}
