import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Package, Clock, DollarSign, Phone, MapPin, FileText, User, TrendingUp, Trash2 } from 'lucide-react';

interface OrdersManagerProps {
  filteredOrders?: any[];
  showTraderInfo?: boolean;
  customerPhone?: string;
  traderPhone?: string;
}

export const OrdersManager = ({ filteredOrders, showTraderInfo = true, customerPhone, traderPhone }: OrdersManagerProps = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fetchedOrders = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/orders'],
    enabled: !filteredOrders,
  });

  const orders = filteredOrders || fetchedOrders;

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest('PATCH', `/api/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث حالة الطلب بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء تحديث الطلب',
        variant: 'destructive',
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/orders/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الطلب بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء حذف الطلب',
        variant: 'destructive',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المعالجة';
      case 'processing':
        return 'قيد التحضير';
      case 'shipped':
        return 'قيد التوصيل';
      case 'delivered':
        return 'تم التوصيل';
      case 'rejected':
        return 'تم الرفض';
      default:
        return 'غير محدد';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      {!orders || orders.length === 0 ? (
        <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500">لم يتم إنشاء أي طلبات حتى الآن</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <Card key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Order Info */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-6 h-6 text-purple-600" />
                        <div>
                          <div className="mb-3">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                              طلب رقم #{order.id}
                            </h3>
                            {showTraderInfo && (
                              <div className="inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <User className="w-6 h-6 text-blue-600" />
                                <div className="text-right">
                                  <div className="font-bold text-blue-900 text-lg">
                                    {order.customerDetails?.name || 'عميل غير محدد'}
                                  </div>
                                  {order.customerDetails?.phone && (
                                    <div className="text-blue-700 text-base font-medium">
                                      {order.customerDetails.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {formatDate(order.orderDate || order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`px-3 py-1 text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {showTraderInfo && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            معلومات التاجر
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><span className="font-medium">الاسم:</span> {order.customerDetails?.name || 'غير محدد'}</div>
                            <div><span className="font-medium">الهاتف:</span> {order.customerDetails?.phone || 'غير محدد'}</div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          عنوان التوصيل
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><span className="font-medium">المحافظة:</span> {order.customerDetails?.governorate || 'غير محدد'}</div>
                          <div><span className="font-medium">المنطقة:</span> {order.customerDetails?.area || 'غير محدد'}</div>
                          <div><span className="font-medium">العنوان:</span> {order.customerDetails?.address || 'غير محدد'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {order.customerDetails?.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">ملاحظات:</span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">{order.customerDetails.notes}</p>
                      </div>
                    )}

                    {/* Products */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-800">المنتجات ({order.totalItems || order.items?.length || 0} قطعة)</h4>
                      <div className="bg-gray-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                            <div className="flex items-center gap-3">
                              {item.product?.imageUrl && (
                                <img 
                                  src={item.product.imageUrl} 
                                  alt={item.product.name}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-800">{item.product?.name || 'منتج غير محدد'}</p>
                                <p className="text-xs text-gray-600">الكمية: {item.quantity}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price Summary & Status Control */}
                  <div className="space-y-4">
                    {/* Status Control */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">تحديث حالة الطلب</h4>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateOrderStatusMutation.mutate({ id: order.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد المعالجة</SelectItem>
                          <SelectItem value="processing">قيد التحضير</SelectItem>
                          <SelectItem value="shipped">قيد التوصيل</SelectItem>
                          <SelectItem value="delivered">تم التوصيل</SelectItem>
                          <SelectItem value="rejected">تم الرفض</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Delete Order Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="w-full mt-3">
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف الطلب
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>تأكيد حذف الطلب</AlertDialogTitle>
                            <AlertDialogDescription>
                              هل أنت متأكد من حذف هذا الطلب؟ هذا الإجراء لا يمكن التراجع عنه.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => deleteOrderMutation.mutate(order.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              حذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        ملخص الفاتورة
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">سعر البيع:</span>
                          <span className="font-medium">{(order.customerPrice || 0).toLocaleString()} د.ع</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">أجرة التوصيل:</span>
                          <span className="font-medium text-orange-600">{(order.deliveryFee || 0).toLocaleString()} د.ع</span>
                        </div>
                        <div className="border-t border-green-200 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-bold">المبلغ الإجمالي:</span>
                            <span className="font-bold text-green-700 text-lg">
                              {(order.totalWithDelivery || parseFloat(order.total || 0)).toLocaleString()} د.ع
                            </span>
                          </div>
                        </div>
                        <div className="border-t border-green-200 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              الربح المحقق:
                            </span>
                            <span className="font-bold text-emerald-600">{(order.profit || 0).toLocaleString()} د.ع</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};