import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

import { usePagedProducts } from '@/hooks/usePagedProducts';
import { createProduct, deleteProduct } from '@/services/ProductsService';

export function ProductsPage() {
  const {
    items: products,
    totalPages,
    pageNumber,
    loading,
    setSearch,
    setFilters,
    setPage,
    refetch,
  } = usePagedProducts({
    pageSize: 20,
    onlyActiveProducts: false,
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    category: '',
    stock: 0,
    status: 'active',
    description: '',
  });

  // Cập nhật search vào hook có debounce
  React.useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery, setSearch]);

  // Cập nhật filters
  React.useEffect(() => {
    const filters = {};
    if (categoryFilter !== 'all') filters.categoryIds = [categoryFilter];
    if (statusFilter !== 'all') filters.productStatusIds = [statusFilter];
    setFilters(filters);
  }, [categoryFilter, statusFilter, setFilters]);

  const handleAddProduct = async () => {
    try {
      await createProduct({
        productName: newProduct.name,
        categoryName: newProduct.category,
        stock: newProduct.stock,
        description: newProduct.description,
        productStatusId: newProduct.status === 'active' ? 1 : 2,
      });
      setIsAddDialogOpen(false);
      setNewProduct({
        name: '',
        category: '',
        stock: 0,
        status: 'active',
        description: '',
      });
      refetch();
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      refetch();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStatusBadge = (statusName) => {
    const active =
      statusName?.toLowerCase() === 'available' ||
      statusName?.toLowerCase() === 'active';
    return (
      <Badge variant={active ? 'default' : 'secondary'}>
        {statusName || 'Unknown'}
      </Badge>
    );
  };

  const categories = React.useMemo(() => {
    const unique = new Set();
    products.forEach((p) => {
      p.categories?.forEach((c) => unique.add(c.categoryName));
    });
    return Array.from(unique);
  }, [products]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>

          {/* Add Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        stock: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newProduct.status}
                    onValueChange={(v) =>
                      setNewProduct({ ...newProduct, status: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-6">
                Loading products...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const image =
                      product.variations?.[0]?.variationImage ||
                      product.categories?.[0]?.categoryImageUrl ||
                      '/placeholder.png';
                    const category =
                      product.categories?.[0]?.categoryName || 'Uncategorized';
                    return (
                      <TableRow key={product.productId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ImageWithFallback
                              src={image}
                              alt={product.productName}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">
                                {product.productName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {product.productId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{category}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>{product.stockQuantity ?? 0}</div>
                            {getStockBadge(product.stockQuantity ?? 0)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(product.productStatus?.productStatusName)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/products/${product.productId}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDeleteProduct(product.productId)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(pageNumber - 1)}
                        className={
                          pageNumber === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setPage(page)}
                            isActive={pageNumber === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(pageNumber + 1)}
                        className={
                          pageNumber === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
