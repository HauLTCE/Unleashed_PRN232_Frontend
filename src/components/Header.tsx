import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Bell, Heart, LogOut, ShoppingCart, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/User/useAuth';
import { useUser } from '../hooks/User/useUser';

export function Header() {
  const { cart, wishlist, notifications } = useApp();
  const { userId, isAuthenticated, logout: authLogout } = useAuth();
  const { user } = useUser(userId);
  const navigate = useNavigate();

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    authLogout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-semibold text-primary">Unleashed</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-foreground hover:text-primary transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account?tab=notifications"
                  className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadNotifications}
                    </Badge>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Heart className="h-5 w-5" />
                  {wishlist.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {wishlist.length}
                    </Badge>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Link>

                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.userImage}
                      alt={user?.userFullname}
                    />
                    <AvatarFallback>
                      {(user?.userFullname?.split(' ') || [])
                        .map(n => n[0])
                        .join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer text-sm font-medium">
                        Hello, {user?.userFullname?.split(' ')[0] || 'User'}!
                      </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.userFullname}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.userEmail || 'No email provided'}
                          </p>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild className="text-black cursor-pointer">
                        <Link to="/account">
                          <User className="mr-2 h-4 w-4" />
                          Account Settings
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}