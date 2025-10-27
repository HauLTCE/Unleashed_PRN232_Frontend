import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../admin/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Search, Bell, X, Loader2, Plus, Eye } from 'lucide-react'; // <-- ADDED: 'Plus' icon
import { useNotifications } from '../../hooks/Notification/useNotifications';

const ITEMS_PER_PAGE = 10;

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
    removeNotification
  } = useNotifications();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [draftFilter, setDraftFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  useEffect(() => {
    const filters = {
      searchQuery: searchQuery || null,
      isDraft: draftFilter === 'all' ? null : (draftFilter === 'draft')
    };
    fetchNotifications(currentPage, ITEMS_PER_PAGE, filters);
  }, [currentPage, searchQuery, draftFilter, fetchNotifications]);

  const refetchData = () => {
    const filters = {
      searchQuery: searchQuery || null,
      isDraft: draftFilter === 'all' ? null : (draftFilter === 'draft')
    };
    fetchNotifications(currentPage, ITEMS_PER_PAGE, filters);
  };

  const handleDeleteNotification = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        await removeNotification(id);
        refetchData();
      } catch (err) {
        console.error("Failed to delete:", err);
      }
    }
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Manage Notifications</h1>
            <p className="text-gray-500">Stay updated with system alerts and important events</p>
          </div>

          <Link to="/admin/notifications/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </Link>

        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={draftFilter}
                onValueChange={(value) => {
                  setDraftFilter(value);
                  setCurrentPage(1);
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

        <Card>
          <CardHeader>
            <CardTitle>Total Notifications ({total})</CardTitle>
          </CardHeader>
          <CardContent>

            {error ? (
              <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-md p-4">
                <X className="h-8 w-8 text-red-600" />
                <span className="ml-2 mt-2 text-lg text-red-700">Error: {error.message}</span>
                <p className="text-sm text-red-600 mt-1">Please try again later.</p>
              </div>
            ) : (
              // If NO error, render the table and pagination
              <>
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
                      {/* This now handles BOTH initial load and subsequent loads */}
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
                        // Only render if NOT loading
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

                                {/* Action 1: View/Edit Link */}
                                <Link to={`/admin/notifications/${notification.notificationId}`}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="View/Edit"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>

                                {/* Action 2: Delete Button */}
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
              </>
            )}

          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
export default NotificationsPage;