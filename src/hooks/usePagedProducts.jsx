import { useEffect, useMemo, useRef, useState } from 'react';
import { getProducts } from '@/services/ProductsService';

// Debounce đơn giản
export function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Cache nhẹ trong bộ nhớ cho mỗi tham số (pageNumber, pageSize, search) */
const memoryCache = new Map();

/** Hook fetch phân trang server-side, không dùng react-query */
export function usePagedProducts({
  pageNumber = 1,
  pageSize = 20,
  search = '',
}) {
  const debouncedSearch = useDebounced(search, 400);

  const params = useMemo(
    () => ({ pageNumber, pageSize, search: debouncedSearch }),
    [pageNumber, pageSize, debouncedSearch]
  );

  const cacheKey = useMemo(() => JSON.stringify(params), [params]);

  const [data, setData] = useState(() => memoryCache.get(cacheKey) || null);
  const [loading, setLoading] = useState(!memoryCache.has(cacheKey));
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      setError(null);

      const cached = memoryCache.get(cacheKey);
      if (cached) {
        setData(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await getProducts(params, { signal: controller.signal });
        if (!mounted) return;

        memoryCache.set(cacheKey, res);
        setData(res);
        setLoading(false);
      } catch (e) {
        if (!mounted) return;
        if (e?.name === 'CanceledError' || e?.name === 'AbortError') return;
        setError(e?.message || 'Load products failed');
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [cacheKey]);

  return { data, loading, error };
}
