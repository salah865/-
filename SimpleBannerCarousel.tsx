import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface SimpleBannerCarouselProps {
  banners: Banner[];
}

export function SimpleBannerCarousel({ banners }: SimpleBannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // التأكد من أن banners هو مصفوفة صالحة
  const safeBanners = banners || [];
  
  // فلترة البانرات النشطة (حد أقصى 5)
  const activeBanners = safeBanners.filter(banner => 
    banner && 
    typeof banner === 'object' && 
    banner.isActive === true
  ).slice(0, 5);
  
  // إذا لم توجد بانرات، نعرض رسالة ترحيبية
  if (activeBanners.length === 0) {
    return (
      <div className="w-full h-64 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mb-6 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-2">مرحباً بكم في متجرنا</h2>
          <p className="text-lg">أفضل المنتجات بأسعار مميزة</p>
        </div>
      </div>
    );
  }

  // التبديل التلقائي كل 4 ثوان
  useEffect(() => {
    if (!activeBanners || activeBanners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        if (!activeBanners || activeBanners.length === 0) return 0;
        return (prev + 1) % activeBanners.length;
      });
    }, 4000);
    
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const nextSlide = () => {
    if (!activeBanners || activeBanners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    if (!activeBanners || activeBanners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-lg mb-6">
      {/* البانرات */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeBanners.map((banner, index) => (
          <div key={banner.id || index} className="w-full h-full flex-shrink-0 relative">
            {banner.imageUrl ? (
              <>
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'بانر'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // في حالة فشل تحميل الصورة، نخفي الصورة
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div 
                  className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 hidden"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
            
            {/* النص */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
              <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {banner.title || 'عنوان البانر'}
              </h2>
              {banner.description && (
                <p className="text-lg md:text-xl max-w-2xl drop-shadow-lg">
                  {banner.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* أزرار التنقل */}
      {activeBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          {/* النقاط */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}