import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Image, ArrowUp, ArrowDown } from "lucide-react";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  description?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export const BannerManager = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["/api/banners"],
  });

  const createBannerMutation = useMutation({
    mutationFn: async () => {
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

      return await apiRequest('POST', '/api/banners', {
        title,
        description,
        imageUrl,
        isActive,
        order: banners.length + 1,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة البانر بنجاح",
        description: "تم إضافة صورة البانر الجديدة",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      resetForm();
      setIsAddModalOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة البانر",
        variant: "destructive",
      });
    },
  });

  const updateBannerMutation = useMutation({
    mutationFn: async () => {
      let imageUrl = editingBanner?.imageUrl || '';
      
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

      return await apiRequest('PATCH', `/api/banners/${editingBanner?.id}`, {
        title,
        description,
        imageUrl,
        isActive,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث البانر بنجاح",
        description: "تم تحديث معلومات البانر",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
      resetForm();
      setEditingBanner(null);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تحديث البانر",
        variant: "destructive",
      });
    },
  });

  const deleteBannerMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/banners/${id}`),
    onSuccess: () => {
      toast({
        title: "تم حذف البانر",
        description: "تم حذف صورة البانر بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, newOrder }: { id: number; newOrder: number }) =>
      apiRequest('PATCH', `/api/banners/${id}`, { order: newOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/banners'] });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedImage(null);
    setImagePreview(null);
    setIsActive(true);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setDescription(banner.description || "");
    setImagePreview(banner.imageUrl);
    setIsActive(banner.isActive);
  };

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

  const moveUp = (banner: Banner) => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (currentIndex > 0) {
      const previousBanner = banners[currentIndex - 1];
      updateOrderMutation.mutate({ id: banner.id, newOrder: previousBanner.order });
      updateOrderMutation.mutate({ id: previousBanner.id, newOrder: banner.order });
    }
  };

  const moveDown = (banner: Banner) => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (currentIndex < banners.length - 1) {
      const nextBanner = banners[currentIndex + 1];
      updateOrderMutation.mutate({ id: banner.id, newOrder: nextBanner.order });
      updateOrderMutation.mutate({ id: nextBanner.id, newOrder: banner.order });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة صور البانر</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إضافة بانر جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة بانر جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان البانر</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="أدخل عنوان البانر"
                />
              </div>
              
              <div>
                <Label htmlFor="description">الوصف (اختياري)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="أدخل وصف البانر"
                  rows={3}
                />
              </div>

              <div>
                <Label>صورة البانر</Label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="معاينة البانر"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      حذف
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="banner-image"
                    />
                    <label htmlFor="banner-image" className="cursor-pointer">
                      <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">اضغط لاختيار صورة</p>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="active">فعال</Label>
              </div>

              <Button
                onClick={() => createBannerMutation.mutate()}
                disabled={!title || !imagePreview || createBannerMutation.isPending}
                className="w-full"
              >
                {createBannerMutation.isPending ? "جاري الإضافة..." : "إضافة البانر"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners
          .sort((a, b) => a.order - b.order)
          .map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant={banner.isActive ? "default" : "secondary"}>
                  {banner.isActive ? "فعال" : "غير فعال"}
                </Badge>
              </div>
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <Button size="sm" variant="outline" onClick={() => moveUp(banner)}>
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => moveDown(banner)}>
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">{banner.title}</h3>
              {banner.description && (
                <p className="text-sm text-gray-600 mb-3">{banner.description}</p>
              )}
              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(banner)}
                >
                  <Edit className="w-3 h-3 ml-1" />
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteBannerMutation.mutate(banner.id)}
                >
                  <Trash2 className="w-3 h-3 ml-1" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal للتعديل */}
      <Dialog open={!!editingBanner} onOpenChange={() => setEditingBanner(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل البانر</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">عنوان البانر</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان البانر"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">الوصف (اختياري)</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف البانر"
                rows={3}
              />
            </div>

            <div>
              <Label>صورة البانر</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="معاينة البانر"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(editingBanner?.imageUrl || null);
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="edit-banner-image"
                  />
                  <label htmlFor="edit-banner-image" className="cursor-pointer">
                    <Image className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">اضغط لاختيار صورة جديدة</p>
                  </label>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label htmlFor="edit-active">فعال</Label>
            </div>

            <Button
              onClick={() => updateBannerMutation.mutate()}
              disabled={!title || updateBannerMutation.isPending}
              className="w-full"
            >
              {updateBannerMutation.isPending ? "جاري التحديث..." : "تحديث البانر"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {banners.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد صور بانر</h3>
            <p className="text-gray-600 mb-4">ابدأ بإضافة صور البانر لمتجرك</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول بانر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};