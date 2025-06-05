import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Palette,
  Upload
} from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatCurrency, getOrderStatus, getOrderStatusColor } from '../utils/formatters';

const productSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  description: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون موجب'),
  minPrice: z.number().min(0, 'الحد الأدنى للسعر يجب أن يكون موجب').optional(),
  maxPrice: z.number().min(0, 'الحد الأعلى للسعر يجب أن يكون موجب').optional(),
  stock: z.number().min(0, 'الكمية يجب أن تكون موجبة'),
  categoryId: z.string().min(1, 'الفئة مطلوبة'),
  sku: z.string().min(1, 'رقم المنتج مطلوب'),
});

type ProductFormData = z.infer<typeof productSchema>;

export const ColoredProductsManager = () => {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
          categoryId: parseInt(data.categoryId),
          imageUrl: imageUrl || undefined,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddModalOpen(false);
      setEditingProduct(null);
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المنتج بنجاح",
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
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setEditingProduct(null);
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المنتج بنجاح",
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
      return await fetch(`/api/products/${id}`, { method: 'DELETE' });
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

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      minPrice: product.minPrice ? parseFloat(product.minPrice) : undefined,
      maxPrice: product.maxPrice ? parseFloat(product.maxPrice) : undefined,
      stock: product.stock,
      categoryId: product.categoryId.toString(),
      sku: product.sku,
      colors: product.colors || [],
    });
    setImagePreview(product.imageUrl);
  };

  const filteredProducts = Array.isArray(products) ? products.filter((product: any) => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || product.categoryId?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate(data);
    } else {
      createProductMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج جديد
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث عن منتج..."
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
                {Array.isArray(categories) && categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
              <p className="text-gray-600 mb-4">ابدأ بإضافة منتجات جديدة لمتجرك</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول منتج
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="border rounded-lg overflow-hidden">
                  {/* Product Image */}
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        )}
                        
                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                          <div className="flex items-center gap-1 mb-2">
                            <Palette className="w-3 h-3 text-gray-500" />
                            <div className="flex gap-1">
                              {product.colors.slice(0, 3).map((color: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {color}
                                </Badge>
                              ))}
                              {product.colors.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.colors.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {Array.isArray(categories) && categories.find((c: any) => c.id === product.categoryId)?.name || getOrderStatus(status)}
                          </Badge>
                          {product.stock < 10 && (
                            <Badge variant="destructive" className="text-xs">
                              مخزون منخفض
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(product.price)} د.ع
                          </div>
                          {(product.minPrice || product.maxPrice) && (
                            <div className="text-xs text-gray-500">
                              {product.minPrice && `من ${formatCurrency(product.minPrice)}`}
                              {product.minPrice && product.maxPrice && ' - '}
                              {product.maxPrice && `إلى ${formatCurrency(product.maxPrice)}`} د.ع
                            </div>
                          )}
                          <div className="text-sm text-gray-600">المخزون: {product.stock}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(product)}
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
                </div>
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

                  <div>
                    <Label htmlFor="sku">رقم المنتج</Label>
                    <Input
                      id="sku"
                      {...form.register('sku')}
                      placeholder="أدخل رقم المنتج"
                    />
                    {form.formState.errors.sku && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.sku.message}
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
                    <Label htmlFor="price">السعر الأساسي</Label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">الكمية المتاحة</Label>
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
                    <Label htmlFor="categoryId">الفئة</Label>
                    <Select
                      value={form.watch('categoryId')}
                      onValueChange={(value) => form.setValue('categoryId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(categories) && categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoryId && (
                      <p className="text-sm text-red-600 mt-1">
                        {form.formState.errors.categoryId.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Colors Section */}
                <div>
                  <Label>الألوان المتاحة</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        placeholder="أدخل لون جديد"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                      />
                      <Button type="button" onClick={addColor} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {form.watch('colors') && form.watch('colors').length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.watch('colors').map((color, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {color}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0"
                              onClick={() => removeColor(color)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
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
                      <div className="relative w-32 h-32">
                        <img
                          src={imagePreview}
                          alt="معاينة"
                          className="w-full h-full object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
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
    </div>
  );
};