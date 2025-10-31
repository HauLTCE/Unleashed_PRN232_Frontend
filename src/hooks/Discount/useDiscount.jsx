// src/hooks/useDiscounts.js
import { useEffect, useMemo, useRef, useState } from 'react';
import * as discountService from '../../services/discountService';

/**
 * Hook để lấy và quản lý danh sách discounts
 * @param {object} filters - { search, statusId, typeId }
 */
export function useDiscounts(filters = {}) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State để trigger việc fetch lại dữ liệu một cách thủ công
  const [refetchIndex, setRefetchIndex] = useState(0);
  const refetch = () => setRefetchIndex(prev => prev + 1);

  // Sử dụng JSON.stringify để useEffect có thể so sánh object filters
  const filtersJSON = JSON.stringify(filters);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Parse lại filters từ chuỗi JSON
        const parsedFilters = JSON.parse(filtersJSON);
        
        // Truyền signal vào service để có thể hủy request
        const res = await discountService.getAllDiscounts(parsedFilters, { signal: controller.signal });
        
        // Giả sử API luôn trả về một mảng
        setDiscounts(Array.isArray(res) ? res : []);

      } catch (e) {
        // Bỏ qua lỗi nếu request bị hủy
        if (e?.name !== 'AbortError' && e?.name !== 'CanceledError') {
          setError(e?.message || 'Failed to load discounts');
          console.error(e);
        }
      } finally {
        setLoading(false);
      }
    })();

    // Cleanup: hủy request khi component unmount hoặc filters thay đổi
    return () => controller.abort();
  }, [filtersJSON, refetchIndex]); // Chạy lại khi filters hoặc refetchIndex thay đổi

  // Tạo một map để truy cập nhanh discount bằng ID, tương tự hook mẫu
  const discountMap = useMemo(() => {
    const map = new Map();
    for (const discount of discounts) {
      if (discount?.discountId != null) {
        map.set(discount.discountId, discount);
      }
    }
    return map;
  }, [discounts]);

  return { discounts, discountMap, loading, error, refetch };
}