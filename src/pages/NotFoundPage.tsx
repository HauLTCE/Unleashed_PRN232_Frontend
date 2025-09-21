import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

export function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for. 
          The page might have been moved, deleted, or you entered the wrong URL.
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
        <Button asChild size="lg">
          <Link to="/">Go Home</Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" asChild>
            <Link to="/shop">Browse Products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Popular Pages</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link to="/" className="text-primary hover:underline">Home</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/shop" className="text-primary hover:underline">Shop</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/about" className="text-primary hover:underline">About</Link>
          <span className="text-muted-foreground">•</span>
          <Link to="/contact" className="text-primary hover:underline">Contact</Link>
        </div>
      </div>
    </div>
  );
}