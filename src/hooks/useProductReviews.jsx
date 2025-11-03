// src/hooks/useProductReviews.jsx
import { useEffect, useState, useCallback } from 'react';
import { ReviewService } from '@/services/reviewService'; 
// Sếp chỉnh lại path cho đúng dự án nhé

export function useProductReviews(productId, initialPage = 0, initialSize = 10) {
  const [data, setData] = useState(null);        // toàn bộ response từ API
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(
    async (overridePage, overrideSize) => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      const currentPage = overridePage ?? page;
      const currentSize = overrideSize ?? size;

      try {
        const res = await ReviewService.getReviewsByProductId(
          productId,
          currentPage,
          currentSize
        );
        // Không đoán cấu trúc, giữ nguyên data để sếp tự dùng
        setData(res);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [productId, page, size]
  );

  // Load khi đổi productId hoặc kích thước page
  useEffect(() => {
    if (!productId) return;
    // reset về page 0 mỗi khi đổi product
    setPage(0);
    fetchReviews(0, size);
  }, [productId, size, fetchReviews]);

  // Tạo review rồi reload lại danh sách
  const createReview = useCallback(
    async (payload) => {
      try {
        const created = await ReviewService.createReview(payload);
        // reload lại để thấy review mới
        await fetchReviews();
        return created;
      } catch (err) {
        console.error('Failed to create review', err);
        throw err;
      }
    },
    [fetchReviews]
  );

  const updateReview = useCallback(
    async (id, payload) => {
      try {
        const updated = await ReviewService.updateReview(id, payload);
        await fetchReviews();
        return updated;
      } catch (err) {
        console.error('Failed to update review', err);
        throw err;
      }
    },
    [fetchReviews]
  );

  const deleteReview = useCallback(
    async (id) => {
      try {
        const deleted = await ReviewService.deleteReview(id);
        await fetchReviews();
        return deleted;
      } catch (err) {
        console.error('Failed to delete review', err);
        throw err;
      }
    },
    [fetchReviews]
  );

  const changePage = async (newPage) => {
    setPage(newPage);
    await fetchReviews(newPage, size);
  };

  const changeSize = async (newSize) => {
    setSize(newSize);
    setPage(0);
    await fetchReviews(0, newSize);
  };

  return {
    data,          // toàn bộ trang review trả về
    page,
    size,
    loading,
    error,
    refetch: fetchReviews,
    setPage: changePage,
    setSize: changeSize,
    createReview,
    updateReview,
    deleteReview,
  };
}
