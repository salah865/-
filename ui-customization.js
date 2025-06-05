import admin from 'firebase-admin';

// تهيئة Firebase إذا لم تكن مهيأة
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function updateUICustomization() {
  try {
    // إعدادات تخصيص واجهة المستخدم
    const customizationSettings = {
      bottomNavIconSize: '22px',
      productPriceSize: '8px',
      wholesalePriceSize: '18px',
      updatedAt: new Date().toISOString()
    };

    // حفظ الإعدادات في Firebase
    await db.collection('ui-customization').doc('settings').set(customizationSettings);
    
    console.log('✅ تم حفظ إعدادات واجهة المستخدم في Firebase');
    console.log(customizationSettings);
    
  } catch (error) {
    console.error('❌ خطأ في حفظ إعدادات واجهة المستخدم:', error);
  }
}

// تشغيل التحديث
updateUICustomization();