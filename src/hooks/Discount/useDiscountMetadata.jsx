// src/hooks/useDiscountMetadata.js

import { useEffect, useMemo, useRef, useState } from 'react';
import * as discountService from '../../services/discountService';

export function useDiscountMetadata() {
  const [statuses, setStatuses] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        setLoading(true);
        // Gọi đồng thời cả hai API để tăng hiệu suất
        const [statusesData, typesData] = await Promise.all([
          discountService.getAllDiscountStatuses(),
          discountService.getAllDiscountTypes(),
        ]);

        // Giả sử API trả về mảng có dạng [{ discountStatusId, name }] và [{ discountTypeId, name }]
        // Chúng ta sẽ đổi tên key để thống nhất là `id`
        setStatuses(statusesData.map(s => ({ id: s.discountStatusId, name: s.name })));
        setTypes(typesData.map(t => ({ id: t.discountTypeId, name: t.name })));
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch discount metadata:", err);
        setError("Could not load required data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, []); // Mảng rỗng đảm bảo hook chỉ chạy 1 lần

  return { statuses, types, loading, error };
}