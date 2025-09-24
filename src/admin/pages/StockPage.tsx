import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Upload, AlertTriangle, Package, TrendingDown, Search, Eye, Plus, FileText } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export function StockPage() {
  const [products] = React.useState(mockProducts);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [stockFilter, setStockFilter] = React.useState('all');
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);

  // Mock import history
  const importHistory = [
    {
      id: 'IMP-001',
      date: '2024-01-15',
      filename: 'stock_update_jan.csv',
      status: 'completed',
      itemsProcessed: 156,
      itemsUpdated: 142,
      itemsFailed: 14
    },
    {
      id: 'IMP-002',
      date: '2024-01-10',
      filename: 'new_products_batch.xlsx',
      status: 'completed',
      itemsProcessed: 45,
      itemsUpdated: 45,
      itemsFailed: 0
    },
    {
      id: 'IMP-003',
      date: '2024-01-05',
      filename: 'inventory_correction.csv',
      status: 'failed',
      itemsProcessed: 0,
      itemsUpdated: 0,
      itemsFailed: 0
    }
  ];

  // Filter products
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStock = stockFilter === 'all' || 
                          (stockFilter === 'low' && product.stock < 10 && product.stock > 0) ||
                          (stockFilter === 'out' && product.stock === 0) ||
                          (stockFilter === 'good' && product.stock >= 10);
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockFilter]);

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  // Calculate stock stats
  const stockStats = React.useMemo(() => {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock < 10 && p.stock > 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return { totalProducts, outOfStock, lowStock, totalValue };
  }, [products]);

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStockIcon = (stock: number) => {
    if (stock === 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (stock < 10) return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  };

  const getImportStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Stock Management</h1>
            <p className="text-muted-foreground">Monitor and manage your inventory levels</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Import History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Import History</DialogTitle>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Import ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Failed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importHistory.map((imp) => (
                      <TableRow key={imp.id}>
                        <TableCell className="font-medium">{imp.id}</TableCell>
                        <TableCell>{new Date(imp.date).toLocaleDateString()}</TableCell>
                        <TableCell>{imp.filename}</TableCell>
                        <TableCell>{getImportStatusBadge(imp.status)}</TableCell>
                        <TableCell>{imp.itemsProcessed}</TableCell>
                        <TableCell>{imp.itemsUpdated}</TableCell>
                        <TableCell>{imp.itemsFailed}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Stock
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Stock Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input id="file" type="file" accept=".csv,.xlsx,.xls" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports CSV, XLSX files. Maximum size: 10MB
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="notes">Import Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this import..."
                    />
                  </div>
                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-medium mb-2">File Format Requirements:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Column 1: Product ID</li>
                      <li>• Column 2: Stock Quantity</li>
                      <li>• Column 3: Price (optional)</li>
                      <li>• First row should contain headers</li>
                    </ul>
                  </div>
                  <Button className="w-full">Upload and Process</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stockStats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</div>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stockStats.lowStock}</div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <div className="text-2xl font-bold">${stockStats.totalValue.toFixed(0)}</div>
                <p className="text-xs text-muted-foreground">Total Inventory Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stock Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Overview ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {product.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStockIcon(product.stock)}
                        <span className={`font-medium ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock < 10 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStockBadge(product.stock)}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">
                      ${(product.price * product.stock).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Category Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Stock by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map(category => {
                const categoryProducts = products.filter(p => p.category === category);
                const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
                const outOfStockCount = categoryProducts.filter(p => p.stock === 0).length;
                const lowStockCount = categoryProducts.filter(p => p.stock < 10 && p.stock > 0).length;
                
                return (
                  <Card key={category}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h3 className="font-medium">{category}</h3>
                        <div className="text-2xl font-bold">{totalStock}</div>
                        <div className="text-sm text-muted-foreground">
                          {categoryProducts.length} products
                        </div>
                        {(outOfStockCount > 0 || lowStockCount > 0) && (
                          <div className="space-y-1">
                            {outOfStockCount > 0 && (
                              <div className="text-sm text-red-600">
                                {outOfStockCount} out of stock
                              </div>
                            )}
                            {lowStockCount > 0 && (
                              <div className="text-sm text-yellow-600">
                                {lowStockCount} low stock
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}