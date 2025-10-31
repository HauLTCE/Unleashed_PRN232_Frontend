import React, {useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Loader2, Star } from 'lucide-react';
import { useDashboardReviews } from '../../hooks/Review/useDashboardReviews';

const ITEMS_PER_PAGE = 10;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const renderStars = (rating) => {
  if (!rating) return <span className="text-muted-foreground">No rating</span>;
  return (
    <div className="flex items-center">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      ))}
      {[...Array(5 - rating)].map((_, i) => (
        <Star key={i} className="h-4 w-4 text-gray-300" />
      ))}
    </div>
  );
};

export function ReviewsPage() {
  const { reviews, total, pagination, loading, error, fetchDashboardReviews } = useDashboardReviews();
  const [currentPage, setCurrentPage] = useState(1);

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
                    <TableRow key={review.reviewId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.userImage} alt={review.userFullname} />
                            <AvatarFallback>{(review.userFullname || 'U').charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{review.userFullname || 'Anonymous'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                            <img src={review.variationImage} alt={review.productName} className="h-10 w-10 object-cover rounded-md"/>
                            <span>{review.productName}</span>
                         </div>
                      </TableCell>
                      <TableCell>{renderStars(review.reviewRating)}</TableCell>
                      <TableCell>{formatDate(review.commentCreatedAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={!pagination.hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                    {[...Array(pagination.totalPages).keys()].map((page) => (
                      <PaginationItem key={page + 1}>
                        <PaginationLink onClick={() => setCurrentPage(page + 1)} isActive={currentPage === page + 1} className="cursor-pointer">{page + 1}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))} className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}