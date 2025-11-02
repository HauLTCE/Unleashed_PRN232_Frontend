import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Warehouse, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStocks from '../../hooks/Inventory/useStocks';
import { toast } from 'sonner';

export default function StockPage() {
  const { stocks, loading, error, createStock, updateStock, deleteStock } = useStocks();
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const emptyStock = { stockId: null, stockName: '', stockAddress: '' };

  const handleOpenNew = () => {
    setIsEdit(false);
    setSelectedStock(emptyStock);
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (stock) => {
    setIsEdit(true);
    setSelectedStock({ ...stock });
    setIsFormDialogOpen(true);
  };

  const handleOpenView = (stock) => {
    setSelectedStock(stock);
    setIsViewDialogOpen(true);
  };

  const handleOpenDelete = (stock) => {
    setSelectedStock(stock);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStock) return;
    try {
      await deleteStock(selectedStock.stockId);
      toast.success('Warehouse deleted successfully.');
      setIsDeleteDialogOpen(false);
      setSelectedStock(null);
    } catch (err) {
      toast.error('Failed to delete warehouse.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateStock(selectedStock.stockId, selectedStock);
        toast.success('Warehouse updated successfully.');
      } else {
        await createStock(selectedStock);
        toast.success('Warehouse created successfully.');
      }
      setIsFormDialogOpen(false);
      setSelectedStock(null);
    } catch (err) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} warehouse.`);
    }
  };

  const handleFormDialogChange = (open) => {
    if (!open) setSelectedStock(null);
    setIsFormDialogOpen(open);
  }

  if (loading) return <AdminLayout><p>Loading warehouses...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-destructive">Error loading warehouses.</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="text-muted-foreground">Manage all your inventory locations.</p>
          </div>
          <Button onClick={handleOpenNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <Card key={stock.stockId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  {stock.stockName}
                </CardTitle>
                <CardDescription>{stock.stockAddress || 'No address specified'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate(`/admin/stock/${stock.stockId}`)}
                >
                  View Inventory
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleOpenView(stock)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleOpenEdit(stock)}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleOpenDelete(stock)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedStock?.stockName}</DialogTitle>
              <DialogDescription>Details for this warehouse location.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <p className="col-span-3">{selectedStock?.stockName}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Address</Label>
                <p className="col-span-3">{selectedStock?.stockAddress || 'N/A'}</p>
              </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isFormDialogOpen} onOpenChange={handleFormDialogChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="stockName">Warehouse Name</Label>
                <Input
                  id="stockName"
                  value={selectedStock?.stockName || ''}
                  onChange={(e) => setSelectedStock({ ...selectedStock, stockName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stockAddress">Address</Label>
                <Input
                  id="stockAddress"
                  value={selectedStock?.stockAddress || ''}
                  onChange={(e) => setSelectedStock({ ...selectedStock, stockAddress: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">{isEdit ? 'Save Changes' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the 
                        <span className="font-semibold"> {selectedStock?.stockName} </span> 
                        warehouse, all inventory data and all transaction data related to the warehouse.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleConfirmDelete}>Confirm Delete (DANGER)</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}