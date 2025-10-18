// src/hooks/useFilterOptions.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { getFilterOptions, clearFilterOptionsCache } from '@/services/FiltersService';

/**
 * Hook lấy options filter (colors, sizes) từ /api/Filters
 * @param {{
 *   force?: boolean,
 *   ttlMs?: number,
 *   onlyAvailable?: boolean,
 *   onlyActiveProducts?: boolean
 * }} props
 */
export function useFilterOptions({
  force = false,
  ttlMs,
  onlyAvailable = false,
  onlyActiveProducts = false,
} = {}) {
  const [data, setData] = useState({ colors: [], sizes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  async function runFetch() {
    setError(null);
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await getFilterOptions({ force, ttlMs, onlyAvailable, onlyActiveProducts });
      setData(res || { colors: [], sizes: [] });
    } catch (e) {
      if (e?.name === 'CanceledError' || e?.name === 'AbortError') return;
      setError(e?.message || 'Load filter options failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runFetch();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [force, ttlMs, onlyAvailable, onlyActiveProducts]);

  const colorMap = useMemo(() => {
    const m = new Map();
    for (const c of data.colors || []) m.set(c.colorId, c);
    return m;
  }, [data.colors]);

  const sizeMap = useMemo(() => {
    const m = new Map();
    for (const s of data.sizes || []) m.set(s.sizeId, s);
    return m;
  }, [data.sizes]);

  const refetch = () => runFetch();
  const clearCache = () => clearFilterOptionsCache();

  return {
    colors: data.colors || [],
    sizes: data.sizes || [],
    colorMap,
    sizeMap,
    loading,
    error,
    refetch,
    clearCache,
  };
}
