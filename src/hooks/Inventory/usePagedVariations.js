import { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../services/ProductsService';

// We can show more items now with the compact layout
const ITEMS_PER_PAGE = 4; 

export function usePagedVariations() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = useCallback(async (page, search) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts({
        search: search,
        pageNumber: page,
        pageSize: ITEMS_PER_PAGE,
      });
      
      const items = response.items || [];
      const totalCount = response.totalCount || 0;

      setProducts(items);
      setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));

    } catch (err) {
      console.error("Failed to fetch products with variations:", err);
      setError(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm, fetchProducts]);

  return {
    products,
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    setCurrentPage,
  };
}