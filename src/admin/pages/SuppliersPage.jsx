import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Upload as UploadIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProviders } from '../../hooks/Inventory/useProviders';
import { useImageUpload } from '../../hooks/useImageUpload';

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

  const {
    uploadFile,
    loading: uploadingImage,
    error: uploadError,
  } = useImageUpload();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState(null);
  const [newProvider, setNewProvider] = React.useState({
    providerName: '',
    providerImageUrl: '',
    providerEmail: '',
    providerPhone: '',
    providerAddress: '',
  });

  const addFileInputRef = React.useRef(null);
  const editFileInputRef = React.useRef(null);

  const filteredProviders = React.useMemo(() => {
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

  const totalPages = Math.ceil(filteredProviders.length / ITEMS_PER_PAGE);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectFileForNewProvider = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      if (res && res.imageUrl) {
        setNewProvider(prev => ({ ...prev, providerImageUrl: res.imageUrl }));
      }
    } catch (err) {
      toast.error('Image upload failed.');
    }
    e.target.value = '';
  };

  const handleSelectFileForSelectedProvider = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadFile(file);
      if (res && res.imageUrl) {
        setSelectedProvider(prev => ({ ...prev, providerImageUrl: res.imageUrl }));
      }
    } catch (err) {
      toast.error('Image upload failed.');
    }
    e.target.value = '';
  };

  const handleAddProvider = async () => {
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

  const handleEditProvider = async () => {
    if (!selectedProvider) return;
    try {
      await updateProvider(selectedProvider.providerId, selectedProvider);
      toast.success('Provider updated successfully');
      setIsEditDialogOpen(false);
      setSelectedProvider(null);
    } catch {
      toast.error('Failed to update provider');
    }
  };

  const handleDeleteProvider = async (id) => {
    try {
      await deleteProvider(id);
      toast.success('Provider deleted successfully');
    } catch {
      toast.error('Failed to delete provider');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-muted-foreground">Loading providers...</div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-red-600">Error loading providers: {error.message}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-foreground">Providers Management</h1>
            <p className="text-muted-foreground">Manage your provider relationships and contact information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Provider</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="providerName">Provider Name *</Label>
                  <Input
                    id="providerName"
                    value={newProvider.providerName}
                    onChange={(e) => setNewProvider({ ...newProvider, providerName: e.target.value })}
                    placeholder="Enter provider name"
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Provider Image</Label>
                  <div className="flex items-center gap-4">
                    {newProvider.providerImageUrl ? (
                      <img src={newProvider.providerImageUrl} alt="Provider Preview" className="h-20 w-20 rounded-md object-cover border" />
                    ) : (
                      <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => addFileInputRef.current?.click()}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <input type="file" accept="image/*" className="hidden" ref={addFileInputRef} onChange={handleSelectFileForNewProvider} />
                      {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerEmail">Email</Label>
                  <Input
                    id="providerEmail"
                    type="email"
                    value={newProvider.providerEmail}
                    onChange={(e) => setNewProvider({ ...newProvider, providerEmail: e.target.value })}
                    placeholder="provider@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="providerPhone">Phone</Label>
                  <Input
                    id="providerPhone"
                    value={newProvider.providerPhone}
                    maxLength={12}
                    onChange={(e) => setNewProvider({ ...newProvider, providerPhone: e.target.value })}
                    placeholder="e.g. +123456789"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="providerAddress">Address</Label>
                  <Input
                    id="providerAddress"
                    value={newProvider.providerAddress}
                    onChange={(e) => setNewProvider({ ...newProvider, providerAddress: e.target.value })}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddProvider} className="bg-primary text-primary-foreground hover:bg-primary/90">Add Provider</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Providers ({filteredProviders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProviders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No providers found.</p>
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
                    {paginatedProviders.map((provider) => (
                      <TableRow key={provider.providerId}>
                        <TableCell>
                          {provider.providerImageUrl ? (
                            <img src={provider.providerImageUrl} alt={provider.providerName} className="h-10 w-10 rounded-full object-cover border" />
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
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedProvider(provider); setIsViewDialogOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedProvider({ ...provider }); setIsEditDialogOpen(true); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProvider(provider.providerId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          {totalPages > 1 && (
            <CardFooter className="flex justify-end items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="editProviderName">Provider Name *</Label>
                  <Input id="editProviderName" value={selectedProvider.providerName} onChange={(e) => setSelectedProvider({ ...selectedProvider, providerName: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Provider Image</Label>
                  <div className="flex items-center gap-4">
                    {selectedProvider.providerImageUrl ? (
                      <img src={selectedProvider.providerImageUrl} alt="Provider Preview" className="h-20 w-20 rounded-md object-cover border" />
                    ) : (
                      <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <Button type="button" variant="outline" disabled={uploadingImage} onClick={() => editFileInputRef.current?.click()}>
                        <UploadIcon className="mr-2 h-4 w-4" />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <input type="file" accept="image/*" className="hidden" ref={editFileInputRef} onChange={handleSelectFileForSelectedProvider} />
                      {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProviderEmail">Email</Label>
                  <Input id="editProviderEmail" type="email" value={selectedProvider.providerEmail} onChange={(e) => setSelectedProvider({ ...selectedProvider, providerEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProviderPhone">Phone</Label>
                  <Input id="editProviderPhone" value={selectedProvider.providerPhone} onChange={(e) => setSelectedProvider({ ...selectedProvider, providerPhone: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="editProviderAddress">Address</Label>
                  <Input id="editProviderAddress" value={selectedProvider.providerAddress} onChange={(e) => setSelectedProvider({ ...selectedProvider, providerAddress: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditProvider}>Save Changes</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provider Details</DialogTitle>
          </DialogHeader>
          {selectedProvider && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4">
                {selectedProvider.providerImageUrl ? (
                  <img src={selectedProvider.providerImageUrl} alt={selectedProvider.providerName} className="h-20 w-20 rounded-full object-cover border-2" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-medium">
                    {selectedProvider.providerName?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{selectedProvider.providerName}</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Email</p>
                  <p>{selectedProvider.providerEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Phone</p>
                  <p>{selectedProvider.providerPhone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-muted-foreground">Address</p>
                  <p>{selectedProvider.providerAddress || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
           <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}