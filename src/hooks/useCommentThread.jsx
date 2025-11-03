// src/hooks/useCommentThread.jsx
import { useEffect, useState, useCallback } from 'react';
import {
  addComment,
  updateComment,
  deleteComment,
  getCommentById,
  getCommentDescendants,
} from '@/services/CommentsService'; 
// Sếp chỉnh lại path cho đúng nhé

/**
 * Quản lý một thread comment (1 comment gốc + toàn bộ descendants).
 * @param {number} rootCommentId - ID comment gốc
 */
export function useCommentThread(rootCommentId) {
  const [rootComment, setRootComment] = useState(null);
  const [descendants, setDescendants] = useState([]); // list replies & child comments
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadThread = useCallback(async () => {
    if (!rootCommentId) return;

    setLoading(true);
    setError(null);

    try {
      const [rootRes, descRes] = await Promise.all([
        getCommentById(rootCommentId),
        getCommentDescendants(rootCommentId),
      ]);

      setRootComment(rootRes.data ?? rootRes);
      setDescendants(descRes.data ?? descRes);
    } catch (err) {
      console.error('Failed to load comment thread', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [rootCommentId]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  // Thêm comment mới hoặc reply
  const addNewComment = useCallback(
    async (commentData) => {
      try {
        const res = await addComment(commentData);
        await loadThread(); // load lại thread
        return res;
      } catch (err) {
        console.error('Failed to add comment', err);
        throw err;
      }
    },
    [loadThread]
  );

  const editComment = useCallback(
    async (commentId, data) => {
      try {
        const res = await updateComment(commentId, data);
        await loadThread();
        return res;
      } catch (err) {
        console.error('Failed to update comment', err);
        throw err;
      }
    },
    [loadThread]
  );

  const removeComment = useCallback(
    async (commentId) => {
      try {
        const res = await deleteComment(commentId);
        await loadThread();
        return res;
      } catch (err) {
        console.error('Failed to delete comment', err);
        throw err;
      }
    },
    [loadThread]
  );

  return {
    rootComment,
    descendants,
    loading,
    error,
    reload: loadThread,
    addNewComment,
    editComment,
    removeComment,
  };
}
