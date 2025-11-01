import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { usePageProductDetail } from '@/hooks/usePageProductDetail';
import { deleteProduct } from '@/services/ProductsService';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, loading, error } = usePageProductDetail(id);

  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
          <p className="text-muted-foreground mt-2">
            The product you are looking for does not exist.
          </p>
          <Button asChild className="mt-4">
            <Link to="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getStockBadge = (stock) => {
    const qty = Number(stock ?? 0);
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

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
    (product.variations && product.variations.length > 0
      ? product.variations[0].variationImage
      : product.image);

  const currentPrice =
    selectedVariation && selectedVariation.variationPrice != null
      ? selectedVariation.variationPrice
      : null;

  const stockQty = product.stock ?? 0;

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
              <p className="text-muted-foreground">
                Product ID: {product.productId}
              </p>
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
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-base">{product.productName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <p className="text-base">
                    {product.categories
                      ?.map((c) => c.categoryName)
                      .join(', ')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Price
                  </label>
                  <p className="text-base font-semibold">
                    {currentPrice != null
                      ? `$${Number(currentPrice).toFixed(2)}`
                      : 'Price not selected'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Stock
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{stockQty}</span>
                    {getStockBadge(stockQty)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div>{getStatusBadge(product.productStatus)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Total Value
                  </label>
                  <p className="text-base font-semibold">
                    {stockQty && currentPrice != null
                      ? `$${(Number(currentPrice) * Number(stockQty)).toFixed(
                          2
                        )}`
                      : '—'}
                  </p>
                </div>
              </div>

              {product.productDescription && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Description
                  </label>
                  <p className="text-base mt-1">
                    {product.productDescription}
                  </p>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tags
                  </label>
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
        {product.variations && product.variations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {product.variations.map((variation) => (
                  <Card key={variation.variationId}>
                    <CardContent className="pt-6 space-y-2">
                      <ImageWithFallback
                        src={variation.variationImage}
                        alt={`${product.productName} - ${variation.color} ${variation.size}`}
                        className="w-full h-32 object-cover rounded-md"
                      />

                      <h4 className="font-medium">
                        {variation.color?.colorName ||
                          variation.color ||
                          '—'}{' '}
                        -{' '}
                        {variation.size?.sizeName ||
                          variation.size ||
                          '—'}
                      </h4>

                      <p className="text-sm text-muted-foreground">
                        Price:{' '}
                        {variation.variationPrice != null
                          ? `$${Number(
                              variation.variationPrice
                            ).toFixed(2)}`
                          : '—'}
                      </p>

                      <Button
                        variant="outline"
                        onClick={() => handleVariationChange(variation)}
                      >
                        Select Variation
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats (mock) */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Total Sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">$1,440</div>
              <p className="text-xs text-muted-foreground">Revenue Generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">4.5</div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
