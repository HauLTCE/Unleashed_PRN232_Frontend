import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Separator } from '../../components/ui/separator';
import { ArrowLeft, Package, Truck, CheckCircle, Loader2, XCircle } from 'lucide-react';
// Import hook useOrder
import { useOrder } from '../../hooks/Order/useOrder'; // Giả sử hook ở đường dẫn này
// Cập nhật: Import useUser
import { useUser } from '../../hooks/User/useUser'; // Tùy chọn: Dùng để lấy tên customer

export function OrderDetailPage() {
  const { id } = useParams();

  // 1. Sử dụng hook useOrder
  const { order, loading, error, cancelThisOrder, reviewThisOrder } = useOrder(id);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Cập nhật: Lấy thông tin người dùng
  // Chúng ta gọi hook useUser với order.userId, nhưng chỉ khi 'order' đã được load
  const { user: customer, loading: customerLoading } = useUser(order?.userId);

  // 2. Xử lý trạng thái Loading
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // 3. Xử lý trạng thái Error
  if (error || !order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">{error ? "Error Loading Order" : "Order Not Found"}</h1>
          <p className="text-muted-foreground mt-2">
            {error ? error : "The order you're looking for doesn't exist."}
          </p>
          <Button asChild className="mt-4">
            <Link to="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  // 4. Helper functions (đã chuyển sang JSX)
  const getStatusBadge = (status) => {
    const statusKey = status ? status.toLowerCase() : 'unknown';
    const variants = {
      pending: 'default',
      processing: 'default', // Thêm trạng thái
      shipping: 'default', // Thêm trạng thái
      completed: 'default',
      failed: 'destructive',
      returned: 'secondary',
      cancelled: 'destructive', // Thêm trạng thái
      denied: 'destructive', // Thêm trạng thái
      inspection: 'default', // Thêm trạng thái
      returning: 'secondary', // Thêm trạng thái
      unknown: 'outline'
    };

    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipping: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      denied: 'bg-red-100 text-red-800',
      inspection: 'bg-cyan-100 text-cyan-800',
      returning: 'bg-gray-100 text-gray-800',
      unknown: 'bg-gray-100 text-gray-800'
    };

    const key = variants[statusKey] ? statusKey : 'unknown';

    return (
      <Badge
        variant={variants[key]}
        className={colors[key]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status) => {
    const statusKey = status ? status.toLowerCase() : 'unknown';
    switch (statusKey) {
      case 'pending':
        return <Package className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipping':
        return <Truck className="h-4 w-4 text-purple-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'returned':
      case 'returning':
        return <Truck className="h-4 w-4 text-gray-500" />;
      case 'inspection':
        return <Package className="h-4 w-4 text-cyan-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  // 5. Tính toán giá trị (dựa trên API response)
  // Sửa: Đổi 'orderVariationSingles' thành 'orderVariations'
  const items = order.orderVariations || [];
  const subtotal = items.reduce((sum, item) => sum + (item.variationPriceAtPurchase * item.quantity), 0);
  const taxRate = order.orderTax || 0;
  const taxAmount = subtotal * taxRate;
  const total = order.orderTotalAmount || 0;
  // Tính toán phí ship (có thể không chính xác 100% nếu có discount)
  const shippingCost = total - subtotal - taxAmount;

  // 6. Xử lý sự kiện Actions
  const handleReview = async (isApproved) => {
    setIsSubmitting(true);
    await reviewThisOrder(isApproved);
    setIsSubmitting(false);
  };

  const handleCancel = async () => {
    // Tạm thời dùng window.confirm, nên thay bằng modal
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      setIsSubmitting(true);
      await cancelThisOrder();
      setIsSubmitting(false);
    }
  };

  // Logic hiển thị nút
  const isActionable = order.orderStatusName?.toLowerCase() === 'pending';
  const isCancelable = order.orderStatusName?.toLowerCase() === 'pending' || order.orderStatusName?.toLowerCase() === 'processing';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header (dùng data API) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/admin/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Order {order.orderId}</h1>
              <p className="text-muted-foreground">
                Placed on {new Date(order.orderDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusIcon(order.orderStatusName)}
            {getStatusBadge(order.orderStatusName)}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items (dùng data API) */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Sửa: 'items' (đã định nghĩa ở trên) */}
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            {/* Cần API trả về các trường này */}
                            <div className="font-medium">{item.productName || 'Product Name N/A'}</div>
                            <div className="text-sm text-muted-foreground">{item.variationName || `ID: ${item.variationSId}`}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.variationPriceAtPurchase.toFixed(2)}</TableCell>
                        <TableCell className="font-medium">
                          ${(item.variationPriceAtPurchase * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Order Timeline (Đơn giản hóa) */}
            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Order Placed</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {/* Bạn có thể thêm logic để hiển thị các mốc thời gian khác từ API */}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary (dùng data API) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customerLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                      <p className="text-base">{order.userId}</p>
                    </div>
                    {/* Cập nhật: Dùng hook useUser để hiển thị tên, email, phone */}
                    {customer && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          {/* Sửa từ customer.fullName thành customer.userFullname */}
                          <p className="text-base">{customer.userFullname || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-base">{customer.userEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-base">{customer.userPhone || 'N/A'}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address (dùng data API) */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="text-base">{order.orderBillingAddress || 'No address provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary (dùng data API) */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({taxRate * 100}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <Separator />
                _   <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span>{order.paymentMethodName}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span>{order.orderTransactionReference}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions (Sử dụng hook) */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isActionable && (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => handleReview(true)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Approve Order
                    </Button>
                    <Button
                      img className="w-full"
                      variant="destructive"
                      onClick={() => handleReview(false)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Reject Order
                    </Button>
                  </>
                )}

                {isCancelable && (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Cancel Order
                  </Button>
                )}

                {!isActionable && !isCancelable && (
                  <p className="text-sm text-muted-foreground text-center">
                    This order can no longer be modified.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

