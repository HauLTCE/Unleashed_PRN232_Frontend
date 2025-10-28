import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { mockProducts } from '../data/mockData';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const product = mockProducts.find(p => p.id === id);

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (stock < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/admin/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">Product ID: {product.id}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
            <Button variant="destructive">
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
                src={product.image}
                alt={product.name}
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
                  <p className="text-base">{product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="text-base">{product.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Price</label>
                  <p className="text-base font-semibold">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Stock</label>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{product.stock}</span>
                    {getStockBadge(product.stock)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>{getStatusBadge(product.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                  <p className="text-base font-semibold">${(product.price * product.stock).toFixed(2)}</p>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base mt-1">{product.description}</p>
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

        {/* Variations (if any) */}
        {product.variations && product.variations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {product.variations.map((variation) => (
                  <Card key={variation.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <ImageWithFallback
                          src={variation.image}
                          alt={`${product.name} - ${variation.color} ${variation.size}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <h4 className="font-medium">{variation.color} - {variation.size}</h4>
                        <p className="text-sm text-muted-foreground">Price: ${variation.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Stock: {variation.stock}</p>
                        {getStockBadge(variation.stock)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
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