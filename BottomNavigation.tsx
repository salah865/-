import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { User, ShoppingBag, ClipboardList } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const BottomNavigation = () => {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/store" && location === "/") return true;
    return location === path || location.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
      {/* تحديث الأيقونات */}
      <div className="flex items-center justify-around">
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 ${
            isActive("/store") || location === "/" ? "text-purple-600" : "text-gray-400"
          }`}
          onClick={() => setLocation("/")}
        >
          <ShoppingBag data-testid="bottom-nav-icon" style={{width: '22px', height: '22px'}} />
          <span className="text-xs">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 ${
            isActive("/orders") ? "text-purple-600" : "text-gray-400"
          }`}
          onClick={() => setLocation("/orders")}
        >
          <ClipboardList data-testid="bottom-nav-icon" style={{width: '22px', height: '22px'}} />
          <span className="text-xs">{language === 'ar' ? 'الطلبات' : 'Orders'}</span>
        </Button>
        
        <Button 
          variant="ghost" 
          className={`flex flex-col items-center gap-1 ${
            isActive("/profile") ? "text-purple-600" : "text-gray-400"
          }`}
          onClick={() => setLocation("/profile")}
        >
          <User data-testid="bottom-nav-icon" style={{width: '22px', height: '22px'}} />
          <span className="text-xs">{language === 'ar' ? 'حسابي' : 'My Account'}</span>
        </Button>
      </div>
    </div>
  );
};