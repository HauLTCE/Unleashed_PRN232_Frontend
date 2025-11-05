import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Search, Eye, Download, Loader2 } from 'lucide-react';
// import { Order } from '../data/mockData'; // Không cần mock data nữa
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/Order/useOrders'; // Giả sử hook ở đường dẫn này

const ITEMS_PER_PAGE = 10;

const statusMap = {
  'all': null,
  'pending': 1,
  'processing': 2,
  'shipping': 3,
  'completed': 4,
  'cancelled': 5,
  'returned': 6,
  'denied': 7,
  'inspection': 8,
  'returning': 9,
};

export function OrdersPage() {
  // State từ hook
  const { orders, pagination, total, loading, error, fetchOrders } = useOrders();

  // State cục bộ cho filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  // 1. Effect để fetch dữ liệu khi filters hoặc page thay đổi
  React.useEffect(() => {
    const filters = {
      search: searchQuery || null,
      sort: null, // Thêm logic sort nếu cần
      statusId: statusMap[statusFilter],
    };

    // Gọi hàm fetch từ hook
    // Hook `useOrders` đã xử lý việc chuyển page 1-based (UI) sang 0-based (API)
    fetchOrders(currentPage, ITEMS_PER_PAGE, filters);

    // fetchOrders được bọc trong useCallback nên an toàn để thêm vào dependency
  }, [fetchOrders, currentPage, searchQuery, statusFilter]);

  // 2. Xóa logic filter/pagination phía client (useMemo, slice)

  // 3. Cập nhật trình xử lý filter để reset page
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset về trang 1 khi filter
  };

  // 4. CẬP NHẬT: helper badge để bao gồm các status mới
  const getStatusBadge = (status) => {
    // Thêm check an toàn
    const statusKey = status ? status.toLowerCase() : 'unknown';

    // CẬP NHẬT: Thêm variants cho status mới
    const variants = {
      pending: 'default',
      processing: 'default',
      shipping: 'default',
      completed: 'default',
      cancelled: 'destructive',
      returned: 'secondary',
      denied: 'destructive',
      inspection: 'default',
      returning: 'secondary',
      unknown: 'outline'
    };

    // CẬP NHẬT: Thêm màu cho status mới
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipping: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
      denied: 'bg-red-200 text-red-900',
      inspection: 'bg-purple-100 text-purple-800',
      returning: 'bg-gray-200 text-gray-900',
      unknown: 'bg-gray-100 text-gray-800'
    };

    const variantKey = variants[statusKey] ? statusKey : 'unknown';

    return (
      <Badge
        variant={variants[variantKey]}
        className={colors[variantKey]}
      >
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </Badge>
    );
  };

  // 5. Cập nhật Stats - chỉ giữ lại Total
  // (Các stats khác không thể tính từ 1 trang dữ liệu)
  const totalOrders = total; // Lấy từ hook

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">Track and manage customer orders</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Orders
          </Button>
        </div>

        {/* Stats Cards - Chỉ giữ lại Total Orders */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{loading ? '...' : totalOrders}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search orders or customers..."
                    value={searchQuery}
                    onChange={handleSearchChange} // Cập nhật
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}> {/* Cập nhật */}
                <SelectTrigger className="w-[180px]"> {/* Tăng nhẹ độ rộng cho vừa chữ */}
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                {/* CẬP NHẬT: Thêm tất cả status từ ảnh */}
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="returning">Returning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({total})</CardTitle> {/* Cập nhật */}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {/* CẬP NHẬT: Thêm width cho cột */}
                  <TableHead className="w-[20px]">Order ID</TableHead>
                  <TableHead className="w-[50px]">Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      <div className="flex justify-center items-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  // Map 'orders' (từ hook), không phải 'paginatedOrders'
                  orders.map((order) => ( // Dùng 'any' vì chưa định nghĩa type 'Order'
                    <TableRow key={order.orderId}> {/* Giả sử API trả về orderId */}
                      {/* CẬP NHẬT: Thêm class để truncate */}
                      <TableCell className="font-medium max-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {order.orderId}
                      </TableCell>
                      <TableCell>
                        <div>
                          {/* CẬP NHẬT: Thêm class để truncate */}
                          <div className="font-medium max-w-[50px] overflow-hidden text-ellipsis whitespace-nowrap">
                            ID: {order.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(order.orderStatusName)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {/* Cập nhật: (order.items || []) -> (order.orderVariationSingles || []) */}
                          {(order.orderVariationSingles || []).slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm">
                              {/* Giả sử item có quantity và productName */}
                              {item.quantity}x {item.productName || 'Item'}
                            </div>
                          ))}
                          {(order.orderVariationSingles || []).length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{(order.orderVariationSingles || []).length - 2} more items
                            </div>
                          )}
                          {/* Hiển thị nếu không có item */}
                          {(order.orderVariationSingles || []).length === 0 && (
                            <div className="text-xs text-muted-foreground">
                              No items
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {/* Cập nhật: order.totalAmount -> order.orderTotalAmount */}
                      <TableCell className="font-medium">{order.orderTotalAmount?.toFixed(2)}đ</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/orders/${order.orderId}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={!pagination.hasPrevious ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
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
    </AdminLayout>
  );
}