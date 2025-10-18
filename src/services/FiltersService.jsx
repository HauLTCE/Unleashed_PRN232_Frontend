// src/services/FiltersService.jsx
import { apiClient } from './ApiClient';

/** Cache nhẹ trong bộ nhớ cho filter options */
const _memory = { value: null, expiry: 0, key: '' };
const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 phút
const now = () => Date.now();

function normalizeToArray(maybePaged) {
  if (!maybePaged) return [];
  if (Array.isArray(maybePaged)) return maybePaged;
  if (typeof maybePaged === 'object' && Array.isArray(maybePaged.items)) return maybePaged.items;
  return [];
}
function toFilterOptionsDTO({ colors = [], sizes = [] } = {}) {
  return {
    colors: colors.map((c) => ({
      colorId: c?.colorId ?? 0,
      colorName: c?.colorName ?? null,
      colorHexCode: c?.colorHexCode ?? null,
    })),
    sizes: sizes.map((s) => ({
      sizeId: s?.sizeId ?? 0,
      sizeName: s?.sizeName ?? null,
    })),
  };
}

/**
 * Gọi hợp nhất: GET /api/Filters?onlyAvailable=&onlyActiveProducts=
 * → { colors: ColorDTO[], sizes: SizeDTO[] }
 */
async function _getMergedOptions(params = {}) {
  const res = await apiClient.get('/Filters', { params });
  const data = res?.data;
  if (!data || !Array.isArray(data?.colors) || !Array.isArray(data?.sizes)) {
    throw new Error('Invalid /Filters payload');
  }
  return toFilterOptionsDTO({
    colors: normalizeToArray(data.colors),
    sizes: normalizeToArray(data.sizes),
  });
}

/**
 * Lấy filter options có cache TTL
 * @param {{
 *   force?: boolean,
 *   ttlMs?: number,
 *   onlyAvailable?: boolean,
 *   onlyActiveProducts?: boolean
 * }} options
 */
export async function getFilterOptions(options = {}) {
  const {
    force = false,
    ttlMs = DEFAULT_TTL_MS,
    onlyAvailable = false,
    onlyActiveProducts = false,
  } = options;

  const cacheKey = JSON.stringify({ onlyAvailable, onlyActiveProducts });
  if (!force && _memory.value && _memory.expiry > now() && _memory.key === cacheKey) {
    return _memory.value;
  }

  const result = await _getMergedOptions({ onlyAvailable, onlyActiveProducts });
  _memory.value = result;
  _memory.expiry = now() + ttlMs;
  _memory.key = cacheKey;
  return result;
}

export function clearFilterOptionsCache() {
  _memory.value = null;
  _memory.expiry = 0;
  _memory.key = '';
}

/** Helpers build params CSV/Array cho các API khác (giữ nguyên như trước) */
export function toCsv(arr) {
  if (!arr) return undefined;
  if (Array.isArray(arr)) return arr.join(',');
  return String(arr);
}
export function buildFilterParams(q = {}) {
  const {
    pageNumber, pageSize, search, productId,
    brandIds, categoryIds, colorIds, sizeIds,
    onlyAvailable, onlyActiveProducts, useCsv = true,
    productStatusId, productStatusIds,
  } = q;

  const p = {};
  if (pageNumber != null) p.pageNumber = pageNumber;
  if (pageSize != null) p.pageSize = pageSize;
  if (search) p.search = search;
  if (productId) p.productId = productId;
  if (onlyAvailable != null) p.onlyAvailable = !!onlyAvailable;
  if (onlyActiveProducts != null) p.onlyActiveProducts = !!onlyActiveProducts;

  const pushIds = (nameSingular, namePlural, value) => {
    if (value == null) return;

    // normalize to array
    const arr = Array.isArray(value) ? value : [value].filter((x) => x != null);

    if (arr.length === 1) {
      // Gửi kép: BE cũ (singular) + BE mới (plural)
      p[nameSingular] = arr[0];
      p[namePlural]   = useCsv ? arr.join(',') : arr;
    } else if (arr.length > 1) {
      // Gửi plural + Fallback singular (lấy phần tử đầu)
      p[nameSingular] = arr[0];
      p[namePlural]   = useCsv ? arr.join(',') : arr;
    }
  };

  pushIds('brandId',        'brandIds',        brandIds);
  pushIds('categoryId',     'categoryIds',     categoryIds);
  pushIds('colorId',        'colorIds',        colorIds);
  pushIds('sizeId',         'sizeIds',         sizeIds);

  // productStatus có thể là 1 số hoặc mảng
  if (productStatusIds != null) {
    pushIds('productStatusId', 'productStatusIds', productStatusIds);
  } else if (productStatusId != null) {
    pushIds('productStatusId', 'productStatusIds', productStatusId);
  }

  return p;
}
