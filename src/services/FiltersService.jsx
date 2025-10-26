export function buildFilterParams(input = {}) {
  const {
    pageNumber = 1,
    pageSize = 20,
    search,

    brandIds,
    categoryIds,
    colorIds,
    sizeIds,

    productStatusId,
    productStatusIds,

    onlyAvailable,
    onlyActiveProducts,
  } = input;

  const params = {
    pageNumber,
    pageSize,
  };

  // search
  if (typeof search === 'string' && search.trim()) {
    params.search = search.trim();
  }

  // Arrays -> comma-separated
  if (Array.isArray(brandIds) && brandIds.length) {
    params.brandIds = brandIds.join(',');
  }
  if (Array.isArray(categoryIds) && categoryIds.length) {
    params.categoryIds = categoryIds.join(',');
  }
  if (Array.isArray(colorIds) && colorIds.length) {
    params.colorIds = colorIds.join(',');
  }
  if (Array.isArray(sizeIds) && sizeIds.length) {
    params.sizeIds = sizeIds.join(',');
  }
  if (Array.isArray(productStatusIds) && productStatusIds.length) {
    params.productStatusIds = productStatusIds.join(',');
  }

  // Scalars / flags
  if (typeof productStatusId === 'number') {
    params.productStatusId = productStatusId;
  }
  if (typeof onlyAvailable === 'boolean') {
    params.onlyAvailable = onlyAvailable;
  }
  if (typeof onlyActiveProducts === 'boolean') {
    params.onlyActiveProducts = onlyActiveProducts;
  }

  return params;
}