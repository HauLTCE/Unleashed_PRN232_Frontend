import { useState, useEffect, useCallback } from 'react';
import { searchVariations } from '../../services/VariationsService';

/**
 * A hook that provides debounced search functionality for product variations.
 * It fetches a paged list of variations based on the search term.
 */
export function useDebouncedVariationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If search term is cleared, clear results
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Set a timer to delay the API call
    const handler = setTimeout(() => {
      searchVariations({ search: searchTerm, page: 1, size: 20 }) // Fetch first 20 results
        .then(data => {
          setResults(data || []);
        })
        .catch(err => {
          console.error("Failed to search variations:", err);
          setResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500); // 500ms delay

    // Cleanup function to cancel the timer if the user types again
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return { setSearchTerm, results, loading };
}