import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Star, ArrowRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// ➊ GỌI API THẬT
import { getProducts } from '@/services/ProductsService';

// Fallback ảnh khi BE không có ảnh variation/brand
const fallbackImg = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

// Map ProductDetailDTO (BE) → Card model (FE)
function mapProductToCard(p) {
  const id = p?.productId; // Guid
  const name = p?.productName ?? '(No name)';
  const image =
    p?.variations?.[0]?.imageUrl ||
    p?.brand?.brandImageUrl ||
    fallbackImg(id);

  // Nếu BE chưa có giá ở Product, tạm lấy từ variation đầu
  const price = p?.variations?.[0]?.price ?? null;

  // Hiển thị “Sale” nếu có giá gốc (chưa có từ BE => để null)
  const originalPrice = null;

  // Nếu BE chưa trả rating/reviewCount => đặt mặc định/ẩn
  const rating = 4.5;
  const reviewCount = 12;

  return { id, name, image, price, originalPrice, rating, reviewCount };
}

export function Homepage() {
  const { addToCart, addToWishlist, isInWishlist } = useApp();

  // ➋ STATE cho dữ liệu thật
  const [items, setItems] = useState([]);      // ProductDetailDTO[]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // ➌ FETCH từ API /api/Products (proxy DEV)
  useEffect(() => {
    setLoading(true);
    getProducts({ pageNumber: 1, pageSize: 8 }) // lấy 8 sp nổi bật
      .then((paged) => setItems(paged?.items ?? []))
      .catch((e) => setErr(e?.message ?? 'Load products failed'))
      .finally(() => setLoading(false));
  }, []);

  // ➍ Map sang card FE & lấy 4 sản phẩm nổi bật
  const featuredCards = useMemo(() => {
    const mapped = items.map(mapProductToCard);
    return mapped.slice(0, 4);
  }, [items]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1575111507952-2d4f371374f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwY2xvdGhpbmclMjBzdG9yZSUyMGhlcm98ZW58MXx8fHwxNzU4NDYyMDM3fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Fashion Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Unleash Your Style
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover premium clothing that reflects your unique personality. 
            From casual essentials to statement pieces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/shop">Shop Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-secondary text-center py-4">
        <p className="text-secondary-foreground">
          <Badge variant="destructive" className="mr-2">NEW</Badge>
          Free shipping on orders over $100 • 30-day returns • Premium quality guaranteed
        </p>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated collections designed for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1746216845602-336ad3a744f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXN1YWwlMjB0LXNoaXJ0JTIwY2xvdGhpbmd8ZW58MXx8fHwxNzU4Mzg0NTI4fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Casual Wear"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-semibold mb-2">Casual Essentials</h3>
                  <p className="text-sm opacity-90 mb-4">Comfortable everyday wear</p>
                  <Button variant="secondary" size="sm">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1715865871494-6bba579c2dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGplYW5zJTIwZmFzaGlvbnxlbnwxfHx8fDE3NTgzNDM3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Denim Collection"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-semibold mb-2">Denim Collection</h3>
                  <p className="text-sm opacity-90 mb-4">Premium jeans & jackets</p>
                  <Button variant="secondary" size="sm">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-0 relative">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1613432539593-bb769c287e08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW50ZXIlMjBqYWNrZXQlMjBjbG90aGluZ3xlbnwxfHx8fDE3NTg0NjIwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Outerwear"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-semibold mb-2">Outerwear</h3>
                  <p className="text-sm opacity-90 mb-4">Jackets & coats for all seasons</p>
                  <Button variant="secondary" size="sm">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">
              Handpicked favorites that our customers love
            </p>
          </div>

          {/* LOADING / ERROR */}
          {loading && (
            <div className="text-center py-10">Đang tải sản phẩm nổi bật…</div>
          )}
          {err && !loading && (
            <div className="text-center py-10 text-red-600">{err}</div>
          )}

          {!loading && !err && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCards.map((product) => (
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
                        onClick={() => addToWishlist?.(product.id)}
                      >
                        ♡
                      </Button>
                    </div>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating (giữ UI cũ; có thể ẩn nếu không cần) */}
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
                          // Tuỳ app: nếu addToCart yêu cầu product object/ID, sửa tại đây:
                          // 1) Nếu cần ID: onClick={() => addToCart(product.id)}
                          // 2) Nếu cần cả object: onClick={() => addToCart(product)}
                          onClick={() => addToCart?.(product.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-xl opacity-90 mb-8">
            Get the latest updates on new arrivals, exclusive deals, and style tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
