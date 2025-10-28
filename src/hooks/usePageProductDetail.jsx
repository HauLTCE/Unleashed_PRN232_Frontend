import { useEffect, useMemo, useRef, useState } from 'react';
import { getProductById } from '@/services/ProductsService';

// -----------------------------------------------------
// In-memory cache tối giản (key = productId)
const _cache = new Map();
const _inFlight = new Map();
// -----------------------------------------------------

function computePriceRange(variations) {
  if (!variations?.length) return { min: null, max: null };

  const prices = variations
    .map(v => (typeof v.variationPrice === 'number' ? v.variationPrice : null))
    .filter(x => x !== null);

  if (!prices.length) return { min: null, max: null };

  let min = prices[0],
    max = prices[0];
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

function collectImages(dto) {
  if (!dto?.variations?.length) return [];
  const imgs = dto.variations
    .map(v => v.variationImage)
    .filter(s => !!s && typeof s === 'string');
  return Array.from(new Set(imgs));
}

export function usePageProductDetail(productId, opts = {}) {
  const {
    immediate = true,
    useCache = true,
    cacheTtlMs = 5 * 60_000, // 5 phút
  } = opts;

  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(!!immediate && !!productId);
  const [error, setError] = useState(null);

  const latestIdRef = useRef(productId);

  const priceRange = useMemo(() => computePriceRange(data?.variations), [data]);
  const images = useMemo(() => collectImages(data), [data]);
  const hasVariations = useMemo(
    () => Array.isArray(data?.variations) && (data?.variations?.length ?? 0) > 0,
    [data]
  );

  // cleanup requests khi unmount
  useEffect(() => {
    return () => {
      _inFlight.forEach(ctrl => ctrl.abort());
      _inFlight.clear();
    };
  }, []);

  useEffect(() => {
    latestIdRef.current = productId;

    if (!immediate || !productId) {
      setLoading(false);
      return;
    }

    let didCancel = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) cache hit
        if (useCache) {
          const hit = _cache.get(productId);
          const now = Date.now();
          if (hit && now - hit.at < cacheTtlMs) {
            if (!didCancel) setData(hit.data);
            setLoading(false);
            return;
          }
        }

        // 2) hủy request cũ
        const prev = _inFlight.get(productId);
        if (prev) prev.abort();

        // 3) tạo request mới
        const ctrl = new AbortController();
        _inFlight.set(productId, ctrl);

        const res = await getProductById(productId);
        if (ctrl.signal.aborted) return;

        // 4) ghi cache
        if (useCache && res?.productId) {
          _cache.set(productId, { at: Date.now(), data: res });
        }

        // 5) set state
        if (!didCancel && latestIdRef.current === productId) {
          setData(res);
          setLoading(false);
        }
      } catch (e) {
        if (e?.name === 'AbortError') return;
        if (!didCancel) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setLoading(false);
        }
      } finally {
        _inFlight.delete(productId);
      }
    };

    run();

    return () => {
      didCancel = true;
    };
  }, [productId, immediate, useCache, cacheTtlMs]);

  // refetch API
  const refetch = async () => {
    if (!productId) return;

    const old = _cache.get(productId);
    if (old) _cache.delete(productId);

    setLoading(true);
    setError(null);

    const prev = _inFlight.get(productId);
    if (prev) prev.abort();

    const ctrl = new AbortController();
    _inFlight.set(productId, ctrl);
    try {
      const res = await getProductById(productId);
      if (ctrl.signal.aborted) return;

      if (useCache && res?.productId) {
        _cache.set(productId, { at: Date.now(), data: res });
      }
      if (latestIdRef.current === productId) {
        setData(res);
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        setError(e instanceof Error ? e : new Error(String(e)));
      }
    } finally {
      setLoading(false);
      _inFlight.delete(productId);
    }
  };

  const invalidate = () => {
    if (productId) _cache.delete(productId);
  };

  const setLocal = updater => {
    setData(prev => {
      const next =
        typeof updater === 'function'
          ? updater(prev)
          : { ...(prev ?? {}), ...(updater ?? {}) };

      const id = next?.productId ?? prev?.productId;
      if (id && useCache) {
        _cache.set(id, { at: Date.now(), data: next });
      }
      return next;
    });
  };

  return {
    data,
    loading,
    error,
    priceRange,
    images,
    hasVariations,
    refetch,
    invalidate,
    setLocal,
  };
}
