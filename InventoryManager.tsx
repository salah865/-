import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Package } from 'lucide-react';

export const InventoryManager = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products'],
  });

  const getStockLevel = (stock: number) => {
    if (stock <= 0) return 'out-of-stock';
    if (stock <= 10) return 'low';
    if (stock <= 50) return 'medium';
    return 'high';
  };

  const getStockBadge = (stock: number) => {
    const level = getStockLevel(stock);
    
    switch (level) {
      case 'out-of-stock':
        return <Badge variant="destructive">نفد المخزون</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800">مخزون منخفض</Badge>;
      case 'medium':
        return <Badge className="bg-amber-100 text-amber-800">مخزون متوسط</Badge>;
      case 'high':
        return <Badge className="bg-emerald-100 text-emerald-800">مخزون جيد</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  const getStockProgress = (stock: number) => {
    const maxStock = 100; // Assume max stock for visualization
    return Math.min((stock / maxStock) * 100, 100);
  };

  const lowStockProducts = products?.filter((product: any) => product.stock <= 10) || [];
  const outOfStockProducts = products?.filter((product: any) => product.stock <= 0) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">إدارة المخزون</h1>
        <p className="text-slate-600 mt-1">متابعة كميات المنتجات والتنبيهات</p>
      </div>

      {/* Stock Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">منتجات نفد مخزونها</h3>
          </div>
          <p className="text-red-700 mt-1">{outOfStockProducts.length} منتج</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">منتجات مخزونها منخفض</h3>
          </div>
          <p className="text-amber-700 mt-1">{lowStockProducts.length} منتج</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">حالة المخزون</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">الكمية الحالية</TableHead>
              <TableHead className="text-right">مستوى المخزون</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products && products.length > 0 ? (
              products.map((product: any) => (
                <TableRow key={product.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                            <Package className="w-4 h-4 text-slate-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-900">
                    {product.category?.name || 'غير محدد'}
                  </TableCell>
                  <TableCell className="text-slate-900">{product.stock} قطعة</TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Progress 
                        value={getStockProgress(product.stock)} 
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStockBadge(product.stock)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-slate-500">لا توجد منتجات</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
