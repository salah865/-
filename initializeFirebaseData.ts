import { persistentFirebaseStorage } from './persistentFirebaseStorage.js';

export async function initializeFirebaseData() {
  try {
    console.log('🔥 بدء تهيئة بيانات Firebase...');

    // التحقق من وجود مستخدم الإدارة
    const adminPhone = '07801258110';
    const adminEmail = 'ggkipogo@gmail.com';
    
    let adminUser = await persistentFirebaseStorage.getUserByPhone(adminPhone);
    
    if (!adminUser) {
      // إنشاء مستخدم الإدارة
      adminUser = await persistentFirebaseStorage.createUser({
        phone: adminPhone,
        email: adminEmail,
        password: 'salah5',
        role: 'admin',
        fullName: 'المدير العام',
        address: 'المملكة العربية السعودية'
      });
      console.log('✅ تم إنشاء حساب المدير الجديد في Firebase');
    } else {
      console.log('✅ حساب المدير موجود بالفعل في Firebase');
    }

    // التحقق من وجود الفئات
    const categories = await persistentFirebaseStorage.getCategories();
    
    if (categories.length === 0) {
      // إنشاء فئات المنتجات
      const electronics = await persistentFirebaseStorage.createCategory({
        name: 'إلكترونيات',
        description: 'أجهزة إلكترونية ومعدات تقنية متطورة'
      });

      const clothing = await persistentFirebaseStorage.createCategory({
        name: 'ملابس',
        description: 'ملابس رجالية ونسائية عصرية'
      });

      const books = await persistentFirebaseStorage.createCategory({
        name: 'كتب',
        description: 'كتب ومراجع تعليمية ومتنوعة'
      });

      console.log('✅ تم إنشاء فئات المنتجات في Firebase');

      // إنشاء منتجات تجريبية
      const products = [
        {
          name: 'هاتف ذكي سامسونج جالاكسي',
          description: 'هاتف ذكي متطور بتقنيات حديثة وكاميرا عالية الدقة',
          price: 2500,
          minPrice: 2200,
          maxPrice: 2800,
          stock: 15,
          sku: 'PHONE001',
          categoryId: electronics.id,
          status: 'active',
          colors: ['أسود', 'أبيض', 'أزرق', 'ذهبي'],
          imageUrl: 'https://via.placeholder.com/400x400?text=Samsung+Galaxy'
        },
        {
          name: 'لابتوب ديل XPS',
          description: 'جهاز لابتوب عالي الأداء للمحترفين',
          price: 4200,
          minPrice: 4000,
          maxPrice: 4500,
          stock: 8,
          sku: 'LAPTOP001',
          categoryId: electronics.id,
          status: 'active',
          colors: ['فضي', 'أسود', 'أبيض'],
          imageUrl: 'https://via.placeholder.com/400x400?text=Dell+XPS'
        },
        {
          name: 'قميص قطني كلاسيكي',
          description: 'قميص أنيق من القطن الطبيعي 100% مريح وعملي',
          price: 120,
          minPrice: 100,
          maxPrice: 150,
          stock: 25,
          sku: 'SHIRT001',
          categoryId: clothing.id,
          status: 'active',
          colors: ['أبيض', 'أزرق', 'أسود', 'رمادي', 'بيج'],
          imageUrl: 'https://via.placeholder.com/400x400?text=Cotton+Shirt'
        },
        {
          name: 'كتاب البرمجة الحديثة',
          description: 'دليل شامل لتعلم البرمجة الحديثة مع أمثلة عملية',
          price: 85,
          minPrice: 70,
          maxPrice: 100,
          stock: 0,
          sku: 'BOOK001',
          categoryId: books.id,
          status: 'active',
          colors: [],
          imageUrl: 'https://via.placeholder.com/400x400?text=Programming+Book'
        },
        {
          name: 'ساعة ذكية آبل',
          description: 'ساعة ذكية متطورة مع تتبع للصحة واللياقة البدنية',
          price: 1200,
          minPrice: 1000,
          maxPrice: 1400,
          stock: 12,
          sku: 'WATCH001',
          categoryId: electronics.id,
          status: 'active',
          colors: ['أسود', 'فضي', 'ذهبي', 'وردي'],
          imageUrl: 'https://via.placeholder.com/400x400?text=Apple+Watch'
        }
      ];

      for (const product of products) {
        await persistentFirebaseStorage.createProduct(product);
      }
      console.log('✅ تم إنشاء المنتجات التجريبية في Firebase');

      // إنشاء عملاء تجريبيين
      const customers = [
        {
          name: 'أحمد محمد',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          address: 'جدة، المملكة العربية السعودية'
        },
        {
          name: 'فاطمة علي',
          email: 'fatima@example.com',
          phone: '+966509876543',
          address: 'الدمام، المملكة العربية السعودية'
        }
      ];

      for (const customer of customers) {
        await persistentFirebaseStorage.createCustomer(customer);
      }
      console.log('✅ تم إنشاء العملاء التجريبيين في Firebase');
    } else {
      console.log('✅ الفئات والمنتجات موجودة بالفعل في Firebase');
    }

    console.log('🎉 تم الانتهاء من تهيئة Firebase بنجاح!');
    console.log('📊 جميع البيانات محفوظة بشكل دائم في قاعدة البيانات');
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
  }
}