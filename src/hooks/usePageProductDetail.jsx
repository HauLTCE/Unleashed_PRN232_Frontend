import { useEffect, useMemo, useRef, useState } from 'react';
import { getProductById } from '@/services/ProductsService';
import type { ProductDetailDTO, VariationDetailDTO } from '@/services/ProductsService';

// -----------------------------------------------------
// In-memory cache tối giản (key = productId)
type CacheEntry = { at: number; data: ProductDetailDTO };
const _cache = new Map<string, CacheEntry>();

// In-flight requests để tránh gọi trùng & hủy đúng cách
const _inFlight = new Map<string, AbortController>();
// -----------------------------------------------------

export type UsePageProductDetailOptions = {
  /** Tự động fetch khi có productId */
  immediate?: boolean;
  /** Bật cache bộ nhớ */
  useCache?: boolean;
  /** TTL cache (ms). Mặc định 5 phút */
  cacheTtlMs?: number;
};

type PriceRange = { min: number | null; max: number | null };

function computePriceRange(variations?: VariationDetailDTO[] | null): PriceRange {
  if (!variations?.length) return { min: null, max: null };
  const prices = variations
    .map(v => (typeof v.variationPrice === 'number' ? v.variationPrice : null))
    .filter((x): x is number => x !== null);

  if (!prices.length) return { min: null, max: null };

  let min = prices[0], max = prices[0];
  for (let i = 1; i < prices.length; i++) {
    const p = prices[i];
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

function collectImages(dto?: ProductDetailDTO | null): string[] {
  if (!dto?.variations?.length) return [];
  const imgs = dto.variations
    .map(v => v.variationImage)
    .filter((s): s is string => !!s && typeof s === 'string');
  return Array.from(new Set(imgs));
}

export function usePageProductDetail(
  productId: string | undefined,
  opts: UsePageProductDetailOptions = {}
) {
  const {
    immediate = true,
    useCache = true,
    cacheTtlMs = 5 * 60_000, // 5 phút
  } = opts;

  const [data, setData] = useState<ProductDetailDTO | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(!!immediate && !!productId);
  const [error, setError] = useState<Error | null>(null);

  // giữ productId mới nhất để chống setState sau khi id đổi
  const latestIdRef = useRef<string | undefined>(productId);

  const priceRange = useMemo(() => computePriceRange(data?.variations), [data]);
  const images = useMemo(() => collectImages(data), [data]);
  const hasVariations = useMemo(
    () => Array.isArray(data?.variations) && (data?.variations?.length ?? 0) > 0,
    [data]
  );

  // hủy request cũ khi productId thay đổi hoặc unmount
  useEffect(() => {
    return () => {
      // cleanup toàn cục (nếu muốn cẩn thận hơn có thể chỉ hủy theo id hiện tại)
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

        // 1) cache hit (còn hạn)
        if (useCache) {
          const hit = _cache.get(productId);
          const now = Date.now();
          if (hit && now - hit.at < cacheTtlMs) {
            if (!didCancel) setData(hit.data);
            setLoading(false);
            return;
          }
        }

        // 2) nếu đang có request cùng id, hủy nó trước
        const prev = _inFlight.get(productId);
        if (prev) prev.abort();

        // 3) tạo request mới
        const ctrl = new AbortController();
        _inFlight.set(productId, ctrl);

        const res = await getProductById(productId); // nếu cần: truyền { signal: ctrl.signal } khi service hỗ trợ
        if (ctrl.signal.aborted) return;

        // 4) ghi cache
        if (useCache && res?.productId) {
          _cache.set(productId, { at: Date.now(), data: res });
        }

        // 5) set state (đảm bảo id còn khớp)
        if (!didCancel && latestIdRef.current === productId) {
          setData(res);
          setLoading(false);
        }
      } catch (e: any) {
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

  // API: refetch / invalidate / setLocal
  const refetch = async () => {
    if (!productId) return;
    // bỏ qua cache bằng cách xóa entry trước khi fetch
    const old = _cache.get(productId);
    if (old) _cache.delete(productId);

    setLoading(true);
    setError(null);

    // hủy request cũ
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
    } catch (e: any) {
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

  /**
   * Cập nhật dữ liệu local để UI phản hồi ngay (optimistic UI).
   * Có thể truyền object hoặc updater(prev) => next
   */
  const setLocal = (
    updater:
      | Partial<ProductDetailDTO>
      | ((prev: ProductDetailDTO | undefined) => ProductDetailDTO | undefined)
  ) => {
    setData(prev => {
      const next =
        typeof updater === 'function'
          ? (updater as any)(prev)
          : ({ ...(prev ?? {}), ...(updater as object) } as ProductDetailDTO);

      // đồng bộ cache (nếu có id)
      const id = (next as any)?.productId ?? (prev as any)?.productId;
      if (id && useCache) {
        _cache.set(id, { at: Date.now(), data: next as ProductDetailDTO });
      }
      return next as ProductDetailDTO;
    });
  };

  return {
    // state
    data,
    loading,
    error,

    // tiện ích suy diễn
    priceRange,
    images,
    hasVariations,

    // điều khiển
    refetch,
    invalidate,
    setLocal,
  };
}
