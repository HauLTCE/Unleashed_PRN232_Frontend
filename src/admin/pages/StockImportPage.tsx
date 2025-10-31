import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, Trash2, Loader2, Plus } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProviders } from '../../hooks/Inventory/useProviders';
import { usePagedVariations } from '../../hooks/Inventory/usePagedVariations';
import { transactionService } from '../../services/transactionService';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableRow } from '../../components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { formatVND } from '../../utils/formatters';

import { useAuth } from '../../hooks/User/useAuth';
import { useUser } from '../../hooks/User/useUser';

export default function StockImportPage() {
  const { stockId } = useParams();
  const navigate = useNavigate();
  const { providers } = useProviders();
  const {
    products,
    loading: loadingProducts,
    currentPage,
    totalPages,
    setSearchTerm,
    setCurrentPage,
  } = usePagedVariations();
  
  // ✅ CORRECT: Get the logged-in user's ID from the auth context
  const { userId } = useAuth();
  // ✅ CORRECT: Fetch the full user profile using the ID
  const { user: currentUser, loading: loadingUser } = useUser(userId);

  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [variationsToImport, setVariationsToImport] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVariation = (variation, product) => {
    if (!variationsToImport.find(v => v.variationId === variation.variationId)) {
      setVariationsToImport([{ ...variation, productName: product.productName, importQuantity: 1 }, ...variationsToImport]);
    } else {
      toast.info("This variation is already in the import list.");
    }
  };

  const handleQuantityChange = (variationId, quantity) => {
    const newQuantity = Math.max(0, parseInt(quantity) || 0);
    setVariationsToImport(variationsToImport.map(v => v.variationId === variationId ? { ...v, importQuantity: newQuantity } : v));
  };
  
  const removeVariationFromImport = (variationId) => {
    setVariationsToImport(variationsToImport.filter(v => v.variationId !== variationId));
  };

  const handleImportSubmit = async () => {
    if (!selectedProviderId) { toast.error('Please select a supplier.'); return; }
    const variationsPayload = variationsToImport.filter(v => v.importQuantity > 0).map(v => ({ variationId: v.variationId, quantity: v.importQuantity }));
    if (variationsPayload.length === 0) { toast.error('Please add at least one product.'); return; }
    
    // ✅ CORRECT: Use the username from the fetched user profile
    if (!currentUser?.userUsername) {
        toast.error("Could not identify the current user's username. Please try logging in again.");
        return;
    }

    setIsSubmitting(true);
    const importDto = {
      providerId: parseInt(selectedProviderId),
      stockId: parseInt(stockId),
      username: currentUser.userUsername,
      variations: variationsPayload,
    };

    try {
      await transactionService.createBulkImport(importDto);
      toast.success('Stock imported successfully!');
      navigate(`/admin/stock/${stockId}`);
    } catch (err) {
      toast.error('Failed to import stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loading = loadingProducts || loadingUser;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate(`/admin/stock/${stockId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Inventory
          </Button>
          <h1 className="text-3xl font-bold">Import New Stock</h1>
          <p className="text-muted-foreground">Add new inventory from a supplier to this warehouse.</p>
        </div>
        
        <div className="space-y-4">
          <Card className="max-w-xl">
            <CardHeader><CardTitle>Supplier</CardTitle></CardHeader>
            <CardContent>
              <Select onValueChange={setSelectedProviderId} value={selectedProviderId}>
                <SelectTrigger><SelectValue placeholder="Select a supplier" /></SelectTrigger>
                <SelectContent>{providers.map(p => <SelectItem key={p.providerId} value={String(p.providerId)}>{p.providerName}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <Card>
              <CardHeader>
                <CardTitle>Find Products</CardTitle>
                <CardDescription>Search for products and add their variations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder="Search by product name or code..." onChange={(e) => setSearchTerm(e.target.value)} className="mb-4" />
                <div className="space-y-4 min-h-[450px] relative">
                  {loading && <div className="absolute inset-0 flex items-center justify-center bg-background/50"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                  {!loading && products.length === 0 && <p className="text-center text-muted-foreground pt-10">No products found.</p>}
                  {!loading && products.map(product => (
                    <div key={product.productId} className="border rounded-lg">
                        <h3 className="font-semibold text-lg p-3 bg-muted/50 rounded-t-lg">{product.productName}</h3>
                        <div className="p-3 space-y-2">
                            {product.variations?.map(v => (
                               <div key={v.variationId} className="flex items-center gap-4 p-2 bg-background rounded-md border">
                                  <ImageWithFallback src={v.variationImage} alt={product.productName} className="h-16 w-16 rounded-md object-cover" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{v.color?.colorName ?? 'N/A'}, {v.size?.sizeName ?? 'N/A'}</p>
                                    <p className="text-sm font-semibold text-primary">{formatVND(v.variationPrice)}</p>
                                  </div>
                                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleAddVariation(v, product)}>
                                    <Plus className="h-4 w-4" />
                                  </Button>
                               </div>
                            ))}
                             {(!product.variations || product.variations.length === 0) && (
                                <p className="text-xs text-muted-foreground px-2">This product has no variations.</p>
                            )}
                        </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                      <PaginationItem><PaginationLink className="font-mono">{currentPage} / {totalPages}</PaginationLink></PaginationItem>
                      <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Products to Import ({variationsToImport.length})</CardTitle>
                <CardDescription>Review items and set quantities.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md min-h-[520px] max-h-[520px] overflow-y-auto">
                  {variationsToImport.length === 0 ? <div className="flex items-center justify-center h-full"><p className="text-center text-muted-foreground p-8">No variations selected.</p></div> : (
                    <Table>
                      <TableBody>
                        {variationsToImport.map(v => (
                          <TableRow key={v.variationId}>
                            <TableCell className="p-2">
                               <div className="flex items-center gap-3">
                                  <ImageWithFallback src={v.variationImage} alt={v.productName} className="h-12 w-12 rounded object-cover"/>
                                  <div>
                                    <p className="font-semibold text-sm">{v.productName}</p>
                                    <p className="text-xs text-muted-foreground">{v.color?.colorName ?? 'N/A'}, {v.size?.sizeName ?? 'N/A'}</p>
                                    <p className="text-xs font-medium">{formatVND(v.variationPrice)}</p>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell className="w-[100px] p-2">
                              <Input type="number" value={v.importQuantity} onChange={e => handleQuantityChange(v.variationId, e.target.value)} min="1" className="h-8" />
                            </TableCell>
                            <TableCell className="w-[40px] p-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeVariationFromImport(v.variationId)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => navigate(`/admin/stock/${stockId}`)}>Cancel</Button>
          <Button onClick={handleImportSubmit} disabled={isSubmitting || variationsToImport.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Import
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}