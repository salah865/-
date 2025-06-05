import { firebaseService } from './firebaseService';

// خدمة جلب بيانات التطبيق الحقيقية
export class AppDataService {
  // جلب إحصائيات التطبيق الشاملة
  async getAppStats() {
    try {
      const [stats, products, orders, users, categories] = await Promise.all([
        firebaseService.getStats(),
        firebaseService.getProducts(),
        firebaseService.getOrders(),
        firebaseService.getUsers(),
        firebaseService.getCategories()
      ]);

      // حساب إحصائيات مفصلة
      const deliveredOrders = orders.filter(order => order.status === 'delivered');
      const rejectedOrders = orders.filter(order => order.status === 'rejected');
      const pendingOrders = orders.filter(order => order.status === 'pending');

      const totalProfit = deliveredOrders.reduce((sum, order) => sum + (order.profit || 0), 0);
      const totalSales = deliveredOrders.reduce((sum, order) => sum + (order.totalWithDelivery || 0), 0);

      return {
        totalProducts: products.length,
        totalOrders: orders.length,
        deliveredOrders: deliveredOrders.length,
        rejectedOrders: rejectedOrders.length,
        pendingOrders: pendingOrders.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        totalProfit,
        totalSales,
        products: products.map(p => ({
          name: p.name,
          price: p.price,
          stock: p.stock,
          category: p.category?.name || 'غير محدد'
        })),
        recentOrders: orders.slice(-5).map(o => ({
          id: o.id,
          status: o.status,
          total: o.totalWithDelivery,
          customerName: o.customerDetails?.name || 'غير محدد',
          date: o.orderDate
        }))
      };
    } catch (error) {
      console.error('خطأ في جلب بيانات التطبيق:', error);
      return null;
    }
  }

  // جلب معلومات منشئ التطبيق
  getAppInfo() {
    return {
      creator: 'صلاح مهدي',
      description: 'منصة تجارة إلكترونية متقدمة مع ذكاء اصطناعي',
      features: [
        'إدارة المنتجات والطلبات',
        'نظام مستخدمين متقدم',
        'مساعد ذكي للتجارة الإلكترونية',
        'تحليلات وإحصائيات شاملة',
        'واجهة عربية سهلة الاستخدام'
      ]
    };
  }

  // تحليل البيانات وإنشاء ملخص ذكي
  async generateDataSummary() {
    const stats = await this.getAppStats();
    if (!stats) return 'لا يمكن الوصول لبيانات التطبيق حالياً';

    const appInfo = this.getAppInfo();
    
    return {
      appInfo,
      currentStats: {
        summary: `يحتوي التطبيق حالياً على ${stats.totalProducts} منتج، ${stats.totalOrders} طلب، ${stats.totalUsers} مستخدم`,
        profit: `إجمالي الأرباح: ${stats.totalProfit.toLocaleString('ar-SA')} د.ع`,
        sales: `إجمالي المبيعات: ${stats.totalSales.toLocaleString('ar-SA')} د.ع`,
        orderStatus: `الطلبات: ${stats.deliveredOrders} مسلم، ${stats.rejectedOrders} مرفوض، ${stats.pendingOrders} قيد الانتظار`
      },
      products: stats.products,
      recentActivity: stats.recentOrders
    };
  }
}

export const appDataService = new AppDataService();