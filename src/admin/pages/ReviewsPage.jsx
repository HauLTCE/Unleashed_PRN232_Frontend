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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : 'N/A';

const renderStars = (rating) => {
  if (!rating) return <span className="text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center">
      {[...Array(rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />)}
      {[...Array(5 - rating)].map((_, i) => <Star key={i} className="h-4 w-4 text-gray-300" />)}
    </div>
  );
};

// Review row component
const ReviewRow = ({ review, onOpenDetail }) => {
  const { product, loading: productLoading } = useProduct(review.productId);

  const variationImage =
    product?.variations?.[0]?.variationImage ||
    product?.mainImage ||
    review.variationImage ||
    "/placeholder.png";

  const productName =
    product?.productName || review.productName || "Unknown product";

  return (
    <TableRow className="cursor-pointer hover:bg-muted/40">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={review.userImage} alt={review.userFullname} />
            <AvatarFallback>{(review.userFullname || "U").charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{review.userFullname || "Anonymous"}</span>
        </div>
      </TableCell>

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

      <TableCell onClick={() => onOpenDetail(review)} className="cursor-pointer">
        {renderStars(review.reviewRating)}
      </TableCell>

      <TableCell>{formatDate(review.commentCreatedAt)}</TableCell>
    </TableRow>
  );
};

// Admin reply box inside modal
const AdminReplyBox = ({ reviewId, parentCommentId, addNewComment, onSent }) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleAddReply = async () => {
    if (!content.trim()) return;

    setSending(true);
    try {
      // Send reply with correct parentCommentId and reviewId
      await addNewComment({
        reviewId,           // review this comment belongs to
        parentCommentId,    // the comment being replied to
        commentContent: content,
      });

      setContent('');      // Reset textarea
      if (onSent) onSent(); // Optional callback to refresh UI
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
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:text-white transition-colors"
      >
        {sending ? 'Sending...' : 'Send Reply'}
      </Button>
    </div>
  );
};



export function ReviewsPage() {
  const { reviews, total, pagination, loading, error, fetchDashboardReviews } = useDashboardReviews();
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReview, setSelectedReview] = useState(null);

  // Use comment thread hook when a review is selected
  const { rootComment, descendants, loading: threadLoading, error: threadError, addNewComment } =
    useCommentThread(selectedReview?.commentId);

  useEffect(() => {
    fetchDashboardReviews(currentPage, ITEMS_PER_PAGE);
  }, [currentPage, fetchDashboardReviews]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customer Reviews</h1>
          <p className="text-muted-foreground">Monitor and manage all product reviews.</p>
        </div>

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
                  reviews.map((review) => (
                    <ReviewRow key={review.reviewId} review={review} onOpenDetail={setSelectedReview} />
                  ))
                )}
              </TableBody>
            </Table>

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
                  <p className="text-red-500">{threadError}</p>
                ) : (
                  <div className="space-y-2">
                    {/* Root Comment */}
                    <div className="pl-0">
                      <p className="font-medium">{rootComment?.userFullname || selectedReview.userFullname}</p>
                      <p className="text-sm text-muted-foreground">
                        {rootComment?.commentContent || selectedReview.reviewContent || "No comment found."}
                      </p>
                    </div>

                    {/* Child comments */}
                    {descendants.map((c) => (
                      <div key={c.commentId} className="pl-4 border-l ml-2 my-2 space-y-1">
                        <p className="font-medium">{c.userFullname}</p>
                        <p className="text-sm text-muted-foreground">{c.commentContent}</p>

                        {/* Nested replies if any */}
                        {c.childComments?.length > 0 && c.childComments.map((child) => (
                          <div key={child.commentId} className="pl-4 border-l ml-2 mt-1 space-y-1">
                            <p className="font-medium">{child.userFullname}</p>
                            <p className="text-sm text-muted-foreground">{child.commentContent}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>


              {/* Admin Reply Box */}
              <AdminReplyBox
                reviewId={selectedReview.reviewId}
                parentCommentId={rootComment?.commentId} // reply is attached to root comment
                addNewComment={addNewComment}           // from useCommentThread
                onSent={() => { } /* optional: can reload thread or close modal */}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>

    </AdminLayout >
  );
}
