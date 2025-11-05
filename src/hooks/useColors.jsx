// src/hooks/useColors.jsx
import { useState, useEffect } from 'react';
import { getColors } from '@/services/ColorService';

export function useColors(colorId) {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColors = async () => {
      setLoading(true);
      setError(null);
      try {
        const colorData = await getColors({ params: { colorId } });
        setColors(colorData);
      } catch (err) {
        setError('Failed to fetch colors');
      } finally {
        setLoading(false);
      }
    };

    if (colorId) {
      fetchColors();
    }
  }, [colorId]);

  return { colors, loading, error };
}
