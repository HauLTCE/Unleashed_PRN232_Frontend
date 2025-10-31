import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../../services/transactionService';

const DEBOUNCE_DELAY = 500;

export function useTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalCount: 0 });
    
    const [filters, setFilters] = useState({
        search: '',
        dateFilter: 'all',
        sort: 'newest_first',
    });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(filters.search);
            setCurrentPage(1); // Reset to first page on new search
        }, DEBOUNCE_DELAY);
        return () => clearTimeout(handler);
    }, [filters.search]);

    const fetchTransactions = useCallback(async (page, currentFilters) => {
        setLoading(true);
        setError(null);
        try {
            const data = await transactionService.getTransactions({
                page: page,
                size: pagination.pageSize,
                search: currentFilters.search,
                dateFilter: currentFilters.dateFilter,
                sort: currentFilters.sort,
            });
            setTransactions(data.data || []);
            setPagination({
                page: data.page,
                pageSize: data.pageSize,
                totalCount: data.totalCount,
            });
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageSize]);

    useEffect(() => {
        fetchTransactions(currentPage, { ...filters, search: debouncedSearch });
    }, [currentPage, debouncedSearch, filters.dateFilter, filters.sort, fetchTransactions]);

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        if (filterName !== 'search') {
            setCurrentPage(1); // Reset page for non-search filters
        }
    };

    return {
        transactions,
        loading,
        error,
        pagination,
        filters,
        currentPage,
        setCurrentPage,
        handleFilterChange,
    };
}