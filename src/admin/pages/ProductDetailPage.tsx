import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout'; 
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { usePageProductDetail } from '@/hooks/usePageProductDetail';
import { deleteProduct } from '@/services/ProductsService';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback'; 
import { useProductRating } from '@/hooks/useProductRating'; 
import { getStockByVariationId } from '@/services/cartService'; 
import { getColors } from '@/services/ColorService'; 
import { getSizes } from '@/services/SizeService'; 
import { searchVariations } from '@/services/VariationsService'; 

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Hook này (của admin) được giả định là đã tải tất cả thông tin
  const { data: product, loading, error } = usePageProductDetail(id);

  const { rating, count: reviewCount, loading: ratingLoading } = useProductRating(id);

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [variationStock, setVariationStock] = useState(null); 

  const [colors, setColors] = useState([]); 
  const [sizes, setSizes] = useState([]); 

  const [variations, setVariations] = useState([]); // To store variations

  // Lấy dữ liệu màu sắc và kích thước khi variationId thay đổi
  useEffect(() => {
    if (product) {
      const fetchVariationDetails = async () => {
        try {
          // Lấy tất cả variation của sản phẩm
          const variationData = await searchVariations({ search: '', productId: product.productId });
          setVariations(variationData); // Set variations từ API

          if (selectedVariation) {
            // Lấy màu sắc và kích thước cho variation đã chọn
            const color = await getColors({ params: { colorId: selectedVariation.colorId } });
            const size = await getSizes({ params: { sizeId: selectedVariation.sizeId } });

            // Cập nhật dữ liệu màu sắc và kích thước
            setColors(color);
            setSizes(size);
          }
        } catch (error) {
          console.error("Không thể lấy thông tin variation:", error);
        }
      };
      fetchVariationDetails();
    }
  }, [product, selectedVariation]);

  // Tự động chọn variation đầu tiên khi load
  useEffect(() => {
    if (product && !selectedVariation) {
      const defaultVar = product.variations && product.variations.length > 0 ? product.variations[0] : null;
      if (defaultVar) {
        setSelectedVariation(defaultVar);
        setSelectedImage(defaultVar.variationImage || null);
      }
    }
  }, [product, selectedVariation]);

  useEffect(() => {
    if (selectedVariation) {
      const fetchStock = async () => {
        try {
          const stockData = await getStockByVariationId(selectedVariation.variationId);
          setVariationStock(stockData);
        } catch (error) {
          console.error('Không thể lấy tồn kho:', error);
          setVariationStock({ available: 0, isOutOfStock: true });
        }
      };
      fetchStock();
    }
  }, [selectedVariation]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Loading Product...</h1>
        </div>
      </AdminLayout>
    );
  }

  if (error || !product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground mt-2">The product you are looking for does not exist.</p>
          <Button asChild className="mt-4">
            <Link to="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getStockBadge = (stock) => {
    const qty = Number(stock ?? 0);
    if (isNaN(qty)) return <Badge variant="outline">N/A</Badge>;
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStatusBadge = (statusObj) => {
    const statusName = statusObj?.productStatusName || statusObj?.name || (typeof statusObj === 'string' ? statusObj : 'Unknown');
    const active = statusName?.toLowerCase() === 'available' || statusName?.toLowerCase() === 'active';
    return <Badge variant={active ? 'default' : 'secondary'}>{statusName || 'Unknown'}</Badge>;
  };

  const handleVariationChange = (variation) => {
    setSelectedVariation(variation);
    setSelectedImage(variation.variationImage || null);
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      navigate('/admin/products');
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    }
  };

  const mainImage =
    selectedImage ||
    (selectedVariation && selectedVariation.variationImage) ||
    (product.variations && product.variations.length > 0
      ? product.variations[0].variationImage
      : product.image);

  const currentPrice =
    selectedVariation && selectedVariation.variationPrice != null
      ? selectedVariation.variationPrice
      : null;

  const stockQty =
    variationStock && variationStock.available != null
      ? variationStock.available
      : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.productName}</h1>
              <p className="text-muted-foreground">Product ID: {product.productId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to={`/admin/products/${id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Link>
            </Button>

            <Button variant="destructive" onClick={handleDeleteProduct}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Product
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Product Image */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageWithFallback
                src={mainImage}
                alt={product.productName}
                className="w-full h-64 object-cover rounded-md"
              />
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-base">{product.productName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-base">
                    {product.categories?.map((c) => c.categoryName).join(', ')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price (Selected Variation)</label>
                  <p className="text-base font-semibold">
                    {currentPrice != null ? `${Number(currentPrice).toLocaleString('vi-VN')}₫` : 'N/A'}
                  </p>
                </div>

                {/* Size and Color */}
                {selectedVariation && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Size</label>
                      <p className="text-base">{selectedVariation.size?.sizeName || '—'}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Color</label>
                      <p className="text-base">{selectedVariation.color?.colorName || '—'}</p>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock</label>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{stockQty}</span>
                    {getStockBadge(stockQty)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>{getStatusBadge(product.productStatus)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Value (Selected)</label>
                  <p className="text-base font-semibold">
                    {stockQty && currentPrice != null
                      ? `${(Number(currentPrice) * Number(stockQty)).toLocaleString('vi-VN')}₫`
                      : '—'}
                  </p>
                </div>
              </div>

              {product.productDescription && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base mt-1">{product.productDescription}</p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Variations */}
        {variations && variations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {variations.map((variation) => {
                  const varStock = variation.quantity ?? variation.stock ?? 'N/A';

                  return (
                    <Card
                      key={variation.variationId}
                      className={selectedVariation?.variationId === variation.variationId ? 'border-primary' : ''}
                    >
                      <CardContent className="pt-6 space-y-2">
                        <ImageWithFallback
                          src={variation.variationImage}
                          alt={`${product.productName} - ${variation.color} ${variation.size}`}
                          className="w-full h-32 object-cover rounded-md"
                        />

                        {/* Hiển thị Size/Color trên card */}
                        <h4 className="font-medium">
                          {variation.color?.colorName || variation.color || '—'} - {variation.size?.sizeName || variation.size || '—'}
                        </h4>

                        <p className="text-sm text-muted-foreground">
                          Price: {variation.variationPrice != null ? `${Number(variation.variationPrice).toLocaleString('vi-VN')}₫` : '—'}
                        </p>

                        <Button
                          variant={selectedVariation?.variationId === variation.variationId ? 'default' : 'outline'}
                          onClick={() => handleVariationChange(variation)}
                          className="w-full"
                        >
                          {selectedVariation?.variationId === variation.variationId ? 'Selected' : 'Select Variation'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
