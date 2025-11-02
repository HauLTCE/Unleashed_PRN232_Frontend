// src/admin/pages/CategoriesPage.jsx
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

import { useCategories } from '@/hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '@/services/CategoriesService';

// 🌟 dùng lại hook upload ảnh
import { useImageUpload } from '@/hooks/useImageUpload';

export function CategoriesPage() {
    const { categories, loading, error, refetch } = useCategories();

    // =============================
    // Upload logic
    // =============================
    const {
        uploadFile,
        loading: uploadingImage,
        error: uploadError,
    } = useImageUpload();

    const addFileInputRef = React.useRef(null);
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
                setNewCategory((prev) => ({
                    ...prev,
                    categoryImageUrl: res.imageUrl,
                }));
            }
        });
        e.target.value = '';
    };

    const triggerEditFileSelect = (categoryId) => {
        const inputEl = editFileInputsRef.current[categoryId];
        if (inputEl) {
            inputEl.click();
        }
    };

    const handleSelectEditFile = (categoryId, e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        uploadFile(file).then((res) => {
            if (res?.imageUrl) {
                setEditCategoryForm((prev) => ({
                    ...prev,
                    categoryImageUrl: res.imageUrl,
                }));
            }
        });
        e.target.value = '';
    };

    // =============================
    // ADD DIALOG STATE
    // =============================
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

    const emptyCategoryForm = React.useMemo(() => ({
        categoryName: '',
        categoryDescription: '',
        categoryImageUrl: '',
    }), []);

    const [newCategory, setNewCategory] = React.useState(emptyCategoryForm);

    const handleAddCategory = async () => {
        try {
            await createCategory(newCategory);
            setNewCategory(emptyCategoryForm);
            setIsAddDialogOpen(false);
            refetch();
        } catch (err) {
            console.error('Add category failed', err);
            alert('Add category failed');
        }
    };

    // =============================
    // EDIT STATE
    // =============================
    const [editingCategoryId, setEditingCategoryId] = React.useState(null);
    const [editCategoryForm, setEditCategoryForm] = React.useState(emptyCategoryForm);

    const handleEditCategory = (category) => {
        setEditingCategoryId(category.categoryId);
        setEditCategoryForm({
            categoryName: category.categoryName || '',
            categoryDescription: category.categoryDescription || '',
            categoryImageUrl: category.categoryImageUrl || '',
        });
    };

    const handleSaveEdit = async (id) => {
        if (!window.confirm('Do you want to save changes?')) return;
        try {
            await updateCategory(id, editCategoryForm);
            setEditingCategoryId(null);
            refetch();
        } catch (err) {
            console.error('Update category failed', err);
            alert('Update failed');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Do you want to delete this category?')) return;
        try {
            await deleteCategory(id);
            refetch();
        } catch (err) {
            console.error('Delete category failed', err);
            alert('Delete failed');
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header + Add Button */}
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Categories Management</h1>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg w-full">
                            <DialogHeader>
                                <DialogTitle>Add New Category</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Category Name */}
                                <div>
                                    <Label>Category Name</Label>
                                    <Input
                                        value={newCategory.categoryName}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, categoryName: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <Label>Category Description</Label>
                                    <Textarea
                                        value={newCategory.categoryDescription}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, categoryDescription: e.target.value })
                                        }
                                    />
                                </div>

                                {/* Image upload */}
                                <div className="flex flex-col gap-2">
                                    <Label>Category Image</Label>

                                    {newCategory.categoryImageUrl ? (
                                        <img
                                            src={newCategory.categoryImageUrl}
                                            alt="category preview"
                                            className="h-16 w-16 rounded-md object-cover border"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground text-center p-1">
                                            <ImageIcon className="h-4 w-4 mr-1" />
                                            No image
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
                                            {uploadingImage ? 'Uploading...' : 'Upload Image'}
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

                                <Button
                                    className="w-full"
                                    onClick={handleAddCategory}
                                    disabled={uploadingImage}
                                >
                                    Add Category
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Loading/Error/Table */}
                {loading ? (
                    <div className="text-center py-6">Loading categories...</div>
                ) : error ? (
                    <div className="text-center py-6 text-red-500">{error}</div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Categories ({categories.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Category Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {categories.map((c) => (
                                        <TableRow key={c.categoryId}>
                                            {/* Image cell */}
                                            <TableCell className="align-top">
                                                {editingCategoryId === c.categoryId ? (
                                                    <div className="flex flex-col gap-2">
                                                        {/* preview */}
                                                        {editCategoryForm.categoryImageUrl ? (
                                                            <img
                                                                src={editCategoryForm.categoryImageUrl}
                                                                alt="category preview"
                                                                className="h-12 w-12 rounded-md object-cover border"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center text-[10px] text-muted-foreground text-center p-1">
                                                                <ImageIcon className="h-4 w-4 mr-1" />
                                                                No image
                                                            </div>
                                                        )}

                                                        {/* upload btn */}
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={uploadingImage}
                                                                onClick={() => triggerEditFileSelect(c.categoryId)}
                                                            >
                                                                <UploadIcon className="h-4 w-4 mr-1" />
                                                                {uploadingImage ? 'Uploading...' : 'Change Image'}
                                                            </Button>

                                                            {uploadError && (
                                                                <span className="text-[10px] text-red-500">
                                                                    {uploadError}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* input file ẩn */}
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            ref={(el) => {
                                                                editFileInputsRef.current[c.categoryId] = el;
                                                            }}
                                                            onChange={(e) => handleSelectEditFile(c.categoryId, e)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <ImageWithFallback
                                                        src={c.categoryImageUrl || '/placeholder.png'}
                                                        alt={c.categoryName || `Category #${c.categoryId}`}
                                                        className="h-12 w-12 rounded-md object-cover"
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Category Name */}
                                            <TableCell className="align-top">
                                                {editingCategoryId === c.categoryId ? (
                                                    <Input
                                                        value={editCategoryForm.categoryName}
                                                        onChange={(e) =>
                                                            setEditCategoryForm({
                                                                ...editCategoryForm,
                                                                categoryName: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    c.categoryName
                                                )}
                                            </TableCell>

                                            {/* Description */}
                                            <TableCell className="align-top">
                                                {editingCategoryId === c.categoryId ? (
                                                    <Textarea
                                                        value={editCategoryForm.categoryDescription}
                                                        onChange={(e) =>
                                                            setEditCategoryForm({
                                                                ...editCategoryForm,
                                                                categoryDescription: e.target.value,
                                                            })
                                                        }
                                                    />
                                                ) : (
                                                    c.categoryDescription
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="flex gap-2 align-top">
                                                {editingCategoryId === c.categoryId ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(c.categoryId)}
                                                            disabled={uploadingImage}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setEditingCategoryId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditCategory(c)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteCategory(c.categoryId)}
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
