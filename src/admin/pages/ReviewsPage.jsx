import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Loader2, Star } from 'lucide-react';
import { useDashboardReviews } from '../../hooks/Review/useDashboardReviews';
import { useProduct } from '../../hooks/useProduct';
import { useCommentThread } from '../../hooks/useCommentThread';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

// --- Constants ---
const ITEMS_PER_PAGE = 10;

// --- Helper Functions ---

/**
 * Formats an ISO date string into a more readable local date.
 */
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

/**
 * Renders a 5-star rating display.
 */
const renderStars = (rating) => {
  if (!rating) return <span className="text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center">
      {/* Render filled stars */}
      {[...Array(rating)].map((_, i) => <Star key={`filled-${i}`} className="h-4 w-4 text-yellow-500 fill-yellow-500" />)}
      {/* Render empty stars */}
      {[...Array(5 - rating)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)}
    </div>
  );
};

// --- Child Components ---

/**
 * Represents a single row in the reviews table.
 */
const ReviewRow = ({ review, onOpenDetail }) => {
  // Fetch product details for the review
  const { product, loading: productLoading } = useProduct(review.productId);

  // Determine the best image to show (variation, main, or placeholder)
  const variationImage =
    product?.variations?.[0]?.variationImage ||
    product?.mainImage ||
    review.variationImage ||
    "/placeholder.png";

  const productName =
    product?.productName || review.productName || "Unknown product";

  return (
    // ADDED: The onClick handler is now on the entire row.
    <TableRow
      className="cursor-pointer hover:bg-muted/40"
      onClick={() => onOpenDetail(review)}
    >
      {/* Customer Cell */}
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.userImage} alt={review.userFullname} />
            <AvatarFallback>{(review.userFullname || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{review.userFullname || "Anonymous"}</span>
        </div>
      </TableCell>

      {/* Product Cell */}
      <TableCell>
        {productLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={variationImage}
              alt={productName}
              className="h-10 w-10 object-cover rounded-md"
            />
            <span>{productName}</span>
          </div>
        )}
      </TableCell>

      {/* Rating Cell */}
      {/* REMOVED: The onClick handler and cursor-pointer class were removed from this cell. */}
      <TableCell>
        {renderStars(review.reviewRating)}
      </TableCell>

      {/* Date Cell */}
      <TableCell>{formatDate(review.commentCreatedAt)}</TableCell>
    </TableRow>
  );
};

/**
 * A form for admins to reply to a review from within the modal.
 */
const AdminReplyBox = ({ reviewId, parentCommentId, addNewComment, onSent }) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  // Handle submitting the reply
  const handleAddReply = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      await addNewComment({
        reviewId,
        parentCommentId,
        commentContent: content,
      });
      setContent('');
      if (onSent) onSent(); // Trigger a reload of the comment thread
    } catch (err) {
      console.error('Failed to send reply', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <p className="font-semibold mb-2">Reply to this comment:</p>
      <textarea
        className="w-full border rounded-md p-2 text-sm"
        placeholder="Write your reply..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Button
        onClick={handleAddReply}
        disabled={sending || !content.trim()}
        className="mt-2 px-4 py-2 bg-blue-600 text-black rounded-md disabled:opacity-50 hover:text-white transition-colors"
      >
        {sending ? 'Sending...' : 'Send Reply'}
      </Button>
    </div>
  );
};

/**
 * Displays a single comment and its replies (children) recursively.
 * Includes logic for editing and deleting.
 */
const CommentItem = ({ comment, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.commentContent);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false); // State for delete confirmation

  // Handle saving an edited comment
  const handleSave = async () => {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await onEdit(comment.commentId, { commentContent: editContent });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save comment', err);
    } finally {
      setSaving(false);
    }
  };

  // Handle deleting a comment
  const handleDelete = async () => {
    try {
      await onDelete(comment.commentId);
      setConfirmDelete(false); // Close confirmation on success
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  return (
    <div className="pl-4 border-l ml-2 my-2 space-y-1">
      <div className="flex justify-between items-start">
        {/* Comment Content */}
        <div className="flex-1">
          <p className="font-medium">{comment.userFullname}</p>
          {isEditing ? (
            <textarea
              className="w-full border rounded-md p-1 text-sm mt-1"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={2}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{comment.commentContent}</p>
          )}
        </div>

        {/* Action Buttons (Edit/Delete/Save/Cancel) */}
        <div className="flex gap-2">
          {isEditing ? (
            // Edit/Save buttons
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          ) : confirmDelete ? (
            // Delete confirmation buttons
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
              >
                Confirm
              </Button>
            </>
          ) : (
            // Default Edit/Delete buttons
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmDelete(true)} // Show confirmation
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Render child comments recursively */}
      {comment.childComments?.length > 0 &&
        comment.childComments.map((child) => (
          <CommentItem
            key={child.commentId}
            comment={child}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </div>
  );
};


// --- Main Page Component ---

export function ReviewsPage() {
  // State for review list and pagination
  const { reviews, total, pagination, loading, error, fetchDashboardReviews } = useDashboardReviews();
  const [currentPage, setCurrentPage] = useState(1);
  // State for the modal
  const [selectedReview, setSelectedReview] = useState(null);

  // State for the comment thread inside the modal
  const {
    rootComment,
    descendants,
    loading: threadLoading,
    error: threadError,
    addNewComment,
    editComment: editCommentThread,
    removeComment: removeCommentThread,
    reload: reloadThread,
  } = useCommentThread(selectedReview?.commentId); // Hook depends on the selected review

  // Fetch reviews when the page changes
  useEffect(() => {
    fetchDashboardReviews(currentPage, ITEMS_PER_PAGE);
  }, [currentPage, fetchDashboardReviews]);

  // Wrapper function to edit a comment and reload the thread
  const handleEditComment = async (commentId, data) => {
    try {
      await editCommentThread(commentId, data);
      await reloadThread();
    } catch (err) {
      console.error('Failed to edit comment in modal', err);
    }
  };

  // Wrapper function to delete a comment and reload the thread
  const handleDeleteComment = async (commentId) => {
    try {
      await removeCommentThread(commentId);
      await reloadThread();
    } catch (err) {
      console.error('Failed to delete comment in modal', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Customer Reviews</h1>
          <p className="text-muted-foreground">Monitor and manage all product reviews.</p>
        </div>

        {/* Reviews Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Reviews ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-destructive">
                      Error: {error}
                    </TableCell>
                  </TableRow>
                ) : !reviews?.length ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No reviews found.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Render all review rows
                  reviews.map((review) => (
                    <ReviewRow
                      key={review.reviewId}
                      review={review}
                      onOpenDetail={setSelectedReview} // Pass the state setter to the row
                    />
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className={!pagination.hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {[...Array(pagination.totalPages).keys()].map((page) => (
                      <PaginationItem key={page + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page + 1)}
                          isActive={currentPage === page + 1}
                          className="cursor-pointer"
                        >
                          {page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rating Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Detail</DialogTitle>
          </DialogHeader>

          {selectedReview ? (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedReview.userImage} alt={selectedReview.userFullname} />
                  <AvatarFallback>{(selectedReview.userFullname || "U").charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedReview.userFullname}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedReview.commentCreatedAt)}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="font-semibold">Rating:</p>
                {renderStars(selectedReview.reviewRating)}
              </div>

              {/* Comment Thread */}
              <div>
                <p className="font-semibold">Comment:</p>
                {threadLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : threadError ? (
                  <p className="text-red-500">{threadError?.message || String(threadError)}</p>

                ) : (
                  <div className="space-y-2">
                    {/* Root Comment (the review itself) */}
                    <div className="pl-0">
                      <p className="font-medium">{rootComment?.userFullname || selectedReview.userFullname}</p>
                      <p className="text-sm text-muted-foreground">
                        {rootComment?.commentContent || selectedReview.reviewContent || "No comment found."}
                      </p>
                    </div>

                    {/* Logic to find and display the admin's most recent reply for editing */}
                    {(() => {
                      const authUser = JSON.parse(localStorage.getItem('authUser'));
                      if (!authUser) return null;

                      // Helper to find the newest comment by the current admin user
                      const getNewestUserComment = (comments, userId) => {
                        let newest = null;

                        const traverse = (commentList) => {
                          if (!commentList?.length) return;

                          commentList.forEach((c) => {
                            if (c.userId === userId) {
                              if (!newest || new Date(c.commentCreatedAt) > new Date(newMest.commentCreatedAt)) {
                                newest = c;
                              }
                            }
                            traverse(c.childComments);
                          });
                        };

                        traverse(comments);
                        return newest;
                      };

                      const newestUserComment = getNewestUserComment(descendants, authUser);

                      // If a comment from the admin exists, render it with edit/delete controls
                      return newestUserComment ? (
                        <CommentItem
                          key={newestUserComment.commentId}
                          comment={newestUserComment}
                          onEdit={handleEditComment}
                          onDelete={handleDeleteComment}
                        />
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              {/* Admin Reply Box */}
              <AdminReplyBox
                reviewId={selectedReview.reviewId}
                parentCommentId={rootComment?.commentId}
                addNewComment={addNewComment}
                onSent={reloadThread} // Reload thread after sending a new reply
              />
            </div>
          ) : (
            // Loading state for the modal content
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}