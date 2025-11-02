import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/card';

import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

import { X, Plus, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';

import { useProduct } from '@/hooks/useProduct';
import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useVariationOptions } from '@/hooks/useVariationOptions';
import { updateProduct } from '@/services/ProductsService';

// 👇 thêm hook upload ảnh giống CreatePage
import { useImageUpload } from '@/hooks/useImageUpload';

export function ProductEditPage() {
  const { id: productId } = useParams();
  const navigate = useNavigate();

  // master data
  const { product, loading, error, refetch } = useProduct(productId);
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { sizes, colors, productStatuses } = useVariationOptions();

  // trạng thái form chung
  const [form, setForm] = React.useState({
    productName: '',
    productCode: '',
    productDescription: '',
    brandId: '',
    categoryId: '',
    productStatusId: '',
  });

  // cấu trúc 1 variation
  const emptyVariation = React.useMemo(
    () => ({
      variationId: 0,
      sizeId: '',
      colorId: '',
      variationPrice: '',
      variationImage: '',
    }),
    []
  );

  // list variations để edit
  const [editVariations, setEditVariations] = React.useState([]);

  // ref để click input file ẩn theo index variation
  const fileInputsRef = React.useRef({});

  // hook upload ảnh dùng lại từ AccountPage/CreatePage
  const {
    uploadFile,
    loading: uploadingImage,
    error: uploadError,
  } = useImageUpload();

  // đổ data sản phẩm ban đầu vào form và variations
  React.useEffect(() => {
    if (!product) return;

    const firstCategoryId =
      (product.categories &&
        product.categories[0] &&
        (product.categories[0].categoryId || product.categories[0].id)) ||
      '';

    setForm({
      productName: product.productName || '',
      productCode: product.productCode || '',
      productDescription: product.productDescription || '',
      brandId: product.brandId ? String(product.brandId) : '',
      categoryId: firstCategoryId ? String(firstCategoryId) : '',
      productStatusId: product.productStatusId
        ? String(product.productStatusId)
        : '',
    });

    const mappedVars = (product.variations || []).map((v) => ({
      variationId: v.variationId || 0,
      sizeId: v.sizeId ? String(v.sizeId) : '',
      colorId: v.colorId ? String(v.colorId) : '',
      variationPrice:
        v.variationPrice !== null && v.variationPrice !== undefined
          ? String(v.variationPrice)
          : '',
      variationImage: v.variationImage || '',
    }));

    setEditVariations(
      mappedVars.length > 0 ? mappedVars : [{ ...emptyVariation }]
    );
  }, [product, emptyVariation]);

  // đổi field trong form chung
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // đổi field trong từng variation
  const updateVariationField = (i, field, value) => {
    setEditVariations((prev) => {
      const clone = [...prev];
      clone[i] = { ...clone[i], [field]: value };
      return clone;
    });
  };

  // thêm variation mới
  const addVariation = () => {
    setEditVariations((prev) => [...prev, { ...emptyVariation }]);
  };

  // xóa variation (trừ khi chỉ còn 1)
  const removeVariation = (i) => {
    setEditVariations((prev) => {
      if (prev.length === 1) return prev;
      const clone = [...prev];
      clone.splice(i, 1);
      return clone;
    });
  };

  // mở file picker cho variation i
  const triggerFileSelect = (i) => {
    const inputEl = fileInputsRef.current[i];
    if (inputEl) {
      inputEl.click();
    }
  };

  // khi chọn file: upload -> nhận link -> set vào variationImage
  const handleSelectFile = (i, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    uploadFile(file).then((res) => {
      if (res && res.imageUrl) {
        updateVariationField(i, 'variationImage', res.imageUrl);
      }
    });

    // reset input để lần sau chọn cùng tên file vẫn trigger
    e.target.value = '';
  };

  // lưu thay đổi
  const handleSave = async () => {
    try {
      const payload = {
        // QUAN TRỌNG: backend cần productId trong body khớp route
        productId: productId,

        productName: form.productName || null,
        productCode: form.productCode || null,
        productDescription: form.productDescription || null,

        brandId: form.brandId ? Number(form.brandId) : null,
        productStatusId: form.productStatusId
          ? Number(form.productStatusId)
          : null,

        categoryIds: form.categoryId
          ? [Number(form.categoryId)]
          : [],

        variations: editVariations.map((v) => ({
          variationId: v.variationId ? Number(v.variationId) : 0,
          sizeId: v.sizeId ? Number(v.sizeId) : null,
          colorId: v.colorId ? Number(v.colorId) : null,
          variationImage: v.variationImage || null,
          variationPrice:
            v.variationPrice !== '' && v.variationPrice != null
              ? Math.max(0, Number(v.variationPrice))
              : null,
        })),
      };

      console.log('UPDATE PAYLOAD >>>', payload);

      await updateProduct(productId, payload);
      await refetch(); // refresh local cache nếu cần
      navigate('/admin/products');
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Failed to update product');
    }
  };

  // các trạng thái tải
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-muted-foreground">Loading product...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-red-600">
          Failed to load product: {String(error)}
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="p-6 text-muted-foreground">Product not found.</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Product</CardTitle>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* THÔNG TIN SẢN PHẨM */}
            <section className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={form.productName}
                  onChange={(e) =>
                    handleFieldChange('productName', e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Product Code</Label>
                <Input
                  value={form.productCode}
                  onChange={(e) =>
                    handleFieldChange('productCode', e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Brand</Label>
                <Select
                  value={form.brandId}
                  onValueChange={(v) => handleFieldChange('brandId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {(brands || []).map((b) => (
                      <SelectItem
                        key={b.brandId || b.id}
                        value={String(b.brandId || b.id)}
                      >
                        {b.brandName ||
                          b.name ||
                          `Brand #${b.brandId || b.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => handleFieldChange('categoryId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categories || []).map((cat) => (
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
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={form.productStatusId}
                  onValueChange={(v) =>
                    handleFieldChange('productStatusId', v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(productStatuses || []).map((ps) => (
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

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.productDescription}
                  onChange={(e) =>
                    handleFieldChange('productDescription', e.target.value)
                  }
                />
              </div>
            </section>

            {/* VARIATIONS */}
            <section className="space-y-4">
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

              <div className="border rounded-lg p-4 space-y-4 max-h-[300px] overflow-y-auto">
                {editVariations.map((v, i) => (
                  <div
                    key={i}
                    className="border rounded-md p-4 relative bg-muted/10"
                  >
                    {/* nút xóa variation */}
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
                            {(sizes || []).map((s) => (
                              <SelectItem
                                key={s.sizeId || s.id}
                                value={String(s.sizeId || s.id)}
                              >
                                {s.sizeName ||
                                  s.name ||
                                  `Size #${s.sizeId || s.id}`}
                              </SelectItem>
                            ))}
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
                            {(colors || []).map((c) => (
                              <SelectItem
                                key={c.colorId || c.id}
                                value={String(c.colorId || c.id)}
                              >
                                {c.colorName ||
                                  c.name ||
                                  `Color #${c.colorId || c.id}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Price */}
                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          min="0"
                          value={v.variationPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (Number(val) < 0) return; // chặn âm
                            updateVariationField(i, 'variationPrice', val);
                          }}
                        />
                      </div>

                      {/* Image upload + preview */}
                      <div className="flex flex-col gap-2">
                        <Label>Image</Label>

                        {/* preview ảnh */}
                        {v.variationImage ? (
                          <img
                            src={v.variationImage}
                            alt="preview"
                            className="h-16 w-16 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground text-center p-1">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            No image
                          </div>
                        )}

                        {/* nút upload ảnh */}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={uploadingImage}
                            onClick={() => triggerFileSelect(i)}
                          >
                            <UploadIcon className="h-4 w-4 mr-1" />
                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
                          </Button>

                          {uploadError && (
                            <span className="text-xs text-red-500">
                              {uploadError}
                            </span>
                          )}
                        </div>

                        {/* input file ẩn để chọn ảnh cho variation i */}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={(el) => {
                            fileInputsRef.current[i] = el;
                          }}
                          onChange={(e) => handleSelectFile(i, e)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FOOTER ACTIONS */}
            <section className="flex gap-4">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={uploadingImage}
              >
                Save Changes
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
