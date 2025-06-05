import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // تصفية البانرات النشطة فقط وحد أقصى 5 بانرات
  const activeBanners = banners?.filter(banner => banner.isActive).slice(0, 5) || [];
  
  // إذا لم توجد بانرات نشطة، نعرض رسالة
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

  // تبديل البانر تلقائياً كل 4 ثوان
  useEffect(() => {
    if (activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg mb-6">
      {/* البانرات */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeBanners.map((banner) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {banner.imageUrl ? (
              <>
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                {/* طبقة الخلفية المظلمة للنص */}
                <div className="absolute inset-0 bg-black bg-opacity-40" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
            )}
            
            {/* النص */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
              <h2 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {banner.title}
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
                onClick={() => goToSlide(index)}
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