// src/admin/pages/BrandsPage.jsx
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Plus, Trash2, Edit, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

import { useBrands } from '@/hooks/useBrands';
import { createBrand, updateBrand, deleteBrand } from '@/services/BrandsService';

// 🌟 Hook upload ảnh chung (đang dùng ở AccountPage / ProductCreatePage)
import { useImageUpload } from '@/hooks/useImageUpload';

export function BrandsPage() {
    const { brands, loading, error, refetch } = useBrands();

    // =============================
    // Upload image logic dùng chung
    // =============================
    const {
        uploadFile,
        loading: uploadingImage,
        error: uploadError,
    } = useImageUpload();

    // ref cho input file của dialog Add Brand
    const addFileInputRef = React.useRef(null);

    // ref cho input file của từng brand đang edit
    const editFileInputsRef = React.useRef({});

    const triggerAddFileSelect = () => {
        if (addFileInputRef.current) {
            addFileInputRef.current.click();
        }
    };

    const handleSelectAddFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file).then((res) => {
            if (res?.imageUrl) {
                setNewBrand((prev) => ({
                    ...prev,
                    brandImageUrl: res.imageUrl,
                }));
            }
        });
        e.target.value = '';
    };

    const triggerEditFileSelect = (brandId) => {
        const inputEl = editFileInputsRef.current[brandId];
        if (inputEl) {
            inputEl.click();
        }
    };

    const handleSelectEditFile = (brandId, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file).then((res) => {
            if (res?.imageUrl) {
                setEditBrandForm((prev) => ({
                    ...prev,
                    brandImageUrl: res.imageUrl,
                }));
            }
        });
        e.target.value = '';
    };

    // =============================
    // ADD DIALOG STATE
    // =============================
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

    const emptyBrandForm = React.useMemo(() => ({
        brandName: '',
        brandDescription: '',
        brandImageUrl: '',
        brandWebsiteUrl: '',
    }), []);

    const [newBrand, setNewBrand] = React.useState(emptyBrandForm);

    const handleAddBrand = async () => {
        try {
            await createBrand(newBrand);
            setNewBrand(emptyBrandForm);
            setIsAddDialogOpen(false);
            refetch();
        } catch (err) {
            console.error('Add brand failed', err);
            alert('Add brand failed');
        }
    };

    // =============================
    // EDIT STATE
    // =============================
    const [editingBrandId, setEditingBrandId] = React.useState(null);
    const [editBrandForm, setEditBrandForm] = React.useState(emptyBrandForm);

    const handleEditBrand = (brand) => {
        setEditingBrandId(brand.brandId);
        setEditBrandForm({
            brandName: brand.brandName || '',
            brandDescription: brand.brandDescription || '',
            brandImageUrl: brand.brandImageUrl || '',
            brandWebsiteUrl: brand.brandWebsiteUrl || '',
        });
    };

    const handleSaveEdit = async (id) => {
        if (!window.confirm('Do you want to save changes?')) return;
        try {
            await updateBrand(id, editBrandForm);
            setEditingBrandId(null);
            refetch();
        } catch (err) {
            console.error('Update brand failed', err);
            alert('Update failed');
        }
    };

    const handleDeleteBrand = async (id) => {
        if (!window.confirm('Do you want to delete this brand?')) return;
        try {
            await deleteBrand(id);
            refetch();
        } catch (err) {
            console.error('Delete brand failed', err);
            alert('Delete failed');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header + Add Button */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Brands Management</h1>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Brand
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg w-full">
                            <DialogHeader>
                                <DialogTitle>Add New Brand</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Brand Name */}
                                <div>
                                    <Label>Brand Name</Label>
                                    <Input
                                        value={newBrand.brandName}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandName: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Brand Description */}
                                <div>
                                    <Label>Brand Description</Label>
                                    <Textarea
                                        value={newBrand.brandDescription}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandDescription: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Brand Image (preview + upload) */}
                                <div className="flex flex-col gap-2">
                                    <Label>Brand Logo</Label>

                                    {newBrand.brandImageUrl ? (
                                        <img
                                            src={newBrand.brandImageUrl}
                                            alt="brand preview"
                                            className="h-16 w-16 rounded-md object-cover border"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground text-center p-1">
                                            <ImageIcon className="h-4 w-4 mr-1" />
                                            No logo
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={uploadingImage}
                                            onClick={triggerAddFileSelect}
                                        >
                                            <UploadIcon className="h-4 w-4 mr-1" />
                                            {uploadingImage ? 'Uploading...' : 'Upload Logo'}
                                        </Button>

                                        {uploadError && (
                                            <span className="text-xs text-red-500">
                                                {uploadError}
                                            </span>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={addFileInputRef}
                                        onChange={handleSelectAddFile}
                                    />
                                </div>

                                {/* Brand Website URL */}
                                <div>
                                    <Label>Brand Website URL</Label>
                                    <Input
                                        value={newBrand.brandWebsiteUrl}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandWebsiteUrl: e.target.value })
                                        }
                                    />
                                </div>

                                <Button className="w-full" onClick={handleAddBrand} disabled={uploadingImage}>
                                    Add Brand
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Loading / Error / Table */}
                {loading ? (
                    <div className="text-center py-6">Loading brands...</div>
                ) : error ? (
                    <div className="text-center py-6 text-red-500">{error}</div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Brands ({brands.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Logo</TableHead>
                                        <TableHead>Brand Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Website</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {brands.map((b) => (
                                        <TableRow key={b.brandId}>
                                            {/* Logo cell */}
                                            <TableCell className="align-top">
                                                {editingBrandId === b.brandId ? (
                                                    <div className="flex flex-col gap-2">
                                                        {/* preview */}
                                                        {editBrandForm.brandImageUrl ? (
                                                            <img
                                                                src={editBrandForm.brandImageUrl}
                                                                alt="brand preview"
                                                                className="h-12 w-12 rounded-md object-cover border"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                                                                <ImageIcon className="h-4 w-4 mr-1" />
                                                                No logo
                                                            </div>
                                                        )}

                                                        {/* nút upload */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={uploadingImage}
                                                                onClick={() => triggerEditFileSelect(b.brandId)}
                                                            >
                                                                <UploadIcon className="h-4 w-4 mr-1" />
                                                                {uploadingImage ? 'Uploading...' : 'Change Logo'}
                                                            </Button>

                                                            {uploadError && (
                                                                <span className="text-[10px] text-red-500">
                                                                    {uploadError}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* input file ẩn cho từng brand */}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            ref={(el) => {
                                                                editFileInputsRef.current[b.brandId] = el;
                                                            }}
                                                            onChange={(e) => handleSelectEditFile(b.brandId, e)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <ImageWithFallback
                                                        src={b.brandImageUrl || '/placeholder.png'}
                                                        alt={b.brandName || `Brand #${b.brandId}`}
                                                        className="h-12 w-12 rounded-md object-cover"
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Brand Name */}
                                            <TableCell className="align-top">
                                                {editingBrandId === b.brandId ? (
                                                    <Input
                                                        value={editBrandForm.brandName}
                                                        onChange={(e) =>
                                                            setEditBrandForm({
                                                                ...editBrandForm,
                                                                brandName: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    b.brandName
                                                )}
                                            </TableCell>

                                            {/* Description */}
                                            <TableCell className="align-top">
                                                {editingBrandId === b.brandId ? (
                                                    <Textarea
                                                        value={editBrandForm.brandDescription}
                                                        onChange={(e) =>
                                                            setEditBrandForm({
                                                                ...editBrandForm,
                                                                brandDescription: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    b.brandDescription
                                                )}
                                            </TableCell>

                                            {/* Website */}
                                            <TableCell className="align-top">
                                                {editingBrandId === b.brandId ? (
                                                    <Input
                                                        value={editBrandForm.brandWebsiteUrl}
                                                        onChange={(e) =>
                                                            setEditBrandForm({
                                                                ...editBrandForm,
                                                                brandWebsiteUrl: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    b.brandWebsiteUrl ? (
                                                        <a
                                                            href={b.brandWebsiteUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-500 underline break-all"
                                                        >
                                                            {b.brandWebsiteUrl}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="flex gap-2 align-top">
                                                {editingBrandId === b.brandId ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(b.brandId)}
                                                            disabled={uploadingImage}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingBrandId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditBrand(b)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteBrand(b.brandId)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
