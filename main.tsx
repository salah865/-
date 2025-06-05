import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// إزالة رسائل الخطأ التطويرية
const removeErrorOverlays = () => {
  // إزالة overlay خطأ التشغيل
  const errorOverlays = document.querySelectorAll('div[style*="position: fixed"]');
  errorOverlays.forEach(overlay => {
    const content = overlay.textContent || '';
    if (content.includes('plugin:runtime-error') || 
        content.includes('unknown runtime error') ||
        content.includes('[vite]')) {
      overlay.remove();
    }
  });
};

// تشغيل الدالة عند تحميل الصفحة وبشكل دوري
setInterval(removeErrorOverlays, 1000);
document.addEventListener('DOMContentLoaded', removeErrorOverlays);

createRoot(document.getElementById("root")!).render(<App />);
