import { Heart, Minus, Plus, RotateCcw, Shield, ShoppingCart, Truck } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner'; // sonner đã tích hợp sẵn, không cần @2.0.3
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useCart } from '../hooks/useCart'; // ✅ 1. Import useCart hook
import { usePageProductDetail } from '../hooks/usePageProductDetail'; // import hook

export function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, priceRange, images, loading, error } = usePageProductDetail(id);
  const { addItemToCart, isLoading: isCartLoading } = useCart(); // ✅ 2. Lấy hàm và trạng thái loading từ context

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Đang tải sản phẩm...</h1>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Sản phẩm không tồn tại</h1>
        <Button asChild className="mt-4">
          <Link to="/admin/products">Quay lại danh sách sản phẩm</Link>
        </Button>
      </div>
    );
  }

  const variations = product.variations || [];
  const uniqueSizes = Array.from(new Set(variations.map(v => v.size?.sizeName).filter(Boolean)));
  const uniqueColors = Array.from(new Set(variations.map(v => v.color?.colorName).filter(Boolean)));

  // ✅ 3. Cập nhật hoàn toàn hàm handleAddToCart
  const handleAddToCart = async () => {
    // Giữ lại validation cũ
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn kích thước');
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    // Tìm biến thể sản phẩm (variation) tương ứng với lựa chọn của người dùng
    const selectedVariation = variations.find(v => {
      const sizeMatch = uniqueSizes.length === 0 || v.size?.sizeName === selectedSize;
      const colorMatch = uniqueColors.length === 0 || v.color?.colorName === selectedColor;
      return sizeMatch && colorMatch;
    });

    if (!selectedVariation) {
      toast.error('Sản phẩm với lựa chọn này không có sẵn.');
      return;
    }

    // Gọi hàm từ context với variationId và số lượng
    const result = await addItemToCart(selectedVariation.id, quantity);

    // Hiển thị thông báo dựa trên kết quả trả về
    if (result.success) {
      toast.success(result.message || `Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } else {
      toast.error(result.message || 'Thêm sản phẩm thất bại.');
    }
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
        <Link to="/admin" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link to="/admin/products" className="hover:text-primary">Danh sách sản phẩm</Link>
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
              Trạng thái: {product.productStatus?.productStatusName || 'Không rõ'}
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
            {/* ✅ 4. Cập nhật nút để xử lý trạng thái loading */}
            <Button onClick={handleAddToCart} className="flex-1" disabled={isCartLoading}>
              {isCartLoading ? (
                'Đang thêm...'
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Thêm vào giỏ
                </>
              )}
            </Button>
            <Button variant="outline" disabled={isCartLoading}>
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