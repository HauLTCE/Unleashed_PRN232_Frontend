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
import { useCategories } from '@/hooks/useCategories';
import { useVariationOptions } from '@/hooks/useVariationOptions';
import { deleteProduct } from '@/services/ProductsService';

export function ProductsPage() {
  // data phân trang
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

  // dropdown filter
  const { categories } = useCategories();
  const { productStatuses } = useVariationOptions();

  // local filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // đồng bộ search (Giữ nguyên)
  React.useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery, setSearch]);

  // đồng bộ filter (ĐÃ SỬA LỖI)
  React.useEffect(() => {
    const filters = {};

    // Nếu filter != 'all', thêm vào object
    if (categoryFilter !== 'all') {
      filters.categoryIds = [Number(categoryFilter)];
    } else {
      // QUAN TRỌNG: Nếu = 'all', phải set là undefined
      // để ghi đè (xoá) filter cũ trong hook usePagedProducts
      filters.categoryIds = undefined;
    }

    if (statusFilter !== 'all') {
      filters.productStatusIds = [Number(statusFilter)];
    } else {
      // Tương tự, set undefined để xoá filter
      filters.productStatusIds = undefined;
    }

    setFilters(filters);
  }, [categoryFilter, statusFilter, setFilters]);


  // badge trạng thái
  const getStatusBadge = (statusLike) => {
    const statusName =
      typeof statusLike === 'string'
        ? statusLike
        : statusLike?.productStatusName ||
        statusLike?.name ||
        'Unknown';

    const active =
      statusName?.toLowerCase() === 'available' ||
      statusName?.toLowerCase() === 'active';

    return (
      <Badge variant={active ? 'default' : 'secondary'}>
        {statusName || 'Unknown'}
      </Badge>
    );
  };

  // xoá product
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>

          {/* Nút chuyển sang trang create */}
          <Button asChild>
            <Link to="/admin/products/create">
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Link>
          </Button>
        </div>

        {/* FILTER BAR */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              {/* Search box */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Category */}
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem
                      key={cat.categoryId || cat.id}
                      value={String(cat.categoryId || cat.id)}
                    >
                      {cat.categoryName ||
                        cat.name ||
                        `Category #${cat.categoryId || cat.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filter Status */}
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {productStatuses?.map((ps) => (
                    <SelectItem
                      key={ps.productStatusId || ps.id}
                      value={String(ps.productStatusId || ps.id)}
                    >
                      {ps.productStatusName ||
                        ps.name ||
                        `Status #${ps.productStatusId || ps.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TABLE */}
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
                    <TableHead>Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((product) => {
                    // Ảnh ưu tiên: variation[0].variationImage -> product.variationImage -> category image -> fallback
                    const imgSrc =
                      product.variations?.[0]?.variationImage ||
                      product.variationImage ||
                      product.categories?.[0]?.categoryImageUrl ||
                      product.categoryList?.[0]?.categoryImageUrl ||
                      '/placeholder.png';

                    // Tên category: ưu tiên categories[0] -> categoryList[0]
                    const categoryName =
                      (product.categories &&
                        product.categories[0] &&
                        product.categories[0].categoryName) ||
                      (product.categoryList &&
                        product.categoryList[0] &&
                        product.categoryList[0].categoryName) ||
                      'Uncategorized';

                    // Tên brand
                    const brandName =
                      product.brand?.brandName ||
                      product.brand?.name ||
                      product.brandName ||
                      'No Brand';

                    // Trạng thái
                    const statusLike =
                      product.productStatus ||
                      product.productStatusName ||
                      product.status ||
                      null;

                    return (
                      <TableRow key={product.productId}>
                        {/* Product */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ImageWithFallback
                              src={imgSrc}
                              alt={product.productName}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">
                                {product.productName}
                              </div>
                              <div className="text-sm text-muted-foreground break-all">
                                ID: {product.productId}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>{categoryName}</TableCell>

                        {/* Brand */}
                        <TableCell>{brandName}</TableCell>

                        {/* Status */}
                        <TableCell>
                          {getStatusBadge(statusLike)}
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                to={`/admin/products/${product.productId}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                to={`/admin/products/${product.productId}/edit`}
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
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