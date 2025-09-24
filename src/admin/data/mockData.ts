// Mock data for admin dashboard

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
  variations?: ProductVariation[];
  description?: string;
  tags?: string[];
}

export interface ProductVariation {
  id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  image: string;
}

export interface Order {
  id: string;
  customer: string;
  customerId: string;
  date: string;
  status: 'pending' | 'completed' | 'failed' | 'returned';
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variation?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  ordersCount: number;
  totalSpent: number;
}

export interface Discount {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expirationDate: string;
  status: 'active' | 'inactive';
  usageCount: number;
  usageLimit?: number;
}

export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'user' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  website?: string;
  status: 'active' | 'inactive';
  dateAdded: string;
  productsSupplied: number;
  totalOrders: number;
  rating: number;
  paymentTerms: string;
  deliveryTime: string;
  notes?: string;
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Cotton T-Shirt',
    category: 'T-Shirts',
    price: 29.99,
    stock: 150,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    description: 'Comfortable cotton t-shirt perfect for everyday wear',
    tags: ['cotton', 'casual', 'unisex']
  },
  {
    id: '2',
    name: 'Denim Slim Fit Jeans',
    category: 'Jeans',
    price: 89.99,
    stock: 5,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
    description: 'Premium denim jeans with a modern slim fit',
    tags: ['denim', 'slim-fit', 'premium']
  },
  {
    id: '3',
    name: 'Summer Floral Dress',
    category: 'Dresses',
    price: 79.99,
    stock: 0,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    description: 'Beautiful floral dress perfect for summer occasions',
    tags: ['floral', 'summer', 'elegant']
  },
  {
    id: '4',
    name: 'Leather Bomber Jacket',
    category: 'Jackets',
    price: 199.99,
    stock: 25,
    status: 'active',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    description: 'Premium leather bomber jacket for a stylish look',
    tags: ['leather', 'bomber', 'premium']
  },
  {
    id: '5',
    name: 'Casual Sneakers',
    category: 'Shoes',
    price: 119.99,
    stock: 75,
    status: 'inactive',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    description: 'Comfortable sneakers for daily wear',
    tags: ['sneakers', 'casual', 'comfortable']
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    customerId: 'CUST-001',
    date: '2024-01-15',
    status: 'completed',
    total: 149.98,
    items: [
      { productId: '1', productName: 'Classic Cotton T-Shirt', quantity: 2, price: 29.99 },
      { productId: '2', productName: 'Denim Slim Fit Jeans', quantity: 1, price: 89.99 }
    ]
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    customerId: 'CUST-002',
    date: '2024-01-14',
    status: 'pending',
    total: 79.99,
    items: [
      { productId: '3', productName: 'Summer Floral Dress', quantity: 1, price: 79.99 }
    ]
  },
  {
    id: 'ORD-003',
    customer: 'Mike Johnson',
    customerId: 'CUST-003',
    date: '2024-01-13',
    status: 'failed',
    total: 199.99,
    items: [
      { productId: '4', productName: 'Leather Bomber Jacket', quantity: 1, price: 199.99 }
    ]
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Wilson',
    customerId: 'CUST-004',
    date: '2024-01-12',
    status: 'returned',
    total: 119.99,
    items: [
      { productId: '5', productName: 'Casual Sneakers', quantity: 1, price: 119.99 }
    ]
  }
];

// Mock Customers
export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: '2023-06-15',
    ordersCount: 12,
    totalSpent: 1299.88
  },
  {
    id: 'CUST-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    joinDate: '2023-08-22',
    ordersCount: 8,
    totalSpent: 899.92
  },
  {
    id: 'CUST-003',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    joinDate: '2023-11-03',
    ordersCount: 3,
    totalSpent: 349.97
  },
  {
    id: 'CUST-004',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    joinDate: '2024-01-10',
    ordersCount: 1,
    totalSpent: 119.99
  }
];

// Mock Discounts
export const mockDiscounts: Discount[] = [
  {
    id: 'DISC-001',
    code: 'WELCOME10',
    discount: 10,
    type: 'percentage',
    expirationDate: '2024-12-31',
    status: 'active',
    usageCount: 45,
    usageLimit: 100
  },
  {
    id: 'DISC-002',
    code: 'SUMMER25',
    discount: 25,
    type: 'percentage',
    expirationDate: '2024-08-31',
    status: 'active',
    usageCount: 23,
    usageLimit: 50
  },
  {
    id: 'DISC-003',
    code: 'FREESHIP',
    discount: 15,
    type: 'fixed',
    expirationDate: '2024-06-30',
    status: 'inactive',
    usageCount: 67,
    usageLimit: 200
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #ORD-005 has been placed by John Doe',
    date: '2024-01-15T10:30:00Z',
    read: false
  },
  {
    id: 'NOTIF-002',
    type: 'stock',
    title: 'Low Stock Alert',
    message: 'Denim Slim Fit Jeans is running low on stock (5 remaining)',
    date: '2024-01-15T09:15:00Z',
    read: false
  },
  {
    id: 'NOTIF-003',
    type: 'stock',
    title: 'Out of Stock',
    message: 'Summer Floral Dress is now out of stock',
    date: '2024-01-14T16:45:00Z',
    read: true
  },
  {
    id: 'NOTIF-004',
    type: 'user',
    title: 'New Customer Registration',
    message: 'Sarah Wilson has created a new account',
    date: '2024-01-14T14:20:00Z',
    read: false
  }
];

// Dashboard analytics data
export const dashboardStats = {
  totalRevenue: 45680,
  totalOrders: 1234,
  totalCustomers: 567,
  totalProducts: 89,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  productsGrowth: 5.1
};

export const salesData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
];

export const categoryData = [
  { name: 'T-Shirts', value: 35, fill: '#576D64' },
  { name: 'Jeans', value: 25, fill: '#AAC0B5' },
  { name: 'Dresses', value: 20, fill: '#F8F5EE' },
  { name: 'Jackets', value: 15, fill: '#000000' },
  { name: 'Shoes', value: 5, fill: '#999999' },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'SUPP-001',
    name: 'Fashion Forward Co.',
    email: 'orders@fashionforward.com',
    phone: '+1 (555) 123-4567',
    address: '123 Fashion Street, New York, NY 10001',
    contactPerson: 'Michael Chen',
    website: 'https://fashionforward.com',
    status: 'active',
    dateAdded: '2023-03-15',
    productsSupplied: 45,
    totalOrders: 156,
    rating: 4.8,
    paymentTerms: 'Net 30',
    deliveryTime: '5-7 business days',
    notes: 'Reliable supplier for premium cotton products.'
  },
  {
    id: 'SUPP-002',
    name: 'Denim Masters Ltd.',
    email: 'supply@denimmasters.com',
    phone: '+1 (555) 987-6543',
    address: '456 Industrial Blvd, Los Angeles, CA 90015',
    contactPerson: 'Sarah Johnson',
    website: 'https://denimmasters.com',
    status: 'active',
    dateAdded: '2023-01-22',
    productsSupplied: 32,
    totalOrders: 89,
    rating: 4.5,
    paymentTerms: 'Net 45',
    deliveryTime: '7-10 business days',
    notes: 'Specialized in high-quality denim products.'
  },
  {
    id: 'SUPP-003',
    name: 'Global Textiles Inc.',
    email: 'info@globaltextiles.com',
    phone: '+1 (555) 456-7890',
    address: '789 Textile Ave, Chicago, IL 60601',
    contactPerson: 'David Rodriguez',
    status: 'active',
    dateAdded: '2023-06-10',
    productsSupplied: 78,
    totalOrders: 234,
    rating: 4.2,
    paymentTerms: 'Net 15',
    deliveryTime: '3-5 business days',
    notes: 'Large volume supplier with competitive pricing.'
  },
  {
    id: 'SUPP-004',
    name: 'Luxury Leather Works',
    email: 'sales@luxuryleather.com',
    phone: '+1 (555) 321-0987',
    address: '321 Leather Lane, Miami, FL 33101',
    contactPerson: 'Emma Thompson',
    website: 'https://luxuryleather.com',
    status: 'inactive',
    dateAdded: '2022-11-08',
    productsSupplied: 12,
    totalOrders: 28,
    rating: 3.8,
    paymentTerms: 'Net 60',
    deliveryTime: '10-14 business days',
    notes: 'Premium leather goods supplier. Currently inactive due to pricing issues.'
  },
  {
    id: 'SUPP-005',
    name: 'Eco-Friendly Fabrics',
    email: 'contact@ecofabrics.com',
    phone: '+1 (555) 654-3210',
    address: '654 Green Way, Portland, OR 97201',
    contactPerson: 'Alex Kim',
    website: 'https://ecofabrics.com',
    status: 'active',
    dateAdded: '2023-08-30',
    productsSupplied: 25,
    totalOrders: 67,
    rating: 4.9,
    paymentTerms: 'Net 30',
    deliveryTime: '4-6 business days',
    notes: 'Sustainable and organic fabric supplier. Excellent quality.'
  }
];