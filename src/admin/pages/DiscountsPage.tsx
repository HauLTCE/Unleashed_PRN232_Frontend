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
import { Textarea } from '../../components/ui/textarea';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Plus, Search, Edit, Trash2, Copy } from 'lucide-react';
import { mockDiscounts, Discount } from '../data/mockData';

const ITEMS_PER_PAGE = 10;

export function DiscountsPage() {
  const [discounts, setDiscounts] = React.useState<Discount[]>(mockDiscounts);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [newDiscount, setNewDiscount] = React.useState<Partial<Discount>>({
    code: '',
    discount: 0,
    type: 'percentage',
    expirationDate: '',
    status: 'active',
    usageLimit: undefined
  });

  // Filter discounts
  const filteredDiscounts = React.useMemo(() => {
    return discounts.filter(discount => {
      const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [discounts, searchQuery, statusFilter]);

  // Paginate discounts
  const totalPages = Math.ceil(filteredDiscounts.length / ITEMS_PER_PAGE);
  const paginatedDiscounts = filteredDiscounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddDiscount = () => {
    const discount: Discount = {
      id: `DISC-${Date.now()}`,
      code: newDiscount.code || '',
      discount: newDiscount.discount || 0,
      type: newDiscount.type as 'percentage' | 'fixed' || 'percentage',
      expirationDate: newDiscount.expirationDate || '',
      status: newDiscount.status as 'active' | 'inactive' || 'active',
      usageCount: 0,
      usageLimit: newDiscount.usageLimit
    };
    
    setDiscounts([...discounts, discount]);
    setIsAddDialogOpen(false);
    setNewDiscount({
      code: '',
      discount: 0,
      type: 'percentage',
      expirationDate: '',
      status: 'active',
      usageLimit: undefined
    });
  };

  const handleDeleteDiscount = (id: string) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setDiscounts(discounts.map(d => 
      d.id === id 
        ? { ...d, status: d.status === 'active' ? 'inactive' : 'active' as 'active' | 'inactive' }
        : d
    ));
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  // Calculate stats
  const stats = React.useMemo(() => {
    const active = filteredDiscounts.filter(d => d.status === 'active').length;
    const expired = filteredDiscounts.filter(d => isExpired(d.expirationDate)).length;
    const totalUsage = filteredDiscounts.reduce((sum, d) => sum + d.usageCount, 0);
    
    return { active, expired, totalUsage };
  }, [filteredDiscounts]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Discount & Promotions</h1>
            <p className="text-muted-foreground">Manage discount codes and promotional campaigns</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Discount
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Discount Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({...newDiscount, code: e.target.value.toUpperCase()})}
                    placeholder="SAVE20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discount">Discount Value</Label>
                    <Input
                      id="discount"
                      type="number"
                      value={newDiscount.discount}
                      onChange={(e) => setNewDiscount({...newDiscount, discount: parseFloat(e.target.value)})}
                      placeholder="20"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={newDiscount.type} onValueChange={(value) => setNewDiscount({...newDiscount, type: value as 'percentage' | 'fixed'})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Input
                    id="expiration"
                    type="date"
                    value={newDiscount.expirationDate}
                    onChange={(e) => setNewDiscount({...newDiscount, expirationDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={newDiscount.usageLimit || ''}
                    onChange={(e) => setNewDiscount({...newDiscount, usageLimit: e.target.value ? parseInt(e.target.value) : undefined})}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={newDiscount.status} onValueChange={(value) => setNewDiscount({...newDiscount, status: value as 'active' | 'inactive'})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddDiscount} className="w-full">
                  Create Discount Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Active Discounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <p className="text-xs text-muted-foreground">Expired Discounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <p className="text-xs text-muted-foreground">Total Redemptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search discount codes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Discounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Codes ({filteredDiscounts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {discount.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(discount.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {discount.discount}
                      {discount.type === 'percentage' ? '%' : '$'} off
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{discount.usageCount}</div>
                        {discount.usageLimit && (
                          <div className="text-xs text-muted-foreground">
                            of {discount.usageLimit} limit
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={isExpired(discount.expirationDate) ? 'text-red-600' : ''}>
                        {new Date(discount.expirationDate).toLocaleDateString()}
                        {isExpired(discount.expirationDate) && (
                          <div className="text-xs">Expired</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(discount.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(discount.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteDiscount(discount.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
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