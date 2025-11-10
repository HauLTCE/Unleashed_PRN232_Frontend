import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useOrder } from "../hooks/Order/useOrder";

export default function CustomerOrderDetailPage() {
    const { orderId } = useParams();
    // Add confirmReceivedOrder from the hook
    const { order, loading, error, cancelThisOrder, confirmReceivedOrder } = useOrder(orderId);
    // Add state to manage button loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle loading and error states
    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 mt-10">{error}</p>;
    }

    if (!order) {
        return <p className="text-center mt-10">Order not found.</p>;
    }

    // --- CALCULATION LOGIC SYNCED FROM ADMIN PAGE ---
    const items = order.orderVariations || [];
    const subtotal = items.reduce((sum, item) => sum + (item.variationPriceAtPurchase * item.quantity), 0);
    const taxRate = order.orderTax || 0;
    const total = order.orderTotalAmount || 0;
    const shippingFee = order.shippingMethodName?.toUpperCase() === 'STANDARD' ? 0 : 20; // Assuming $20 for non-standard shipping
    const totalBeforeShipping = total - shippingFee;
    const subtotalAfterDiscount = totalBeforeShipping / (1 + taxRate);
    const discountAmount = subtotal - subtotalAfterDiscount;
    const taxAmount = subtotalAfterDiscount * taxRate;

    // --- STATUS DISPLAY HELPER (FROM ADMIN PAGE) ---
    const getStatusBadge = (status) => {
        const statusKey = status ? status.toLowerCase() : 'unknown';
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
        return <Badge className={colors[statusKey] || colors['unknown']}>{status}</Badge>;
    };

    // Button handlers
    const handleConfirm = async () => {
        if (window.confirm('Are you sure you have received this order?')) {
            setIsSubmitting(true);
            await confirmReceivedOrder();
            setIsSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            setIsSubmitting(true);
            await cancelThisOrder();
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Order ID: <span className="font-medium text-primary">{order.orderTrackingNumber}</span>
                        <span className="mx-2">|</span>
                        Placed on: {new Date(order.orderDate).toLocaleDateString('en-US')}
                    </p>
                </div>
                {getStatusBadge(order.orderStatusName)}
            </div>

            {/* Order Items */}
            <div className="border rounded-lg">
                <div className="p-4">
                    <h2 className="font-semibold">Order Items</h2>
                </div>
                {items.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.variationId}>
                                    <TableCell>
                                        <p className="font-medium">{item.productName || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">{item.variationName || `ID: ${item.variationId}`}</p>
                                    </TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">${item.variationPriceAtPurchase.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        ${(item.quantity * item.variationPriceAtPurchase).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="p-4 text-sm text-muted-foreground">No items in this order.</p>
                )}
            </div>

            {/* Payment Summary */}
            <div className="border rounded-lg p-4 space-y-3">
                <h2 className="font-semibold">Payment Summary</h2>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0.01 && (
                    <div className="flex justify-between text-green-600">
                        <span className="text-muted-foreground">Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingFee > 0 ? `$${shippingFee.toFixed(2)}` : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span>${taxAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-start pt-4">
                {/* Only show Cancel button if status is PENDING */}
                {order.orderStatusName?.toLowerCase() === 'pending' && (
                    <Button onClick={handleCancel} variant="outline" className="bg-gray-500 hover:bg-gray-600" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Cancel Order
                    </Button>
                )}

                {/* Only show Confirm button if status is SHIPPING */}
                {order.orderStatusName?.trim().toLowerCase() === 'shipping' && (
                    <Button onClick={handleConfirm} variant="outline" className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Receipt
                    </Button>
                )}
            </div>
        </div>
    );
}