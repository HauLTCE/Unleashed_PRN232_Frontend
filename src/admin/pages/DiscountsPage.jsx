import React from 'react';

// Import các component UI
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Textarea } from '../../components/ui/textarea';

// Import layout và icons
import { Copy, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';

// Import hook và service
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { useDiscounts } from '../../hooks/Discount/useDiscount';
import * as discountService from '../../services/discountService';

const ITEMS_PER_PAGE = 10;

export function DiscountsPage() {
  // State cho các bộ lọc và phân trang
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);

  // State cho Dialog và form tạo mới
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  // State ban đầu cho form
  const initialFormState = {
    discountTypeId: 1,
    discountCode: '',
    discountValue: 0,
    discountDescription: '',
    discountMinimumOrderValue: 0,
    discountMaximumValue: 0,
    discountUsageLimit: 100,
    discountEndDate: '',
  };
  const [newDiscount, setNewDiscount] = React.useState(initialFormState);

  // Chuyển đổi giá trị filter sang ID mà API yêu cầu
  const statusIdForApi = statusFilter === 'all' ? undefined : (statusFilter === 'active' ? 1 : 2);

  // Sử dụng hook để fetch dữ liệu
  const { discounts, loading: isLoading, error: fetchError, refetch } = useDiscounts({
    search: searchQuery,
    statusId: statusIdForApi,
  });

  // Logic phân trang ở client-side
  const totalPages = Math.ceil(discounts.length / ITEMS_PER_PAGE);
  const paginatedDiscounts = discounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // === CÁC HÀM XỬ LÝ SỰ KIỆN ===

  const handleAddDiscount = async () => {
    if (!newDiscount.discountCode || !newDiscount.discountEndDate || newDiscount.discountValue <= 0) {
      alert('Please fill in Code, Value, and Expiration Date.');
      return;
    }

    const payload = {
      discountStatusId: 1, // Active
      discountTypeId: Number(newDiscount.discountTypeId),
      discountCode: newDiscount.discountCode,
      discountValue: Number(newDiscount.discountValue),
      discountDescription: newDiscount.discountDescription,
      discountMinimumOrderValue: Number(newDiscount.discountMinimumOrderValue),
      discountMaximumValue: Number(newDiscount.discountMaximumValue),
      discountUsageLimit: Number(newDiscount.discountUsageLimit),
      discountStartDate: new Date().toISOString(),
      discountEndDate: new Date(newDiscount.discountEndDate).toISOString(),
    };

    setIsCreating(true);
    try {
      await discountService.createDiscount(payload);
      setIsAddDialogOpen(false);
      setNewDiscount(initialFormState);
      refetch();
    } catch (error) {
      console.error("Failed to create discount:", error);
      alert(`Error creating discount: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await discountService.deleteDiscount(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete discount:", error);
        alert(`Error deleting discount: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleToggleStatus = async (discount) => {
    // 1. Kiểm tra đầu vào nghiêm ngặt
    if (!discount || typeof discount.discountId !== 'number' || typeof discount.discountStatusId !== 'number') {
      console.error("Invalid discount object provided. Cannot proceed.", discount);
      alert("Cannot update status: Invalid data provided.");
      return;
    }

    // 2. Xác định trạng thái mới (Active = 1, Inactive = 2)
    const newStatusId = discount.discountStatusId === 1 ? 2 : 1;

    const updatePayload = {
      discountStatusId: newStatusId,
      discountTypeId: discount.discountTypeId ?? 0,
      discountCode: discount.discountCode ?? '',
      discountValue: discount.discountValue ?? 0,
      discountDescription: discount.discountDescription ?? null,
      discountMinimumOrderValue: discount.discountMinimumOrderValue ?? 0,
      discountMaximumValue: discount.discountMaximumValue ?? null,
      discountUsageLimit: discount.discountUsageLimit ?? 0,
      discountStartDate: discount.discountStartDate ?? new Date().toISOString(),
      discountEndDate: discount.discountEndDate ?? new Date().toISOString(),
    };

    console.log("Attempting to send update payload:", updatePayload);

    try {
      await discountService.updateDiscount(discount.discountId, updatePayload);
      refetch();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(`Error updating status: ${error.response?.data?.message || error.message}`);
    }
  };
  // === CÁC HÀM HELPER ===

  const getStatusBadge = (status) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    const lower = String(status).toLowerCase();
    if (lower === 'active') {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
    }
    if (lower === 'inactive') {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Inactive</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const copyToClipboard = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      alert(`Copied "${code}" to clipboard!`);
    });
  };

  if (isLoading) { return <AdminLayout><div>Loading...</div></AdminLayout>; }
  if (fetchError) { return <AdminLayout><div>Error: {fetchError}</div></AdminLayout>; }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Discounts</h1>
            <p className="text-muted-foreground">Manage your discount codes and promotions.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add New Discount</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create New Discount</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="discountCode">Discount Code</Label>
                  <Input id="discountCode" value={newDiscount.discountCode} onChange={(e) => setNewDiscount({ ...newDiscount, discountCode: e.target.value.toUpperCase() })} placeholder="SUMMER25" />
                </div>
                <div>
                  <Label htmlFor="discountDescription">Description</Label>
                  <Textarea id="discountDescription" value={newDiscount.discountDescription} onChange={(e) => setNewDiscount({ ...newDiscount, discountDescription: e.target.value })} placeholder="Describe the promotion" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountValue">Value</Label>
                    <Input id="discountValue" type="number" value={newDiscount.discountValue} onChange={(e) => setNewDiscount({ ...newDiscount, discountValue: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="discountTypeId">Type</Label>
                    <Select value={String(newDiscount.discountTypeId)} onValueChange={(value) => setNewDiscount({ ...newDiscount, discountTypeId: Number(value) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Percentage (%)</SelectItem>
                        <SelectItem value="2">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountMinimumOrderValue">Min. Order Value</Label>
                    <Input id="discountMinimumOrderValue" type="number" value={newDiscount.discountMinimumOrderValue} onChange={(e) => setNewDiscount({ ...newDiscount, discountMinimumOrderValue: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="discountMaximumValue">Max. Discount Value</Label>
                    <Input id="discountMaximumValue" type="number" value={newDiscount.discountMaximumValue} onChange={(e) => setNewDiscount({ ...newDiscount, discountMaximumValue: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="discountUsageLimit">Usage Limit</Label>
                  <Input id="discountUsageLimit" type="number" value={newDiscount.discountUsageLimit} onChange={(e) => setNewDiscount({ ...newDiscount, discountUsageLimit: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="discountEndDate">Expiration Date</Label>
                  <Input id="discountEndDate" type="date" value={newDiscount.discountEndDate} onChange={(e) => setNewDiscount({ ...newDiscount, discountEndDate: e.target.value })} />
                </div>
                <Button onClick={handleAddDiscount} disabled={isCreating} className="w-full">
                  {isCreating ? 'Creating...' : 'Create Discount'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Search by code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Discount Codes ({discounts.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{paginatedDiscounts.map((discount) => (
                <TableRow key={discount.discountId}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-mono">
                      {discount.discountCode}
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(discount.discountCode)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{discount.discountValue}{discount.discountTypeName === 'PERCENTAGE' ? '%' : '$'} off</TableCell>
                  <TableCell>0 / {discount.discountUsageLimit}</TableCell>
                  <TableCell>{new Date(discount.discountEndDate).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(discount.discountStatusName)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/discounts/${discount.discountId}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View/Edit"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(discount)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDiscount(discount.discountId)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                    {[...Array(totalPages).keys()].map((page) => (
                      <PaginationItem key={page + 1}>
                        <PaginationLink onClick={() => setCurrentPage(page + 1)} isActive={currentPage === page + 1} className="cursor-pointer">{page + 1}</PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}