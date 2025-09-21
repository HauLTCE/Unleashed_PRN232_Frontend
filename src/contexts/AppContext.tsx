import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  description: string;
  category: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface AppContextType {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  logout: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  // Wishlist
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Products
  products: Product[];
  getProduct: (id: string) => Product | undefined;

  // Orders
  orders: Order[];
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    price: 29.99,
    originalPrice: 39.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=400'
    ],
    rating: 4.5,
    reviewCount: 128,
    description: 'Comfortable cotton t-shirt perfect for everyday wear.',
    category: 'T-Shirts',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Gray', 'Navy'],
    inStock: true
  },
  {
    id: '2',
    name: 'Premium Denim Jeans',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      'https://images.unsplash.com/photo-1506629905270-11674df08e05?w=400'
    ],
    rating: 4.7,
    reviewCount: 89,
    description: 'High-quality denim jeans with a modern fit.',
    category: 'Jeans',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Blue', 'Black', 'Gray'],
    inStock: true
  },
  {
    id: '3',
    name: 'Casual Button-Up Shirt',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'
    ],
    rating: 4.3,
    reviewCount: 76,
    description: 'Versatile button-up shirt for any occasion.',
    category: 'Shirts',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Light Blue'],
    inStock: true
  },
  {
    id: '4',
    name: 'Winter Wool Coat',
    price: 179.99,
    originalPrice: 229.99,
    image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
    images: [
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400',
      'https://images.unsplash.com/photo-1559551409-dadc959f76b8?w=400'
    ],
    rating: 4.8,
    reviewCount: 45,
    description: 'Warm and stylish wool coat for winter.',
    category: 'Outerwear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Gray'],
    inStock: true
  },
  {
    id: '5',
    name: 'Athletic Joggers',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
    ],
    rating: 4.4,
    reviewCount: 112,
    description: 'Comfortable athletic joggers for workouts and lounging.',
    category: 'Activewear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Gray', 'Navy'],
    inStock: true
  },
  {
    id: '6',
    name: 'Casual Hoodie',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'
    ],
    rating: 4.6,
    reviewCount: 67,
    description: 'Cozy hoodie perfect for casual wear.',
    category: 'Hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gray', 'Black', 'Navy'],
    inStock: true
  }
];

const mockUser: User = {
  id: '1',
  fullName: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'
};

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    items: [{ productId: '1', quantity: 2, size: 'M', color: 'Black' }],
    total: 59.98,
    status: 'delivered',
    trackingNumber: 'TRK123456789'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Order Shipped',
    message: 'Your order #ORD-001 has been shipped and is on its way.',
    date: '2024-01-16',
    read: false,
    type: 'success'
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products] = useState<Product[]>(mockProducts);
  const [orders] = useState<Order[]>(mockOrders);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    if (email === 'john@example.com' && password === 'password') {
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      fullName: userData.fullName,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  const addToCart = (productId: string, quantity = 1, size?: string, color?: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.productId === productId && 
        item.size === size && 
        item.color === color
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.productId === productId && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { productId, quantity, size, color }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const addToWishlist = (productId: string) => {
    setWishlist(prev => [...prev, productId]);
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(id => id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const getProduct = (id: string) => {
    return products.find(product => product.id === id);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  return (
    <AppContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      getCartTotal,
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      products,
      getProduct,
      orders,
      notifications,
      markNotificationAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}