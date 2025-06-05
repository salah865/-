import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  Tags,
  ShoppingCart,
  Warehouse,
  Users,
  Settings,
  Store,
  LogOut,
  Bell,
  MessageCircle
} from 'lucide-react';

export const Sidebar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // حساب عدد الرسائل غير المقروءة
  const getUnreadMessagesCount = () => {
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
    const updateUnreadCount = () => {
      setUnreadCount(getUnreadMessagesCount());
    };

    updateUnreadCount();

    // تحديث كل 10 ثوانٍ
    const interval = setInterval(updateUnreadCount, 10000);

    // استمع لتغييرات localStorage
    const handleStorageChange = () => {
      updateUnreadCount();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const menuItems = [
    { path: '/', icon: BarChart3, label: 'الإحصائيات' },
    { path: '/products', icon: Package, label: 'المنتجات' },
    { path: '/categories', icon: Tags, label: 'الفئات' },
    { path: '/orders', icon: ShoppingCart, label: 'الطلبات', badge: '5' },
    { path: '/inventory', icon: Warehouse, label: 'المخزون' },
    { path: '/customers', icon: Users, label: 'العملاء' },
    { path: '/support', icon: MessageCircle, label: 'الدعم الفني', badge: unreadCount > 0 ? unreadCount.toString() : undefined },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg border-l border-slate-200 flex-shrink-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Store className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">متجري</h2>
            <p className="text-sm text-slate-500">لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{user?.username}</p>
            <p className="text-xs text-slate-500">مدير المتجر</p>
          </div>
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
