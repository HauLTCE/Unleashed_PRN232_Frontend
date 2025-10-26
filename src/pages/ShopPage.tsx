import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Star, Search, Filter, Heart, ShoppingCart } from 'lucide-react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { useApp } from '../contexts/AppContext';

// 🧠 Dữ liệu thật (server-side, không dùng react-query)
import { usePagedProducts } from '@/hooks/usePagedProducts';

// ---- Helpers kiểu dữ liệu (khớp với types.ts của Sếp) ----
type VariationDetailDTO = {
  variationId: number;
  productId?: string | null;
  sizeId?: number | null;
  colorId?: number | null;
  variationImage?: string | null;
  variationPrice?: number | null;
};

type CategoryDetailDTO = {
  categoryId: number;
  categoryName?: string | null;
};

type ProductDetailDTO = {
  productId: string;
  productName?: string | null;
  productCode?: string | null;
  productDescription?: string | null;
  brandId?: number | null;
  productStatusId?: number | null;
  productCreatedAt?: string | null;
  productUpdatedAt?: string | null;
  categories?: CategoryDetailDTO[] | null;
  variations?: VariationDetailDTO[] | null;
  // Những field UI dưới đây không có trong DTO => sẽ fallback
  rating?: number;
  reviewCount?: number;
  originalPrice?: number;
};

// ---- Utils: lấy giá & ảnh từ variations ----
function getMinPrice(p: ProductDetailDTO): number | null {
  const prices = (p.variations ?? [])
    .map(v => (v.variationPrice ?? null))
    .filter((x): x is number => typeof x === 'number');
  if (!prices.length) return null;
  return Math.min(...prices);
}

function getPrimaryImage(p: ProductDetailDTO): string {
  const img = (p.variations ?? []).find(v => v.variationImage)?.variationImage;
  return img || 'https://picsum.photos/seed/placeholder/800/600';
}

function getCategoryNames(p: ProductDetailDTO): string[] {
  return (p.categories ?? [])
    .map(c => c.categoryName)
    .filter((x): x is string => !!x);
}

export function ShopPage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  // ── State: search / category(multi) / sort
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]); // [] = All
  const [sortBy, setSortBy] = useState('featured');

  // Gọi API (đã debounce trong hook)
  const pageSize = 20;
  const {
    data,
    loading,
    error,
    setPage,
    nextPage,
    prevPage,
    setSearch,
  } = usePagedProducts({
    pageNumber: 1,
    pageSize,
    search: '',
  });

  // an toàn rỗng
  const items: ProductDetailDTO[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  // Tính min/max price để UI slider hợp lý (trên trang hiện tại)
  const pagePrices = items
    .map(getMinPrice)
    .filter((x): x is number => typeof x === 'number');

  const pageMinPrice = pagePrices.length ? Math.floor(Math.min(...pagePrices)) : 0;
  const pageMaxPrice = pagePrices.length ? Math.ceil(Math.max(...pagePrices)) : 200;

  const [priceMax, setPriceMax] = useState<number>(pageMaxPrice);

  // Đồng bộ slider khi trang mới trả về
  useEffect(() => {
    setPriceMax(pageMaxPrice);
  }, [pageMaxPrice]);

  // Danh sách category (từ trang hiện tại)
  const categoriesOnPage = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach(p => {
      (p.categories ?? []).forEach(c => {
        if (c?.categoryId != null && c?.categoryName) {
          map.set(c.categoryId, c.categoryName);
        }
      });
    });
    // Sắp xếp A→Z
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // Helpers cho checkbox
  const isAllCategories = selectedCategoryIds.length === 0;
  const toggleCategory = (id: number) => {
    setSelectedCategoryIds(prev => {
      const has = prev.includes(id);
      const next = has ? prev.filter(x => x !== id) : [...prev, id];
      return next;
    });
    setPage(1);
  };
  const setAllCategories = () => {
    setSelectedCategoryIds([]);
    setPage(1);
  };

  // Lọc client-side (trên page hiện tại): Category (multi) + Price
  const filteredOnPage = useMemo(() => {
    const filtered = items.filter(p => {
      // Category (OR nhiều category; [] = All)
      const byCat =
        isAllCategories
          ? true
          : (p.categories ?? []).some(c => c?.categoryId != null && selectedCategoryIds.includes(c.categoryId!));

      // Price by min variation price
      const minPrice = getMinPrice(p);
      const byPrice =
        minPrice == null ? false : minPrice >= pageMinPrice && minPrice <= priceMax;

      return byCat && byPrice;
    });

    // Sort (giữ nguyên các lựa chọn UI)
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (getMinPrice(a) ?? Infinity) - (getMinPrice(b) ?? Infinity);
        case 'price-high':
          return (getMinPrice(b) ?? -Infinity) - (getMinPrice(a) ?? -Infinity);
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'newest':
          // Nếu có createdAt: ưu tiên createdAt desc, nếu không dùng productId để tạm đại diện
          return String(b.productId).localeCompare(String(a.productId));
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, isAllCategories, selectedCategoryIds, priceMax, pageMinPrice, sortBy]);

  const showingCount = filteredOnPage.length;

  const onClickWishlist = (productId: string) => {
    if (isInWishlist(productId)) removeFromWishlist(productId);
    else addToWishlist(productId);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setAllCategories(); // về All
    setPriceMax(pageMaxPrice);
    setSortBy('featured');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <p className="text-muted-foreground">
          Discover our complete collection of premium clothing
        </p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              const v = e.target.value;
              setSearchQuery(v);
              setSearch(v);      // báo cho hook (có debounce)
              setPage(1);        // về trang 1 khi search
            }}
            className="pl-10"
          />
        </div>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            setSortBy(v);
          }}
        >
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar: Category + Price */}
        <div className="lg:w-64 space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </div>

            {/* Category (Checkbox multiple) */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Category</h4>

              {/* All Categories */}
              <label className="flex items-center gap-3 mb-2 cursor-pointer">
                <Checkbox
                  checked={isAllCategories}
                  onCheckedChange={(checked) => {
                    if (checked) setAllCategories();
                    else setSelectedCategoryIds([]); // vẫn coi như All
                  }}
                />
                <span>All Categories</span>
              </label>

              <div className="max-h-64 overflow-auto pr-1 space-y-2">
                {categoriesOnPage.map(c => {
                  const checked = selectedCategoryIds.includes(c.id);
                  return (
                    <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          // Nếu đang ở All -> chuyển sang chỉ chọn category này
                          if (isAllCategories) {
                            setSelectedCategoryIds([c.id]);
                            setPage(1);
                          } else {
                            toggleCategory(c.id);
                          }
                        }}
                      />
                      <span>{c.name}</span>
                    </label>
                  );
                })}
                {categoriesOnPage.length === 0 && (
                  <p className="text-xs text-muted-foreground">No category on this page</p>
                )}
              </div>
            </div>

            {/* Price (max-only trên trang hiện tại) */}
            <div>
              <h4 className="font-medium mb-3">Price (per page)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>${pageMinPrice}</span>
                  <span>${priceMax}</span>
                </div>
                <input
                  type="range"
                  min={pageMinPrice}
                  max={pageMaxPrice}
                  value={priceMax}
                  onChange={(e) => {
                    setPriceMax(parseInt(e.target.value, 10));
                    setPage(1);
                  }}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Showing products with min-variation price ≤ ${priceMax}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* State messages */}
          {error && (
            <div className="mb-4 text-red-600 text-sm">
              {String(error)}
            </div>
          )}
          {loading && (
            <div className="mb-4 text-sm text-muted-foreground">Loading products…</div>
          )}

          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {showingCount} on this page / Total {totalCount} products (page {data?.pageNumber}/{totalPages})
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {filteredOnPage.map((product) => {
              const img = getPrimaryImage(product);
              const price = getMinPrice(product);
              const rating = product.rating ?? 0;
              const reviewCount = product.reviewCount ?? 0;

              return (
                <Card key={product.productId} className="group overflow-hidden border hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="relative">
                      <ImageWithFallback
                        src={img}
                        alt={product.productName ?? 'Product'}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Nếu có originalPrice thì hiện Sale */}
                      {product.originalPrice && (
                        <Badge className="absolute top-3 left-3 bg-destructive">Sale</Badge>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onClickWishlist(product.productId)}
                      >
                        <Heart className={`h-4 w-4 ${isInWishlist(product.productId) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>

                    <div className="p-4">
                      <Link to={`/product/${product.productId}`}>
                        <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                          {product.productName ?? 'Unnamed Product'}
                        </h3>
                      </Link>

                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({reviewCount})
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">
                            {price != null ? `$${price}` : '—'}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product.productId)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={price == null}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Tag category dưới tên */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getCategoryNames(product).map((cn) => (
                          <Badge key={cn} variant="outline">{cn}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination server-side */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      prevPage();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={data?.pageNumber === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      nextPage();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
