import { apiClient } from "./ApiClient";

/**
 * Upload real file (multipart/form-data)
 * @param {File} file 
 * @returns {Promise<{ imageUrl: string }>}
 */
export const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post("/Upload/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data; // { imageUrl: "https://..." }
};

/**
 * Upload base64 image (JSON request)
 * @param {string} base64Image 
 * @param {string} fileName 
 * @returns {Promise<{ imageUrl: string }>}
 */
export const uploadBase64Image = async (base64Image, fileName = "upload.jpg") => {
  const res = await apiClient.post("/Upload/base64", {
    base64Image,
    fileName,
  });

  return res.data;
};
