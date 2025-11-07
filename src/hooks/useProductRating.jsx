// src/hooks/useProductRating.js

import { useState, useEffect, useCallback } from 'react';
import { ReviewService } from '@/services/reviewService';

export function useProductRating(productId) {
    const [rating, setRating] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Dùng useCallback để hàm fetchRating không bị tạo lại mỗi lần component render,
    // giúp tối ưu hiệu năng. Đây sẽ là hàm "refetch" của chúng ta.
    const fetchRating = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        try {
            // SỬA LỖI: Gọi API endpoint đúng và hiệu quả hơn.
            // API này được thiết kế để chỉ trả về điểm trung bình và số lượng, rất nhẹ.
            const summaries = await ReviewService.getProductRatingSummaries([productId]);

            if (summaries && summaries.length > 0) {
                const summary = summaries[0];
                setRating(Number(summary.averageRating.toFixed(1)));
                setCount(summary.reviewCount);
            } else {
                // Nếu không có review, trả về giá trị mặc định
                setRating(0);
                setCount(0);
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin rating:", error);
            setRating(0);
            setCount(0);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    // Tự động gọi fetchRating khi productId thay đổi
    useEffect(() => {
        fetchRating();
    }, [fetchRating]);

    // SỬA LỖI: Đây là phần quan trọng nhất.
    // Chúng ta trả về hàm `fetchRating` với tên là `refetch`
    // để component ProductDetailPage có thể gọi nó.
    return { rating, count, loading, refetch: fetchRating };
}