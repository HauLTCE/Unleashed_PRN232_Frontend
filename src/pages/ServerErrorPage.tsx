import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, RefreshCw } from 'lucide-react';

export function ServerErrorPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-muted-foreground">500</h1>
        <h2 className="text-3xl font-bold mb-4">Server Error</h2>
        <p className="text-muted-foreground mb-8">
          Oops! Something went wrong on our end. We're working to fix this issue. 
          Please try again in a few minutes.
        </p>
      </div>

      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex space-x-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="space-y-4">
        <Button onClick={handleRefresh} size="lg">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/">Go Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">What you can do:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Refresh the page</li>
          <li>• Check your internet connection</li>
          <li>• Try again in a few minutes</li>
          <li>• Contact our support team if the problem persists</li>
        </ul>
      </div>
    </div>
  );
}