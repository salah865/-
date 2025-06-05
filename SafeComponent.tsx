import React from 'react';

interface SafeComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SafeComponent({ children, fallback }: SafeComponentProps) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('خطأ في المكون:', error);
    
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">عذراً، حدث خطأ في تحميل هذا الجزء</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-purple-600 hover:text-purple-700 underline"
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    );
  }
}