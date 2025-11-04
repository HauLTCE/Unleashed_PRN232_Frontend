// src/pages/ProductDetailPage.jsx

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

// Imports cho Review
import { Textarea } from '../components/ui/textarea';
import { useProductRating } from '../hooks/useProductRating';
import { useProductReviews } from '../hooks/useProductReviews';

// ✅ Đảm bảo là 'export function' (Named export)
export function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, loading, error } = usePageProductDetail(id);
  const { addItemToCart, isLoading: isCartLoading } = useCart();

  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(null);

  // =============================================
  // LOGIC CHO REVIEWS
  // =============================================

  const {
    data: reviewData,
    loading: reviewsLoading,
    error: reviewsError,
    page,
    setPage,
    createReview,
    eligibility,
    checkingEligibility,
  } = useProductReviews(id);

  const {
    rating,
    count,
    loading: ratingLoading,
  } = useProductRating(id);

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

  // (Các logic cũ của sản phẩm)
  const variations = useMemo(() => product?.variations || [], [product]);
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

  // =============================================
  // HÀM XỬ LÝ
  // =============================================

  // Hàm xử lý gửi đánh giá (Giữ nguyên)
  const handleSubmitReview = async () => {
    if (newRating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá.');
      return;
    }
    if (!userId) {
      toast.error('Bạn cần đăng nhập để thực hiện đánh giá.');
      return;
    }
    if (!eligibility || !eligibility.orderId) {
      toast.error('Bạn không đủ điều kiện (hoặc đã) đánh giá sản phẩm này.');
      return;
    }
    const payload = {
      productId: id,
      userId: userId,
      orderId: eligibility.orderId,
      reviewRating: newRating,
      reviewComment: newComment || null,
    };
    setIsSubmitting(true);
    try {
      await createReview(payload);
      toast.success('Gửi đánh giá thành công!');
      setNewRating(0);
      setNewComment('');
    } catch (err) {
      console.error('Failed to submit review', err);
      const errorMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(' ')
        : err.response?.data?.message || 'Gửi đánh giá thất bại.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hàm render Khung Gửi Đánh Giá (Giữ nguyên)
  const renderReviewForm = () => {
    if (checkingEligibility) {
      return (
        <div className="mb-8 p-4 border rounded-lg bg-muted/50 text-center">
          <p className="text-muted-foreground">Đang kiểm tra điều kiện đánh giá...</p>
        </div>
      );
    }
    if (userId && eligibility && eligibility.orderId) {
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
                      : 'fill-gray-300 text-gray-400 hover:fill-yellow-300'
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
    return (
      <div className="mb-8 p-4 border rounded-lg bg-muted/50 text-center">
        <p className="text-muted-foreground">
          {!userId
            ? 'Vui lòng đăng nhập để đánh giá sản phẩm.'
            : 'Bạn cần mua sản phẩm này để có thể đánh giá (hoặc bạn đã đánh giá rồi).'}
        </p>
      </div>
    );
  };

  // (Các hàm xử lý cũ của sản phẩm (addToCart, quantity...))
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

  // =============================================
  // RENDER LOADING / ERROR (Trang)
  // =============================================
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

  const isOutOfStock = stock !== null && stock.isOutOfStock;
  const availableStock = stock?.available ?? null;

  // =============================================
  // RENDER JSX (Trang)
  // =============================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Danh sách sản phẩm</Link>
        <span>/</span>
        <span className="text-foreground">{product.productName}</span>
      </div>

      {/* Grid thông tin sản phẩm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Cột ảnh sản phẩm */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback src={selectedVariation?.variationImage} alt={product.productName} className="w-full h-full object-cover" />
          </div>
          {variations.length > 0 && (
            <div className="grid grid-cols-5 gap-4">
              {variations.map((variation) => (
                <button
                  key={variation.variationId}
                  onClick={() => setSelectedVariationId(variation.variationId)}
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

        {/* Cột thông tin chi tiết, giá, nút mua hàng */}
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

            {/* Số lượng */}
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

      {/* =================================== */}
      {/* PHẦN ĐÁNH GIÁ SẢN PHẨM */}
      {/* =================================== */}
      <div className="mt-16 pt-10 border-t">
        <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>

        {/* --- 1. Tổng quan Rating --- */}
        <ProductRatingSummary
          rating={rating}
          count={count}
          loading={ratingLoading}
        />

        {/* --- 2. Form Đánh giá (gọi hàm render) --- */}
        {renderReviewForm()}

        {/* --- 3. Danh sách đánh giá & Phân trang --- */}
        <h3 className="text-xl font-semibold mb-4">Tất cả đánh giá ({reviewData?.totalItems ?? 0})</h3>
        {reviewsLoading ? (
          <p>Đang tải đánh giá...</p>
        ) : reviewsError ? (
          <p className="text-red-500">Không thể tải đánh giá.</p>
        ) : !reviewData || !reviewData.items || reviewData.items.length === 0 ? (
          <p className="text-muted-foreground">Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          <>
            {/* List */}
            <div className="space-y-6">
              {reviewData.items.map((review) => {

                // ✅ SỬA LOGIC Ở ĐÂY:
                // Đọc trực tiếp từ object review (đã được hook làm phẳng)
                const userName = review.fullName || 'Người dùng ẩn danh';
                const userImage = review.userImage; // Sẽ là null nếu API trả về null

                // Lấy ngày hiển thị (ưu tiên update)
                // ✅ Đổi tên field createdAt/updatedAt
                const displayDate = review.updatedAt || review.createdAt;
                const formattedDate = displayDate
                  ? new Date(displayDate).toLocaleDateString('vi-VN')
                  : '';

                // Hiển thị 'Đã cập nhật'
                const dateLabel = review.updatedAt !== review.createdAt ? '(Đã cập nhật)' : '';

                return (
                  <div key={review.reviewId} className="border p-4 rounded-lg shadow-sm bg-white">
                    {/* --- Phần Header Của Review (Đã cập nhật) --- */}
                    <div className="flex items-start justify-between mb-3">

                      {/* Avatar và Tên */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={userImage} // Đọc trực tiếp
                            alt={userName}  // Đọc trực tiếp
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold">{userName}</span>
                      </div>

                      {/* Ngày tháng (căn phải) */}
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="text-xs text-muted-foreground">
                          {formattedDate}
                        </span>
                        {dateLabel && <span className="block text-xs text-blue-500 italic -mt-1">{dateLabel}</span>}
                      </div>

                    </div>

                    {/* --- Phần Body Của Review --- */}
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < (review.reviewRating || 0)
                            ? 'fill-yellow-400 text-yellow-500'
                            : 'fill-gray-300 text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{review.reviewComment || 'Người dùng này không để lại bình luận.'}</p>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {reviewData.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 pt-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                >
                  Trang trước
                </Button>
                <span className="text-sm font-medium">
                  Trang {page + 1} / {reviewData.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page + 1 >= reviewData.totalPages}
                >
                  Trang sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}


// =============================================
// COMPONENT CON CHO RATING SUMMARY
// (Giữ nguyên)
// =============================================
function ProductRatingSummary({ rating, count, loading }) {
  if (loading) return <p className="mb-8">Đang tải đánh giá...</p>;

  const StarIcon = ({ filled }) => <span className={`text-2xl ${filled ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>;

  const stars = Array.from({ length: 5 }, (_, i) => (
    <StarIcon key={i} filled={i < Math.round(rating)} />
  ));

  return (
    <div className="bg-muted p-4 rounded-lg mb-8 flex items-center gap-4">
      <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
      <div>
        <div className="flex">{stars}</div>
        <p className="text-sm text-muted-foreground">Dựa trên {count} đánh giá</p>
      </div>
    </div>
  );
}