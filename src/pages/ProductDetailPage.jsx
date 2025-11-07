import {
  Heart, Minus, Plus, RotateCcw, Shield, ShoppingCart, Truck, Star,
  MessageSquare, Edit, Trash2
} from 'lucide-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

// --- UI Components & Hooks ---
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../hooks/User/useAuth';
import { useCart } from '../hooks/useCart';
import { usePageProductDetail } from '../hooks/usePageProductDetail';
import { useVariations } from '../hooks/useVariations';
import { useProductRating } from '../hooks/useProductRating';

// --- Services ---
import { getStockByVariationId } from '../services/cartService';
import userService from '../services/userService';
import { ReviewService } from '../services/reviewService';
import { addComment, updateComment, deleteComment } from '../services/CommentService';

const CommentForm = ({ initialContent = "", initialRating = 0, onSubmit, onCancel, isSubmitting, isReview = false }) => {
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState(initialRating);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReview && (rating === 0 || !content.trim())) {
      toast.error("Vui lòng cung cấp cả đánh giá sao và bình luận.");
      return;
    }
    if (!isReview && !content.trim()) {
      toast.error("Nội dung không được để trống.");
      return;
    }
    onSubmit({ rating, content });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {isReview && (
        <div className="flex items-center space-x-2">
          <span className="font-medium">Đánh giá của bạn:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer transition-colors ${rating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
      )}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={isReview ? "Chia sẻ cảm nhận của bạn về sản phẩm..." : "Viết phản hồi của bạn..."}
        rows={4}
      />
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button>}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : 'Gửi'}</Button>
      </div>
    </form>
  );
};

// *** COMPONENT QUAN TRỌNG CẦN SỬA ***
const ReviewItem = ({ review, currentUser, onAction }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Lấy danh sách child comments trực tiếp từ prop `review`
  const childComments = review.childComments || [];

  const isAuthor = currentUser?.userId === review.userId;
  const isTopLevelReview = !!review.reviewRating;

  const handleReplySubmit = async ({ content }) => {
    // Khi reply, chúng ta cần parentCommentId (chính là commentId của review hiện tại)
    // và reviewId gốc.
    await onAction('reply', { parentCommentId: review.commentId, reviewId: review.reviewId, content });
    setShowReplyForm(false);
  };

  const handleUpdateSubmit = async ({ rating, content }) => {
    if (isTopLevelReview) {
      await onAction('updateReview', { reviewId: review.reviewId, rating, content });
    } else {
      await onAction('updateComment', { commentId: review.commentId, content });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này và tất cả các phản hồi con?")) {
      if (isTopLevelReview) {
        onAction('deleteReview', { reviewId: review.reviewId });
      } else {
        onAction('deleteComment', { commentId: review.commentId });
      }
    }
  };

  return (
    <div className="pt-4 first:pt-0">
      <div className="flex items-start space-x-4">
        <ImageWithFallback src={review.userImage || '/default-avatar.png'} alt={review.fullName} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{review.fullName}</span>
            <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          {isTopLevelReview && (
            <div className="flex items-center my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`h-4 w-4 ${review.reviewRating >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
              ))}
            </div>
          )}

          {isEditing ? (
            <CommentForm
              initialContent={review.reviewComment}
              initialRating={review.reviewRating}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setIsEditing(false)}
              isReview={isTopLevelReview}
              isSubmitting={false}
            />
          ) : (
            <p className="text-sm mt-1 whitespace-pre-line">{review.reviewComment}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" /> Trả lời
              </Button>
              {isAuthor && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-xs">
                    <Edit className="h-3 w-3 mr-1" /> Sửa
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 text-xs" onClick={handleDelete}>
                    <Trash2 className="h-3 w-3 mr-1" /> Xóa
                  </Button>
                </>
              )}
            </div>
          )}

          {showReplyForm && (
            <div className="ml-8 mt-2">
              <CommentForm onSubmit={handleReplySubmit} onCancel={() => setShowReplyForm(false)} />
            </div>
          )}

          {/* SỬA LỖI: Hiển thị các child comments đã có sẵn bằng đệ quy */}
          <div className="ml-8 mt-2 space-y-4 border-l pl-4">
            {childComments.map(child => (
              <ReviewItem
                key={child.commentId}
                review={child} // Truyền child comment vào component ReviewItem con
                currentUser={currentUser}
                onAction={onAction} />
            ))}
            {/* Không cần nút "Xem thêm" nữa vì tất cả đã được tải */}
          </div>
        </div>
      </div>
    </div>
  );
};


export function ProductDetailPage() {
  const { id: productId } = useParams();


  const { data: product, loading, error } = usePageProductDetail(productId);
  const { addItemToCart, isLoading: isCartLoading } = useCart();
  const { variations } = useVariations(productId);
  const { rating, count: reviewCount, refetch: refetchRating } = useProductRating(productId);
  const { userId: currentUserId, isAuthenticated } = useAuth();

  const currentUser = useMemo(() => {
    if (!isAuthenticated || !currentUserId) return null;
    return { userId: currentUserId };
  }, [isAuthenticated, currentUserId]);



  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(null);

  const selectedVariation = useMemo(() => {
    return variations.find(v => v.variationId === selectedVariationId);
  }, [selectedVariationId, variations]);



  const [reviewsResult, setReviewsResult] = useState({ items: [], totalCount: 0 });
  const [reviewersInfo, setReviewersInfo] = useState({});
  const [reviewsPage, setReviewsPage] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState({ isEligible: false, eligibleOrderId: null, message: '' });


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


  const fetchReviews = useCallback(async (page, forceRefresh = false) => {
    if (!productId) return;
    setIsLoadingReviews(true);
    try {
      const data = await ReviewService.getReviewsByProductId(productId, page - 1, 5);

      // Không cần lấy user info ở đây nữa vì backend đã làm rồi
      // Chỉ cần set dữ liệu trả về từ API
      setReviewsResult(prev => ({
        items: forceRefresh || page === 1 ? data.items : [...prev.items, ...data.items],
        totalCount: data.totalCount
      }));

      if (page > reviewsPage) setReviewsPage(page);

    } catch (err) {
      toast.error("Không thể tải danh sách đánh giá.");
    } finally {
      setIsLoadingReviews(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, reviewsPage]);

  useEffect(() => {
    fetchReviews(1, true);
    if (isAuthenticated) {
      ReviewService.checkEligibility(productId)
        .then(setEligibility)
        .catch(() => toast.error("Không thể kiểm tra quyền đánh giá."));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAuthenticated]);


  const handleAddToCart = async () => {
    if (!selectedVariation) {
      toast.error('Vui lòng chọn một phiên bản sản phẩm.');
      return;
    }
    const isOutOfStock = stock !== null && stock.isOutOfStock;
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
    if (stock?.available !== null && finalQuantity > stock?.available) {
      toast.error(`Số lượng thêm vào không được vượt quá số lượng tồn kho (${stock?.available}).`);
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
    setQuantity(q => Math.max(1, (Number(q) || 2) - 1));
  };

  const increaseQuantity = () => {
    const currentQuantity = Number(quantity) || 0;
    if (stock?.available !== null && currentQuantity >= stock?.available) {
      toast.info(`Chỉ còn ${stock?.available} sản phẩm trong kho.`);
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


  const handleAction = useCallback(async (action, payload) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này.");
      return;
    }
    setIsSubmitting(true);
    try {
      switch (action) {
        case 'createReview':
          await ReviewService.createReview({ productId, orderId: eligibility.eligibleOrderId, reviewRating: payload.rating, reviewComment: payload.content });
          toast.success("Gửi đánh giá thành công!");
          setEligibility({ isEligible: false, message: 'Cảm ơn bạn đã đánh giá!' });
          break;
        case 'updateReview':
          await ReviewService.updateReview(payload.reviewId, { reviewRating: payload.rating, reviewComment: payload.content });
          toast.success("Cập nhật đánh giá thành công!");
          break;
        case 'deleteReview':
          await ReviewService.deleteReview(payload.reviewId);
          toast.success("Xóa đánh giá thành công!");
          break;
        case 'reply':
          await addComment({ reviewId: payload.reviewId, parentCommentId: payload.parentCommentId, commentContent: payload.content });
          toast.success("Gửi phản hồi thành công!");
          break;
        case 'updateComment':
          await updateComment(payload.commentId, { commentContent: payload.content });
          toast.success("Cập nhật phản hồi thành công!");
          break;
        case 'deleteComment':
          await deleteComment(payload.commentId);
          toast.success("Xóa phản hồi thành công!");
          break;
        default: break;
      }

      await fetchReviews(1, true);
      await refetchRating();
    } catch (error) {

      let errorMessage = "Thao tác thất bại. Vui lòng thử lại.";

      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || error.response.data.error || error.response.data.title || errorMessage;
        if (typeof error.response.data.errors === 'object') {
          const validationErrors = Object.values(error.response.data.errors).flat();
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join('\n');
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [isAuthenticated, eligibility.eligibleOrderId, fetchReviews, productId, refetchRating]);


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

  // Giờ không cần mergedReviews nữa, vì dữ liệu đã có sẵn trong reviewsResult.items
  const reviewsToDisplay = reviewsResult.items;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Danh sách sản phẩm</Link>
        <span>/</span>
        <span className="text-foreground">{product.productName}</span>
      </div>

      {/* Phần thông tin sản phẩm giữ nguyên */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback src={selectedVariation?.variationImage || product.productImages?.[0]?.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
          </div>
          {variations.length > 1 && (
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
                {selectedVariation ? `${selectedVariation.variationPrice.toLocaleString()}₫` : (product.minPrice ? `${product.minPrice.toLocaleString()}₫` : 'Vui lòng chọn phiên bản')}
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
                  Còn lại: {availableStock} sản phẩm
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

      {/* Phần review */}
      <div className="border-t pt-8 mt-16">
        <div className="flex items-center mb-4">
          <h2 className="text-2xl font-bold">Đánh giá sản phẩm</h2>
          <div className="flex items-center ml-4">
            <div className="flex text-yellow-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`h-5 w-5 ${index < Math.round(rating) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">({reviewCount} đánh giá)</span>
          </div>
        </div>
        {isAuthenticated && eligibility.isEligible && (
          <div className="mb-8 p-4 border rounded-lg bg-slate-50">
            <h3 className="text-lg font-semibold">Viết đánh giá của bạn</h3>
            <p className="text-sm text-muted-foreground mb-4">Bạn đã mua sản phẩm này. Hãy chia sẻ cảm nhận của bạn!</p>
            <CommentForm onSubmit={(data) => handleAction('createReview', data)} isSubmitting={isSubmitting} isReview={true} />
          </div>
        )}
        {isAuthenticated && eligibility.message && !eligibility.isEligible && (
          <div className="mb-8 p-3 border rounded-lg bg-gray-50 text-center text-sm text-gray-600">{eligibility.message}</div>
        )}
        {!isAuthenticated && (
          <div className="mb-8 p-4 border rounded-lg text-center">
            <p>Vui lòng <Link to="/login" className="text-primary hover:underline font-semibold">đăng nhập</Link> để viết đánh giá.</p>
          </div>
        )}
        <div className="space-y-4 divide-y">
          {reviewsToDisplay.length > 0 ? (
            reviewsToDisplay.map((review) => (
              <ReviewItem key={review.reviewId} review={review} currentUser={currentUser} onAction={handleAction} />
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Chưa có đánh giá nào cho sản phẩm này.</p>
          )}
          {reviewsResult.items.length < reviewsResult.totalCount && (
            <div className="text-center pt-8">
              <Button onClick={() => fetchReviews(reviewsPage + 1)} disabled={isLoadingReviews}>
                {isLoadingReviews ? 'Đang tải...' : 'Xem thêm đánh giá'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}