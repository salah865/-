import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Eye,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  FolderPlus,
  Tags
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  description: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون موجب'),
  minPrice: z.number().min(0, 'الحد الأدنى للسعر يجب أن يكون موجب').optional(),
  maxPrice: z.number().min(0, 'الحد الأعلى للسعر يجب أن يكون موجب').optional(),
  stock: z.number().min(0, 'الكمية يجب أن تكون موجبة'),
  categoryId: z.string().min(1, 'الفئة مطلوبة'),
  sku: z.string().min(1, 'رقم المنتج مطلوب'),
  colors: z.array(z.string()).optional().default([]),
}).refine((data) => {
  if (data.minPrice && data.maxPrice) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, {
  message: "الحد الأدنى يجب أن يكون أقل من أو يساوي الحد الأعلى",
  path: ["minPrice"]
});

const categorySchema = z.object({
  name: z.string().min(1, 'اسم الفئة مطلوب'),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type CategoryFormData = z.infer<typeof categorySchema>;

export const EnhancedProductsManager = () => {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      minPrice: undefined,
      maxPrice: undefined,
      stock: 0,
      categoryId: '',
      sku: '',
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      let imageUrl = '';
      
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('فشل في رفع الصورة');
        }
        
        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.url;
      }

      return await apiRequest('POST', '/api/products', {
        name: data.name,
        description: data.description || null,
        price: data.price,
        minPrice: data.minPrice || null,
        maxPrice: data.maxPrice || null,
        stock: data.stock,
        categoryId: parseInt(data.categoryId),
        sku: data.sku,
        imageUrl: imageUrl || null,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة المنتج بنجاح",
        description: "تم إضافة المنتج الجديد إلى قائمة المنتجات",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddModalOpen(false);
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة المنتج",
        description: "حدث خطأ أثناء إضافة المنتج. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      return await apiRequest('PUT', `/api/products/${editingProduct.id}`, {
        name: data.name,
        description: data.description || null,
        price: data.price,
        minPrice: data.minPrice || null,
        maxPrice: data.maxPrice || null,
        stock: data.stock,
        categoryId: parseInt(data.categoryId),
        sku: data.sku,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث المنتج بنجاح",
        description: "تم حفظ التغييرات على المنتج",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      form.reset();
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث المنتج",
        description: "حدث خطأ أثناء تحديث المنتج. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      console.log('حذف المنتج رقم:', productId);
      const response = await apiRequest('DELETE', `/api/products/${productId}`);
      console.log('نتيجة الحذف:', response);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "تم حذف المنتج بنجاح",
        description: "تم حذف المنتج من قائمة المنتجات",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف المنتج",
        description: "حدث خطأ أثناء حذف المنتج. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return await apiRequest('POST', '/api/categories', data);
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الفئة بنجاح",
        description: "تم إضافة فئة جديدة للمنتجات",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setIsCategoryModalOpen(false);
      categoryForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة الفئة",
        description: "حدث خطأ أثناء إضافة الفئة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      return await apiRequest('PUT', `/api/categories/${editingCategory.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث الفئة بنجاح",
        description: "تم حفظ التغييرات على الفئة",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      setEditingCategory(null);
      categoryForm.reset();
    },
    onError: () => {
      toast({
        title: "خطأ في تحديث الفئة",
        description: "حدث خطأ أثناء تحديث الفئة. يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return await apiRequest('DELETE', `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الفئة بنجاح",
        description: "تم حذف الفئة من قائمة الفئات",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
    },
    onError: () => {
      toast({
        title: "خطأ في حذف الفئة",
        description: "لا يمكن حذف فئة تحتوي على منتجات",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  const startEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: product.price || 0,
      minPrice: product.minPrice || undefined,
      maxPrice: product.maxPrice || undefined,
      stock: product.stock,
      categoryId: product.categoryId?.toString() || '',
      sku: product.sku || '',
    });
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setIsAddModalOpen(false);
    form.reset();
  };

  const onCategorySubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // وظائف التعامل مع الصور
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const startEditCategory = (category: any) => {
    setEditingCategory(category);
    categoryForm.reset({
      name: category.name,
      description: category.description || '',
    });
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
    categoryForm.reset();
  };

  // تصفية المنتجات
  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  // إحصائيات سريعة
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const lowStockProducts = Array.isArray(products) ? products.filter((p: any) => p.stock < 10).length : 0;
  const totalValue = Array.isArray(products) ? products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0) : 0;

  return (
    <div className="space-y-6">
      {/* التبويب بين المنتجات والفئات */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={activeTab === 'products' ? 'default' : 'outline'}
              onClick={() => setActiveTab('products')}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              إدارة المنتجات
            </Button>
            <Button
              variant={activeTab === 'categories' ? 'default' : 'outline'}
              onClick={() => setActiveTab('categories')}
              className="flex items-center gap-2"
            >
              <Tags className="w-4 h-4" />
              إدارة الفئات
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === 'products' ? (
        <>
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">منتجات بمخزون منخفض</p>
                    <p className="text-2xl font-bold text-orange-600">{lowStockProducts}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">القيمة الإجمالية</p>
                    <p className="text-2xl font-bold text-green-600">{totalValue.toLocaleString()} د.ع</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* شريط الأدوات */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
              {/* البحث */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="ابحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* تصفية حسب الفئة */}
              <div className="w-full md:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">جميع الفئات</option>
                  {Array.isArray(categories) && categories.map((category: any) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج جديد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* نموذج إضافة/تعديل المنتج */}
      {(isAddModalOpen || editingProduct) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">اسم المنتج *</Label>
                  <Input
                    id="name"
                    placeholder="أدخل اسم المنتج"
                    {...form.register('name')}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sku">رقم المنتج (SKU) *</Label>
                  <Input
                    id="sku"
                    placeholder="مثال: PROD-001"
                    {...form.register('sku')}
                  />
                  {form.formState.errors.sku && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.sku.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">رقم فريد لتعريف المنتج</p>
                </div>



                <div>
                  <Label htmlFor="price">السعر (د.ع) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    {...form.register('price', { valueAsNumber: true })}
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.price.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">سعر المنتج بالدينار العراقي</p>
                </div>

                <div>
                  <Label htmlFor="minPrice">الحد الأدنى للسعر (د.ع)</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    placeholder="0"
                    {...form.register('minPrice', { valueAsNumber: true })}
                  />
                  {form.formState.errors.minPrice && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.minPrice.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">أقل سعر يمكن بيع المنتج به</p>
                </div>

                <div>
                  <Label htmlFor="maxPrice">الحد الأعلى للسعر (د.ع)</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    placeholder="0"
                    {...form.register('maxPrice', { valueAsNumber: true })}
                  />
                  {form.formState.errors.maxPrice && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.maxPrice.message}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">أعلى سعر يمكن بيع المنتج به</p>
                </div>

                <div>
                  <Label htmlFor="stock">الكمية المتوفرة *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    {...form.register('stock', { valueAsNumber: true })}
                  />
                  {form.formState.errors.stock && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.stock.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="category">الفئة *</Label>
                  <select
                    id="category"
                    {...form.register('categoryId')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">اختر الفئة</option>
                    {Array.isArray(categories) && categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.categoryId && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.categoryId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  placeholder="وصف المنتج (اختياري)"
                  {...form.register('description')}
                />
              </div>

              {/* رفع صورة المنتج */}
              <div className="space-y-3">
                <Label>صورة المنتج</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="معاينة المنتج" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        إزالة
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <label htmlFor="imageInput" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            اختر صورة للمنتج
                          </span>
                          <span className="mt-1 block text-xs text-gray-500">
                            PNG, JPG, GIF حتى 5MB
                          </span>
                        </label>
                        <input
                          id="imageInput"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="submit"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                  className="flex-1"
                >
                  {(createProductMutation.isPending || updateProductMutation.isPending) 
                    ? 'جاري الحفظ...' 
                    : editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'
                  }
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* قائمة المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قائمة المنتجات ({filteredProducts.length})</span>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">مُرتبة حسب الأحدث</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد منتجات</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || selectedCategory 
                  ? 'لا توجد منتجات تطابق معايير البحث' 
                  : 'ابدأ بإضافة منتجات جديدة لمتجرك'
                }
              </p>
              {!searchTerm && !selectedCategory && (
                <Button onClick={() => setIsAddModalOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول منتج
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* صورة المنتج */}
                  {product.imageUrl ? (
                    <div className="w-full h-48 bg-slate-100">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center');
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-slate-500 text-sm">لا توجد صورة</span>';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                      <span className="text-slate-500 text-sm">لا توجد صورة</span>
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-slate-600 mb-2">{product.description}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {categories.find((c: any) => c.id === product.categoryId)?.name || 'غير محدد'}
                          </Badge>
                          {product.stock < 10 && (
                            <Badge variant="destructive" className="text-xs">
                              مخزون منخفض
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">سعر التجزئة:</span>
                      <span className="font-semibold text-green-600">
                        {product.price?.toLocaleString()} د.ع
                      </span>
                    </div>
                    {product.wholesalePrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">سعر الجملة:</span>
                        <span className="font-semibold text-purple-600">
                          {product.wholesalePrice.toLocaleString()} د.ع
                        </span>
                      </div>
                    )}
                    {(product.minPrice || product.maxPrice) && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">نطاق السعر:</span>
                        <span className="font-medium text-blue-600 text-sm">
                          {product.minPrice ? `${product.minPrice.toLocaleString()}` : '0'} - 
                          {product.maxPrice ? ` ${product.maxPrice.toLocaleString()}` : ' ∞'} د.ع
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">المتوفر:</span>
                      <span className={`font-medium ${product.stock < 10 ? 'text-orange-600' : 'text-slate-900'}`}>
                        {product.stock} قطعة
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteProductMutation.mutate(product.id)}
                      disabled={deleteProductMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      ) : (
        <>
          {/* إدارة الفئات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tags className="w-5 h-5" />
                  <span>إدارة فئات المنتجات</span>
                </div>
                <Button 
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  إضافة فئة جديدة
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(categories) && categories.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Tags className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">لا توجد فئات</h3>
                    <p className="text-slate-600 mb-4">ابدأ بإضافة فئات لتنظيم منتجاتك</p>
                    <Button onClick={() => setIsCategoryModalOpen(true)}>
                      <FolderPlus className="w-4 h-4 ml-2" />
                      إضافة أول فئة
                    </Button>
                  </div>
                ) : (
                  Array.isArray(categories) && categories.map((category: any) => {
                    const categoryProducts = Array.isArray(products) ? products.filter((p: any) => p.categoryId === category.id) : [];
                    return (
                      <Card key={category.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">{category.name}</h3>
                              {category.description && (
                                <p className="text-sm text-slate-600 mb-2">{category.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {categoryProducts.length} منتج
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditCategory(category)}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 ml-1" />
                              تعديل
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteCategoryMutation.mutate(category.id)}
                              disabled={deleteCategoryMutation.isPending || categoryProducts.length > 0}
                              title={categoryProducts.length > 0 ? 'لا يمكن حذف فئة تحتوي على منتجات' : 'حذف الفئة'}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* نموذج إضافة/تعديل الفئة */}
          {(isCategoryModalOpen || editingCategory) && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">
                  {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="categoryName">اسم الفئة *</Label>
                    <Input
                      id="categoryName"
                      placeholder="أدخل اسم الفئة"
                      {...categoryForm.register('name')}
                    />
                    {categoryForm.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">{categoryForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoryDescription">الوصف</Label>
                    <Input
                      id="categoryDescription"
                      placeholder="وصف الفئة (اختياري)"
                      {...categoryForm.register('description')}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="submit"
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                      className="flex-1"
                    >
                      {(createCategoryMutation.isPending || updateCategoryMutation.isPending) 
                        ? 'جاري الحفظ...' 
                        : editingCategory ? 'حفظ التغييرات' : 'إضافة الفئة'
                      }
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelCategoryEdit}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};