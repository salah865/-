import { firebaseService } from './firebaseService.js';

export async function initializeFirebaseData() {
  try {
    console.log('🔥 بدء تهيئة بيانات Firebase...');

    // إنشاء مستخدم الإدارة
    const adminUser = await firebaseService.createUser({
      phone: '+966500000001',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      fullName: 'المدير العام',
      address: 'الرياض، المملكة العربية السعودية'
    });
    console.log('✅ تم إنشاء حساب المدير');

    // إنشاء فئات المنتجات
    const electronics = await firebaseService.createCategory({
      name: 'إلكترونيات',
      description: 'أجهزة إلكترونية ومعدات تقنية متطورة'
    });

    const clothing = await firebaseService.createCategory({
      name: 'ملابس',
      description: 'ملابس رجالية ونسائية عصرية'
    });

    const books = await firebaseService.createCategory({
      name: 'كتب',
      description: 'كتب ومراجع تعليمية ومتنوعة'
    });

    console.log('✅ تم إنشاء فئات المنتجات');

    // إنشاء منتجات تجريبية
    const products = [
      {
        name: 'هاتف ذكي سامسونج جالاكسي',
        description: 'هاتف ذكي متطور بتقنيات حديثة',
        price: '2500',
        stock: 15,
        sku: 'PHONE001',
        categoryId: electronics.id,
        status: 'active',
        imageUrl: 'https://via.placeholder.com/300x200?text=Samsung+Galaxy'
      },
      {
        name: 'لابتوب ديل XPS',
        description: 'جهاز لابتوب عالي الأداء للمحترفين',
        price: '4200',
        stock: 8,
        sku: 'LAPTOP001',
        categoryId: electronics.id,
        status: 'active',
        imageUrl: 'https://via.placeholder.com/300x200?text=Dell+XPS'
      },
      {
        name: 'قميص قطني كلاسيكي',
        description: 'قميص أنيق من القطن الطبيعي',
        price: '120',
        stock: 25,
        sku: 'SHIRT001',
        categoryId: clothing.id,
        status: 'active',
        imageUrl: 'https://via.placeholder.com/300x200?text=Cotton+Shirt'
      },
      {
        name: 'كتاب البرمجة الحديثة',
        description: 'دليل شامل لتعلم البرمجة الحديثة',
        price: '85',
        stock: 30,
        sku: 'BOOK001',
        categoryId: books.id,
        status: 'active',
        imageUrl: 'https://via.placeholder.com/300x200?text=Programming+Book'
      }
    ];

    for (const product of products) {
      await firebaseService.createProduct(product);
    }
    console.log('✅ تم إنشاء المنتجات التجريبية');

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
      await firebaseService.createCustomer(customer);
    }
    console.log('✅ تم إنشاء العملاء التجريبيين');

    console.log('🎉 تم تهيئة جميع بيانات Firebase بنجاح!');
    
    return {
      adminUser,
      categories: [electronics, clothing, books],
      productsCount: products.length,
      customersCount: customers.length
    };

  } catch (error) {
    console.error('❌ خطأ في تهيئة بيانات Firebase:', error);
    throw error;
  }
}