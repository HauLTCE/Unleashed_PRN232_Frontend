import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Lock } from 'lucide-react';

export function ForbiddenPage() {
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
        <Lock className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">403</h1>
        <h2 className="text-3xl font-bold mb-4">Access Forbidden</h2>
        <p className="text-muted-foreground mb-8">
          You don't have permission to access this page. 
          This might be because you need to log in or you don't have the required privileges.
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
          <Link to="/login">Login</Link>
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
        <h3 className="font-semibold mb-2">Possible reasons:</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• You need to log in to access this page</li>
          <li>• Your account doesn't have the required permissions</li>
          <li>• The page is restricted to certain user types</li>
          <li>• Your session may have expired</li>
        </ul>
      </div>
    </div>
  );
}