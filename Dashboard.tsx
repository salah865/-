import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Eye,
  Bell,
  Plus,
  BarChart3
} from 'lucide-react';

export const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'processing':
        return 'bg-amber-100 text-amber-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'قيد التجهيز';
      case 'pending':
        return 'جديد';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">لوحة تحكم التاجر</h1>
            <p className="text-slate-600">متابعة المبيعات اليومية وإدارة الطلبات</p>
          </div>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart Placeholder */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">مبيعات الشهر</CardTitle>
            <select className="text-sm border border-slate-300 rounded-lg px-3 py-1">
              <option>آخر 30 يوم</option>
              <option>آخر 7 أيام</option>
              <option>آخر 3 أشهر</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Eye className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">رسم بياني للمبيعات</p>
                <p className="text-xs text-slate-400 mt-1">سيتم تكامله مع مكتبة الرسوم البيانية</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">الطلبات الأخيرة</CardTitle>
            <a href="/orders" className="text-primary text-sm hover:text-primary/80">
              عرض الكل
            </a>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {order.customer?.name || 'عميل غير معروف'}
                        </p>
                        <p className="text-sm text-slate-500">طلب #{order.id}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{order.total} د.ع</p>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">لا توجد طلبات</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
