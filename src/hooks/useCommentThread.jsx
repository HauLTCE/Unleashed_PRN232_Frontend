// src/hooks/useCommentThread.jsx
import { useEffect, useState, useCallback } from 'react';
import {
  addComment,
  updateComment,
  deleteComment,
  getCommentById,
  getCommentDescendants,
} from '@/services/CommentService';
import userService from '../services/userService';
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

  const attachUserInfoBatch = async (rootComment, descendants) => {
    // 1. Collect all unique userIds from root + descendants + nested childComments
    const userIds = new Set();

    const collectIds = (comment) => {
      if (!comment) return;
      userIds.add(comment.userId);
      comment.childComments?.forEach(collectIds);
    };

    collectIds(rootComment);
    descendants.forEach(collectIds);
    console.log(userIds)
    // 2. Fetch all user info at once
    const userInfos = await userService.getUserReviewInfos([...userIds]); // expects array

    // 3. Map userId -> info for quick lookup
    const userMap = Object.fromEntries(
      userInfos.map((u) => [u.userId, u])
    );

    // 4. Recursively attach user info
    const enrich = (comment) => {
      if (!comment) return comment;
      const userInfo = userMap[comment.userId];
      const enrichedComment = {
        ...comment,
        userFullname: userInfo?.userFullname || comment.userFullname,
        userImage: userInfo?.userImage || comment.userImage,
        childComments: comment.childComments?.map(enrich) || [],
      };
      return enrichedComment;
    };

    const enrichedRoot = enrich(rootComment);
    const enrichedDescendants = descendants.map(enrich);

    return { enrichedRoot, enrichedDescendants };
  };


  const loadThread = useCallback(async () => {
    if (!rootCommentId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch root comment and all descendants
      const [rootRes, descRes] = await Promise.all([
        getCommentById(rootCommentId),
        getCommentDescendants(rootCommentId),
      ]);

      const root = rootRes.data ?? rootRes;
      const descendantsData = descRes.data ?? descRes;

      // 2. Collect all unique userIds
      const userIds = new Set();
      const collectIds = (comment) => {
        if (!comment) return;
        userIds.add(comment.userId);
        comment.childComments?.forEach(collectIds);
      };

      collectIds(root);
      descendantsData.forEach(collectIds);

      // 3. Fetch all user info in one call
      const userInfos = await userService.getUserReviewInfos([...userIds]);
      const userMap = Object.fromEntries(userInfos.map((u) => [u.userId, u]));

      // 4. Recursively attach user info
      const enrich = (comment) => {
        if (!comment) return comment;
        const userInfo = userMap[comment.userId];
        return {
          ...comment,
          userFullname: userInfo?.userFullname || comment.userFullname,
          userImage: userInfo?.userImage || comment.userImage,
          childComments: comment.childComments?.map(enrich) || [],
        };
      };

      const enrichedRoot = enrich(root);
      const enrichedDescendants = descendantsData.map(enrich);

      setRootComment(enrichedRoot);
      setDescendants(enrichedDescendants);
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

  const addNewComment = useCallback(
    async (commentData) => {
      try {
        const res = await addComment(commentData);
        await loadThread(); // reload thread
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
    attachUserInfoBatch,
    addNewComment,
    editComment,
    removeComment,
  };
}
