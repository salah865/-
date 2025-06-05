import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Store, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Image,
  CreditCard,
  LogOut,
  Menu,
  X,
  Smartphone,
  Monitor,
  Brain,
  MessageCircle,
  Bell
} from 'lucide-react';

export const ResponsiveTopNavbar = () => {
  const [location] = useLocation();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { 
      path: '/', 
      label: 'لوحة التحكم', 
      icon: LayoutDashboard,
      description: 'النظرة العامة والإحصائيات'
    },
    { 
      path: '/users', 
      label: 'إدارة المستخدمين', 
      icon: Users,
      description: 'إدارة العملاء والمديرين'
    },
    { 
      path: '/products', 
      label: 'إدارة المنتجات', 
      icon: Package,
      description: 'إضافة وتعديل المنتجات'
    },
    { 
      path: '/orders', 
      label: 'إدارة الطلبات والعملاء', 
      icon: ShoppingCart,
      description: 'متابعة وإدارة الطلبات والعملاء'
    },
    { 
      path: '/notifications', 
      label: 'إدارة الإشعارات', 
      icon: MessageCircle,
      description: 'إرسال إشعارات للعملاء'
    },
    { 
      path: '/ai-assistant', 
      label: 'الذكاء الاصطناعي', 
      icon: Brain,
      description: 'مساعد الذكاء الاصطناعي'
    },
    { 
      path: '/banners', 
      label: 'إدارة البانرات', 
      icon: Image,
      description: 'البانرات الترويجية'
    },
    { 
      path: '/withdraw-management', 
      label: 'إدارة السحوبات', 
      icon: CreditCard,
      description: 'طلبات السحب والمدفوعات'
    },
    { 
      path: '/analytics', 
      label: 'التقارير والتحليلات', 
      icon: BarChart3,
      description: 'تحليل الأداء والمبيعات'
    },
    { 
      path: '/settings', 
      label: 'إعدادات التطبيق', 
      icon: Settings,
      description: 'إعدادات النظام العامة'
    },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location === '/' || location === '/admin' || location === '/dashboard';
    }
    return location.startsWith(path);
  };

  const NavLink = ({ item, mobile = false }: { item: typeof navItems[0], mobile?: boolean }) => {
    const isActive = isActiveRoute(item.path);
    const Icon = item.icon;

    return (
      <Link href={item.path}>
        <Button
          variant={isActive ? "default" : "ghost"}
          className={`
            ${mobile ? 'w-full justify-start h-auto p-4' : 'h-10'} 
            ${isActive 
              ? 'bg-purple-600 text-white hover:bg-purple-700' 
              : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
            }
            ${mobile ? 'flex-col items-start space-y-1' : ''}
          `}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
        >
          <div className={`flex items-center ${mobile ? 'w-full' : 'space-x-2 space-x-reverse'}`}>
            <Icon className={`${mobile ? 'w-5 h-5 ml-3' : 'w-4 h-4'}`} />
            <span className={`${mobile ? 'text-base font-medium' : 'text-sm'}`}>
              {item.label}
            </span>
            {isActive && (
              <Badge className="mr-auto bg-purple-100 text-purple-800 text-xs">نشط</Badge>
            )}
          </div>
          {mobile && (
            <p className="text-xs text-gray-500 mt-1 text-right w-full">
              {item.description}
            </p>
          )}
        </Button>
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">إدارة المتجر</h1>
                <p className="text-xs text-gray-500">نظام إدارة شامل</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-2 space-x-reverse">
            {navItems.slice(0, 5).map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
            
            {/* More menu for additional items */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-purple-600">
                  المزيد
                  <BarChart3 className="w-4 h-4 mr-2" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900">أدوات إضافية</h3>
                  {navItems.slice(5).map((item) => (
                    <NavLink key={item.path} item={item} mobile />
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Mobile Menu and Logout */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {/* Device Type Indicator */}
            <div className="hidden sm:flex items-center space-x-1 space-x-reverse text-xs text-gray-500">
              <Monitor className="w-4 h-4 hidden lg:block" />
              <Smartphone className="w-4 h-4 lg:hidden" />
              <span className="hidden md:inline">
                {typeof window !== 'undefined' && window.innerWidth >= 1024 ? 'سطح المكتب' : 'الجوال'}
              </span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline mr-2">تسجيل خروج</span>
            </Button>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="lg:hidden text-gray-700"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="space-y-6 mt-6">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">إدارة المتجر</h2>
                        <p className="text-xs text-gray-500">القائمة الرئيسية</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <NavLink key={item.path} item={item} mobile />
                    ))}
                  </div>

                  {/* Mobile Footer */}
                  <div className="pt-4 border-t mt-6">
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 h-auto p-4"
                    >
                      <LogOut className="w-5 h-5 ml-3" />
                      <span className="text-base font-medium">تسجيل خروج</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};