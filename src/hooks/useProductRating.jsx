import { useEffect, useState } from 'react';
import { ReviewService } from '@/services/reviewService';

export function useProductRating(productId) {
    const [rating, setRating] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!productId) return;
        setLoading(true);

        ReviewService.getReviewsByProductId(productId, 0, 50)
            .then((res) => {
                const reviews = res.items ?? res.data ?? res ?? [];
                if (Array.isArray(reviews)) {
                    const ratings = reviews.map((r) => r.reviewRating ?? 0);
                    const avg =
                        ratings.length > 0
                            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
                            : 0;
                    setRating(Number(avg.toFixed(1)));
                    setCount(ratings.length);
                }
            })
            .catch(() => {
                setRating(0);
                setCount(0);
            })
            .finally(() => setLoading(false));
    }, [productId]);

    return { rating, count, loading };
}
