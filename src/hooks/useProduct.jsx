import { useEffect, useState, useCallback, useRef } from 'react';
import { getProductById } from '@/services/ProductsService';

export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await getProductById(productId, {
        signal: controller.signal,
      });
      setProduct(data || null);
    } catch (e) {
      if (e.name === 'AbortError' || e.name === 'CanceledError') return;
      setError(e.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  return {
    product,
    loading,
    error,
    refetch: load,
    setProduct, // để local edit tạm trong FE nếu cần
  };
}
