import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

// Icons and Notifications
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDiscounts } from "../hooks/Discount/useDiscount";
import { useOrders } from "../hooks/Order/useOrders";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/User/useAuth";
import { useUser } from "../hooks/User/useUser";
// --- HOOKS TỪ CONTEXT ---
// ✅ Tích hợp hooks từ các file context bạn đã cung cấp

export function CheckoutPage() {
  const navigate = useNavigate();

  // --- LẤY STATE TỪ CÁC HOOKS ---
  const { cart, isLoading: isCartLoading, error: cartError, clearCart } = useCart();
  const { userId, isAuthenticated } = useAuth();
  const { user: userProfile, loading: isUserLoading, error: userError } = useUser(userId);
  const { createOrder, loading: isProcessingOrder } = useOrders();
  const { discounts: activeDiscounts, loading: discountLoading, error: discountError } = useDiscounts({
    statusId: 2, // Giả sử 1 = "active"
  });
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  // State cục bộ cho form
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '', address: '', city: '',
    state: '', zipCode: '', country: '', phone: '',
    paymentMethodId: 1, shippingMethodId: 2, specialInstructions: '',
  });

  // Tự động điền thông tin user đã biết vào form
  useEffect(() => {
    // Chỉ điền form khi có dữ liệu userProfile
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        email: userProfile.email || '',
        // Giả sử API trả về `userFullname` và `userPhone`
        firstName: userProfile.userFullname?.split(' ')[0] || '',
        lastName: userProfile.userFullname?.split(' ').slice(1).join(' ') || '',
        phone: userProfile.userPhone || '',
        // Bạn cũng có thể điền địa chỉ nếu API trả về
        // address: userProfile.address || '', 
      }));
    }
  }, [userProfile]);

  // "Làm phẳng" dữ liệu giỏ hàng để dễ tính toán và render
  const cartItems = useMemo(() => {
    if (!cart) return [];
    return cart.flatMap(group => group.items);
  }, [cart]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.variation.variationPrice * item.quantity, 0),
    [cartItems]
  );

  const shippingFee = formData.shippingMethodId === 1 ? 20000 : 0;
  const tax = subtotal * 0.05;

  const discountAmount = useMemo(() => {
    if (!selectedDiscount) return 0;
    if (selectedDiscount.discountType === "PERCENT") {
      return (subtotal * selectedDiscount.discountValue) / 100;
    }
    return selectedDiscount.discountValue; // nếu là loại "AMOUNT"
  }, [selectedDiscount, subtotal]);

  const total = subtotal + shippingFee + tax - discountAmount;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !userId) {
      toast.error("Please log in to complete your purchase.");
      navigate("/login");
      return;
    }

    const orderDto = {
      userId,
      orderStatusId: 1,
      paymentMethodId: formData.paymentMethodId,
      shippingMethodId: formData.shippingMethodId,
      orderTotalAmount: total,
      orderBillingAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`,
      orderNote: formData.specialInstructions || null,
      orderVariations: cartItems.map((item) => ({
        variationId: item.variation.id,
        quantity: item.quantity,
        variationPriceAtPurchase: item.variation.variationPrice,
      })),
      discountId: selectedDiscount?.discountId || null,
    };
    console.log('Final Order DTO to be sent:', JSON.stringify(orderDto, null, 2));
    try {
      const newOrder = await createOrder(orderDto);
      toast.success("Order placed successfully!");
      await clearCart();
      navigate(`/checkout/success/${newOrder.orderId}`);
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(`Failed to place order: ${error.message}`);
    }
  };

  // --- XỬ LÝ CÁC TRẠNG THÁI CỦA GIAO DIỆN ---
  if (isCartLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold text-red-600">Failed to load your cart</h2>
        <p className="text-muted-foreground mt-2">{cartError}</p>
        <Button onClick={() => navigate('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  // Điều hướng nếu giỏ hàng trống sau khi đã tải xong
  if (!isCartLoading && cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cột trái: Form thông tin */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Thông tin liên hệ & Giao hàng</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* ✅ 5. Xử lý trạng thái loading và error của `useUser` */}
              {isUserLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2">Đang tải thông tin của bạn...</span>
                </div>
              )}
              {userError && (
                <p className="text-red-600 text-center">{userError}</p>
              )}
              {/* Form chỉ hiển thị khi không loading và không có lỗi */}
              {!isUserLoading && !userError && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Tên</Label>
                      <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Họ</Label>
                      <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="address">Địa chỉ</Label>
                    <Input id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} required />
                  </div>
                  <div>
                    <Label>Phương thức giao hàng</Label>
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={1}
                          checked={formData.shippingMethodId === 1}
                          onChange={() => handleInputChange("shippingMethodId", 1)}
                        />
                        <span>Express (+20,000đ)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={2}
                          checked={formData.shippingMethodId === 2}
                          onChange={() => handleInputChange("shippingMethodId", 2)}
                        />
                        <span>Standard (Miễn phí)</span>
                      </label>
                    </div>
                  </div>
                  <Card>
                    <CardHeader><CardTitle>Chọn mã giảm giá</CardTitle></CardHeader>
                    <CardContent>
                      {discountLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2">Đang tải mã giảm giá...</span>
                        </div>
                      ) : discountError ? (
                        <p className="text-red-600">{discountError}</p>
                      ) : activeDiscounts.length === 0 ? (
                        <p className="text-muted-foreground">Hiện chưa có mã giảm giá nào.</p>
                      ) : (
                        <div className="space-y-3">
                          {activeDiscounts.map((discount) => (
                            <label
                              key={discount.discountId}
                              className={`flex justify-between items-center border rounded-xl p-3 cursor-pointer transition ${selectedDiscount?.discountId === discount.discountId
                                ? "border-primary bg-primary/10"
                                : "hover:bg-muted"
                                }`}
                            >
                              <div>
                                <p className="font-medium">{discount.discountCode}</p>
                                <p className="text-sm text-muted-foreground">
                                  {discount.discountTypeId === 1
                                    ? `Giảm ${discount.discountValue}%`
                                    : `Giảm ${discount.discountValue.toLocaleString()}đ`}
                                </p>
                              </div>
                              <input
                                type="radio"
                                name="discount"
                                checked={selectedDiscount?.discountId === discount.discountId}
                                onChange={() => setSelectedDiscount(discount)}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* ... các input khác cho city, state ... */}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Tóm tắt đơn hàng */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.variation.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">{(item.variation.variationPrice * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingFee === 0 ? "Free" : `${shippingFee.toLocaleString()}đ`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (5%)</span>
                  <span>{(subtotal * 0.05).toLocaleString()}đ</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{total.toLocaleString()}đ</span>
              </div>
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" size="lg" disabled={isProcessingOrder}>
            {isProcessingOrder ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              `Complete Order - ${total.toLocaleString()}đ`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}