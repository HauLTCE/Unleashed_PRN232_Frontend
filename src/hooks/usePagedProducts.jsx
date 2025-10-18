// src/hooks/usePagedProducts.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getProducts } from '@/services/ProductsService';
import { buildFilterParams } from '@/services/FiltersService';

/** Debounce đơn giản cho search */
export function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Cache nhẹ với TTL theo tham số gọi */
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 phút
const cache = new Map(); // key -> { data, expiry }
const now = () => Date.now();
export function clearPagedProductsCache() {
  cache.clear();
}

/**
 * Hook fetch phân trang server-side, KHÔNG dùng react-query
 * - Hỗ trợ: pageNumber, pageSize, search, brandIds, categoryIds, colorIds, sizeIds,
 *           productStatusId|productStatusIds, onlyAvailable, onlyActiveProducts
 * - Có debounce search, cache TTL, abort request cũ, keepPreviousData nhẹ
 */
export function usePagedProducts(initialQuery = {}) {
  // ➊ State truy vấn có thể cập nhật dần
  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 20,
    search: '',
    brandIds: undefined,
    categoryIds: undefined,
    colorIds: undefined,
    sizeIds: undefined,
    productStatusId: undefined,
    productStatusIds: undefined,
    onlyAvailable: false,
    onlyActiveProducts: false,
    ...initialQuery,
  });

  // ➋ Debounce search để giảm số lần gọi API
  const debouncedSearch = useDebounced(query.search, 400);

  // ➌ Build params đúng format BE (đã có helper buildFilterParams)
  const builtParams = useMemo(() => {
    return buildFilterParams({
      ...query,
      search: debouncedSearch,
    });
  }, [
    query.pageNumber,
    query.pageSize,
    debouncedSearch,
    query.brandIds,
    query.categoryIds,
    query.colorIds,
    query.sizeIds,
    query.productStatusId,
    query.productStatusIds,
    query.onlyAvailable,
    query.onlyActiveProducts,
  ]);

  // ➍ Khóa cache theo params
  const cacheKey = useMemo(() => JSON.stringify(builtParams), [builtParams]);

  // ➎ Data/Loading/Error + keepPreviousData
  const [data, setData] = useState(() => {
    const c = cache.get(cacheKey);
    return c && c.expiry > now() ? c.data : null;
  });
  const [loading, setLoading] = useState(() => !cache.has(cacheKey));
  const [error, setError] = useState(null);

  // ➏ AbortController + requestId để chống race condition
  const abortRef = useRef(null);
  const reqIdRef = useRef(0);

  const fetchPage = useCallback(async () => {
    setError(null);
    const cached = cache.get(cacheKey);
    const isCacheValid = cached && cached.expiry > now();
    if (!isCacheValid) setLoading(true);

    // Hủy request cũ nếu còn
    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const myReqId = ++reqIdRef.current;

    try {
      const res = await getProducts(builtParams, { signal: controller.signal });
      // Bảo vệ: chỉ set nếu vẫn là request mới nhất
      if (reqIdRef.current !== myReqId) return;

      // Chuẩn hóa tối thiểu
      const safe = {
        items: Array.isArray(res?.items) ? res.items : [],
        totalCount: Number(res?.totalCount ?? 0),
        pageNumber: Number(res?.pageNumber ?? query.pageNumber ?? 1),
        pageSize: Number(res?.pageSize ?? query.pageSize ?? 20),
        totalPages: Number(res?.totalPages ?? 1),
        hasPrevious: !!res?.hasPrevious,
        hasNext: !!res?.hasNext,
      };

      cache.set(cacheKey, { data: safe, expiry: now() + CACHE_TTL_MS });
      setData(safe);
    } catch (e) {
      if (e?.name === 'AbortError' || e?.name === 'CanceledError') return;
      setError(e?.message || 'Load products failed');
    } finally {
      if (reqIdRef.current === myReqId) setLoading(false);
    }
  }, [cacheKey, builtParams, query.pageNumber, query.pageSize]);

  // ➐ Tự động fetch khi params đổi
  useEffect(() => {
    fetchPage();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchPage]);

  // ➑ Các helpers update truy vấn siêu tiện
  const setPage = useCallback((p) => {
    setQuery((q) => ({ ...q, pageNumber: Math.max(1, Number(p) || 1) }));
  }, []);
  const nextPage = useCallback(() => {
    setQuery((q) => ({ ...q, pageNumber: (q.pageNumber || 1) + 1 }));
  }, []);
  const prevPage = useCallback(() => {
    setQuery((q) => ({ ...q, pageNumber: Math.max(1, (q.pageNumber || 1) - 1) }));
  }, []);
  const setPageSize = useCallback((s) => {
    const size = Math.max(1, Number(s) || 20);
    setQuery((q) => ({ ...q, pageSize: size, pageNumber: 1 })); // reset về trang 1 khi đổi size
  }, []);
  const setSearch = useCallback((text) => {
    setQuery((q) => ({ ...q, search: text ?? '', pageNumber: 1 }));
  }, []);
  const setFilters = useCallback((partial) => {
    // partial: { brandIds, categoryIds, colorIds, sizeIds, productStatusId|Ids, onlyAvailable, onlyActiveProducts }
    setQuery((q) => ({ ...q, ...partial, pageNumber: 1 }));
  }, []);
  const refetch = useCallback(() => {
    // ép bỏ cache khóa hiện tại & fetch lại
    cache.delete(cacheKey);
    fetchPage();
  }, [cacheKey, fetchPage]);

  // ➒ Giá trị trả về thân thiện FE
  const items = data?.items ?? [];
  const meta = {
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? query.pageNumber ?? 1,
    pageSize: data?.pageSize ?? query.pageSize ?? 20,
    totalPages: data?.totalPages ?? 1,
    hasPrevious: !!data?.hasPrevious,
    hasNext: !!data?.hasNext,
  };

  return {
    /** dữ liệu sản phẩm đã phân trang */
    data: { items, ...meta },
    items,
    ...meta,

    /** trạng thái */
    loading,
    error,

    /** truy vấn hiện tại + helpers cập nhật */
    query,
    setQuery,
    setSearch,
    setFilters,
    setPage,
    setPageSize,
    nextPage,
    prevPage,

    /** điều khiển cache & fetch */
    refetch,
    clearCache: clearPagedProductsCache,
  };
}
