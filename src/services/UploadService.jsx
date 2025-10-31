
/**
 * Upload ảnh dạng file (multipart/form-data)
 * Backend endpoint: POST /upload/file
 * Body: FormData với key "file"
 *
 * @param {File} file - file ảnh từ <input type="file" />
 * @returns {Promise<any>} response.data (dạng { imageUrl: '...' })
 */
export const uploadImageFile = async (file) => {
  // Chuẩn bị form-data
  const formData = new FormData();
  formData.append('file', file); // trùng tên parameter IFormFile file

  // Gửi request
  const response = await ('/Upload/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Backend trả về { imageUrl: '...' }
  return response.data;
};

/**
 * Upload ảnh dạng base64 (JSON)
 * Backend endpoint: POST /upload/base64
 * Body: { base64Image, fileName }
 *
 * Lưu ý:
 * - base64Image có thể là chuỗi đầy đủ "data:image/jpeg;base64,...."
 *   Controller bên backend đã .Split(',').Last() nên OK.
 *
 * @param {string} base64Image - chuỗi base64 đầy đủ (data:image/...;base64,xxxx)
 * @param {string} fileName - tên gợi ý cho file (vd: 'product-banner.jpg')
 * @returns {Promise<any>} response.data (dạng { imageUrl: '...' })
 */
export const uploadBase64Image = async (base64Image, fileName = 'upload.jpg') => {
  const payload = {
    base64Image,
    fileName,
  };

  const response = await apiClient.post('/Upload/base64', payload, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};
