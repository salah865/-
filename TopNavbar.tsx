import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tags, 
  Warehouse,
  Image,
  LogOut 
} from 'lucide-react';

export const TopNavbar = () => {
  const [location] = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { path: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
    { path: '/users', label: 'إدارة المستخدمين', icon: Users },
    { path: '/products', label: 'إدارة المنتجات', icon: Package },
    { path: '/orders', label: 'إدارة الطلبات', icon: ShoppingCart },
    { path: '/banners', label: 'إدارة البانرات', icon: Image },
    { path: '/analytics', label: 'التقارير والتحليلات', icon: Tags },
    { path: '/settings', label: 'إعدادات التطبيق', icon: Warehouse },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-slate-900">إدارة المتجر</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 space-x-reverse px-4 py-2 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600 hidden md:block">
              مرحباً، Admin
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};