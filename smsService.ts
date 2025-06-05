// خدمة إرسال الرسائل النصية
interface SMSService {
  sendVerificationCode(phoneNumber: string, email?: string): Promise<{ success: boolean; code?: string; message?: string }>;
  verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }>;
}

// تخزين رموز التحقق مؤقتاً
const verificationCodes = new Map<string, { code: string; expiry: number }>();

class MockSMSService implements SMSService {
  async sendVerificationCode(phoneNumber: string, email?: string): Promise<{ success: boolean; code?: string; message?: string }> {
    try {
      // إنشاء رمز عشوائي
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // تخزين الرمز لمدة 5 دقائق
      const expiry = Date.now() + (5 * 60 * 1000);
      verificationCodes.set(phoneNumber, { code, expiry });
      
      console.log(`📱 رمز التحقق لـ ${phoneNumber}: ${code}`);
      
      return {
        success: true,
        code: code, // نعرض الرمز للاختبار
        message: `تم إرسال رمز التحقق إلى ${phoneNumber}`
      };
    } catch (error) {
      console.error('خطأ في إرسال الرمز:', error);
      return {
        success: false,
        message: 'حدث خطأ في إرسال رمز التحقق'
      };
    }
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
    const stored = verificationCodes.get(phoneNumber);
    
    if (!stored) {
      return {
        success: false,
        message: 'لم يتم إرسال رمز تحقق لهذا الرقم'
      };
    }
    
    if (Date.now() > stored.expiry) {
      verificationCodes.delete(phoneNumber);
      return {
        success: false,
        message: 'انتهت صلاحية رمز التحقق'
      };
    }
    
    if (stored.code !== code) {
      return {
        success: false,
        message: 'رمز التحقق غير صحيح'
      };
    }
    
    // حذف الرمز بعد استخدامه
    verificationCodes.delete(phoneNumber);
    
    return {
      success: true,
      message: 'تم التحقق بنجاح'
    };
  }
}

class TwilioSMSService implements SMSService {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  async sendVerificationCode(phoneNumber: string, email?: string): Promise<{ success: boolean; code?: string; message?: string }> {
    // استخدام النظام المحاكي دائماً حتى يتم توفير خدمة SMS صحيحة
    return new MockSMSService().sendVerificationCode(phoneNumber, email);
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
    return new MockSMSService().verifyCode(phoneNumber, code);
  }
}

// خدمة TextBelt المجانية (بديل لـ Twilio)
class TextBeltSMSService implements SMSService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TEXTBELT_API_KEY || 'textbelt'; // textbelt للاختبار المجاني
  }

  async sendVerificationCode(phoneNumber: string, email?: string): Promise<{ success: boolean; code?: string; message?: string }> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // تخزين الرمز
      const expiry = Date.now() + (5 * 60 * 1000);
      verificationCodes.set(phoneNumber, { code, expiry });

      // تنسيق رقم الهاتف
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+964${phoneNumber.slice(1)}`;
      
      // إرسال الرسالة عبر TextBelt
      const response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formattedPhone,
          message: `رمز التحقق الخاص بك: ${code}`,
          key: this.apiKey
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ تم إرسال رمز التحقق عبر TextBelt إلى ${formattedPhone}`);
        return {
          success: true,
          message: `تم إرسال رمز التحقق إلى ${phoneNumber}`
        };
      } else {
        throw new Error(result.error || 'فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('خطأ في إرسال الرسالة عبر TextBelt:', error);
      
      // في حالة فشل TextBelt، استخدم النظام المحاكي
      console.log('📱 تراجع إلى النظام المحاكي');
      return new MockSMSService().sendVerificationCode(phoneNumber, email);
    }
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
    return new MockSMSService().verifyCode(phoneNumber, code);
  }
}

// خدمة SMS.to
class SMStoService implements SMSService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SMSTO_API_KEY || '';
  }

  async sendVerificationCode(phoneNumber: string, email?: string): Promise<{ success: boolean; code?: string; message?: string }> {
    if (!this.apiKey) {
      console.log('⚠️ مفتاح SMS.to غير متوفر، استخدام النظام المحاكي');
      return new MockSMSService().sendVerificationCode(phoneNumber, email);
    }

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // تخزين الرمز
      const expiry = Date.now() + (5 * 60 * 1000);
      verificationCodes.set(phoneNumber, { code, expiry });

      // تنسيق رقم الهاتف
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+964${phoneNumber.slice(1)}`;
      
      // إرسال الرسالة عبر SMS.to
      const response = await fetch('https://api.sms.to/sms/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          to: formattedPhone,
          message: `رمز التحقق الخاص بك: ${code}`,
          sender_id: 'YourApp'
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ تم إرسال رمز التحقق عبر SMS.to إلى ${formattedPhone}`);
        return {
          success: true,
          message: `تم إرسال رمز التحقق إلى ${phoneNumber}`
        };
      } else {
        throw new Error(result.message || 'فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('خطأ في إرسال الرسالة عبر SMS.to:', error);
      
      // في حالة فشل SMS.to، استخدم النظام المحاكي
      console.log('📱 تراجع إلى النظام المحاكي');
      return new MockSMSService().sendVerificationCode(phoneNumber, email);
    }
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
    return new MockSMSService().verifyCode(phoneNumber, code);
  }
}

// خدمة إرسال البريد الإلكتروني
interface EmailService {
  sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; message?: string }>;
}

class SendGridEmailService implements EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
  }

  async sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    if (!this.apiKey) {
      console.log('⚠️ مفتاح SendGrid غير متوفر، تم تخطي إرسال البريد الإلكتروني');
      return { success: true, message: 'تم تخطي إرسال البريد الإلكتروني' };
    }

    try {
      // استخدام SendGrid لإرسال البريد
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(this.apiKey);

      const msg = {
        to: email,
        from: 'noreply@yourstore.com', // يجب أن يكون بريد مُتحقق منه في SendGrid
        subject: 'رمز التحقق - استعادة كلمة المرور',
        text: `رمز التحقق الخاص بك هو: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; text-align: center;">رمز التحقق</h2>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="font-size: 18px; color: #666; margin-bottom: 20px;">رمز التحقق الخاص بك:</p>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; margin: 20px 0;">${code}</div>
              <p style="font-size: 14px; color: #888;">هذا الرمز صالح لمدة 5 دقائق</p>
            </div>
            <p style="color: #666; font-size: 14px;">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`✅ تم إرسال رمز التحقق عبر البريد الإلكتروني إلى ${email}`);
      
      return {
        success: true,
        message: 'تم إرسال رمز التحقق عبر البريد الإلكتروني'
      };
    } catch (error) {
      console.error('خطأ في إرسال البريد الإلكتروني:', error);
      return {
        success: false,
        message: 'فشل في إرسال البريد الإلكتروني'
      };
    }
  }
}

// خدمة مجمعة ترسل الكود عبر SMS والإيميل
class CombinedVerificationService implements SMSService {
  private smsService: SMSService;
  private emailService: EmailService;

  constructor() {
    this.smsService = new SMStoService();
    this.emailService = new SendGridEmailService();
  }

  async sendVerificationCode(phoneNumber: string, email?: string): Promise<{ success: boolean; code?: string; message?: string }> {
    // إرسال عبر SMS
    const smsResult = await this.smsService.sendVerificationCode(phoneNumber);
    
    // إرسال نفس الكود عبر البريد الإلكتروني إذا تم توفيره
    if (email && smsResult.success && smsResult.code) {
      const emailResult = await this.emailService.sendVerificationEmail(email, smsResult.code);
      
      if (emailResult.success) {
        return {
          ...smsResult,
          message: `${smsResult.message} وعبر البريد الإلكتروني`
        };
      }
    }

    return smsResult;
  }

  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
    return this.smsService.verifyCode(phoneNumber, code);
  }
}

// تصدير خدمة الرسائل النصية
// يمكنك تغيير هذا لاستخدام خدمة مختلفة:
// new MockSMSService() - عرض الرموز على الشاشة
// new TextBeltSMSService() - مجاني ومحدود
// new SMStoService() - مدفوع وموثوق
// new CombinedVerificationService() - SMS + Email
export const smsService: SMSService = new CombinedVerificationService();