import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Package, Users } from 'lucide-react';

export const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsItems = [
    {
      title: 'إجمالي المبيعات',
      value: `${stats?.totalSales?.toLocaleString() || 0} د.ع`,
      change: '12% عن الشهر السابق',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      title: 'عدد الطلبات',
      value: stats?.totalOrders || 0,
      change: '8% عن الشهر السابق',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'عدد المنتجات',
      value: stats?.totalProducts || 0,
      change: 'منتج نشط',
      icon: Package,
      color: 'purple',
    },
    {
      title: 'عدد العملاء',
      value: stats?.totalCustomers || 0,
      change: '15% عن الشهر السابق',
      icon: Users,
      color: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsItems.map((item, index) => {
        const Icon = item.icon;
        
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{item.value}</p>
                  <p className="text-sm text-emerald-600 mt-1">
                    <TrendingUp className="inline w-3 h-3 ml-1" />
                    {item.change}
                  </p>
                </div>
                <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`text-${item.color}-600 text-lg w-6 h-6`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
