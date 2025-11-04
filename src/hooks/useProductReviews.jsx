// src/hooks/useProductReviews.jsx
import { useEffect, useState, useCallback } from 'react';
import { ReviewService } from '@/services/reviewService';
import userService from '@/services/userService'; // ✅ 1. Import userService
// Sếp chỉnh lại path cho đúng dự án nhé

export function useProductReviews(productId, initialPage = 0, initialSize = 10) {
  const [data, setData] = useState(null); // toàn bộ response từ API
  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State cho eligibility
  const [eligibility, setEligibility] = useState(null); // Sẽ lưu { orderId, orderDate }
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  const fetchReviews = useCallback(
    async (overridePage, overrideSize) => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      const currentPage = overridePage ?? page;
      const currentSize = overrideSize ?? size;

      try {
        // ✅ 2. Lấy danh sách review như cũ
        const res = await ReviewService.getReviewsByProductId(
          productId,
          currentPage,
          currentSize
        );

        // ==================================================
        // ✅ 3. LOGIC MỚI: Làm giàu data review với User Info
        // ==================================================
        const reviews = res?.items;

        if (reviews && reviews.length > 0) {
          // 3a. Gom các userId duy nhất
          const userIds = [
            ...new Set(reviews.map(r => r.userId).filter(Boolean)),
          ];

          if (userIds.length > 0) {
            try {
              // 3b. Gọi API lấy thông tin user
              const userInfos = await userService.getUserReviewInfos(userIds);

              // 3c. Tạo map để tra cứu O(1)
              const userInfoMap = userInfos.reduce((acc, user) => {
                acc[user.userId] = user; // Giả sử DTO trả về có 'userId'
                return acc;
              }, {});

              // 3d. Gắn thông tin user vào từng review
              reviews.forEach(review => {
                if (review.userId && userInfoMap[review.userId]) {
                  review.user = userInfoMap[review.userId]; // Gắn cả object user
                }
              });

              // Cập nhật lại list review đã được làm giàu
              res.items = reviews;

            } catch (userErr) {
              // Lỗi này không nghiêm trọng, chỉ là không lấy được tên/avatar
              // Vẫn hiển thị review bình thường
              console.warn("Failed to fetch user review infos", userErr);
            }
          }
        }
        // ==================================================
        // ✅ KẾT THÚC LOGIC MỚI
        // ==================================================

        setData(res); // ✅ 4. Set data đã được làm giàu

      } catch (err) {
        console.error('Failed to fetch reviews', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [productId, page, size]
  );

  // Effect: Tự động kiểm tra eligibility
  useEffect(() => {
    if (!productId) {
      setCheckingEligibility(false);
      return;
    }

    setCheckingEligibility(true);
    setEligibility(null);

    // Lấy userId (đã bóc vỏ)
    let userIdFromStorage = localStorage.getItem('authUser');
    let userId = null;
    if (userIdFromStorage) {
      try {
        userId = JSON.parse(userIdFromStorage);
      } catch (e) {
        userId = userIdFromStorage;
      }
    }

    if (!userId) {
      // Chưa login, không cần check API
      setCheckingEligibility(false);
      return;
    }

    // Đã login, tiến hành check
    ReviewService.checkEligibility(productId)
      .then((res) => {
        setEligibility(res); // Lưu { orderId, orderDate }
      })
      .catch((err) => {
        console.warn('User not eligible to review', err.response?.data);
        setEligibility(null); // Không đủ điều kiện
      })
      .finally(() => {
        setCheckingEligibility(false);
      });
  }, [productId]); // Chạy lại mỗi khi productId thay đổi

  // Load reviews (Effect cũ)
  // ❗️ Em đã sửa lại dependency của effect này
  // Ta cần bỏ `fetchReviews` ra khỏi dependency, vì `fetchReviews`
  // lại phụ thuộc vào `page` và `size`. Nếu để `fetchReviews`
  // nó sẽ bị gọi lại 2 lần (1 lần do productId, 1 lần do setPage)
  // và tạo ra race condition.
  useEffect(() => {
    if (!productId) return;
    setPage(0); // Reset về trang 0 khi đổi sản phẩm
    fetchReviews(0, size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, size]); // Chỉ chạy khi productId hoặc size thay đổi

  // Tạo review rồi reload lại danh sách
  const createReview = useCallback(
    async (payload) => {
      try {
        const created = await ReviewService.createReview(payload);

        // reload lại để thấy review mới (về trang 0)
        await fetchReviews(0, size);
        setPage(0);

        // Sau khi review thành công, set lại eligibility = null
        setEligibility(null);

        return created;
      } catch (err) {
        console.error('Failed to create review', err);
        throw err;
      }
    },
    [fetchReviews, size] // Thêm size vào dependency
  );

  const updateReview = useCallback(
    async (id, payload) => {
      try {
        const updated = await ReviewService.updateReview(id, payload);
        await fetchReviews(); // reload trang hiện tại
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
        await fetchReviews(); // reload trang hiện tại
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
    setPage(0); // Luôn về trang 0 khi đổi size
    await fetchReviews(0, newSize);
  };

  return {
    data, // toàn bộ trang review trả về (đã có data user)
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

    // Xuất state mới ra cho component dùng
    eligibility,
    checkingEligibility,
  };
}