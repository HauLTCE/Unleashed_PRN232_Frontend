import React from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Search, Loader2, ArrowRight, ArrowLeft, User, Building, Truck } from 'lucide-react';
import { useTransactions } from '../../hooks/Inventory/useTransaction';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../components/ui/pagination';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { formatVND } from '../../utils/formatters';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

export default function TransactionsPage() {
    const {
        transactions,
        loading,
        error,
        pagination,
        filters,
        currentPage,
        setCurrentPage,
        handleFilterChange,
    } = useTransactions({
        dateFilter: 'all',
        sort: 'newest_first'
    });
    
    const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

    const getTransactionTypeBadge = (typeName) => {
        if (typeName?.toLowerCase().includes('in') || typeName?.toLowerCase().includes('import')) {
            return <Badge className="bg-green-100 text-green-800 border-green-300">{typeName}</Badge>;
        }
        if (typeName?.toLowerCase().includes('out') || typeName?.toLowerCase().includes('sale') || typeName?.toLowerCase().includes('reserve')) {
            return <Badge className="bg-red-100 text-red-800 border-red-300">{typeName}</Badge>;
        }
        return <Badge variant="secondary">{typeName}</Badge>;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Transaction History</h1>
                    <p className="text-muted-foreground">Review all inventory movements across warehouses.</p>
                </div>

                <Card>
                    <CardContent className="pt-6 flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by product, warehouse, provider..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={filters.dateFilter} onValueChange={(v) => handleFilterChange('dateFilter', v)}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="6months">Last 6 Months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.sort} onValueChange={(v) => handleFilterChange('sort', v)}>
                            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest_first">Date: Newest First</SelectItem>
                                <SelectItem value="oldest_first">Date: Oldest First</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    {loading && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    {!loading && error && <p className="text-center text-destructive">Failed to load transactions.</p>}
                    {!loading && transactions.length === 0 && <p className="text-center text-muted-foreground py-10">No transactions found.</p>}

                    {!loading && transactions.map(t => (
                        <Card key={t.transactionId}>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                <div className="md:col-span-2 flex items-center gap-4">
                                    <ImageWithFallback src={t.variationImage} alt={t.productName} className="h-16 w-16 rounded-lg object-cover" />
                                    <div>
                                        <p className="font-bold">{t.productName}</p>
                                        <p className="text-sm text-muted-foreground">{t.colorName}, {t.sizeName}</p>
                                        <p className="text-sm">{t.transactionProductPrice ? formatVND(t.transactionProductPrice) : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        {t.transactionTypeName?.toLowerCase().includes('in') ? <ArrowRight className="h-4 w-4 text-green-500"/> : <ArrowLeft className="h-4 w-4 text-red-500"/>}
                                        <span className="font-semibold text-lg">{t.transactionQuantity}</span> units
                                        {getTransactionTypeBadge(t.transactionTypeName)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{formatDate(t.transactionDate)}</p>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {t.inchargeEmployeeUsername && <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/> {t.inchargeEmployeeUsername}</p>}
                                    {t.providerName && <p className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground"/> {t.providerName}</p>}
                                    {t.stockName && <p className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground"/> {t.stockName}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {totalPages > 1 && (
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem><PaginationPrevious onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                            <PaginationItem><PaginationLink>{currentPage} / {totalPages}</PaginationLink></PaginationItem>
                            <PaginationItem><PaginationNext onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                        </PaginationContent>
                    </Pagination>
                )}
            </div>
        </AdminLayout>
    );
}