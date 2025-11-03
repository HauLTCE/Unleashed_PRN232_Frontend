import api from './api'; // axios instance có baseURL, interceptor, v.v.

// =========================
// 🧠 Review Service
// =========================
export const ReviewService = {
  // 🟩 1. Tạo review (CUSTOMER)
  async createReview(data) {
    const res = await api.post('/Reviews', data);
    return res.data;
  },

  // 🟩 2. Lấy danh sách review theo ProductId
  async getReviewsByProductId(productId, page = 0, size = 10) {
    const res = await api.get(`/Reviews/product/${productId}`, {
      params: { page, size },
    });
    return res.data;
  },

  // 🟩 3. Lấy danh sách review theo UserId
  async getReviewsByUserId(userId, page = 0, size = 10) {
    const res = await api.get(`/Reviews/user/${userId}`, {
      params: { page, size },
    });
    return res.data;
  },

  // 🟩 4. Kiểm tra eligibility (CUSTOMER)
  async checkEligibility(productId) {
    const res = await api.get('/Reviews/eligibility', {
      params: { productId },
    });
    return res.data;
  },

  // 🟩 5. Kiểm tra xem review đã tồn tại chưa
  async checkReviewExists(productId, orderId, userId) {
    const res = await api.get('/Reviews/check-exists', {
      params: { productId, orderId, userId },
    });
    return res.data;
  },

  // 🟩 6. Lấy review theo ID
  async getReviewById(id) {
    const res = await api.get(`/Reviews/${id}`);
    return res.data;
  },

  // 🟩 7. Cập nhật review (CUSTOMER)
  async updateReview(id, data) {
    const res = await api.put(`/Reviews/${id}`, data);
    return res.data;
  },

  // 🟩 8. Xóa review (ADMIN hoặc STAFF)
  async deleteReview(id) {
    const res = await api.delete(`/Reviews/${id}`);
    return res.data;
  },

  // 🟩 9. Lấy danh sách review cho dashboard (ADMIN hoặc STAFF)
  async getDashboardReviews(page = 0, size = 10) {
    const res = await api.get('/Reviews/dashboard', {
      params: { page, size },
    });
    return res.data;
  },

  // 🟩 10. Lấy danh sách reply theo commentId
  async getCommentReplies(commentId, page = 0, size = 10) {
    const res = await api.get(`/Reviews/comments/${commentId}/replies`, {
      params: { page, size },
    });
    return res.data;
  },
};
