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
import { Plus, Trash2, Edit } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

import { useCategories } from '@/hooks/useCategories';
import { createCategory, updateCategory, deleteCategory } from '@/services/CategoriesService';

export function CategoriesPage() {
    const { categories, loading, error, refetch } = useCategories();

    // ADD DIALOG
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const emptyCategoryForm = React.useMemo(() => ({
        categoryName: '',
        categoryDescription: '',
        categoryImageUrl: '',
    }), []);
    const [newCategory, setNewCategory] = React.useState(emptyCategoryForm);

    // EDIT STATE
    const [editingCategoryId, setEditingCategoryId] = React.useState(null);
    const [editCategoryForm, setEditCategoryForm] = React.useState(emptyCategoryForm);

    // --- Handlers ---
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
                                <div>
                                    <Label>Category Name</Label>
                                    <Input
                                        value={newCategory.categoryName}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, categoryName: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Category Description</Label>
                                    <Textarea
                                        value={newCategory.categoryDescription}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, categoryDescription: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Category Image URL</Label>
                                    <Input
                                        value={newCategory.categoryImageUrl}
                                        onChange={(e) =>
                                            setNewCategory({ ...newCategory, categoryImageUrl: e.target.value })
                                        }
                                    />
                                </div>
                                <Button className="w-full" onClick={handleAddCategory}>
                                    Add Category
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Loading/Error */}
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
                                            <TableCell>
                                                <ImageWithFallback
                                                    src={c.categoryImageUrl || '/placeholder.png'}
                                                    alt={c.categoryName || `Category #${c.categoryId}`}
                                                    className="h-12 w-12 rounded-md object-cover"
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {editingCategoryId === c.categoryId ? (
                                                    <Input
                                                        value={editCategoryForm.categoryName}
                                                        onChange={(e) =>
                                                            setEditCategoryForm({ ...editCategoryForm, categoryName: e.target.value })
                                                        }
                                                    />
                                                ) : c.categoryName}
                                            </TableCell>

                                            <TableCell>
                                                {editingCategoryId === c.categoryId ? (
                                                    <Textarea
                                                        value={editCategoryForm.categoryDescription}
                                                        onChange={(e) =>
                                                            setEditCategoryForm({ ...editCategoryForm, categoryDescription: e.target.value })
                                                        }
                                                    />
                                                ) : c.categoryDescription}
                                            </TableCell>

                                            <TableCell className="flex gap-2">
                                                {editingCategoryId === c.categoryId ? (
                                                    <>
                                                        <Button size="sm" onClick={() => handleSaveEdit(c.categoryId)}>Save</Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingCategoryId(null)}>Cancel</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button size="sm" variant="ghost" onClick={() => handleEditCategory(c)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(c.categoryId)}>
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
