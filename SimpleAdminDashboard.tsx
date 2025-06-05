import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Plus,
  Bell,
  MessageCircle,
  Eye,
  Settings,
  Image,
  Wallet
} from 'lucide-react';
import { Link } from 'wouter';

export const SimpleAdminDashboard = () => {
  const [unreadSupportMessages, setUnreadSupportMessages] = useState(0);

  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  // حساب عدد رسائل الدعم غير المقروءة
  const getUnreadSupportCount = () => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('support_chat_')) {
        try {
          const chatData = localStorage.getItem(key);
          if (chatData) {
            const messages = JSON.parse(chatData);
            count += messages.filter((msg: any) => 
              msg.sender === 'user' && msg.status !== 'read'
            ).length;
          }
        } catch (error) {
          // تجاهل الأخطاء
        }
      }
    }
    return count;
  };

  // تحديث عدد الرسائل غير المقروءة
  useEffect(() => {
    const updateCount = () => setUnreadSupportMessages(getUnreadSupportCount());
    updateCount();
    
    // تحديث كل 5 ثوانٍ
    const interval = setInterval(updateCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // حساب الإحصائيات
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) : 0;

  return (
    <div className="space-y-8">
      {/* الترحيب */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">مرحباً بك في لوحة تحكم تاجر</h1>
            <p className="text-purple-100">إدارة شاملة ومتقدمة لجميع جوانب تطبيقك التجاري</p>
          </div>
          <div className="text-center">
            <div className="text-sm text-purple-200">الوقت الحالي</div>
            <div className="text-xl font-bold">{new Date().toLocaleTimeString('ar-IQ')}</div>
          </div>
        </div>
      </div>

      {/* الإحصائيات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي المنتجات</p>
                <p className="text-3xl font-bold text-slate-900">{totalProducts}</p>
                <p className="text-xs text-blue-600 mt-1">منتج متاح للبيع</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي الطلبات</p>
                <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
                <p className="text-xs text-green-600 mt-1">طلب تم استلامه</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
                <p className="text-xs text-purple-600 mt-1">مستخدم مسجل</p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">إجمالي الأرباح</p>
                <p className="text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">دينار عراقي</p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* اختصارات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>الإجراءات السريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/products">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-blue-50">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">إدارة المنتجات</span>
              </Button>
            </Link>

            <Link href="/orders">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-green-50">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium">إدارة الطلبات</span>
              </Button>
            </Link>

            <Link href="/users">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-purple-50">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">إدارة المستخدمين</span>
              </Button>
            </Link>

            <Link href="/banners">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-pink-50">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-pink-600" />
                </div>
                <span className="text-sm font-medium">إدارة البانرات</span>
              </Button>
            </Link>

            <Link href="/withdraw-management">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-emerald-50">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">إدارة السحوبات</span>
              </Button>
            </Link>

            <Link href="/analytics">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-indigo-50">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium">التقارير</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-slate-50">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-slate-600" />
                </div>
                <span className="text-sm font-medium">الإعدادات</span>
              </Button>
            </Link>

            <Link href="/support">
              <Button variant="outline" className="h-24 flex flex-col gap-2 w-full hover:bg-orange-50 relative">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-medium">دردشة الدعم</span>
                {unreadSupportMessages > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">
                      {unreadSupportMessages > 9 ? '9+' : unreadSupportMessages}
                    </span>
                  </div>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* الطلبات الحديثة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>الطلبات الحديثة</span>
              <Link href="/orders">
                <Button variant="ghost" size="sm">عرض الكل</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">لا توجد طلبات حديثة</p>
                <p className="text-sm text-slate-500">ستظهر الطلبات الجديدة هنا</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">طلب جديد</p>
                        <p className="text-xs text-slate-500">منذ دقائق</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">50,000 د.ع</p>
                      <p className="text-xs text-green-600">مؤكد</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>المنتجات الأكثر مبيعاً</span>
              <Link href="/analytics">
                <Button variant="ghost" size="sm">عرض التقرير</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">لا توجد منتجات</p>
                <p className="text-sm text-slate-500">أضف منتجات لمتجرك</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 3).map((product: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{product.name || `منتج ${index + 1}`}</p>
                        <p className="text-xs text-slate-500">{(product.price || 25000).toLocaleString()} د.ع</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {Math.floor(Math.random() * 50) + 10} مبيعة
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* دردشة الدعم */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <MessageCircle className="w-5 h-5" />
            دردشة الدعم المباشر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 mb-2">تواصل مباشر مع العملاء والتجار</p>
              <p className="text-sm text-purple-600">متاح على مدار 24 ساعة</p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <MessageCircle className="w-4 h-4 ml-2" />
              فتح الدردشة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};