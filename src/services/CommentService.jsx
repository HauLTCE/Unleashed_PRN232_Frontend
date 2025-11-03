import { apiClient } from './apiClient';

/**
 * Tạo mới một comment (hoặc reply).
 * @param {Object} commentData - dữ liệu comment: { reviewId, parentCommentId?, content }
 */
export const addComment = (commentData) => {
    return apiClient.post('/Comments', commentData);
};

/**
 * Cập nhật comment.
 * @param {number} commentId - ID của comment cần update
 * @param {Object} commentData - dữ liệu update: { content }
 */
export const updateComment = (commentId, commentData) => {
    return apiClient.put(`/Comments/${commentId}`, commentData);
};

/**
 * Xóa comment.
 * @param {number} commentId - ID của comment cần xóa
 */
export const deleteComment = (commentId) => {
    return apiClient.delete(`/Comments/${commentId}`);
};

/**
 * Lấy 1 comment cụ thể theo ID.
 * @param {number} commentId
 */
export const getCommentById = (commentId) => {
    return apiClient.get(`/Comments/${commentId}`);
};

/**
 * Lấy comment cha của 1 comment con.
 * @param {number} commentId
 */
export const getCommentParent = (commentId) => {
    return apiClient.get(`/Comments/${commentId}/parent`);
};

/**
 * Lấy toàn bộ replies (con cháu) của một comment.
 * @param {number} commentId
 */
export const getCommentDescendants = (commentId) => {
    return apiClient.get(`/Comments/${commentId}/descendants`);
};
