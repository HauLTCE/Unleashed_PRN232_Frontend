import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Shield,
  ShoppingCart,
  Truck,
  Star, // Icon ngôi sao
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { useCart } from '../hooks/useCart';
import { usePageProductDetail } from '../hooks/usePageProductDetail';
import { getStockByVariationId } from '../services/cartService';

import { Textarea } from '../components/ui/textarea';
import { useProductRating } from '../hooks/useProductRating';
import { useProductReviews } from '../hooks/useProductReviews';

import { useColors } from '../hooks/useColors';
import { useSizes } from '../hooks/useSizes';
import { useVariations } from '../hooks/useVariations';

export function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, loading, error } = usePageProductDetail(id);
  const { addItemToCart, isLoading: isCartLoading } = useCart();

  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(null);

  // Use hooks to get size and color information
  const { colors, loading: colorsLoading, error: colorsError } = useColors(selectedVariationId);
  const { sizes, loading: sizesLoading, error: sizesError } = useSizes(selectedVariationId);
  const { variations } = useVariations(id);  // Removed the declaration of variations here

  const { rating, count: reviewCount, loading: ratingLoading } = useProductRating(id);

  const userId = useMemo(() => {
    let userIdFromStorage = localStorage.getItem('authUser');
    if (!userIdFromStorage) return null;
    try {
      return JSON.parse(userIdFromStorage);
    } catch (e) {
      return userIdFromStorage;
    }
  }, []);

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVariation = useMemo(() => {
    return variations.find(v => v.variationId === selectedVariationId);
  }, [selectedVariationId, variations]);

  useEffect(() => {
    if (variations.length > 0 && !selectedVariationId) {
      setSelectedVariationId(variations[0].variationId);
    }
  }, [variations, selectedVariationId]);

  useEffect(() => {
    if (!selectedVariation?.variationId) return;

    const fetchStock = async () => {
      setStock(null);
      try {
        const stockData = await getStockByVariationId(selectedVariation.variationId);
        setStock(stockData);
      } catch (error) {
        console.error("Không thể lấy tồn kho:", error);
        setStock({ available: 0, isOutOfStock: true });
      }
    };

    fetchStock();
  }, [selectedVariation]);

  const handleAddToCart = async () => {
    if (!selectedVariation) {
      toast.error('Vui lòng chọn một phiên bản sản phẩm.');
      return;
    }
    if (isOutOfStock) {
      toast.error('Sản phẩm này đã hết hàng.');
      return;
    }
    const finalQuantity = Number(quantity);
    if (!finalQuantity || finalQuantity < 1) {
      toast.error('Vui lòng nhập số lượng hợp lệ.');
      setQuantity(1);
      return;
    }
    if (availableStock !== null && finalQuantity > availableStock) {
      toast.error(`Số lượng thêm vào không được vượt quá số lượng tồn kho (${availableStock}).`);
      setQuantity(1);
      return;
    }
    const result = await addItemToCart(selectedVariation.variationId, finalQuantity);
    const message = result?.message?.message || '';
    if (result && result.success) {
      toast.success(message || `Đã thêm ${finalQuantity} sản phẩm vào giỏ hàng!`);
    } else {
      toast.error(message || 'Thêm sản phẩm thất bại. Vui lòng thử lại.');
    }
  };

  const handleVariationChange = (variation) => {
    setSelectedVariationId(variation.variationId);
  };

  const decreaseQuantity = () => {
    const currentQuantity = Number(quantity) || 2;
    setQuantity(Math.max(1, currentQuantity - 1));
  };

  const increaseQuantity = () => {
    const currentQuantity = Number(quantity) || 0;
    if (availableStock !== null && currentQuantity >= availableStock) {
      toast.info(`Chỉ còn ${availableStock} sản phẩm trong kho.`);
      return;
    }
    setQuantity(currentQuantity + 1);
  };

  const handleQuantityInputChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const isOutOfStock = stock !== null && stock.isOutOfStock;
  const availableStock = stock?.available ?? null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Đang tải sản phẩm...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Button asChild className="mt-4">
          <Link to="/admin/products">Quay lại danh sách sản phẩm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Danh sách sản phẩm</Link>
        <span>/</span>
        <span className="text-foreground">{product.productName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback src={selectedVariation?.variationImage} alt={product.productName} className="w-full h-full object-cover" />
          </div>
          {variations.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {variations.map((variation) => (
                <button
                  key={variation.variationId}
                  onClick={() => handleVariationChange(variation)}
                  className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${selectedVariationId === variation.variationId ? 'border-primary' : 'border-transparent'}`}
                >
                  <ImageWithFallback
                    src={variation.variationImage}
                    alt={`${product.productName} - ${variation.color?.colorName || ''} ${variation.size?.sizeName || ''}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
            <p className="text-muted-foreground mb-2">Thương hiệu: <span className="font-medium">{product.brand?.brandName}</span></p>
            <p className="text-muted-foreground mb-2">Danh mục: {product.categories?.map(c => c.categoryName).join(', ')}</p>

            {selectedVariation?.color?.colorName && <p className="text-muted-foreground">Màu sắc: <span className="font-medium">{selectedVariation.color.colorName}</span></p>}
            {selectedVariation?.size?.sizeName && <p className="text-muted-foreground">Kích thước: <span className="font-medium">{selectedVariation.size.sizeName}</span></p>}

            <div className="flex items-center space-x-4 my-6">
              <span className="text-3xl font-bold">
                {selectedVariation ? `${selectedVariation.variationPrice.toLocaleString()}₫` : 'Vui lòng chọn phiên bản'}
              </span>
            </div>
          </div>

          <p className="text-muted-foreground whitespace-pre-line">{product.productDescription}</p>

          <div className="space-y-4">
            <div className="h-5 pt-1">
              {isOutOfStock ? (
                <p className="text-sm font-semibold text-red-600">Hết hàng</p>
              ) : stock !== null ? (
                <p className="text-sm text-muted-foreground">
                  Còn lại: {stock.available} sản phẩm
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Đang kiểm tra tồn kho...</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Số lượng</label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={decreaseQuantity} disabled={isOutOfStock || !selectedVariation}><Minus className="h-4 w-4" /></Button>
                <input
                  type="number"
                  value={quantity}
                  onChange={handleQuantityInputChange}
                  min="1"
                  className="px-2 py-2 border rounded-md text-center w-16"
                  disabled={isOutOfStock || !selectedVariation}
                />
                <Button variant="outline" size="icon" onClick={increaseQuantity} disabled={isOutOfStock || !selectedVariation}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="flex-1" disabled={isCartLoading || isOutOfStock || !selectedVariation}>
              {isCartLoading ? 'Đang thêm...' : isOutOfStock ? 'Hết hàng' : (<><ShoppingCart className="mr-2 h-4 w-4" /> Thêm vào giỏ</>)}
            </Button>
            <Button variant="outline" disabled={isCartLoading}><Heart className="h-4 w-4" /></Button>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3"><Truck className="h-5 w-5 text-primary" /><span className="text-sm">Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫</span></div>
            <div className="flex items-center space-x-3"><RotateCcw className="h-5 w-5 text-primary" /><span className="text-sm">Đổi trả trong vòng 30 ngày</span></div>
            <div className="flex items-center space-x-3"><Shield className="h-5 w-5 text-primary" /><span className="text-sm">Bảo hành 2 năm</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
