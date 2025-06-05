import { firebaseService } from './firebaseService';

// تتبع محاولات استرداد كلمة المرور
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();

// تتبع محاولات تسجيل الدخول
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

export class SecurityService {
  // فحص محاولات تسجيل الدخول (10 محاولات في الساعة)
  static checkLoginAttempts(phoneNumber: string): { allowed: boolean; remainingAttempts: number; timeUntilReset: number } {
    const now = Date.now();
    const attempts = loginAttempts.get(phoneNumber);
    
    if (!attempts) {
      loginAttempts.set(phoneNumber, { count: 1, lastAttempt: now });
      return { allowed: true, remainingAttempts: 9, timeUntilReset: 3600000 };
    }
    
    // إذا مر أكثر من ساعة، أعد تعيين العداد
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
      loginAttempts.set(phoneNumber, { count: 1, lastAttempt: now });
      return { allowed: true, remainingAttempts: 9, timeUntilReset: 3600000 };
    }
    
    // فحص الحد الأقصى للمحاولات (10 محاولات في الساعة)
    if (attempts.count >= 10) {
      const timeUntilReset = 3600000 - (now - attempts.lastAttempt);
      return { allowed: false, remainingAttempts: 0, timeUntilReset };
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    const remaining = 10 - attempts.count;
    const timeUntilReset = 3600000 - (now - attempts.lastAttempt);
    
    return { allowed: true, remainingAttempts: remaining, timeUntilReset };
  }

  // إعادة تعيين محاولات تسجيل الدخول عند النجاح
  static resetLoginAttempts(phoneNumber: string): void {
    loginAttempts.delete(phoneNumber);
  }

  // الحصول على معلومات محاولات تسجيل الدخول
  static getLoginAttemptInfo(phoneNumber: string): { attempts: number; timeUntilReset: number } {
    const now = Date.now();
    const attempts = loginAttempts.get(phoneNumber);
    
    if (!attempts) {
      return { attempts: 0, timeUntilReset: 0 };
    }
    
    const timeUntilReset = Math.max(0, 3600000 - (now - attempts.lastAttempt));
    return { attempts: attempts.count, timeUntilReset };
  }

  // فحص عدد المحاولات المسموحة لاسترداد كلمة المرور
  static checkRateLimiting(identifier: string): boolean {
    const now = Date.now();
    const attempts = resetAttempts.get(identifier);
    
    if (!attempts) {
      resetAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // إذا مر أكثر من ساعة، أعد تعيين العداد
    if (now - attempts.lastAttempt > 60 * 60 * 1000) {
      resetAttempts.set(identifier, { count: 1, lastAttempt: now });
      return true;
    }
    
    // فحص الحد الأقصى للمحاولات (3 محاولات في الساعة)
    if (attempts.count >= 3) {
      return false;
    }
    
    attempts.count++;
    attempts.lastAttempt = now;
    return true;
  }

  // إنشاء رمز استرداد آمن
  static async generateResetCode(userPhone: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // صالح لمدة 5 دقائق
    
    try {
      // حفظ رمز الاسترداد في Firebase
      await firebaseService.createResetCode({
        userPhone,
        code,
        expiresAt,
        createdAt: new Date().toISOString()
      });
      
      return code;
    } catch (error) {
      console.error('خطأ في إنشاء رمز الاسترداد:', error);
      throw new Error('فشل في إنشاء رمز الاسترداد');
    }
  }

  // التحقق من رمز الاسترداد
  static async verifyResetCode(userPhone: string, inputCode: string): Promise<boolean> {
    try {
      const resetCodes = await firebaseService.getResetCodes();
      const validCode = resetCodes.find((reset: any) => 
        reset.userPhone === userPhone && 
        reset.code === inputCode &&
        Date.now() < reset.expiresAt
      );
      
      if (validCode) {
        // حذف الرمز بعد الاستخدام
        await firebaseService.deleteResetCode(validCode.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في التحقق من رمز الاسترداد:', error);
      return false;
    }
  }

  // تشفير كلمة المرور
  static hashPassword(password: string): string {
    // في بيئة الإنتاج، استخدم bcrypt أو مكتبة تشفير قوية
    return Buffer.from(password).toString('base64');
  }

  // التحقق من كلمة المرور
  static verifyPassword(password: string, hashedPassword: string): boolean {
    return Buffer.from(password).toString('base64') === hashedPassword;
  }

  // تنظيف البيانات المنتهية الصلاحية
  static cleanExpiredAttempts(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    const expiredKeys: string[] = [];
    resetAttempts.forEach((attempt, key) => {
      if (now - attempt.lastAttempt > oneHour) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => resetAttempts.delete(key));
  }
}

// تنظيف دوري للبيانات المنتهية الصلاحية كل ساعة
setInterval(() => {
  SecurityService.cleanExpiredAttempts();
}, 60 * 60 * 1000);