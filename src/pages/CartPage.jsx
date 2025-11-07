import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useCart } from '../hooks/useCart';

// Tiện ích định dạng tiền tệ (giữ nguyên)
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
  // Lấy hàm updateItemQuantityInCart mới từ hook
  const { cart, isLoading, error, updateItemQuantityInCart, removeItemFromCart, clearCart } = useCart();

  // "Làm phẳng" (flatten) dữ liệu giỏ hàng để tính toán
  const allCartItems = useMemo(() => {
    if (!cart) return [];
    return cart.flatMap(group => group.items);
  }, [cart]);

  // Tính toán tổng tiền dựa trên mảng đã được làm phẳng
  const subtotal = useMemo(() => {
    return allCartItems.reduce((total, item) => total + (item.variation.variationPrice * item.quantity), 0);
  }, [allCartItems]);

  const shipping = subtotal > 200000 ? 0 : 30000;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  /**
   * Hàm xử lý cập nhật số lượng (tăng và giảm).
   * Sử dụng hàm `updateItemQuantityInCart` chuyên dụng.
   */
  const handleQuantityChange = async (variationId, newQuantity) => {
    const result = await updateItemQuantityInCart(variationId, newQuantity);

    // Chỉ hiển thị toast khi có lỗi, vì giao diện đã tự cập nhật rồi
    if (!result.success) {
      toast.error(result.message);
    }
  };

  /**
   * Hàm xóa một sản phẩm khỏi giỏ hàng.
   */
  const handleRemoveItem = async (variationId) => {
    const result = await removeItemFromCart(variationId);
    if (result.success) {
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } else {
      toast.error(result.message);
    }
  };

  /**
   * Hàm xóa toàn bộ giỏ hàng.
   */
  const handleClearCart = async () => {
    const result = await clearCart();
    if (result.success) {
      toast.success('Đã xóa tất cả sản phẩm');
    } else {
      toast.error(result.message);
    }
  };

  // ---- RENDER LOGIC ----

  if (isLoading && !cart) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold">Đang tải giỏ hàng...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-destructive">
        <h1 className="text-3xl font-bold mb-4">Đã có lỗi xảy ra</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (allCartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
        <p className="text-muted-foreground mb-8">
          Hãy bắt đầu mua sắm và thêm sản phẩm vào đây nhé.
        </p>
        <Button asChild size="lg">
          <Link to="/shop">Bắt đầu mua sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Giỏ Hàng</h1>
        <Button variant="outline" onClick={handleClearCart} disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Xóa tất cả'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((group) => (
            <div key={group.productName}>
              <h2 className="text-xl font-semibold mb-4">{group.productName}</h2>
              <div className="space-y-4">
                {group.items.map((item) => (
                  <Card key={item.variation.id}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={item.variation.variationImage || fallbackImg(item.variation.id)}
                            alt={group.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-sm text-muted-foreground">
                                <span>Màu: {item.variation.colorName}</span>
                                <span className="mx-2">•</span>
                                <span>Kích cỡ: {item.variation.sizeName}</span>
                              </div>
                              <div className="font-semibold mt-2 text-lg">
                                {formatVND(item.variation.variationPrice)}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.variation.id)}
                              disabled={isLoading}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              {/* Nút giảm số lượng */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.variation.id, item.quantity - 1)}
                                disabled={isLoading}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium w-10 text-center text-base">{item.quantity}</span>
                              {/* Nút tăng số lượng */}
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(item.variation.id, item.quantity + 1)}
                                disabled={isLoading || item.quantity >= item.stockQuantity}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              {item.quantity >= item.stockQuantity && (
                                <p className="text-xs text-destructive ml-2">Đã đạt tồn kho tối đa</p>
                              )}
                            </div>
                            <div className="font-bold text-lg">
                              {formatVND(item.variation.variationPrice * item.quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Tóm Tắt Đơn Hàng</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Tạm tính ({allCartItems.length} sản phẩm)</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Miễn phí</span> : formatVND(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Thuế (5%)</span>
                  <span>{formatVND(tax)}</span>
                </div>
                {subtotal > 0 && subtotal < 200000 && (
                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    Mua thêm {formatVND(200000 - subtotal)} để được miễn phí vận chuyển!
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Tổng Cộng</span>
                    <span>{formatVND(total)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <Button asChild className="w-full" size="lg">
                  <Link to="/checkout">Tiến hành thanh toán</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/shop">Tiếp tục mua sắm</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}