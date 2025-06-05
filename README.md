# منصة التجارة الإلكترونية المتقدمة - Tajer Platform

منصة تجارة إلكترونية متقدمة مع ذكاء اصطناعي وإدارة إشعارات شاملة، مصممة خصيصاً للتجار العرب.

## المميزات الأساسية

### 🛍️ إدارة المنتجات
- دعم 3 صور لكل منتج (رئيسية + 2 إضافية)
- تصنيفات متقدمة للمنتجات
- إدارة المخزون والأسعار
- البحث الذكي في المنتجات

### 👥 إدارة المستخدمين والتجار
- نظام مصادقة متقدم مع Firebase
- إدارة ملفات التجار الشخصية
- نظام صلاحيات متعدد المستويات
- تتبع أنشطة المستخدمين

### 📊 التحليلات والتقارير
- تحليلات مبيعات شاملة
- تقارير الأرباح والخسائر
- إحصائيات المنتجات والتجار
- لوحة تحكم تفاعلية

### 🔔 نظام الإشعارات المتقدم
- إشعارات فورية مع Firebase Cloud Messaging
- إشعارات البريد الإلكتروني
- إشعارات داخل التطبيق
- إدارة مخصصة للإشعارات

### 🤖 المساعد الذكي
- دعم Hugging Face API
- مساعدة ذكية للتجار
- تحليل البيانات بالذكاء الاصطناعي
- اقتراحات مخصصة

### 🌐 الدعم متعدد اللغات
- واجهة باللغة العربية والإنجليزية
- تصميم يدعم اتجاه الكتابة من اليمين لليسار
- محتوى مترجم بالكامل

## التقنيات المستخدمة

### Frontend
- **React 18** مع TypeScript
- **Tailwind CSS** للتصميم
- **Shadcn/ui** للمكونات
- **Wouter** للتوجيه
- **React Query** لإدارة البيانات
- **React Hook Form** للنماذج

### Backend
- **Node.js** مع Express
- **Firebase Firestore** كقاعدة بيانات
- **Firebase Authentication** للمصادقة
- **Firebase Cloud Messaging** للإشعارات
- **TypeScript** للتطوير الآمن

### AI & APIs
- **Hugging Face API** للذكاء الاصطناعي
- **Firebase APIs** للخدمات السحابية
- **RESTful APIs** للتكامل

### Deployment
- **Netlify** للنشر الإنتاجي
- **Firebase Hosting** (بديل)
- إعدادات CI/CD تلقائية

## الإعداد والتشغيل

### متطلبات النظام
- Node.js 18+ 
- npm أو yarn
- حساب Firebase
- حساب Hugging Face (اختياري)

### التثبيت
```bash
# استنساخ المشروع
git clone https://github.com/YOUR_USERNAME/tajer-platform.git
cd tajer-platform

# تثبيت التبعيات
npm install

# إعداد متغيرات البيئة
cp .env.example .env
```

### متغيرات البيئة المطلوبة
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
HUGGINGFACE_API_KEY=your_huggingface_key
```

### تشغيل المشروع
```bash
# تشغيل محلي
npm run dev

# بناء للإنتاج
npm run build

# معاينة الإنتاج
npm run preview
```

## النشر على Netlify

### الطريقة الأولى: GitHub Integration
1. ادفع المشروع إلى GitHub
2. اربط repository مع Netlify
3. أضف متغيرات البيئة في Netlify
4. النشر سيكون تلقائي عند كل commit

### الطريقة الثانية: Manual Deploy
1. بناء المشروع: `npm run build`
2. رفع مجلد `dist` إلى Netlify
3. إعداد متغيرات البيئة

## إعداد Firebase

### 1. إنشاء مشروع Firebase
- اذهب إلى [Firebase Console](https://console.firebase.google.com)
- أنشئ مشروع جديد
- فعل Authentication و Firestore

### 2. إعداد Authentication
- فعل Google Sign-in
- أضف النطاقات المخولة

### 3. إعداد Firestore
- أنشئ قاعدة بيانات
- ارفع قواعد الأمان من `firestore.rules`

### 4. إعداد Cloud Messaging
- فعل FCM للإشعارات
- أضف `google-services.json`

## الهيكل العام للمشروع

```
tajer-platform/
├── client/                 # الواجهة الأمامية
│   ├── src/
│   │   ├── components/     # المكونات
│   │   ├── pages/         # الصفحات
│   │   ├── lib/           # المكتبات المساعدة
│   │   └── hooks/         # React Hooks
├── server/                # الخادم الخلفي
│   ├── routes.ts          # مسارات API
│   ├── firebaseService.ts # خدمات Firebase
│   └── notificationService.ts # خدمة الإشعارات
├── shared/                # الملفات المشتركة
│   └── schema.ts          # نماذج البيانات
├── netlify/              # إعدادات Netlify
└── docs/                 # الوثائق

```

## المساهمة

نرحب بالمساهمات! يرجى قراءة دليل المساهمة قبل البدء.

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف LICENSE للتفاصيل.

## الدعم

للدعم الفني أو الاستفسارات:
- افتح issue في GitHub
- راسلنا على: support@tajer-platform.com

---

## إعدادات خاصة للمطورين

### Scripts المتاحة
- `npm run dev` - تشغيل محلي
- `npm run build` - بناء للإنتاج  
- `npm run preview` - معاينة البناء
- `npm run lint` - فحص الكود
- `npm run type-check` - فحص الأنواع

### أدوات التطوير
- ESLint للفحص
- Prettier للتنسيق
- TypeScript للتحقق من الأنواع
- Vite للبناء السريع