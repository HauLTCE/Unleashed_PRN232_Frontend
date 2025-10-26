import React, { useEffect } from 'react';
import { AdminLayout } from '../../admin/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Search, Bell, X, Loader2 } from 'lucide-react';
import { useNotifications } from '../../hooks/Notification/useNotifications';

const ITEMS_PER_PAGE = 10;

// Helper functions moved outside component for better readability
// Removed getTypeIcon and getTypeBadge as 'Type' is being removed

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (e) {
    return "Invalid date";
  }
};


export function NotificationsPage() {
  // Use the hook to get data and functions
  const {
    total,
    notifications,
    pagination,
    loading,
    error,
    fetchNotifications,
    updateNotification, // This is no longer used but kept if needed later
    removeNotification
  } = useNotifications();

  // Local state for UI controls
  const [searchQuery, setSearchQuery] = React.useState('');
  // Add back a filter for draft status
  const [draftFilter, setDraftFilter] = React.useState('all');
  // This state now drives *which page to request*
  const [currentPage, setCurrentPage] = React.useState(1);

  // This useEffect hook now triggers API calls when filters or page change
  useEffect(() => {
    const filters = {
      searchQuery: searchQuery || null,
      // Pass draft status filter. Assumes hook/backend can handle `isDraft`
      // 'all' -> null, 'draft' -> true, 'published' -> false
      isDraft: draftFilter === 'all' ? null : (draftFilter === 'draft')
    };
    fetchNotifications(currentPage, ITEMS_PER_PAGE, filters);
  }, [currentPage, searchQuery, draftFilter, fetchNotifications]);

  // Helper function to manually refetch data after an update
  const refetchData = () => {
    const filters = {
      searchQuery: searchQuery || null,
      isDraft: draftFilter === 'all' ? null : (draftFilter === 'draft')
    };
    fetchNotifications(currentPage, ITEMS_PER_PAGE, filters);
  };

  // Removed handleMarkAsRead and handleMarkAsUnread

  const handleDeleteNotification = async (id) => {
    // Using a custom modal/dialog is better than window.confirm
    // but window.confirm is used here as per the original code.
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await removeNotification(id);
        // After deletion, refetch to update the list
        refetchData();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };


  // Handle initial loading state
  if (loading && !notifications.length) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-lg">Loading notifications...</span>
        </div>
      </AdminLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-md p-4">
          <X className="h-8 w-8 text-red-600" />
          <span className="ml-2 text-lg text-red-700">Error: {error.message}</span>
        </div>
      </AdminLayout>
    );
  }


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Manage Notifications</h1>
            <p className="text-gray-500">Stay updated with system alerts and important events</p>
          </div>

          {/* "Mark All as Read" button removed as it's not in the hook */}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            {/* Add back Status filter */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to page 1 on search
                    }}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
              {/* Status Filter for Draft/Published */}
              <Select
                value={draftFilter}
                onValueChange={(value) => {
                  setDraftFilter(value);
                  setCurrentPage(1); // Reset page on filter change
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            {/* Use totalCount from pagination for the master count */}
            <CardTitle>Total Notifications ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* Removed Type column */}
                    <TableHead>Title</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Show loading spinner inside table body */}
                  {loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                          <span className="ml-2">Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Show empty state if not loading and no notifications */}
                  {!loading && total === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No notifications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Map over the 'notifications' array directly from the hook
                    !loading && notifications.map((notification) => (
                      <TableRow
                        key={notification.notificationId} // Use notificationId from DTO
                        // Highlight if not a draft
                        className={!notification.isNotificationDraft ? 'bg-blue-50' : ''}
                      >
                        {/* Removed Type cell */}
                        <TableCell>
                          {/* Use notificationTitle and isNotificationDraft */}
                          <div className={`font-medium ${!notification.isNotificationDraft ? 'font-semibold' : ''}`}>
                            {notification.notificationTitle}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* Use notificationContent */}
                          <div className="max-w-md truncate text-sm text-gray-500">
                            {notification.notificationContent}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {/* Use notificationCreatedAt */}
                          {formatDate(notification.notificationCreatedAt)}
                        </TableCell>
                        <TableCell>
                          {/* Use `isNotificationDraft` property */}
                          <Badge variant={notification.isNotificationDraft ? 'secondary' : 'default'}>
                            {notification.isNotificationDraft ? 'Draft' : 'Published'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {/* Removed Mark as Read/Unread buttons */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.notificationId)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination - now driven by the hook's pagination state */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(pagination.currentPage - 1)}
                        className={!pagination.hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        disabled={!pagination.hasPrevious || loading}
                      />
                    </PaginationItem>

                    {/* Create page number links */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={pagination.currentPage === page}
                          className="cursor-pointer"
                          disabled={loading}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(pagination.currentPage + 1)}
                        className={!pagination.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        disabled={!pagination.hasNext || loading}
                      />
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

// Add a default export for environments that need it
export default NotificationsPage;

