import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Warehouse,
  Tag,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Truck,
  Star,
  FileText,
  Folder
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Categories', href: '/admin/categories', icon: Folder },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Suppliers', href: '/admin/suppliers', icon: Truck },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Stock', href: '/admin/stock', icon: Warehouse },
  { name: 'Transactions', href: '/admin/transactions', icon: FileText },
  { name: 'Discounts', href: '/admin/discounts', icon: Tag },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border transition-all duration-300 h-screen flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-sidebar-foreground font-medium">Admin Panel</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}