import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Filter,
  Grid,
  List,
  Star,
  Plus,
  Minus,
  Package,
  Tag
} from 'lucide-react';

interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

export const CustomerStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // تصفية المنتجات
  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId?.toString() === selectedCategory;
    const isAvailable = product.stock > 0;
    return matchesSearch && matchesCategory && isAvailable;
  }) : [];

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    ));
  };

  const toggleFavorite = (productId: number) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const getCartItemQuantity = (productId: number) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">متجر تاجر</h1>
                  <p className="text-sm text-slate-600">كل ما تحتاجه في مكان واحد</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button className="relative bg-purple-600 hover:bg-purple-700">
                  <ShoppingCart className="w-5 h-5 ml-2" />
                  سلة التسوق
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </div>
              <div className="text-left">
                <p className="text-sm text-slate-600">الإجمالي</p>
                <p className="font-bold text-purple-600">{totalPrice.toLocaleString()} د.ع</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* الشريط الجانبي للتصفية */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  تصفية المنتجات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">البحث</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="ابحث عن منتج..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* الفئات */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">الفئات</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-right p-2 rounded-lg transition-colors ${
                        !selectedCategory ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      جميع الفئات
                    </button>
                    {Array.isArray(categories) && categories.map((category: any) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id.toString())}
                        className={`w-full text-right p-2 rounded-lg transition-colors ${
                          selectedCategory === category.id.toString() 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* منطقة المنتجات */}
          <div className="lg:col-span-3">
            {/* شريط الأدوات */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-900">المنتجات المتاحة</h2>
                <Badge variant="outline" style={{ direction: 'ltr' }}>
                  {filteredProducts.length?.toLocaleString('en-US')} منتج
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* عرض المنتجات */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-600">
                  {searchTerm || selectedCategory 
                    ? 'لا توجد منتجات تطابق معايير البحث' 
                    : 'لا توجد منتجات متاحة حالياً'
                  }
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product: any) => {
                  const cartQuantity = getCartItemQuantity(product.id);
                  const isFavorite = favorites.includes(product.id);
                  
                  return (
                    <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-4">
                        {/* صورة المنتج */}
                        <div className="mb-4">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-48 object-cover rounded-lg bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center ${product.imageUrl ? 'hidden' : ''}`}>
                            <Package className="w-16 h-16 text-slate-400" />
                          </div>
                        </div>

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">
                              {product.name}
                            </h3>
                            {product.description && (
                              <p className="text-sm text-slate-600 mb-2">{product.description}</p>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {categories.find((c: any) => c.id === product.categoryId)?.name || 'غير محدد'}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map((star) => (
                                  <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                                <span className="text-xs text-slate-500">(4.8)</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(product.id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">سعر الجملة</div>
                              <p 
                                data-testid="product-price" 
                                className="text-xs font-semibold text-purple-600"
                                style={{ direction: 'ltr' }}
                              >
                                {product.price?.toLocaleString('en-US')} د.ع
                              </p>
                              {product.minPrice && product.maxPrice && (
                                <div className="text-[10px] text-gray-500 mt-1" style={{ direction: 'ltr' }}>
                                  {product.minPrice?.toLocaleString('en-US')} - {product.maxPrice?.toLocaleString('en-US')} د.ع
                                </div>
                              )}
                            </div>
                            <Badge variant="secondary" className="text-xs" style={{ direction: 'ltr' }}>
                              متوفر: {product.stock?.toLocaleString('en-US')} قطعة
                            </Badge>
                          </div>

                          {cartQuantity > 0 ? (
                            <div className="flex items-center justify-between bg-purple-50 rounded-lg p-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="font-medium text-purple-700" style={{ direction: 'ltr' }}>
                                {cartQuantity?.toLocaleString('en-US')} في السلة
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                                disabled={cartQuantity >= product.stock}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => addToCart(product)}
                              className="w-full bg-purple-600 hover:bg-purple-700"
                              disabled={product.stock === 0}
                            >
                              <ShoppingCart className="w-4 h-4 ml-2" />
                              إضافة للسلة
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};