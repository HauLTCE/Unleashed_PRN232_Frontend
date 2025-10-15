import React, { useEffect, useMemo, useState } from 'react';
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

// gọi API thật
import { getProducts } from '@/services/ProductsService';
// vẫn xài các action của app (wishlist/cart)
import { useApp } from '../contexts/AppContext';

// fallback ảnh khi BE thiếu
const fallbackImg = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

// map ProductDetailDTO -> model UI đang dùng
function mapProduct(p) {
  const id = p?.productId;
  const name = p?.productName ?? '(No name)';
  const description = p?.productDescription ?? '';
  const image = p?.variations?.[0]?.imageUrl || p?.brand?.brandImageUrl || fallbackImg(id);
  const price = p?.variations?.[0]?.price ?? null;
  const originalPrice = null; // BE chưa có -> để null
  const rating = 4.5;         // tạm thời, ẩn nếu không cần
  const reviewCount = 12;     // tạm thời, ẩn nếu không cần

  // category: lấy tên đầu tiên (nếu có)
  const category = p?.categories?.[0]?.categoryName ?? 'Uncategorized';

  // colors/sizes từ variations (nếu chỉ có id -> hiển thị "#<id>")
  const colors = Array.from(
    new Set(
      (p?.variations ?? [])
        .map(v => v?.colorId)
        .filter(v => v != null)
        .map(id => `#${id}`)
    )
  );
  const sizes = Array.from(
    new Set(
      (p?.variations ?? [])
        .map(v => v?.sizeId)
        .filter(v => v != null)
        .map(id => `#${id}`)
    )
  );

  return { id, name, description, image, price, originalPrice, rating, reviewCount, category, colors, sizes, raw: p };
}

export function ShopPage() {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  // --------- STATE (server-side pagination + client filters) ----------
  const [serverPage, setServerPage] = useState(1);   // trang đang fetch từ BE
  const [pageSize, setPageSize] = useState(20);      // số item/ trang (<= 50 theo BE)
  const [searchQuery, setSearchQuery] = useState(''); // gửi lên BE qua ?search
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // dữ liệu từ BE
  const [serverItems, setServerItems] = useState([]);  // ProductDetailDTO[]
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalCount, setServerTotalCount] = useState(0);

  // filter client-side
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [sortBy, setSortBy] = useState('featured');

  // fetch dữ liệu thật từ BE khi serverPage / pageSize / searchQuery đổi
  useEffect(() => {
    setLoading(true);
    getProducts({ pageNumber: serverPage, pageSize, search: searchQuery })
      .then((paged) => {
        setServerItems(paged?.items ?? []);
        setServerTotalPages(paged?.totalPages ?? 1);
        setServerTotalCount(paged?.totalCount ?? 0);
      })
      .catch((e) => setErr(e?.message ?? 'Load products failed'))
      .finally(() => setLoading(false));
  }, [serverPage, pageSize, searchQuery]);

  // chuẩn hóa thành model UI
  const normalized = useMemo(() => serverItems.map(mapProduct), [serverItems]);

  // build bộ lọc (categories/colors/sizes) từ dữ liệu trang hiện tại
  const categories = useMemo(() => {
    return Array.from(new Set(normalized.map(p => p.category))).filter(Boolean);
  }, [normalized]);

  const availableColors = useMemo(() => {
    return Array.from(new Set(normalized.flatMap(p => p.colors))).filter(Boolean);
  }, [normalized]);

  const availableSizes = useMemo(() => {
    return Array.from(new Set(normalized.flatMap(p => p.sizes))).filter(Boolean);
  }, [normalized]);

  // áp dụng filter + sort (trên trang hiện tại)
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = normalized.filter(product => {
      // search cục bộ (ngoài search server) để khớp UI hiện tại
      const matchesSearch =
        (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      // category
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // color
      const matchesColor = selectedColors.length === 0 ||
        selectedColors.some(color => product.colors.includes(color));

      // size
      const matchesSize = selectedSizes.length === 0 ||
        selectedSizes.some(size => product.sizes.includes(size));

      // price
      const price = product.price ?? 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesColor && matchesSize && matchesPrice;
    });

    // sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price ?? 0) - (b.price ?? 0);
        case 'price-high':
          return (b.price ?? 0) - (a.price ?? 0);
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'newest': {
          const ad = a.raw?.productCreatedAt ? new Date(a.raw.productCreatedAt).getTime() : 0;
          const bd = b.raw?.productCreatedAt ? new Date(b.raw.productCreatedAt).getTime() : 0;
          return bd - ad;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [normalized, searchQuery, selectedCategory, selectedColors, selectedSizes, priceRange, sortBy]);

  // Vì phân trang đang là server-side, trang hiện tại chính là filtered trên page đó
  const paginatedProducts = filteredAndSortedProducts;

  // handlers
  const handleColorChange = (color, checked) => {
    setSelectedColors(prev => checked ? [...prev, color] : prev.filter(c => c !== color));
  };
  const handleSizeChange = (size, checked) => {
    setSelectedSizes(prev => checked ? [...prev, size] : prev.filter(s => s !== size));
  };
  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange([0, 200]);
    setSortBy('featured');
  };

  // khi search thay đổi -> fetch lại trang 1
  const onSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setServerPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Shop</h1>
        <p className="text-muted-foreground">
          Discover our complete collection of premium clothing
        </p>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
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
        {/* Filters Sidebar */}
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

            {/* Category Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Category</h4>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Colors</h4>
              <div className="space-y-2">
                {availableColors.map(color => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={selectedColors.includes(color)}
                      onCheckedChange={(checked) => handleColorChange(color, !!checked)}
                    />
                    <label htmlFor={`color-${color}`} className="text-sm">
                      {color}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-3">Sizes</h4>
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={selectedSizes.includes(size)}
                      onCheckedChange={(checked) => handleSizeChange(size, !!checked)}
                    />
                    <label htmlFor={`size-${size}`} className="text-sm">
                      {size}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-medium mb-3">Price Range</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">${priceRange[0]}</span>
                  <span className="text-sm">-</span>
                  <span className="text-sm">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-muted-foreground">
              {/* Hiển thị số trên trang hiện tại + tổng số trang từ BE */}
              {loading
                ? 'Loading...'
                : `Showing ${paginatedProducts.length} products • Page ${serverPage}/${serverTotalPages} (server)`}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per page:</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(parseInt(v, 10)); setServerPage(1); }}>
                <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="32">32</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LOADING / ERROR */}
          {err && !loading && (
            <div className="text-center py-10 text-red-600">{err}</div>
          )}

          {loading ? (
            <div className="text-center py-10">Đang tải sản phẩm…</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {paginatedProducts.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.originalPrice && (
                          <Badge className="absolute top-3 left-3 bg-destructive">
                            Sale
                          </Badge>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            // tuỳ app context của Sếp lưu wishlist theo id/object
                            if (isInWishlist?.(product.id)) {
                              removeFromWishlist?.(product.id);
                            } else {
                              addToWishlist?.(product.id);
                            }
                          }}
                        >
                          <Heart className={`h-4 w-4 ${isInWishlist?.(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                      </div>
                      <div className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        {/* Rating (giữ UI cũ; ẩn nếu không cần) */}
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({product.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {product.price != null ? (
                              <span className="font-semibold">${product.price}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Contact</span>
                            )}
                            {product.originalPrice && (
                              <span className="text-sm text-muted-foreground line-through">
                                ${product.originalPrice}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => addToCart?.(product.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Server-side Pagination */}
              {serverTotalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (serverPage > 1) setServerPage(serverPage - 1);
                        }}
                      />
                    </PaginationItem>
                    {Array.from({ length: serverTotalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={serverPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setServerPage(i + 1);
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
                          if (serverPage < serverTotalPages) setServerPage(serverPage + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
