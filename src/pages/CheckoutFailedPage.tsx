import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { XCircle } from 'lucide-react';

export function CheckoutFailedPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Card>
        <CardContent className="p-12">
          <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Payment Failed</h1>
          <p className="text-muted-foreground mb-6">
            We're sorry, but there was an issue processing your payment. 
            Please check your payment information and try again.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6">
            <p className="text-sm">
              Common reasons for payment failure:
            </p>
            <ul className="text-sm text-left mt-2 space-y-1">
              <li>• Insufficient funds</li>
              <li>• Incorrect card details</li>
              <li>• Card expired</li>
              <li>• Payment method not accepted</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/checkout">Try Again</Link>
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