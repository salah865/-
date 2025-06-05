import { useState } from 'react';
import { ChevronUp, Package, TrendingUp, X, CheckCircle } from 'lucide-react';
import { formatCurrency, getOrderStatus } from '../utils/formatters';

interface Order {
  id: number;
  total: string;
  status: string;
  profit: number;
  createdAt: string;
  customerDetails: {
    name: string;
    phone: string;
  };
}

interface NetProfitSummaryProps {
  orders: Order[];
}

export function NetProfitSummary({ orders }: NetProfitSummaryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // حساب الطلبات المكتملة والمسحوبة (جميع الطلبات التي حققت أرباحاً)
  const profitableOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'مكتمل' || order.status === 'withdrawn'
  );

  // حساب صافي الأرباح الإجمالية (المحققة + المسحوبة)
  const totalProfit = profitableOrders.reduce((total, order) => {
    return total + (order.profit || 0);
  }, 0);

  // حساب الأرباح المتاحة (غير المسحوبة فقط)
  const availableOrders = orders.filter(order => 
    order.status === 'completed' || order.status === 'مكتمل'
  );
  
  const netProfit = availableOrders.reduce((total, order) => {
    return total + (order.profit || 0);
  }, 0);

  // عدد جميع الطلبات المكتملة (بما في ذلك المسحوبة)
  const completedOrdersCount = profitableOrders.length;

  return (
    <>
      {/* المكون الرئيسي */}
      <div className="flex justify-center mb-4">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-100 hover:bg-green-200 transition-colors rounded-full p-3 shadow-md"
          title="عرض تفاصيل الأرباح المحققة"
        >
          <ChevronUp className="w-6 h-6 text-green-600" />
        </button>
      </div>

      {/* النافذة المنبثقة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* رأس النافذة */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">تفاصيل الأرباح المحققة</h2>
                    <p className="text-gray-600">الطلبات المكتملة والأرباح المحققة فقط</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* ملخص الإحصائيات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    {formatCurrency(netProfit)} د.ع
                  </div>
                  <div className="text-green-600 font-medium">الأرباح المتاحة</div>
                  <div className="text-xs text-green-500 mt-1">غير مسحوبة</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-700 mb-2">
                    {formatCurrency(totalProfit)} د.ع
                  </div>
                  <div className="text-orange-600 font-medium">إجمالي الأرباح</div>
                  <div className="text-xs text-orange-500 mt-1">المحققة + المسحوبة</div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700 mb-2">
                    {completedOrdersCount}
                  </div>
                  <div className="text-blue-600 font-medium">إجمالي الطلبات</div>
                  <div className="text-xs text-blue-500 mt-1">مكتملة + مسحوبة</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-700 mb-2">
                    {formatCurrency(profitableOrders.reduce((total: number, order: Order) => total + parseInt(order.total), 0))} د.ع
                  </div>
                  <div className="text-purple-600 font-medium">إجمالي المبيعات</div>
                  <div className="text-xs text-purple-500 mt-1">جميع الطلبات</div>
                </div>
              </div>

              {/* قائمة الطلبات المكتملة */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  جميع الطلبات المحققة للأرباح ({completedOrdersCount})
                </h3>
                
                {profitableOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد طلبات مكتملة بعد</p>
                    <p className="text-sm text-gray-400 mt-2">
                      الأرباح تظهر هنا فقط عندما تكتمل الطلبات
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {profitableOrders.map((order: Order) => (
                      <div 
                        key={order.id} 
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                طلب رقم #{order.id.toString().slice(-6)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {order.customerDetails?.name} - {order.customerDetails?.phone}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString('ar-IQ')} - 
                                {new Date(order.createdAt).toLocaleTimeString('ar-IQ')}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatCurrency(parseInt(order.total))} د.ع
                            </div>
                            <div className="text-sm text-green-600 font-medium">
                              ربح: {formatCurrency(order.profit || 0)} د.ع
                            </div>
                            <div className="text-xs text-gray-500">
                              {getOrderStatus(order.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ملاحظة مهمة */}
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">ملاحظة مهمة</h4>
                    <p className="text-sm text-yellow-700">
                      هذه الأرقام تمثل صافي الأرباح المحققة من الطلبات المكتملة فقط. 
                      الطلبات المعلقة أو قيد التنفيذ أو الملغية لا تحتسب ضمن هذه الإحصائيات.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}