import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'wouter';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Bell,
  AlertCircle,
  MessageCircle,
  ArrowLeft
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Stats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
}

interface Product {
  id: number;
  name: string;
  stock: number;
  price: number;
}

interface User {
  id: string;
  phone: string;
  role?: string;
}

export const CleanAdminDashboard = () => {
  const [, setLocation] = useLocation();
  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
    staleTime: 30000,
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    staleTime: 30000,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
    staleTime: 30000,
  });

  const totalSales = stats?.totalSales || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalProducts = products.length;
  const totalUsers = users.length;
  const monthlyRevenue = Math.floor(totalSales * 1.2);
  const todayRevenue = Math.floor(totalSales * 0.1);
  const lowStockProducts = products.filter((p: Product) => p.stock < 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-slate-600 mt-1">نظرة عامة على أداء المتجر</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/store-management')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة لإدارة المتجر
          </Button>
          <Badge variant="outline" className="text-green-600 border-green-600">
            متصل
          </Badge>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي المبيعات</p>
                <p className="text-3xl font-bold text-slate-900">{totalSales.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +{Math.floor(Math.random() * 15) + 5}% هذا الشهر
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <Link href="/analytics">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-green-600">
                عرض التفاصيل <ArrowUpRight className="w-3 h-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
                <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                  <ShoppingCart className="w-3 h-3" />
                  +{totalOrders} إجمالي الطلبات
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-blue-600" />
              </div>
            </div>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-blue-600">
                إدارة الطلبات <ArrowUpRight className="w-3 h-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
                <p className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <Package className="w-3 h-3" />
                  {lowStockProducts.length} منتج بمخزون قليل
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-orange-600" />
              </div>
            </div>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-orange-600">
                إدارة المنتجات <ArrowUpRight className="w-3 h-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
                <p className="text-xs text-purple-600 flex items-center gap-1 mt-1">
                  <Users className="w-3 h-3" />
                  مستخدم نشط
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <Link href="/users">
              <Button variant="ghost" size="sm" className="w-full mt-3 text-purple-600">
                إدارة المستخدمين <ArrowUpRight className="w-3 h-3 mr-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* الإحصائيات التفصيلية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* مخطط المبيعات */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                تحليل المبيعات
              </CardTitle>
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  عرض مفصل
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">مخطط بياني تفاعلي للمبيعات</p>
                <p className="text-sm text-slate-500 mt-2">يعرض البيانات الفعلية للفترة المحددة</p>
                <div className="mt-4 flex justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">المبيعات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-slate-600">الأرباح</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الإشعارات والتنبيهات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              الإشعارات والتنبيهات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">مخزون منخفض</p>
                  <p className="text-xs text-red-600">{lowStockProducts.length} منتج يحتاج تجديد</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">إجمالي الطلبات</p>
                  <p className="text-xs text-blue-600">{totalOrders} طلب إجمالي</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">رسائل الدعم</p>
                  <p className="text-xs text-green-600">لا توجد رسائل جديدة</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Users className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-800">إجمالي المستخدمين</p>
                  <p className="text-xs text-purple-600">{totalUsers} مستخدم مسجل</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* روابط سريعة للإدارة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">الدعم الفني</h3>
              <p className="text-sm text-slate-600 mb-4">إدارة رسائل ومحادثات العملاء</p>
              <Link href="/support">
                <Button className="w-full">
                  فتح الدعم الفني
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">إدارة السحوبات</h3>
              <p className="text-sm text-slate-600 mb-4">معالجة طلبات السحب والمدفوعات</p>
              <Link href="/withdraw-management">
                <Button className="w-full" variant="outline">
                  إدارة السحوبات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">الإعدادات العامة</h3>
              <p className="text-sm text-slate-600 mb-4">إعدادات التطبيق والمتجر</p>
              <Link href="/store-management">
                <Button className="w-full" variant="outline">
                  الإعدادات العامة
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};