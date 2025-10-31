import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { Upload, ArrowLeft, Loader2, Package } from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback'; // Make sure this component is correctly imported
import { useParams, useNavigate } from 'react-router-dom';
import { formatVND } from '../../utils/formatters';
import { usePagedStockDetails } from '../../hooks/Inventory/usePagedStockDetails';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { Skeleton } from '../../components/ui/skeleton';

// A placeholder component for loading state to improve user experience
const InventorySkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <Skeleton className="h-7 w-2/5" />
          <Skeleton className="h-4 w-3/5 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5"><Skeleton className="h-5 w-24" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                  <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(2)].map((_, j) => (
                  <TableRow key={j}>
                    <TableCell><div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-md" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function StockDetailPage() {
  const { stockId } = useParams();
  const navigate = useNavigate();
  const {
    paginatedProductGroups,
    totalItems,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
  } = usePagedStockDetails(stockId);

  const getStockBadge = (qty) => {
    if (qty <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty < 10) return <Badge variant="secondary" className="bg-yellow-400 text-yellow-900">Low Stock</Badge>;
    return <Badge variant="default" className="bg-green-500 hover:bg-green-600">In Stock</Badge>;
  };

  if (error) return <AdminLayout><p className="text-destructive text-center py-10">Failed to load inventory data. Please try again.</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="ghost" size="sm" className="mb-2" onClick={() => navigate('/admin/stock')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Warehouses
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Warehouse Inventory</h1>
            <p className="text-muted-foreground">A total of {totalItems} variation items are being tracked in this location.</p>
          </div>
          <Button onClick={() => navigate(`/admin/stock/${stockId}/import`)}>
            <Upload className="h-4 w-4 mr-2" /> Import Stock
          </Button>
        </div>
        
        {loading ? (
          <InventorySkeleton />
        ) : paginatedProductGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center py-20 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold">No Products Found</h3>
              <p>This warehouse is currently empty. Start by importing stock.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {paginatedProductGroups.map((group) => (
              <Card key={group.productId || group.productName}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl">{group.productName}</CardTitle>
                      <CardDescription>
                        {group.brandName} <span className="mx-1.5">•</span> {group.productCode}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2 items-start">
                      {group.categories.map(cat => <Badge key={cat} variant="outline">{cat}</Badge>)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40%]">Variation</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Stock Value</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.variations.map((v) => (
                          <TableRow key={v.variationId}>
                            <TableCell>
                              <div className="flex items-center gap-4 font-medium">
                                {/* === IMAGE ADDED HERE === */}
                                <ImageWithFallback
                                  src={v.imageUrl}
                                  alt={`${group.productName} - ${v.colorName} ${v.sizeName}`}
                                  className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span style={{ backgroundColor: v.colorHexCode }} className="h-4 w-4 rounded-full border" />
                                        </TooltipTrigger>
                                        <TooltipContent>{v.colorName}</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <p>{v.colorName}, {v.sizeName}</p>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Var ID: {v.variationId}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">{formatVND(v.price)}</TableCell>
                            <TableCell className="text-center font-bold text-lg">{v.stockQuantity}</TableCell>
                            <TableCell className="text-right font-mono">{formatVND(v.price * v.stockQuantity)}</TableCell>
                            <TableCell className="text-center">{getStockBadge(v.stockQuantity)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && !loading && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
              <PaginationItem><PaginationLink className="font-mono" isActive>{currentPage} / {totalPages}</PaginationLink></PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </AdminLayout>
  );
}