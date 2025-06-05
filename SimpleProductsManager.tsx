import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Upload
} from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { CategoriesManager } from './CategoriesManager';

const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  description: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون موجب'),
  minPrice: z.number().min(0, 'الحد الأدنى للسعر يجب أن يكون موجب').optional(),
  maxPrice: z.number().min(0, 'الحد الأعلى للسعر يجب أن يكون موجب').optional(),
  stock: z.number().min(0, 'الكمية يجب أن تكون موجبة'),
});

type ProductFormData = z.infer<typeof productSchema>;

export const SimpleProductsManager = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

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
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        }
      }

      return await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categoryId: 1, // فئة افتراضية، يمكن تغييرها في صفحة إدارة المنتج
          sku: `PROD_${Date.now()}`, // رقم منتج تلقائي، يمكن تغييره في صفحة إدارة المنتج
          imageUrl: imageUrl || undefined,
        }),
      });
    },
    onSuccess: () => {
      // تحديث فوري لجميع البيانات في كل التطبيق
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.refetchQueries({ queryKey: ['/api/products'] });
      
      setIsAddModalOpen(false);
      setEditingProduct(null);
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج بنجاح وسيظهر فوراً في واجهة الزبون",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة المنتج",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      let imageUrl = editingProduct.imageUrl;
      
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        }
      }

      return await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          categoryId: parseInt(data.categoryId),
          imageUrl,
        }),
      });
    },
    onSuccess: () => {
      // تحديث فوري لجميع البيانات في كل التطبيق
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.refetchQueries({ queryKey: ['/api/products'] });
      
      setEditingProduct(null);
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المنتج بنجاح وسيظهر فوراً في واجهة الزبون",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المنتج",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف المنتج بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف المنتج",
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

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      minPrice: product.minPrice ? parseFloat(product.minPrice) : undefined,
      maxPrice: product.maxPrice ? parseFloat(product.maxPrice) : undefined,
      stock: product.stock || 0,
      categoryId: product.categoryId?.toString() || '',
      sku: product.sku || '',
    });
    setImagePreview(product.imageUrl || null);
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              إدارة المنتجات
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج جديد
              </Button>
              <Button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Package className="w-4 h-4 ml-2" />
                إدارة الفئات
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="البحث في المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <Card>
        <CardContent className="p-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">لا توجد منتجات</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                إضافة أول منتج
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <Card key={product.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">السعر:</span>
                        <span className="font-bold text-purple-600">
                          {parseFloat(product.price).toLocaleString()} د.ع
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">المخزون:</span>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock} قطعة
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">الفئة:</span>
                        <span className="text-sm">{product.category?.name}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setLocation(`/products/${product.id}/manage`)}
                        className="flex-1"
                      >
                        <Package className="w-3 h-3 ml-1" />
                        إدارة الصفحة
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProductMutation.mutate(product.id)}
                        disabled={deleteProductMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Product Modal */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                    form.reset();
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">اسم المنتج</Label>
                    <Input
                      id="name"
                      {...form.register('name')}
                      placeholder="أدخل اسم المنتج"
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>


                </div>

                <div>
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="أدخل وصف المنتج"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">سعر الجملة</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register('price', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                    {form.formState.errors.price && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="minPrice">الحد الأدنى للسعر</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      step="0.01"
                      {...form.register('minPrice', { valueAsNumber: true })}
                      placeholder="اختياري"
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxPrice">الحد الأعلى للسعر</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      step="0.01"
                      {...form.register('maxPrice', { valueAsNumber: true })}
                      placeholder="اختياري"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stock">الكمية المتوفرة</Label>
                  <Input
                    id="stock"
                    type="number"
                    {...form.register('stock', { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {form.formState.errors.stock && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="image">صورة المنتج</Label>
                  <div className="space-y-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="معاينة" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={createProductMutation.isPending || updateProductMutation.isPending}
                    className="flex-1"
                  >
                    {editingProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingProduct(null);
                      form.reset();
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* مكون إدارة الفئات */}
      <CategoriesManager 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
      />
    </div>
  );
};