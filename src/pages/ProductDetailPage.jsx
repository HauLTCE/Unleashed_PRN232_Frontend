// src/pages/ProductDetailPage.jsx

import { Heart, Minus, Plus, RotateCcw, Shield, ShoppingCart, Truck, Star } from 'lucide-react';
import { useState } from 'react'; // Bỏ useEffect vì hook đã lo
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// Components
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';

// Hooks
import { useCart } from '../hooks/useCart';
import { usePageProductDetail } from '../hooks/usePageProductDetail';
import { useProductRating } from '@/hooks/useProductRating';
import { useProductReviews } from '@/hooks/useProductReviews'; // Hook đã chứa tất cả

export function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, priceRange, images, loading, error } = usePageProductDetail(id);
  const { addItemToCart, isLoading: isCartLoading } = useCart();

  const { rating, count, loading: ratingLoading } = useProductRating(id);

  // ✅ Lấy tất cả state và hàm cần thiết từ một hook duy nhất
  const {
    data: reviewsData,
    loading: reviewsLoading,
    error: reviewsError,
    createReview,
    eligibility, // State trả về từ hook
    checkingEligibility, // State trả về từ hook
  } = useProductReviews(id);

  // State cho lựa chọn sản phẩm
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // State cho form đánh giá mới
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⛔ Không còn useEffect hay state riêng cho eligibility (hook lo hết)

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

  const variations = product.variations || [];
  const uniqueSizes = Array.from(new Set(variations.map(v => v.size?.sizeName).filter(Boolean)));
  const uniqueColors = Array.from(new Set(variations.map(v => v.color?.colorName).filter(Boolean)));

  const handleAddToCart = async () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    const selectedVariation = variations.find(v => {
      const sizeMatch = uniqueSizes.length === 0 || v.size?.sizeName === selectedSize;
      const colorMatch = uniqueColors.length === 0 || v.color?.colorName === selectedColor;
      return sizeMatch && colorMatch;
    });

    if (!selectedVariation) {
      toast.error('Sản phẩm với lựa chọn này không có sẵn.');
      return;
    }

    const result = await addItemToCart(selectedVariation.id, quantity);
    if (result.success) {
      toast.success(result.message || `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } else {
      toast.error(result.message || 'Thêm sản phẩm thất bại.');
    }
  };

  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));
  const increaseQuantity = () => setQuantity(prev => prev + 1);

  // Hàm xử lý gửi đánh giá
  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá.');
      return;
    }

    // Lấy userId từ Local Storage và bóc vỏ "..."
    let userIdFromStorage = localStorage.getItem('authUser');
    if (!userIdFromStorage) {
      toast.error('Bạn cần đăng nhập để thực hiện đánh giá.');
      return;
    }
    if (userIdFromStorage.startsWith('"') && userIdFromStorage.endsWith('"')) {
      userIdFromStorage = userIdFromStorage.slice(1, -1);
    }

    // Dùng eligibility từ hook
    if (!eligibility || !eligibility.orderId) {
      toast.error('Bạn không đủ điều kiện (hoặc đã) đánh giá sản phẩm này.');
      return;
    }

    const payload = {
      productId: id,
      userId: userIdFromStorage,
      orderId: eligibility.orderId, // ✅ Dùng orderId thật từ hook
      reviewRating: newRating,
      reviewComment: newComment || null,
    };

    setIsSubmitting(true);
    try {
      await createReview(payload); // Gọi hàm từ hook
      toast.success('Gửi đánh giá thành công!');
      // Reset form (hook sẽ tự động set eligibility = null)
      setNewRating(0);
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit review', err);
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(' ')
        : err.response?.data?.message || 'Gửi đánh giá thất bại (có thể bạn đã đánh giá rồi).';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm render Khung Gửi Đánh Giá
  const renderReviewForm = () => {
    const isLoggedIn = !!localStorage.getItem('authUser');

    // Hook đang kiểm tra...
    if (checkingEligibility) {
      return (
        <div className="mb-8 p-4 border rounded-lg bg-muted/50 text-center">
          <p className="text-muted-foreground">Đang kiểm tra điều kiện đánh giá...</p>
        </div>
      );
    }

    // Đủ điều kiện (hook đã check: đã login VÀ có orderId)
    if (isLoggedIn && eligibility && eligibility.orderId) {
      return (
        <div className="mb-8 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Viết đánh giá của bạn</h3>
          <p className="text-sm text-muted-foreground mb-4">
            (Đánh giá cho đơn hàng: ...{eligibility.orderId.slice(-12)})
          </p>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Đánh giá (sao)</label>
              <div className="flex items-center gap-1 text-yellow-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-colors ${star <= newRating
                      ? 'fill-yellow-400 text-yellow-500'
                      : 'stroke-gray-400 text-gray-400'
                      }`}
                    onClick={() => setNewRating(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="reviewComment" className="block mb-2 font-medium">
                Bình luận (tùy chọn)
              </label>
              <Textarea
                id="reviewComment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                rows={4}
              />
            </div>

            <Button onClick={handleSubmitReview} disabled={isSubmitting || newRating === 0}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </div>
      );
    }

    // Không đủ điều kiện
    return (
      <div className="mb-8 p-4 border rounded-lg bg-muted/50 text-center">
        <p className="text-muted-foreground">
          {!isLoggedIn
            ? 'Vui lòng đăng nhập để đánh giá sản phẩm.'
            : 'Bạn cần mua sản phẩm này để có thể đánh giá (hoặc bạn đã đánh giá rồi).'}
        </p>
      </div>
    );
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/admin" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/admin/products" className="hover:text-primary">Danh sách sản phẩm</Link>
        <span>/</span>
        <span className="text-foreground">{product.productName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback
              src={images[selectedImage] || images[0]}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.productName} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>

            {/* Rating trung bình */}
            <div className="flex items-center gap-2 mb-3">
              {ratingLoading ? (
                <span className="text-sm text-muted-foreground">Đang tải đánh giá...</span>
              ) : (
                <>
                  <div className="flex items-center text-yellow-500">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-yellow-400' : 'stroke-yellow-400'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{rating.toFixed(1)} / 5</span>
                  <span className="text-sm text-muted-foreground">({count} lượt đánh giá)</span>
                </>
              )}
            </div>

            <p className="text-muted-foreground mb-2">
              Thương hiệu: <span className="font-medium">{product.brand?.brandName}</span>
            </p>
            <p className="text-muted-foreground mb-2">
              Danh mục: {product.categories?.map(c => c.categoryName).join(', ')}
            </p>
            <p className="text-muted-foreground mb-4">
              Trạng thái: {product.productStatus?.productStatusName || 'Không rõ'}
            </p>

            <div className="flex items-center space-x-4 mb-6">
              {priceRange.min && priceRange.max ? (
                <span className="text-3xl font-bold">
                  {priceRange.min === priceRange.max
                    ? `${priceRange.min.toLocaleString()}₫`
                    : `${priceRange.min.toLocaleString()}₫ - ${priceRange.max.toLocaleString()}₫`}
                </span>
              ) : (
                <span className="text-3xl font-bold">Liên hệ</span>
              )}
            </div>
          </div>

          <p className="text-muted-foreground whitespace-pre-line">
            {product.productDescription}
          </p>

          {/* Options */}
          <div className="space-y-4">
            {uniqueColors.length > 0 && (
              <div>
                <label className="block mb-2 font-medium">Màu sắc</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn màu" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueColors.map(color => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div>
                <label className="block mb-2 font-medium">Kích thước</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn size" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSizes.map(size => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium">Số lượng</label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={decreaseQuantity}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border rounded-md text-center min-w-[48px]">
                  {quantity}
                </span>
                <Button variant="outline" size="icon" onClick={increaseQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="flex-1" disabled={isCartLoading}>
              {isCartLoading ? (
                'Đang thêm...'
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thêm vào giỏ
                </>
              )}
            </Button>
            <Button variant="outline" disabled={isCartLoading}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm">Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-sm">Đổi trả trong vòng 30 ngày</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Bảo hành 2 năm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review & Comment Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Đánh giá & Bình luận</h2>

        {/* KHUNG GỬI ĐÁNH GIÁ MỚI */}
        {renderReviewForm()}

        {/* DANH SÁCH ĐÁNH GIÁ HIỆN CÓ */}
        {reviewsLoading ? (
          <p>Đang tải đánh giá...</p>
        ) : reviewsError ? (
          <p className="text-red-500">Không thể tải đánh giá.</p>
        ) : !reviewsData || !reviewsData.items || reviewsData.items.length === 0 ? (
          <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <div className="space-y-6">
            {reviewsData.items.map((review) => (
              <div key={review.reviewId} className="border p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{review.userId ? `User: ...${review.userId.slice(-6)}` : 'Người dùng'}</span>
                  <span className="text-xs text-muted-foreground">
                    {review.reviewCreatedAt ? new Date(review.reviewCreatedAt).toLocaleDateString('vi-VN') : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.reviewRating
                        ? 'fill-yellow-400 text-yellow-500'
                        : 'stroke-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <p className="text-sm">{review.reviewComment || 'Không có nội dung bình luận.'}</p>

              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
}