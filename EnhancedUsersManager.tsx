import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  ShoppingBag,
  DollarSign,
  Package,
  Eye
} from "lucide-react";
import { formatCurrency, getOrderStatus, getOrderStatusColor } from '../utils/formatters';

export const EnhancedUsersManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['/api/orders'],
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const filteredUsers = users.filter((user: any) => 
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const getUserOrders = (userId: number) => {
    return orders.filter((order: any) => order.customerId === userId);
  };

  const getUserStats = (userId: number) => {
    const userOrders = getUserOrders(userId);
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum: number, order: any) => sum + (parseFloat(order.total) || 0), 0);
    const lastOrderDate = userOrders.length > 0 ? 
      new Date(Math.max(...userOrders.map((order: any) => new Date(order.createdAt).getTime()))).toLocaleDateString('ar-SA') : 
      'لا توجد طلبات';
    
    return { totalOrders, totalSpent, lastOrderDate };
  };

  const handleViewUserDetails = (user: any) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              إدارة المستخدمين
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="البحث عن المستخدمين..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">لا توجد مستخدمين مسجلين</p>
            ) : (
              filteredUsers.map((user: any) => {
                const stats = getUserStats(user.id);
                return (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-lg">{user.fullName || 'بدون اسم'}</h3>
                            <div className="flex flex-col gap-1 text-sm text-gray-600">
                              {user.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {user.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                انضم في: {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <ShoppingBag className="w-4 h-4" />
                              <span className="font-medium">{stats.totalOrders}</span>
                            </div>
                            <p className="text-xs text-gray-500">طلب</p>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">{stats.totalSpent.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500">إجمالي الإنفاق</p>
                          </div>

                          <Button 
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 ml-1" />
                            التفاصيل
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* نافذة تفاصيل المستخدم */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  تفاصيل المستخدم: {selectedUser.fullName || 'بدون اسم'}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile">المعلومات الشخصية</TabsTrigger>
                  <TabsTrigger value="orders">الطلبات</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>المعلومات الأساسية</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">الاسم</label>
                          <p className="text-lg">{selectedUser.fullName || getOrderStatus(status)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                          <p className="text-lg">{selectedUser.email || getOrderStatus(status)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
                          <p className="text-lg">{selectedUser.phone || getOrderStatus(status)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">تاريخ التسجيل</label>
                          <p className="text-lg">{new Date(selectedUser.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">نوع الحساب</label>
                          <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'secondary'}>
                            {selectedUser.role === 'admin' ? 'مدير' : 'عميل'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>إحصائيات المستخدم</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {(() => {
                          const stats = getUserStats(selectedUser.id);
                          return (
                            <>
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <ShoppingBag className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-green-600">{stats.totalSpent.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">إجمالي الإنفاق</p>
                              </div>
                              <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                <p className="text-lg font-medium text-purple-600">{stats.lastOrderDate}</p>
                                <p className="text-sm text-gray-600">آخر طلب</p>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>قائمة الطلبات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const userOrders = getUserOrders(selectedUser.id);
                        return userOrders.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">لا توجد طلبات لهذا المستخدم</p>
                        ) : (
                          <div className="space-y-3">
                            {userOrders.map((order: any) => (
                              <div key={order.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium">طلب رقم: {order.id}</h4>
                                    <p className="text-sm text-gray-600">
                                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                                    </p>
                                  </div>
                                  <div className="text-left">
                                    <Badge className={getOrderStatusColor(order.status)}>
                                      {getOrderStatusText(order.status)}
                                    </Badge>
                                    <p className="text-lg font-bold text-green-600 mt-1">
                                      {parseFloat(order.total).toFixed(2)} ر.س
                                    </p>
                                  </div>
                                </div>
                                
                                {order.items && order.items.length > 0 && (
                                  <div className="space-y-2">
                                    <h5 className="font-medium text-sm">عناصر الطلب:</h5>
                                    {order.items.map((item: any, index: number) => {
                                      const product = products.find((p: any) => p.id === item.productId);
                                      return (
                                        <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                          <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-gray-500" />
                                            <span>{product?.name || `منتج رقم ${item.productId}`}</span>
                                          </div>
                                          <div>
                                            <span>الكمية: {item.quantity}</span>
                                            <span className="mx-2">•</span>
                                            <span>السعر: {parseFloat(item.price).toFixed(2)} ر.س</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};