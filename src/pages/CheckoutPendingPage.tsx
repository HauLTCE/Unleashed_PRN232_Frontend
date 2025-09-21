import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Clock } from 'lucide-react';

export function CheckoutPendingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Card>
        <CardContent className="p-12">
          <Clock className="h-20 w-20 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Payment Pending</h1>
          <p className="text-muted-foreground mb-6">
            Your payment is being processed. This may take a few minutes. 
            You will receive a confirmation email once the payment is complete.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm">
              <strong>Order Number:</strong> #ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </p>
            <p className="text-sm">
              <strong>Status:</strong> Payment Processing
            </p>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/account?tab=orders">Check Order Status</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link to="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}