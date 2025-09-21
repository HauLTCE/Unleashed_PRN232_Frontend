import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle } from 'lucide-react';

export function CheckoutSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Card>
        <CardContent className="p-12">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase! Your order has been successfully placed and 
            you will receive a confirmation email shortly.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm">
              <strong>Order Number:</strong> #ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
            <p className="text-sm">
              <strong>Estimated Delivery:</strong> 5-7 business days
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/account?tab=orders">View Order Status</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}