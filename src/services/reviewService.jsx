import { apiClient } from './apiClient';

/**
 * Fetches reviews for the admin dashboard.
 */
export const getDashboardReviews = (page = 1, size = 10, filters = {}) => {
  // API is 0-indexed, UI is 1-indexed
  const params = { page: page - 1, size, ...filters };
  return apiClient.get('/Reviews/dashboard', { params });
};
/**
 * Fetches reviews for a specific product.
 */
export const getProductReviews = (productId, page = 1, size = 10) => {
  const params = { page: page - 1, size };
  return apiClient.get(`/Reviews/product/${productId}`, { params });
};
/**
 * Fetches a specific user's review history.
 */
export const getUserReviewHistory = (userId, page = 1, size = 10) => {
  const params = { page: page - 1, size };
  return apiClient.get(`/Reviews/user/${userId}`, { params });
};
/**
 * Submits a new review.
 */
export const addReview = (reviewData) => {
  return apiClient.post('/Reviews', reviewData);
};
/**
 * Checks if a user is eligible to review a product for a given order.
 * Note: The backend endpoint was defined for eligibility based on product, let's adapt to that.
 */
export const checkReviewEligibility = (productId) => {
  return apiClient.get('/Reviews/eligibility', { params: { productId } });
};

// =========================
// 🧠 Review Service
// =========================
export const ReviewService = {
  // 🟩 1. Tạo review (CUSTOMER)
  async createReview(data) {
    const res = await apiClient.post('/Reviews', data);
    return res.data;
  },

  // 🟩 2. Lấy danh sách review theo ProductId
  async getReviewsByProductId(productId, page = 0, size = 10) {
    const res = await apiClient.get(`/Reviews/product/${productId}`, {
      params: { page, size },
    });
    return res.data;
  },

  // 🟩 3. Lấy danh sách review theo UserId
  async getReviewsByUserId(userId, page = 0, size = 10) {
    const res = await apiClient.get(`/Reviews/user/${userId}`, {
      params: { page, size },
    });
    return res.data;
  },

  // 🟩 4. Kiểm tra eligibility (CUSTOMER)
  async checkEligibility(productId) {
    const res = await apiClient.get('/Reviews/eligibility', {
      params: { productId },
    });
    return res.data;
  },

  // 🟩 5. Kiểm tra xem review đã tồn tại chưa
  async checkReviewExists(productId, orderId, userId) {
    const res = await apiClient.get('/Reviews/check-exists', {
      params: { productId, orderId, userId },
    });
    return res.data;
  },

  // 🟩 6. Lấy review theo ID
  async getReviewById(id) {
    const res = await apiClient.get(`/Reviews/${id}`);
    return res.data;
  },

  // 🟩 7. Cập nhật review (CUSTOMER)
  async updateReview(id, data) {
    const res = await apiClient.put(`/Reviews/${id}`, data);
    return res.data;
  },

  // 🟩 8. Xóa review (ADMIN hoặc STAFF)
  async deleteReview(id) {
    const res = await apiClient.delete(`/Reviews/${id}`);
    return res.data;
  },

  // 🟩 9. Lấy danh sách review cho dashboard (ADMIN hoặc STAFF)
  async getDashboardReviews(page = 0, size = 10) {
    const res = await apiClient.get('/Reviews/dashboard', {
      params: { page, size },
    });
    return res.data;
  },

  // 🟩 10. Lấy danh sách reply theo commentId
  async getCommentReplies(commentId, page = 0, size = 10) {
    const res = await apiClient.get(`/Reviews/comments/${commentId}/replies`, {
      params: { page, size },
    });
    return res.data;
  },
};