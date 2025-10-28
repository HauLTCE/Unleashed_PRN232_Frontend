import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { usePageProductDetail } from '../hooks/usePageProductDetail';

export function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, priceRange, images } = usePageProductDetail(id);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Đang tải sản phẩm...</h1>
      </div>
    );
  }

  const variations = product.variations || [];
  const uniqueSizes = Array.from(new Set(variations.map(v => v.size?.sizeName).filter(Boolean)));
  const uniqueColors = Array.from(new Set(variations.map(v => v.color?.colorName).filter(Boolean)));

  const handleAddToCart = () => {
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }
    toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Cửa hàng</Link>
        <span>/</span>
        <span className="text-foreground">{product.productName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <ImageWithFallback
              src={images[selectedImage] || images[0]}
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                >
                  <ImageWithFallback
                    src={image}
                    alt={`${product.productName} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
            <p className="text-muted-foreground mb-2">
              Thương hiệu: <span className="font-medium">{product.brand?.brandName}</span>
            </p>
            <p className="text-muted-foreground mb-2">
              Danh mục: {product.categories?.map(c => c.categoryName).join(', ')}
            </p>
            <p className="text-muted-foreground mb-4">
              Trạng thái: {product.productStatus?.productStatusName}
            </p>

            <div className="flex items-center space-x-4 mb-6">
              {priceRange.min && priceRange.max ? (
                <span className="text-3xl font-bold">
                  {priceRange.min === priceRange.max
                    ? `${priceRange.min.toLocaleString()}₫`
                    : `${priceRange.min.toLocaleString()}₫ - ${priceRange.max.toLocaleString()}₫`}
                </span>
              ) : (
                <span className="text-3xl font-bold">Liên hệ</span>
              )}
            </div>
          </div>

          <p className="text-muted-foreground whitespace-pre-line">
            {product.productDescription}
          </p>

          {/* Options */}
          <div className="space-y-4">
            {uniqueColors.length > 0 && (
              <div>
                <label className="block mb-2 font-medium">Màu sắc</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn màu" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueColors.map(color => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div>
                <label className="block mb-2 font-medium">Kích thước</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn size" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueSizes.map(size => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ✅ Thay Select bằng nút tăng giảm */}
            <div>
              <label className="block mb-2 font-medium">Số lượng</label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={decreaseQuantity}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border rounded-md text-center min-w-[48px]">
                  {quantity}
                </span>
                <Button variant="outline" size="icon" onClick={increaseQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Thêm vào giỏ
            </Button>
            <Button variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          {/* Product Features */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-sm">Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-sm">Đổi trả trong vòng 30 ngày</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm">Bảo hành 2 năm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
