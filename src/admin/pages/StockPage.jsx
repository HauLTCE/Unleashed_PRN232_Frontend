import React from "react";
import { AdminLayout } from "../components/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Upload,
  AlertTriangle,
  Package,
  TrendingDown,
  Search,
  FileText,
} from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

// ✅ Replace old hook
import { useStockVariations } from "../../hooks/Inventory/useStockVariations";

export default function StockPage() {
  const { stockVariations, loading, error } = useStockVariations();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [stockFilter, setStockFilter] = React.useState("all");
  const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);

  // --- Filter Logic ---
  const filteredProducts = React.useMemo(() => {
    if (!Array.isArray(stockVariations)) return [];

    return stockVariations.filter((product) => {
      const matchesSearch =
        product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.quantity < 10 && product.quantity > 0) ||
        (stockFilter === "out" && product.quantity === 0) ||
        (stockFilter === "good" && product.quantity >= 10);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [stockVariations, searchQuery, categoryFilter, stockFilter]);

  // --- Category List ---
  const categories = React.useMemo(() => {
    if (!Array.isArray(stockVariations)) return [];
    return Array.from(
      new Set(stockVariations.map((p) => p.category || "Uncategorized"))
    );
  }, [stockVariations]);

  // --- Stats ---
  const stockStats = React.useMemo(() => {
    const totalProducts = stockVariations.length;
    const outOfStock = stockVariations.filter((p) => p.quantity === 0).length;
    const lowStock = stockVariations.filter(
      (p) => p.quantity < 10 && p.quantity > 0
    ).length;
    const totalValue = stockVariations.reduce(
      (sum, p) => sum + (p.price * p.quantity || 0),
      0
    );
    return { totalProducts, outOfStock, lowStock, totalValue };
  }, [stockVariations]);

  // --- Helper UI ---
  const getStockBadge = (qty) => {
    if (qty === 0) return <Badge variant="destructive">Out of Stock</Badge>;
    if (qty < 10) return <Badge variant="secondary">Low Stock</Badge>;
    return <Badge variant="default">In Stock</Badge>;
  };

  const getStockIcon = (qty) => {
    if (qty === 0) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (qty < 10) return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    return <Package className="h-4 w-4 text-green-500" />;
  };

  // --- Loading/Error states ---
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-10 text-center text-muted-foreground text-lg">
          Loading stock variations...
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-10 text-center text-red-500">
          Failed to load stock variations. Please try again later.
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* --- Page Header --- */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Stock Variation Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage your product variations
            </p>
          </div>

          {/* --- Import Buttons --- */}
          <div className="flex gap-2">
            <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" /> Import History
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import History</DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground">
                  Import logs will appear here once implemented.
                </p>
              </DialogContent>
            </Dialog>

            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" /> Import Variations
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Stock Variations</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input id="file" type="file" accept=".csv,.xlsx,.xls" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports CSV/XLSX files. Max 10MB.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="notes">Import Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this import..."
                    />
                  </div>
                  <Button className="w-full">Upload and Process</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* --- Stats Cards --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stockStats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Total Variations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{stockStats.outOfStock}</div>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stockStats.lowStock}</div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <div className="text-2xl font-bold">
                  ${stockStats.totalValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Total Inventory Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Filters --- */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search variations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Stock Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="good">In Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* --- Table --- */}
        <Card>
          <CardHeader>
            <CardTitle>
              Stock Variations Overview ({filteredProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={`${product.stockId}-${product.variationId}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={product.imageUrl}
                          alt={product.productName}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {product.stockId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{product.category || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStockIcon(product.quantity)}
                        <span
                          className={`font-medium ${product.quantity === 0
                            ? "text-red-600"
                            : product.quantity < 10
                              ? "text-yellow-600"
                              : "text-green-600"
                            }`}
                        >
                          {product.quantity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStockBadge(product.quantity)}</TableCell>
                    <TableCell>${product.price?.toFixed(2) || "—"}</TableCell>
                    <TableCell className="font-medium">
                      ${(product.price * product.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
