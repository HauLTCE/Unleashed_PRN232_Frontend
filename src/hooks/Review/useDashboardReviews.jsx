import { useState, useCallback } from 'react';
import { getDashboardReviews } from '../../services/reviewService';

export const useDashboardReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardReviews = useCallback(async (page, size, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardReviews(page, size, filters);
      
      const items = response?.data?.items || [];
      const totalCount = response?.data?.totalCount || 0;
      
      setReviews(items);
      setTotal(totalCount);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(totalCount / size),
        hasNext: page < Math.ceil(totalCount / size),
        hasPrevious: page > 1,
      });

    } catch (err) {
      console.error("Failed to fetch dashboard reviews:", err);
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  return { reviews, total, pagination, loading, error, fetchDashboardReviews };
};