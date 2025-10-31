import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviders } from '../../hooks/Inventory/useProviders';

const ITEMS_PER_PAGE = 10;

export function SuppliersPage() {
  const {
    providers,
    loading,
    error,
    createProvider,
    updateProvider,
    deleteProvider,
  } = useProviders();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedSupplier, setSelectedSupplier] = React.useState(null);
  const [newProvider, setNewProvider] = React.useState({
    providerName: '',
    providerImageUrl: '',
    providerEmail: '',
    providerPhone: '',
    providerAddress: '',
  });


  // Filter suppliers
  const filteredSuppliers = React.useMemo(() => {
    if (!Array.isArray(providers)) return [];

    const query = searchQuery.toLowerCase();

    return providers.filter((provider) => {
      return (
        provider.providerName?.toLowerCase().includes(query) ||
        provider.providerEmail?.toLowerCase().includes(query) ||
        provider.providerPhone?.toLowerCase().includes(query) ||
        provider.providerAddress?.toLowerCase().includes(query)
      );
    });
  }, [providers, searchQuery]);


  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddSupplier = async () => {
    if (!newProvider.providerName) {
      toast.error('Provider name is required');
      return;
    }

    try {
      await createProvider(newProvider);
      toast.success('Provider added successfully');
      setIsAddDialogOpen(false);
      setNewProvider({
        providerName: '',
        providerImageUrl: '',
        providerEmail: '',
        providerPhone: '',
        providerAddress: '',
      });
    } catch (error) {
      toast.error('Failed to add provider');
    }
  };


  const handleEditSupplier = async () => {
    if (!selectedSupplier) return;
    try {
      await updateProvider(selectedSupplier.providerId, selectedSupplier);
      toast.success('Supplier updated successfully');
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
    } catch {
      toast.error('Failed to update supplier');
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await deleteProvider(id);
      toast.success('Supplier deleted successfully');
    } catch {
      toast.error('Failed to delete supplier');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-muted-foreground">Loading suppliers...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-600">Error loading suppliers: {error.message}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-foreground">Suppliers Management</h1>
            <p className="text-muted-foreground">Manage your supplier relationships and contact information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Provider</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4">
                {/* Provider Name */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="providerName">Provider Name *</Label>
                  <Input
                    id="providerName"
                    value={newProvider.providerName}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, providerName: e.target.value })
                    }
                    placeholder="Enter provider name"
                    required
                  />
                </div>

                {/* Provider Image URL */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="providerImageUrl">Image URL</Label>
                  <Input
                    id="providerImageUrl"
                    value={newProvider.providerImageUrl}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, providerImageUrl: e.target.value })
                    }
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {/* Provider Email */}
                <div className="space-y-2">
                  <Label htmlFor="providerEmail">Email</Label>
                  <Input
                    id="providerEmail"
                    type="email"
                    value={newProvider.providerEmail}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, providerEmail: e.target.value })
                    }
                    placeholder="provider@email.com"
                  />
                </div>

                {/* Provider Phone */}
                <div className="space-y-2">
                  <Label htmlFor="providerPhone">Phone</Label>
                  <Input
                    id="providerPhone"
                    value={newProvider.providerPhone}
                    maxLength={12}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, providerPhone: e.target.value })
                    }
                    placeholder="e.g. +123456789"
                  />
                </div>

                {/* Provider Address */}
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="providerAddress">Address</Label>
                  <Input
                    id="providerAddress"
                    value={newProvider.providerAddress}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, providerAddress: e.target.value })
                    }
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSupplier}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Add Provider
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSuppliers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No suppliers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Logo</TableHead>
                      <TableHead>Provider Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedSuppliers.length > 0 ? (
                      paginatedSuppliers.map((provider) => (
                        <TableRow key={provider.providerId}>
                          <TableCell>
                            {provider.providerImageUrl ? (
                              <img
                                src={provider.providerImageUrl}
                                alt={provider.providerName}
                                className="h-10 w-10 rounded-full object-cover border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                                {provider.providerName?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="font-medium">{provider.providerName}</TableCell>
                          <TableCell>{provider.providerEmail || '-'}</TableCell>
                          <TableCell>{provider.providerPhone || '-'}</TableCell>
                          <TableCell>{provider.providerAddress || '-'}</TableCell>

                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSupplier(provider);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSupplier(provider);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDeleteSupplier(provider.providerId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No providers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
