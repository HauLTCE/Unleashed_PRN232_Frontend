import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Warehouse, Plus, MoreVertical, Edit, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStocks from '../../hooks/Inventory/useStocks';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

export default function StockPage() {
  const { stocks, loading, error, createStock, updateStock, deleteStock } = useStocks();
  const navigate = useNavigate();

  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isEdit, setIsEdit] = React.useState(false);
  const [currentStock, setCurrentStock] = React.useState({ stockId: null, stockName: '', stockAddress: '' });

  const openNewDialog = () => {
    setIsEdit(false);
    setCurrentStock({ stockId: null, stockName: '', stockAddress: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (stock) => {
    setIsEdit(true);
    setCurrentStock(stock);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await deleteStock(id);
        toast.success('Warehouse deleted successfully.');
      } catch (err) {
        toast.error('Failed to delete warehouse.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateStock(currentStock.stockId, currentStock);
        toast.success('Warehouse updated successfully.');
      } else {
        await createStock(currentStock);
        toast.success('Warehouse created successfully.');
      }
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} warehouse.`);
    }
  };

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
          <Button onClick={openNewDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <Card key={stock.stockId}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5" />
                      {stock.stockName}
                    </CardTitle>
                    <CardDescription>{stock.stockAddress || 'No address specified'}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(stock)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(stock.stockId)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/admin/stock/${stock.stockId}`)}>
                  View Inventory <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEdit ? 'Edit Warehouse' : 'Add New Warehouse'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <Label htmlFor="stockName">Warehouse Name</Label>
                <Input
                  id="stockName"
                  value={currentStock.stockName}
                  onChange={(e) => setCurrentStock({ ...currentStock, stockName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stockAddress">Address</Label>
                <Input
                  id="stockAddress"
                  value={currentStock.stockAddress}
                  onChange={(e) => setCurrentStock({ ...currentStock, stockAddress: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{isEdit ? 'Save Changes' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}