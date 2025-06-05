import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Heart, Gift, Sparkles, ArrowRight } from 'lucide-react';

interface IntroScreenProps {
  onComplete: () => void;
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    {
      icon: ShoppingCart,
      title: "أهلاً وسهلاً بك",
      subtitle: "في متجرك الرقمي المفضل",
      description: "تسوق بسهولة واحصل على أفضل المنتجات",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Star,
      title: "منتجات مميزة",
      subtitle: "جودة عالية وأسعار منافسة",
      description: "اكتشف مجموعة واسعة من المنتجات المتنوعة",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Heart,
      title: "تجربة تسوق مميزة",
      subtitle: "خدمة عملاء متميزة على مدار الساعة",
      description: "نحن هنا لخدمتك في أي وقت",
      color: "from-pink-500 to-red-600"
    },
    {
      icon: Gift,
      title: "ابدأ التسوق الآن",
      subtitle: "واستمتع بتجربة فريدة",
      description: "اكتشف عالم من المنتجات الرائعة",
      color: "from-green-500 to-emerald-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev === steps.length - 1) {
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
          }, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [steps.length, onComplete]);

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                }}
                animate={{
                  y: [null, -100],
                  opacity: [0.7, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative text-center px-8 max-w-md">
            {/* Logo Area */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2 
              }}
              className="mb-8"
            >
              <div className={`w-32 h-32 mx-auto bg-gradient-to-r ${currentStepData.color} rounded-full flex items-center justify-center shadow-2xl`}>
                <IconComponent className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            {/* Animated Cart Icons */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    opacity: [0, 0.6, 0],
                    x: [0, Math.cos(i * 60 * Math.PI / 180) * 120],
                    y: [0, Math.sin(i * 60 * Math.PI / 180) * 120],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <ShoppingCart className="w-6 h-6 text-white/40" />
                </motion.div>
              ))}
            </motion.div>

            {/* Title */}
            <motion.h1
              key={currentStep + 'title'}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-2"
            >
              {currentStepData.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              key={currentStep + 'subtitle'}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -30, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-purple-200 mb-4"
            >
              {currentStepData.subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              key={currentStep + 'description'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-300 text-lg leading-relaxed"
            >
              {currentStepData.description}
            </motion.p>

            {/* Progress Dots */}
            <motion.div
              className="flex justify-center gap-3 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-white scale-125' 
                      : index < currentStep 
                        ? 'bg-purple-300' 
                        : 'bg-gray-500'
                  }`}
                  animate={{
                    scale: index === currentStep ? 1.25 : 1,
                  }}
                />
              ))}
            </motion.div>

            {/* Skip Button */}
            <motion.button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onComplete, 500);
              }}
              className="absolute top-8 right-8 text-white/70 hover:text-white transition-colors duration-200 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="text-sm">تخطي</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {/* Sparkle Effects */}
            {currentStep === steps.length - 1 && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      rotate: [0, 180],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    style={{
                      left: Math.random() * 100 + '%',
                      top: Math.random() * 100 + '%',
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}