import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";
import { orderService } from "../services/orderService"; // mock service

export function CheckoutPage() {
  const navigate = useNavigate();
  const isAuthenticated = true;

  const getCartTotal = () => {
    return cart.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const clearCart = () => setCart([]);

  // 🧠 Tính toán tổng tiền
  const cartItems = cart
    .map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      return product ? { ...cartItem, product } : null;
    })
    .filter(Boolean);

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [formData, setFormData] = useState({
    email: user.email,
    firstName: "John",
    lastName: "Doe",
    address: "123 Main Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "US",
    phone: "555-1234",
    paymentMethod: "card",
    cardNumber: "4111 1111 1111 1111",
    expiryDate: "12/26",
    cvv: "123",
    nameOnCard: "John Doe",
    deliveryMethod: "standard",
    discountCode: "",
    specialInstructions: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 🧾 Submit mock order
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!isAuthenticated) {
      toast.error("Please log in to complete your purchase");
      setIsProcessing(false);
      navigate("/login");
      return;
    }

    try {
      const orderDto = {
        userId: user?.id || null,
        orderStatusId: 1,
        paymentMethodId: formData.paymentMethod === "paypal" ? 2 : 1,
        shippingMethodId: formData.deliveryMethod === "express" ? 2 : 1,
        discountId:
          formData.discountCode.toLowerCase() === "welcome10" ? 1 : null,
        orderTotalAmount: total,
        orderBillingAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
        orderNote: formData.specialInstructions || null,
        orderVariations: cartItems.map((item) => ({
          productVariationId: item.productId,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      };

      const res = await orderService.createOrder(orderDto);
      console.log("🟢 Mock Order created:", res);

      clearCart();
      toast.success("✅ Order placed successfully!");
      navigate("/checkout/success");
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error("❌ Failed to complete your order.");
      navigate("/checkout/failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const applyDiscountCode = () => {
    if (formData.discountCode.toLowerCase() === "welcome10") {
      toast.success("Discount applied! 10% off");
    } else {
      toast.error("Invalid discount code");
    }
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange("email", e.target.value)
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : `Complete Order - $${total.toFixed(2)}`}
            </Button>
          </form>
        </div>

        {/* Right side order summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <div>
                    <p>{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} | {item.color} | Size {item.size}
                    </p>
                  </div>
                  <p>${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
