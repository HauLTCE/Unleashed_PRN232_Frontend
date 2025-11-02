import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useCart } from '../hooks/useCart'; // <-- Thay thế useApp bằng useCart

// Tiện ích định dạng tiền tệ (giống như trong Homepage)
const formatVND = (value) => {
  if (value == null) return 'N/A';
  try {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  } catch {
    return `${value.toLocaleString('vi-VN')} ₫`;
  }
};

const fallbackImg = (seed) => `https://picsum.photos/seed/${seed}/200/200`;

export function CartPage() {
  // Sử dụng hook useCart mới
  const { cart, isLoading, error, addItemToCart, removeItemFromCart, clearCart } = useCart();

  // cart.items giờ là nguồn dữ liệu chính
  const cartItems = cart?.items || [];

  // Tính toán tổng tiền bằng useMemo để tối ưu hóa
  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  }, [cartItems]);

  // Các tính toán khác vẫn giữ nguyên
  const shipping = subtotal > 2000000 ? 0 : 30000; // Ví dụ: free ship trên 2,000,000₫
  const tax = subtotal * 0.08; // 8% thuế
  const total = subtotal + shipping + tax;

  // Hàm cập nhật số lượng - gọi addItemToCart
  const handleQuantityChange = async (variationId, newQuantity) => {
    if (newQuantity < 1) {
      // Nếu số lượng < 1, coi như xóa sản phẩm
      await handleRemoveItem(variationId);
    } else {
      // Backend sẽ xử lý việc cập nhật số lượng khi gọi lại addToCart
      const success = await addItemToCart(variationId, newQuantity);
      if (success) {
        toast.success('Cart updated successfully');
      } else {
        toast.error('Failed to update cart');
      }
    }
  };

  // Hàm xóa một item
  const handleRemoveItem = async (variationId) => {
    const success = await removeItemFromCart(variationId);
    if (success) {
      toast.success('Item removed from cart');
    } else {
      toast.error('Failed to remove item');
    }
  };

  // Hàm xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    const success = await clearCart();
    if (success) {
      toast.success('Cart cleared');
    } else {
      toast.error('Failed to clear cart');
    }
  };

  // Trạng thái Loading ban đầu
  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold">Loading your cart...</h1>
      </div>
    );
  }

  // Trạng thái Lỗi
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-destructive">
        <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Trạng thái giỏ hàng rỗng
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild size="lg">
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="outline" onClick={handleClearCart} disabled={isLoading}>
          {isLoading ? 'Clearing...' : 'Clear Cart'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.variation.variationId}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <ImageWithFallback
                      src={item.variation.variationImage || fallbackImg(item.variation.productId)}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/product/${item.variation.productId}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {item.productName}
                        </Link>
                        {/* Hiển thị các thuộc tính từ DTO */}
                        <div className="text-sm text-muted-foreground mt-1">
                          {item.variation.attributes?.map(attr => `${attr.attributeName}: ${attr.attributeValue}`).join(' • ')}
                        </div>
                        <div className="font-semibold mt-2">
                          {formatVND(item.finalPrice)}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.variation.variationId)}
                        disabled={isLoading}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.variation.variationId, item.quantity - 1)}
                          disabled={isLoading}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.variation.variationId, item.quantity + 1)}
                          disabled={isLoading || item.quantity >= item.stockQuantity} // Vô hiệu hóa nếu vượt quá tồn kho
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="font-semibold">
                        {formatVND(item.finalPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>{formatVND(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatVND(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatVND(tax)}</span>
                </div>

                {subtotal < 2000000 && (
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    Add {formatVND(2000000 - subtotal)} more for free shipping!
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>{formatVND(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/shop">
                    Continue Shopping
                  </Link>
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}