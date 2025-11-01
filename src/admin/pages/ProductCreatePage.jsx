import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/AdminLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { X, Plus } from 'lucide-react';

import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { useVariationOptions } from '@/hooks/useVariationOptions';
import { createProduct } from '@/services/ProductsService';

export function ProductCreatePage() {
  const navigate = useNavigate();

  // master data
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { sizes, colors, productStatuses } = useVariationOptions();

  // form state cho product
  const [newProduct, setNewProduct] = React.useState({
    productName: '',
    productCode: '',
    productDescription: '',
    brandId: '',
    categoryId: '',
    productStatusId: '',
  });

  // variations state
  const emptyVariation = React.useMemo(
    () => ({
      sizeId: '',
      colorId: '',
      variationPrice: '',
      variationImage: '',
    }),
    []
  );
  const [variations, setVariations] = React.useState([{ ...emptyVariation }]);

  // handlers variations
  const updateVariationField = (i, field, value) => {
    setVariations((prev) => {
      const clone = [...prev];
      clone[i] = { ...clone[i], [field]: value };
      return clone;
    });
  };

  const addVariation = () => {
    setVariations((prev) => [...prev, { ...emptyVariation }]);
  };

  const removeVariation = (i) => {
    setVariations((prev) => {
      if (prev.length === 1) return prev;
      const clone = [...prev];
      clone.splice(i, 1);
      return clone;
    });
  };

  const handleVariationImageChange = (i, value) => {
    updateVariationField(i, 'variationImage', value);
  };

  // submit
  const handleCreate = async () => {
    try {
      const payload = {
        productName: newProduct.productName || null,
        productCode: newProduct.productCode || null,
        productDescription: newProduct.productDescription || null,

        // nếu chưa chọn thì để null thay vì 0 để BE đỡ nổi giận
        brandId: newProduct.brandId ? Number(newProduct.brandId) : null,
        productStatusId: newProduct.productStatusId
          ? Number(newProduct.productStatusId)
          : null,

        categoryIds: newProduct.categoryId
          ? [Number(newProduct.categoryId)]
          : [],

        variations: variations.map((v) => ({
          sizeId: v.sizeId ? Number(v.sizeId) : null,
          colorId: v.colorId ? Number(v.colorId) : null,
          variationImage: v.variationImage || null,
          variationPrice:
            v.variationPrice !== '' && v.variationPrice != null
              ? Math.max(0, Number(v.variationPrice))
              : null,
        })),
      };

      await createProduct(payload);
      navigate('/admin/products'); // quay lại list
    } catch (err) {
      console.error('Failed to create product:', err);
      alert('Failed to create product');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Thông tin sản phẩm */}
            <section className="space-y-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={newProduct.productName}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productName: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Product Code</Label>
                <Input
                  value={newProduct.productCode}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productCode: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Brand</Label>
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
                  value={newProduct.productDescription}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productDescription: e.target.value,
                    })
                  }
                />
              </div>
            </section>

            {/* Variations */}
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

                      <div>
                        <Label>Price</Label>
                        <Input
                          type="number"
                          min="0"
                          value={v.variationPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            // chặn nhập âm
                            if (Number(val) < 0) return;
                            updateVariationField(i, 'variationPrice', val);
                          }}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label>Image URL</Label>

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
                            handleVariationImageChange(i, value);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Footer actions */}
            <section className="flex gap-4">
              <Button
                className="w-full"
                onClick={handleCreate}
              >
                Create Product
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
