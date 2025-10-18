// src/hooks/useCategoryOptions.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { getCategories } from '@/services/CategoriesService';

// Chuẩn hoá: mảng hoặc PagedResult → mảng
function normalizeToArray(maybePaged) {
  if (!maybePaged) return [];
  if (Array.isArray(maybePaged)) return maybePaged;
  if (typeof maybePaged === 'object' && Array.isArray(maybePaged.items)) return maybePaged.items;
  return [];
}

/** Lấy danh sách category để render filter */
export function useCategoryOptions(params = { pageNumber: 1, pageSize: 200, search: '' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCategories(params, { signal: controller.signal });
        setCategories(normalizeToArray(res));
      } catch (e) {
        if (e?.name !== 'AbortError' && e?.name !== 'CanceledError') {
          setError(e?.message || 'Load categories failed');
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [params?.pageNumber, params?.pageSize, params?.search]);

  const categoryMap = useMemo(() => {
    const m = new Map();
    for (const c of categories) {
      if (c?.categoryId != null) m.set(c.categoryId, c);
    }
    return m;
  }, [categories]);

  return { categories, categoryMap, loading, error };
}
