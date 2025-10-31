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
import { Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

import { usePagedProducts } from '@/hooks/usePagedProducts';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useVariationOptions } from '@/hooks/useVariationOptions';

import { createProduct, deleteProduct } from '@/services/ProductsService';

export function ProductsPage() {
  // 1. Danh sách sản phẩm phân trang
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

  // 2. Master data (dropdown)
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { sizes, colors, productStatuses } = useVariationOptions();

  // 3. Local state cho filter list
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all'); // categoryId filter
  const [statusFilter, setStatusFilter] = React.useState('all');     // productStatusId filter

  // 4. Popup state
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  // 5. Form tạo sản phẩm mới (thông tin chung)
  const emptyProductForm = React.useMemo(
    () => ({
      productName: '',
      productCode: '',
      productDescription: '',
      brandId: '',
      categoryId: '',
      productStatusId: '',
    }),
    []
  );

  const [newProduct, setNewProduct] = React.useState(emptyProductForm);

  // 6. Variation list (nhiều biến thể / màu / size / giá)
  const emptyVariation = React.useMemo(
    () => ({
      sizeId: '',
      colorId: '',
      variationPrice: '',
      variationImage: '', // local preview URL tạm
    }),
    []
  );

  const [variations, setVariations] = React.useState([{ ...emptyVariation }]);

  // 7. Đồng bộ search -> hook usePagedProducts (debounced bên trong)
  React.useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery, setSearch]);

  // 8. Đồng bộ filter -> hook usePagedProducts
  React.useEffect(() => {
    const filters = {};
    if (categoryFilter !== 'all') {
      filters.categoryIds = [Number(categoryFilter)];
    }
    if (statusFilter !== 'all') {
      filters.productStatusIds = [Number(statusFilter)];
    }
    setFilters(filters);
  }, [categoryFilter, statusFilter, setFilters]);

  // --- Helpers hiển thị badge tồn kho ---
  const getStockBadge = (stock) => {
    const qty = Number(stock ?? 0);
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  // --- Helpers hiển thị badge trạng thái ---
  const getStatusBadge = (statusObj) => {
    const statusName =
      statusObj?.productStatusName ||
      statusObj?.name ||
      (typeof statusObj === 'string' ? statusObj : 'Unknown');

    const active =
      statusName?.toLowerCase() === 'available' ||
      statusName?.toLowerCase() === 'active';

    return (
      <Badge variant={active ? 'default' : 'secondary'}>
        {statusName || 'Unknown'}
      </Badge>
    );
  };

  // ====== HANDLERS CHO VARIATIONS ======

  // Cập nhật 1 field trong variation i
  const updateVariationField = (i, field, value) => {
    setVariations((prev) => {
      const clone = [...prev];
      clone[i] = { ...clone[i], [field]: value };
      return clone;
    });
  };

  // Thêm biến thể mới
  const addVariation = () => {
    setVariations((prev) => [...prev, { ...emptyVariation }]);
  };

  // Xoá biến thể i (giữ lại ít nhất 1)
  const removeVariation = (i) => {
    setVariations((prev) => {
      if (prev.length === 1) {
        return prev; // không cho xoá hết sạch
      }
      const clone = [...prev];
      clone.splice(i, 1);
      return clone;
    });
  };

  // Chọn ảnh cho variation -> thay vì upload, nhập vào URL string
  const handleVariationImageChange = (i, value) => {
    if (!value) return;
    updateVariationField(i, 'variationImage', value);  // Thay vì tạo URL từ file, sử dụng giá trị string
  };

  // Submit tạo product
  const handleAddProduct = async () => {
    try {
      const payload = {
        productName: newProduct.productName,
        productCode: newProduct.productCode,
        productDescription: newProduct.productDescription,
        brandId: Number(newProduct.brandId) || 0,
        productStatusId: Number(newProduct.productStatusId) || 0,
        categoryIds: newProduct.categoryId
          ? [Number(newProduct.categoryId)]
          : [],
        variations: variations.map((v) => ({
          sizeId: Number(v.sizeId) || 0,
          colorId: Number(v.colorId) || 0,
          variationImage: v.variationImage || '',
          variationPrice: Number(v.variationPrice) || 0,
        })),
      };

      await createProduct(payload);

      // Reset form sau khi tạo thành công
      setNewProduct(emptyProductForm);
      setVariations([{ ...emptyVariation }]);
      setIsAddDialogOpen(false);

      // Reload list
      refetch();
    } catch (err) {
      console.error('Failed to add product:', err);
      alert('Failed to add product');
    }
  };

  // Xoá product
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

  // Render dropdown options
  const renderBrandOptions = () =>
    (brands || []).map((b) => (
      <SelectItem
        key={b.brandId || b.id}
        value={String(b.brandId || b.id)}
      >
        {b.brandName || b.name || `Brand #${b.brandId || b.id}`}
      </SelectItem>
    ));

  const renderCategoryOptions = () =>
    (categories || []).map((cat) => (
      <SelectItem
        key={cat.categoryId || cat.id}
        value={String(cat.categoryId || cat.id)}
      >
        {cat.categoryName || cat.name || `Category #${cat.categoryId || cat.id}`}
      </SelectItem>
    ));

  const renderStatusOptions = () =>
    (productStatuses || []).map((ps) => (
      <SelectItem
        key={ps.productStatusId || ps.id}
        value={String(ps.productStatusId || ps.id)}
      >
        {ps.productStatusName || ps.name || `Status #${ps.productStatusId || ps.id}`}
      </SelectItem>
    ));

  const renderSizeOptions = () =>
    (sizes || []).map((s) => (
      <SelectItem
        key={s.sizeId || s.id}
        value={String(s.sizeId || s.id)}
      >
        {s.sizeName || s.name || `Size #${s.sizeId || s.id}`}
      </SelectItem>
    ));

  const renderColorOptions = () =>
    (colors || []).map((c) => (
      <SelectItem
        key={c.colorId || c.id}
        value={String(c.colorId || c.id)}
      >
        {c.colorName || c.name || `Color #${c.colorId || c.id}`}
      </SelectItem>
    ));

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* HEADER TOP OF PAGE */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Products Management</h1>
            <p className="text-muted-foreground">
              Manage your product catalog
            </p>
          </div>

          {/* ADD PRODUCT DIALOG */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl w-full h-[80vh] p-0 flex flex-col overflow-hidden">
              {/* Header cố định */}
              <DialogHeader className="px-6 py-4 border-b shrink-0">
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>

              {/* Body có scrollbar luôn */}
              <div className="flex-1 overflow-y-scroll px-6 py-4 space-y-6">
                {/* ============== THÔNG TIN SẢN PHẨM ============== */}
                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      value={newProduct.productName}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productName: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Product Code */}
                  <div>
                    <Label htmlFor="productCode">Product Code</Label>
                    <Input
                      id="productCode"
                      value={newProduct.productCode}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productCode: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Brand */}
                  <div>
                    <Label htmlFor="brandId">Brand</Label>
                    <Select
                      value={newProduct.brandId}
                      onValueChange={(v) =>
                        setNewProduct({
                          ...newProduct,
                          brandId: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderBrandOptions()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="categoryId">Category</Label>
                    <Select
                      value={newProduct.categoryId}
                      onValueChange={(v) =>
                        setNewProduct({
                          ...newProduct,
                          categoryId: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderCategoryOptions()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <Label htmlFor="productStatusId">Status</Label>
                    <Select
                      value={newProduct.productStatusId}
                      onValueChange={(v) =>
                        setNewProduct({
                          ...newProduct,
                          productStatusId: v,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderStatusOptions()}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="productDescription">Description</Label>
                    <Textarea
                      id="productDescription"
                      value={newProduct.productDescription}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          productDescription: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* ============== DANH SÁCH VARIATIONS ============== */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm text-muted-foreground">
                      Variations
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addVariation}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variation
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4 max-h-[260px] overflow-y-auto">
                    {variations.map((v, i) => (
                      <div
                        key={i}
                        className="border rounded-md p-4 relative bg-muted/10"
                      >
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                          onClick={() => removeVariation(i)}
                          title="Remove this variation"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Size */}
                          <div>
                            <Label>Size</Label>
                            <Select
                              value={v.sizeId}
                              onValueChange={(val) =>
                                updateVariationField(i, 'sizeId', val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                {renderSizeOptions()}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Color */}
                          <div>
                            <Label>Color</Label>
                            <Select
                              value={v.colorId}
                              onValueChange={(val) =>
                                updateVariationField(i, 'colorId', val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select color" />
                              </SelectTrigger>
                              <SelectContent>
                                {renderColorOptions()}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Price */}
                          <div>
                            <Label>Price</Label>
                            <Input
                              type="number"
                              value={v.variationPrice}
                              onChange={(e) =>
                                updateVariationField(
                                  i,
                                  'variationPrice',
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          {/* Image input & preview */}
                          <div className="flex flex-col gap-2">
                            <Label>Image</Label>

                            {v.variationImage ? (
                              <img
                                src={v.variationImage}
                                alt="preview"
                                className="h-16 w-16 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                No image
                              </div>
                            )}

                            <Input
                              type="text"
                              placeholder="Enter image URL"
                              value={v.variationImage || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleVariationImageChange(i, value);  // Cập nhật bằng giá trị string nhập vào
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer cố định */}
              <div className="px-6 py-4 border-t shrink-0">
                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
                      {cat.categoryName || cat.name || `Category #${cat.categoryId || cat.id}`}
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
                      {ps.productStatusName || ps.name || `Status #${ps.productStatusId || ps.id}`}
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
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const imgSrc =
                      product.variations?.[0]?.variationImage ||
                      product.categories?.[0]?.categoryImageUrl ||
                      '/placeholder.png';

                    const categoryName =
                      product.categories?.[0]?.categoryName || 'Uncategorized';

                    const stockQty = product.stockQuantity ?? 0;

                    return (
                      <TableRow key={product.productId}>
                        {/* Product col */}
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
                              <div className="text-sm text-muted-foreground">
                                ID: {product.productId}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>{categoryName}</TableCell>

                        {/* Stock */}
                        <TableCell>
                          <div className="space-y-1">
                            <div>{stockQty}</div>
                            {getStockBadge(stockQty)}
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          {getStatusBadge(product.productStatus)}
                        </TableCell>

                        {/* Actions */}
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
                              onClick={() => handleDeleteProduct(product.productId)}
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
