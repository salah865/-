import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export const CategoriesManager = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم إضافة الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفئة",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      resetForm();
      toast({
        title: "تم بنجاح",
        description: "تم تحديث الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الفئة",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/categories'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "تم بنجاح",
        description: "تم حذف الفئة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الفئة",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEditingCategory(null);
    setCategoryName('');
    setCategoryDescription('');
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
  };

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      toast({
        title: "خطأ",
        description: "اسم الفئة مطلوب",
        variant: "destructive",
      });
      return;
    }

    const data = {
      name: categoryName.trim(),
      description: categoryDescription.trim() || undefined,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate(data);
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            إدارة الفئات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* نموذج إضافة/تعديل فئة */}
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryName">اسم الفئة</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="أدخل اسم الفئة"
                />
              </div>
              
              <div>
                <Label htmlFor="categoryDescription">الوصف (اختياري)</Label>
                <Textarea
                  id="categoryDescription"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  placeholder="أدخل وصف الفئة"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {editingCategory ? 'تحديث الفئة' : 'إضافة الفئة'}
                </Button>
                
                {editingCategory && (
                  <Button 
                    onClick={resetForm}
                    variant="outline"
                  >
                    إلغاء التعديل
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* قائمة الفئات */}
          <Card>
            <CardHeader>
              <CardTitle>الفئات الموجودة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">لا توجد فئات مضافة</p>
                ) : (
                  categories.map((category: any) => (
                    <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-gray-600">{category.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};