import { apiClient} from './apiClient';

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