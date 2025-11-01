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
import { Plus, Trash2, X, Edit } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';

import { useBrands } from '@/hooks/useBrands';
import { createBrand, updateBrand, deleteBrand } from '@/services/BrandsService';

export function BrandsPage() {
    const { brands, loading, error, refetch } = useBrands();

    // ADD DIALOG
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
    const emptyBrandForm = React.useMemo(() => ({
        brandName: '',
        brandDescription: '',
        brandImageUrl: '',
        brandWebsiteUrl: '',
    }), []);
    const [newBrand, setNewBrand] = React.useState(emptyBrandForm);

    // EDIT STATE
    const [editingBrandId, setEditingBrandId] = React.useState(null);
    const [editBrandForm, setEditBrandForm] = React.useState(emptyBrandForm);

    // --- Handlers ---
    const handleAddBrand = async () => {
        try {
            await createBrand(newBrand);
            setNewBrand(emptyBrandForm);
            setIsAddDialogOpen(false);
            refetch(); // tự động load lại dữ liệu
        } catch (err) {
            console.error('Add brand failed', err);
            alert('Add brand failed');
        }
    };

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
            refetch(); // tự động load lại dữ liệu
        } catch (err) {
            console.error('Update brand failed', err);
            alert('Update failed');
        }
    };

    const handleDeleteBrand = async (id) => {
        if (!window.confirm('Do you want to delete this brand?')) return;
        try {
            await deleteBrand(id);
            refetch(); // tự động load lại dữ liệu
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
                                <div>
                                    <Label>Brand Name</Label>
                                    <Input
                                        value={newBrand.brandName}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandName: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Brand Description</Label>
                                    <Textarea
                                        value={newBrand.brandDescription}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandDescription: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Brand Image URL</Label>
                                    <Input
                                        value={newBrand.brandImageUrl}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandImageUrl: e.target.value })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Brand Website URL</Label>
                                    <Input
                                        value={newBrand.brandWebsiteUrl}
                                        onChange={(e) =>
                                            setNewBrand({ ...newBrand, brandWebsiteUrl: e.target.value })
                                        }
                                    />
                                </div>
                                <Button className="w-full" onClick={handleAddBrand}>
                                    Add Brand
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Loading/Error */}
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
                                            <TableCell>
                                                <ImageWithFallback
                                                    src={b.brandImageUrl || '/placeholder.png'}
                                                    alt={b.brandName || `Brand #${b.brandId}`}
                                                    className="h-12 w-12 rounded-md object-cover"
                                                />
                                            </TableCell>

                                            {/* Brand info */}
                                            <TableCell>
                                                {editingBrandId === b.brandId ? (
                                                    <Input
                                                        value={editBrandForm.brandName}
                                                        onChange={(e) =>
                                                            setEditBrandForm({ ...editBrandForm, brandName: e.target.value })
                                                        }
                                                    />
                                                ) : b.brandName}
                                            </TableCell>

                                            <TableCell>
                                                {editingBrandId === b.brandId ? (
                                                    <Textarea
                                                        value={editBrandForm.brandDescription}
                                                        onChange={(e) =>
                                                            setEditBrandForm({ ...editBrandForm, brandDescription: e.target.value })
                                                        }
                                                    />
                                                ) : b.brandDescription}
                                            </TableCell>

                                            <TableCell>
                                                {editingBrandId === b.brandId ? (
                                                    <Input
                                                        value={editBrandForm.brandWebsiteUrl}
                                                        onChange={(e) =>
                                                            setEditBrandForm({ ...editBrandForm, brandWebsiteUrl: e.target.value })
                                                        }
                                                    />
                                                ) : (
                                                    b.brandWebsiteUrl ? (
                                                        <a href={b.brandWebsiteUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">
                                                            {b.brandWebsiteUrl}
                                                        </a>
                                                    ) : '-'
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="flex gap-2">
                                                {editingBrandId === b.brandId ? (
                                                    <>
                                                        <Button size="sm" onClick={() => handleSaveEdit(b.brandId)}>Save</Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingBrandId(null)}>Cancel</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button size="sm" variant="ghost" onClick={() => handleEditBrand(b)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" variant="ghost" onClick={() => handleDeleteBrand(b.brandId)}>
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
