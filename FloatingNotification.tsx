import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart, Heart, X, AlertCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'cart' | 'save';
  isVisible: boolean;
  onClose: () => void;
}

export const FloatingNotification = ({ message, type, isVisible, onClose }: NotificationProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // تختفي بعد ثانيتين

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'cart':
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case 'save':
        return <Heart className="w-5 h-5 text-pink-600" />;
      default:
        return <Check className="w-5 h-5 text-green-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'cart':
        return 'bg-blue-50 border-blue-200';
      case 'save':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                     ${getBackgroundColor()} border rounded-lg shadow-lg p-4 min-w-[300px]`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getIcon()}
              <span className="text-gray-800 font-medium">{message}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook لإدارة الإشعارات
export const useFloatingNotification = () => {
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'cart' | 'save';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showNotification = (message: string, type: 'success' | 'error' | 'cart' | 'save' = 'success') => {
    setNotification({
      message,
      type,
      isVisible: true,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false,
    }));
  };

  return {
    notification,
    showNotification,
    hideNotification,
  };
};