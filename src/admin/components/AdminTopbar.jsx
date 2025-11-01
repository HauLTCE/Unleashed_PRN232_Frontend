import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/User/useAuth';
import { useUser } from '../../hooks/User/useUser';

export function AdminTopbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const notificationCount = 1;

  const { userId, role, logout, isAuthenticated, isLoading } = useAuth();
  const { user } = useUser(userId);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <header className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-center text-muted-foreground">
          Loading user...
        </div>
      </header>
    );
  }

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-xl font-semibold text-foreground">
            Unleashed Dashboard
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* User Dropdown */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <span className="text-sm text-muted-foreground">
                  Hello {user?.userUsername || 'Admin'}
                </span>
              </DropdownMenuTrigger>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                  <AvatarFallback>
                    {role ? role.slice(0, 2).toUpperCase() : 'US'}
                  </AvatarFallback>
                </Avatar>
              </Button>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.userUsername || 'Unknown User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    ID: {userId || 'N/A'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
