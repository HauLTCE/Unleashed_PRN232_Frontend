import { useParams } from "react-router-dom";
import { useOrder } from "../hooks/Order/useOrder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export default function CustomerOrderDetailPage() {
    const { orderId } = useParams();
    const { order, loading, error, cancelThisOrder } = useOrder(orderId);

    const statusColor = {
        1: "bg-yellow-500",   // PENDING
        2: "bg-blue-500",     // PROCESSING
        3: "bg-indigo-500",   // SHIPPING
        4: "bg-green-600",    // COMPLETED
        5: "bg-gray-500",     // CANCELLED
        6: "bg-purple-500",   // RETURNED
        7: "bg-red-600",      // DENIED
        8: "bg-orange-500",   // INSPECTION
        9: "bg-blue-700",     // RETURNING
    };

    if (loading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-6 h-6" />
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 mt-10">{error}</p>;
    }

    if (!order) {
        return <p className="text-center mt-10">Order not found.</p>;
    }

    const subtotal = order.orderVariations?.reduce(
        (sum, item) => sum + item.quantity * item.variationPriceAtPurchase,
        0
    );

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Order #{order.orderTrackingNumber}</h1>
                    <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.orderDate).toLocaleString()}
                    </p>
                </div>

                <Badge className={statusColor[order.orderStatusId] || ""}>
                    {order.orderStatusName}
                </Badge>
            </div>

            {/* Order Items */}
            <div className="border rounded-lg p-4">
                <h2 className="font-semibold mb-3">Order Items</h2>

                {order.orderVariations?.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Variation ID</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {order.orderVariations.map((item) => (
                                <TableRow key={item.variationId}>
                                    <TableCell>{item.variationId}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>${item.variationPriceAtPurchase.toFixed(2)}</TableCell>
                                    <TableCell>
                                        ${(item.quantity * item.variationPriceAtPurchase).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No items found in this order.</p>
                )}
            </div>

            {/* Summary */}
            <div className="border rounded-lg p-4 space-y-2">
                <h2 className="font-semibold">Summary</h2>
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                    <span>Tax ({order.orderTax * 100}%)</span>
                    <span>${(subtotal * order.orderTax).toFixed(2)}</span>
                </div>

                <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${order.orderTotalAmount?.toFixed(2)}</span>
                </div>
            </div>

            {/* ✅ Only show cancel button if PENDING */}
            {order.orderStatusId === 1 && (
                <div className="flex pt-4">
                    <Button
                        onClick={cancelThisOrder}
                        className="bg-gray-500 hover:bg-gray-600"
                    >
                        Cancel Order
                    </Button>
                </div>
            )}
        </div>
    );
}
