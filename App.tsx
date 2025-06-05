import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { SupportChat } from "@/components/SupportChat";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NetworkStatus } from "@/components/NetworkStatus";
import { WelcomePage } from "@/pages/WelcomePage";
import { IntroScreen } from "@/components/IntroScreen";
import { useIntro } from "@/hooks/useIntro";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

import { DashboardPage } from "@/pages/DashboardPage";
import { UsersManagementPage } from "@/pages/UsersManagementPage";
import UserManagement from "@/pages/UserManagement";
import ProductsList from "@/pages/ProductsList";
import CategoryManager from "@/pages/CategoryManager";
import { OrdersPage } from "@/pages/OrdersPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AppSettingsPage } from "@/pages/AppSettingsPage";
import { AdminSettingsPage } from "@/pages/AdminSettingsPage";
import { FinalBannerManager } from "@/pages/FinalBannerManager";
import { BannerManagement } from "@/pages/BannerManagement";
import { CustomerStorePage } from "@/pages/CustomerStorePage";
import { NewProductPage } from "@/pages/NewProductPage";
import { SavedProductsPage } from "@/pages/SavedProductsPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";
import { CustomerProfilePage } from "@/pages/CustomerProfilePage";
import { EditProfilePage } from "@/pages/EditProfilePage";
import { SupportChatPage } from "@/pages/SupportChatPage";
import { AdminSupportNew } from "@/pages/AdminSupportNew";
import { StoreManagementPage } from "@/pages/StoreManagementPage";
import NewProductManager from "@/pages/NewProductManager";
import EditProductPage from "@/pages/EditProductPage";
import { CustomerProductPage } from "@/pages/CustomerProductPage";
import { CustomerSavedProductsPage } from "@/pages/CustomerSavedProductsPage";
import { SortProductsPage } from "@/pages/SortProductsPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { WithdrawPage } from "@/pages/WithdrawPage";
import { ZainCashWithdrawPage } from "@/pages/ZainCashWithdrawPage";
import { MastercardWithdrawPage } from "@/pages/MastercardWithdrawPage";
import { WithdrawManagementPage } from "@/pages/WithdrawManagementPage";
import { UserWithdrawHistoryPage } from "@/pages/UserWithdrawHistoryPage";
import { CustomersManagementPage } from "@/pages/CustomersManagementPage";
import { CartProvider } from "@/hooks/useCart";
import BannedPage from "@/pages/BannedPage";
import AIAssistant from "@/pages/AIAssistant";
import { UserBanManagement } from "@/pages/UserBanManagement";
import { BannedUserPage } from "@/pages/BannedUserPage";
import { ECommerceAssistantPage } from "@/pages/ECommerceAssistantPage";
import { NotificationManagementPage } from "@/pages/NotificationManagementPage";
import { AppPoliciesPage } from "@/pages/AppPoliciesPage";
import { UserSettingsPage } from "@/pages/UserSettingsPage";
import { AdminUserSettingsPage } from "@/pages/AdminUserSettingsPage";
import { LanguageSettingsPage } from "@/pages/LanguageSettingsPage";
import AIChatPage from "@/pages/AIChatPage";
import NotFoundPage from "@/pages/NotFound";

function AdminRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/admin" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/users" component={UserManagement} />
        <Route path="/users-old" component={UsersManagementPage} />
        <Route path="/products" component={ProductsList} />
        <Route path="/products/new" component={NewProductManager} />
        <Route path="/products/:id/edit" component={EditProductPage} />
        <Route path="/categories/new" component={CategoryManager} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/customers" component={CustomersManagementPage} />
        <Route path="/banners" component={BannerManagement} />
        <Route path="/banners-old" component={FinalBannerManager} />
        <Route path="/withdraw-management" component={WithdrawManagementPage} />
        <Route path="/notifications" component={NotificationManagementPage} />
        <Route path="/analytics" component={AnalyticsPage} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/ai-chat" component={AIChatPage} />
        <Route path="/support" component={AdminSupportNew} />
        <Route path="/settings" component={AdminSettingsPage} />
        <Route path="/admin-user-settings" component={AdminUserSettingsPage} />
        <Route path="/user-ban-management" component={UserBanManagement} />
        <Route path="/app-settings" component={AppSettingsPage} />
        <Route path="/store-management" component={StoreManagementPage} />
        <Route path="*" component={NotFoundPage} />
      </Switch>
    </Layout>
  );
}

function CustomerRouter() {
  console.log("CustomerRouter loaded");
  return (
    <CartProvider>
      <Switch>
        <Route path="/" component={CustomerStorePage} />
        <Route path="/customer" component={CustomerStorePage} />
        <Route path="/store" component={CustomerStorePage} />
        <Route path="/sort-products" component={SortProductsPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/product/:id" component={CustomerProductPage} />
        <Route path="/saved-products" component={SavedProductsPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/order-confirmation" component={OrderConfirmationPage} />
        <Route path="/orders" component={CustomerOrdersPage} />
        <Route path="/profile" component={CustomerProfilePage} />
        <Route path="/profile/edit" component={EditProfilePage} />
        <Route path="/withdraw" component={WithdrawPage} />
        <Route path="/withdraw/zain-cash" component={ZainCashWithdrawPage} />
        <Route path="/withdraw/mastercard" component={MastercardWithdrawPage} />
        <Route path="/withdraw-history" component={UserWithdrawHistoryPage} />
        <Route path="/support" component={SupportChatPage} />
        <Route path="/ai-chat" component={AIChatPage} />
        <Route path="/user-settings" component={UserSettingsPage} />
        <Route path="/language-settings" component={LanguageSettingsPage} />
        <Route path="/ecommerce-assistant" component={ECommerceAssistantPage} />
        <Route path="/app-policies" component={AppPoliciesPage} />
        <Route path="/banned" component={BannedUserPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </CartProvider>
  );
}

function ProtectedRouter() {
  const { user } = useAuth();
  
  // إذا لم يكن هناك مستخدم، عرض صفحة التحميل
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // التحقق من حالة الحظر للمستخدمين العاديين
  if (user?.role === 'customer' && (user as any)?.isBanned) {
    const banExpiresAt = (user as any)?.banExpiresAt;
    
    // إذا كان الحظر لا نهائي (بدون تاريخ انتهاء) أو لم ينته بعد
    if (!banExpiresAt || (banExpiresAt && new Date(banExpiresAt).getTime() > new Date().getTime())) {
      return <BannedPage banReason={(user as any)?.banReason} banExpiresAt={banExpiresAt} />;
    }
  }
  
  // توجيه المدراء دائماً للواجهة الإدارية
  if (user.role === 'admin') {
    return <AdminRouter />;
  }
  
  // توجيه العملاء للواجهة العادية فقط
  if (user.role === 'customer') {
    return <CustomerRouter />;
  }
  
  // للمستخدمين بدور غير محدد، توجيههم للواجهة العادية كافتراضي
  return <CustomerRouter />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { showIntro, isLoading: introLoading, completeIntro } = useIntro();
  const [location] = useLocation();

  // تحديد المسارات الإدارية بوضوح
  const adminPaths = ['/admin', '/dashboard', '/users', '/analytics', '/settings', '/banners', '/store-management', '/user-management', '/category-management', '/orders-management', '/banner-management', '/customers', '/withdraw-management', '/notifications', '/orders', '/ai-assistant', '/ai-chat', '/support'];
  const isAdminProductPath = location === '/products' || location.startsWith('/products/') || location.includes('management');
  const isAdminPath = adminPaths.some(path => location.startsWith(path)) || isAdminProductPath;
  
  // عرض الانترو عند الدخول الأول
  if (!introLoading && showIntro) {
    return <IntroScreen onComplete={completeIntro} />;
  }
  
  if (isAdminPath) {
    return <AdminRouter />;
  }

  if (isLoading || introLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/register" component={RegisterPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/banned" component={BannedUserPage} />
        <Route path="/" component={WelcomePage} />
        <Route path="*" component={WelcomePage} />
      </Switch>
    );
  }

  return <ProtectedRouter />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <NetworkStatus />
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
