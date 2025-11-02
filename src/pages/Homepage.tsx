// src/pages/Homepage.jsx
import { ArrowRight, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useApp } from '../contexts/AppContext';

// Real API
import { getProducts } from '@/services/ProductsService';

// Fallback image when no variationImage is available
const fallbackImg = (seed) => `https://picsum.photos/seed/${seed}/800/600`;

/* =========================
   Utils
========================= */

// Prefer a variation that has an image; then price; else first
function pickBestVariationPreferImage(variations = []) {
  if (!Array.isArray(variations) || variations.length === 0) return null;
  const withImg = variations.find(v => !!v?.variationImage || !!v?.imageUrl);
  if (withImg) return withImg;
  const withPrice = variations.find(v => (v?.variationPrice ?? v?.price) != null);
  if (withPrice) return withPrice;
  return variations[0];
}

// Always take image from variation (fallback to placeholder)
function getVarImageStrict(v, productId) {
  return v?.variationImage || v?.imageUrl || fallbackImg(productId);
}

// Price helper (VND symbol; UI labels stay in English)
const formatVND = (value) => {
  if (value == null) return null;
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  } catch {
    return `${value?.toLocaleString?.('vi-VN') ?? value} ₫`;
  }
};

/* =========================
   Map ProductDetailDTO → Card model
========================= */
function mapProductToCard(p) {
  const id = p?.productId;
  const name = p?.productName ?? 'Untitled product';

  const variations = Array.isArray(p?.variations) ? p.variations : [];
  const bestVar = pickBestVariationPreferImage(variations);

  const image = getVarImageStrict(bestVar, id);
  const price = bestVar?.variationPrice ?? bestVar?.price ?? null;

  // Mock UI rating to keep layout consistent (hide if not needed)
  const rating = 4.5;
  const reviewCount = 12;

  return { id, name, image, price, rating, reviewCount, _hasVar: variations.length > 0 };
}

/* =========================
   Component
========================= */
export function Homepage() {
  const { addToCart, addToWishlist, isInWishlist } = useApp();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      setLoading(true);
      try {
        // Pull a reasonable amount; homepage will pick featured subset
        const paged = await getProducts({ pageNumber: 1, pageSize: 16 });
        if (mounted) setItems(paged?.items ?? []);
      } catch (e) {
        if (mounted) setErr(e?.message ?? 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();
    return () => { mounted = false; };
  }, []);

  // Map to cards (with _hasVar mark)
  const cards = useMemo(
    () => items.map(mapProductToCard),
    [items]
  );

  // Priority: products WITH variations first; fill remaining from others
  const prioritizedCards = useMemo(() => {
    const withVar = cards.filter(c => c._hasVar);
    const noVar = cards.filter(c => !c._hasVar);
    return [...withVar, ...noVar];
  }, [cards]);

  // Featured = take first 4 from prioritized
  const featuredCards = useMemo(() => prioritizedCards.slice(0, 4), [prioritizedCards]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1575111507952-2d4f371374f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
            alt="Fashion Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Unleash Your Style</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover premium pieces that feel as good as they look. Elevate your daily outfit—effortlessly.
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

      {/* Promo Strip */}
      <section className="bg-secondary text-center py-4">
        <p className="text-secondary-foreground">
          <Badge variant="destructive" className="mr-2">NEW</Badge>
          Free shipping over 2,000,000₫ • 30-day returns • Premium quality guaranteed
        </p>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Essentials for every mood—curated just for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                img: 'https://images.unsplash.com/photo-1746216845602-336ad3a744f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                title: 'Casual Essentials',
                desc: 'Comfort that meets modern style',
              },
              {
                img: 'https://images.unsplash.com/photo-1715865871494-6bba579c2dc0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                title: 'Denim Collection',
                desc: 'Timeless fits, premium textures',
              },
              {
                img: 'https://images.unsplash.com/photo-1613432539593-bb769c287e08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
                title: 'Outerwear',
                desc: 'Layer up for every season',
              },
            ].map((c, idx) => (
              <Card key={idx} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-0 relative">
                  <ImageWithFallback
                    src={c.img}
                    alt={c.title}
                    className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-semibold mb-2">{c.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{c.desc}</p>
                    <Button variant="secondary" size="sm" asChild>
                      <Link to="/shop">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products (prioritize products WITH variations) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Products</h2>
            <p className="text-muted-foreground">Editor’s picks you’ll wear on repeat</p>
          </div>

          {loading && (
            <div className="text-center py-10">Loading featured products…</div>
          )}
          {err && !loading && (
            <div className="text-center py-10 text-red-600">{err}</div>
          )}

          {!loading && !err && (
            <>
              {featuredCards.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No featured products available yet.
                </div>
              ) : (
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
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => addToWishlist?.(product.id)}
                            aria-label="Add to wishlist"
                          >
                            {isInWishlist?.(product.id) ? '♥' : '♡'}
                          </Button>
                        </div>

                        <div className="p-4">
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-medium mb-2 hover:text-primary transition-colors">
                              {product.name}
                            </h3>
                          </Link>

                          {/* Rating (optional visual) */}
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">({product.reviewCount})</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {product.price != null ? (
                                <span className="font-semibold">
                                  {formatVND(product.price)}
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">Contact for price</span>
                              )}
                            </div>
                            <Button
                              size="sm"
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
            </>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-xl opacity-90 mb-8">
            Be the first to know about new arrivals, exclusive offers, and style tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-foreground"
            />
            <Button variant="secondary" size="lg">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
