import { firebaseService } from './firebaseService.js';

export async function createAdminUser() {
  try {
    // إنشاء حساب المدير بالبيانات التي قدمتها
    const adminUser = await firebaseService.createUser({
      email: 'ggkipogo@gmail.com',
      password: 'salah5',
      phone: '+966500000001',
      role: 'admin',
      fullName: 'المدير العام',
      address: 'المملكة العربية السعودية'
    });

    console.log('✅ تم إنشاء حساب المدير بنجاح:', adminUser);
    return adminUser;
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المدير:', error);
    throw error;
  }
}

export async function initializeSystem() {
  try {
    console.log('🚀 بدء تهيئة النظام...');
    
    // إنشاء حساب المدير
    await createAdminUser();
    
    // إنشاء فئات أساسية
    const categories = [
      { name: 'إلكترونيات', description: 'أجهزة إلكترونية ومعدات تقنية' },
      { name: 'ملابس', description: 'ملابس رجالية ونسائية' },
      { name: 'كتب', description: 'كتب ومراجع متنوعة' }
    ];

    for (const category of categories) {
      await firebaseService.createCategory(category);
    }

    console.log('✅ تم تهيئة النظام بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة النظام:', error);
  }
}