// src/hooks/useImageUpload.js
import { useState, useCallback } from 'react';
import {
  uploadImageFile,
  uploadBase64Image,
} from '../services/UploadService';

/**
 * Hook dùng để upload ảnh lên server (ImgBB qua backend)
 *
 * Giá trị trả về:
 * - imageUrl    : string | null      -> link ảnh sau khi upload thành công
 * - loading     : boolean            -> trạng thái đang upload
 * - error       : string | null      -> thông báo lỗi (nếu có)
 * - uploadFile  : (file: File)       -> hàm upload file (multipart/form-data)
 * - uploadBase64: (base64, name?)    -> hàm upload base64 (JSON)
 * - reset       : ()                 -> xóa trạng thái hiện tại
 */
export const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload bằng file gốc (ví dụ từ <input type="file" />)
   */
  const uploadFile = useCallback(async (file) => {
    if (!file) {
      setError('Không có file để upload');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await uploadImageFile(file);
      // backend: { imageUrl: 'https://...' }
      setImageUrl(data.imageUrl || null);
      return data;
    } catch (err) {
      const message = err.message || 'Upload file thất bại';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload bằng chuỗi base64 (ví dụ ảnh đã crop/compress sẵn)
   */
  const uploadBase64 = useCallback(async (base64Image, fileName = 'upload.jpg') => {
    if (!base64Image) {
      setError('Không có dữ liệu base64 để upload');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await uploadBase64Image(base64Image, fileName);
      setImageUrl(data.imageUrl || null);
      return data;
    } catch (err) {
      const message = err.message || 'Upload base64 thất bại';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset trạng thái (khi sếp muốn clear form, chọn ảnh khác, v.v.)
   */
  const reset = useCallback(() => {
    setImageUrl(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    imageUrl,
    loading,
    error,
    uploadFile,
    uploadBase64,
    reset,
  };
};
