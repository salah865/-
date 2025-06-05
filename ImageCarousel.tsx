import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  banners: any[];
}

export const ImageCarousel = ({ banners }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // استخدام البانرات الممررة من الصفحة الأساسية
  const activeBanners = banners;
  
  // صور افتراضية في حالة عدم وجود بانرات من الإدارة
  const defaultBanners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=300&fit=crop",
      title: "مرحباً بكم في متجرنا",
      description: "أفضل المنتجات بأسعار مناسبة"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=300&fit=crop",
      title: "أفضل المنتجات",
      description: "جودة عالية وخدمة ممتازة"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=300&fit=crop",
      title: "عروض خاصة",
      description: "خصومات مذهلة على جميع المنتجات"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=300&fit=crop",
      title: "توصيل سريع",
      description: "وصول أسرع إلى باب منزلك"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&h=300&fit=crop",
      title: "منتجات مميزة",
      description: "تشكيلة واسعة ومتنوعة"
    }
  ];

  // استخدام البانرات المضافة من الإدارة فقط
  const activeBannersOnly = activeBanners?.filter((banner: any) => banner.isActive) || [];
  const displayBanners = activeBannersOnly.map((banner: any) => ({
    id: banner.id,
    image: banner.imageUrl,
    title: banner.title,
    description: banner.description || banner.desc
  }));

  // تبديل البانر تلقائياً كل 4 ثوان
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === displayBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? displayBanners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === displayBanners.length - 1 ? 0 : currentIndex + 1);
  };

  return (
    <div className="relative w-full">
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-0 relative">
          {/* الصورة الحالية */}
          <div className="relative h-48 md:h-64">
            <img
              src={displayBanners[currentIndex].image}
              alt={displayBanners[currentIndex].title}
              className="w-full h-full object-cover"
            />
            
            {/* التراكب المظلم */}
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            
            {/* النص */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-6">
              <h2 className="text-xl md:text-3xl font-bold mb-2">
                {displayBanners[currentIndex].title}
              </h2>
              <p className="text-sm md:text-lg opacity-90">
                {displayBanners[currentIndex].description}
              </p>
            </div>
          </div>

          {/* أزرار التنقل */}
          {displayBanners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
            </>
          )}

          {/* المؤشرات */}
          {displayBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 space-x-reverse">
              {displayBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white bg-opacity-50'
                  }`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};