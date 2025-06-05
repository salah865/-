import { firebaseService } from "./firebaseService";
import { appSettings, type AppSetting, type InsertAppSetting } from "@shared/schema";

export class AppSettingsService {
  // الإعدادات الافتراضية للتطبيق
  private defaultSettings = [
    // إعدادات التواصل
    {
      key: 'support_phone',
      value: '+9647801258110',
      category: 'contact',
      description: 'رقم هاتف الدعم الفني'
    },
    {
      key: 'support_email',
      value: 'TajerStore99@gmail.com',
      category: 'contact',
      description: 'بريد الدعم الفني'
    },
    {
      key: 'support_whatsapp',
      value: '+9647801258110',
      category: 'contact',
      description: 'رقم واتساب الدعم الفني'
    },
    {
      key: 'company_name',
      value: 'للخدمات العامة والاستثمارات والصيانة العامة',
      category: 'contact',
      description: 'اسم الشركة'
    },
    {
      key: 'company_address',
      value: 'اربيل،عينكاوة',
      category: 'contact',
      description: 'عنوان الشركة'
    },
    
    // إعدادات التوصيل
    {
      key: 'delivery_price_baghdad',
      value: '4000',
      category: 'delivery',
      description: 'سعر التوصيل في بغداد'
    },
    {
      key: 'delivery_price_provinces',
      value: '5000',
      category: 'delivery',
      description: 'سعر التوصيل في المحافظات'
    },
    {
      key: 'delivery_time',
      value: '1-3 أيام عمل',
      category: 'delivery',
      description: 'مدة التوصيل المتوقعة'
    },
    
    // إعدادات عامة
    {
      key: 'app_name',
      value: 'تاجر',
      category: 'general',
      description: 'اسم التطبيق'
    },
    {
      key: 'app_description',
      value: 'منصة تجارة إلكترونية متقدمة للسوق العراقي',
      category: 'general',
      description: 'وصف التطبيق'
    },
    {
      key: 'app_version',
      value: '1.0.0',
      category: 'general',
      description: 'إصدار التطبيق'
    },
    {
      key: 'maintenance_mode',
      value: 'false',
      category: 'general',
      description: 'وضع الصيانة'
    },
    
    // إعدادات المطور
    {
      key: 'developer_name',
      value: 'صلاح مهدي',
      category: 'developer',
      description: 'اسم المطور'
    },
    {
      key: 'developer_contact',
      value: '+9647801258110',
      category: 'developer',
      description: 'رقم تواصل المطور'
    }
  ];

  // إنشاء أو تحديث إعداد
  async setSetting(key: string, value: string, category: string = 'general', description?: string): Promise<void> {
    try {
      // البحث عن الإعداد الحالي في Firebase
      const settings = await this.getAllSettings();
      const existingSetting = settings.find(setting => setting.key === key);

      const settingData = {
        key,
        value,
        category,
        description: description || existingSetting?.description || '',
        updatedAt: new Date()
      };

      if (existingSetting) {
        // تحديث الإعداد الموجود
        await firebaseService.updateAppSetting(existingSetting.id, settingData);
      } else {
        // إنشاء إعداد جديد
        await firebaseService.createAppSetting({
          ...settingData,
          createdAt: new Date()
        });
      }
      
      console.log(`تم حفظ الإعداد: ${key} = ${value}`);
    } catch (error) {
      console.error('خطأ في حفظ الإعداد:', error);
      throw error;
    }
  }

  // جلب إعداد معين
  async getSetting(key: string, defaultValue?: string): Promise<string | null> {
    try {
      const settings = await this.getAllSettings();
      const setting = settings.find(s => s.key === key);
      return setting?.value || defaultValue || null;
    } catch (error) {
      console.error('خطأ في جلب الإعداد:', error);
      return defaultValue || null;
    }
  }

  // جلب جميع الإعدادات
  async getAllSettings(): Promise<any[]> {
    try {
      return await firebaseService.getAppSettings();
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      return [];
    }
  }

  // جلب الإعدادات حسب الفئة
  async getSettingsByCategory(category: string): Promise<any[]> {
    try {
      const allSettings = await this.getAllSettings();
      return allSettings.filter(setting => setting.category === category);
    } catch (error) {
      console.error('خطأ في جلب إعدادات الفئة:', error);
      return [];
    }
  }

  // تحديث عدة إعدادات
  async updateMultipleSettings(settings: { key: string; value: string; category?: string; description?: string }[]): Promise<void> {
    try {
      for (const setting of settings) {
        await this.setSetting(
          setting.key, 
          setting.value, 
          setting.category || 'general', 
          setting.description
        );
      }
      console.log('تم تحديث الإعدادات المتعددة بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث الإعدادات المتعددة:', error);
      throw error;
    }
  }

  // إنشاء الإعدادات الافتراضية
  async initializeDefaultSettings(): Promise<void> {
    try {
      const existingSettings = await this.getAllSettings();
      
      for (const defaultSetting of this.defaultSettings) {
        const exists = existingSettings.some(setting => setting.key === defaultSetting.key);
        
        if (!exists) {
          await firebaseService.createAppSetting({
            ...defaultSetting,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`تم إنشاء الإعداد الافتراضي: ${defaultSetting.key}`);
        }
      }
      
      console.log('تم تهيئة الإعدادات الافتراضية');
    } catch (error) {
      console.error('خطأ في تهيئة الإعدادات الافتراضية:', error);
      throw error;
    }
  }

  // جلب إعدادات التواصل للعرض في الدعم الفني
  async getContactSettings(): Promise<{
    supportPhone: string;
    supportEmail: string;
    supportWhatsapp: string;
    companyName: string;
    companyAddress: string;
  }> {
    try {
      const contactSettings = await this.getSettingsByCategory('contact');
      
      return {
        supportPhone: contactSettings.find(s => s.key === 'support_phone')?.value || '+9647801258110',
        supportEmail: contactSettings.find(s => s.key === 'support_email')?.value || 'support@tager.com',
        supportWhatsapp: contactSettings.find(s => s.key === 'support_whatsapp')?.value || '+9647801258110',
        companyName: contactSettings.find(s => s.key === 'company_name')?.value || 'للخدمات العامة والاستثمارات والصيانة العامة',
        companyAddress: contactSettings.find(s => s.key === 'company_address')?.value || 'بغداد، الكرادة خارج'
      };
    } catch (error) {
      console.error('خطأ في جلب إعدادات التواصل:', error);
      // إرجاع القيم الافتراضية في حالة الخطأ
      return {
        supportPhone: '+9647801258110',
        supportEmail: 'support@tager.com',
        supportWhatsapp: '+9647801258110',
        companyName: 'للخدمات العامة والاستثمارات والصيانة العامة',
        companyAddress: 'بغداد، الكرادة خارج'
      };
    }
  }

  // جلب إعدادات التوصيل
  async getDeliverySettings(): Promise<{
    baghdadPrice: number;
    provincesPrice: number;
    deliveryTime: string;
  }> {
    try {
      const deliverySettings = await this.getSettingsByCategory('delivery');
      
      return {
        baghdadPrice: parseInt(deliverySettings.find(s => s.key === 'delivery_price_baghdad')?.value || '4000'),
        provincesPrice: parseInt(deliverySettings.find(s => s.key === 'delivery_price_provinces')?.value || '5000'),
        deliveryTime: deliverySettings.find(s => s.key === 'delivery_time')?.value || '1-3 أيام عمل'
      };
    } catch (error) {
      console.error('خطأ في جلب إعدادات التوصيل:', error);
      return {
        baghdadPrice: 4000,
        provincesPrice: 5000,
        deliveryTime: '1-3 أيام عمل'
      };
    }
  }
}

export const appSettingsService = new AppSettingsService();