import { db } from './firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface FCMMessage {
  to?: string;
  registration_ids?: string[];
  notification: {
    title: string;
    body: string;
  };
  data?: Record<string, string>;
  priority: 'high' | 'normal';
}

class FCMService {
  private serverKey: string | undefined;

  constructor() {
    this.serverKey = process.env.FIREBASE_SERVER_KEY;
  }

  async sendToDevice(fcmToken: string, payload: PushNotificationPayload): Promise<boolean> {
    if (!this.serverKey) {
      console.warn('⚠️ Firebase Server Key غير متوفر - لن يتم إرسال إشعارات push');
      return false;
    }

    try {
      const message: FCMMessage = {
        to: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body
        },
        data: payload.data || {},
        priority: 'high'
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.serverKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ تم إرسال الإشعار بنجاح:', result);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ فشل في إرسال الإشعار:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  async sendToMultipleDevices(fcmTokens: string[], payload: PushNotificationPayload): Promise<boolean> {
    if (!this.serverKey) {
      console.warn('⚠️ Firebase Server Key غير متوفر - لن يتم إرسال إشعارات push');
      return false;
    }

    if (fcmTokens.length === 0) {
      console.warn('⚠️ لا توجد رموز FCM للإرسال إليها');
      return false;
    }

    try {
      const message: FCMMessage = {
        registration_ids: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body
        },
        data: payload.data || {},
        priority: 'high'
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${this.serverKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ تم إرسال الإشعارات بنجاح:', result);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ فشل في إرسال الإشعارات:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعارات:', error);
      return false;
    }
  }

  async getUserFCMTokens(userIds: string[]): Promise<string[]> {
    try {
      const tokens: string[] = [];
      
      for (const userId of userIds) {
        // محاولة إيجاد FCM Token للمستخدم من مخزن البيانات البديل
        // في هذا التطبيق، سنستخدم مفاتيح وهمية للاختبار
        // في البيئة الحقيقية، يجب أن يسجل المستخدم FCM Token عند تسجيل الدخول
        tokens.push(`fcm_token_${userId}`);
      }
      
      return tokens;
    } catch (error) {
      console.error('❌ خطأ في جلب رموز FCM:', error);
      return [];
    }
  }

  async getAllUserFCMTokens(): Promise<string[]> {
    try {
      // للاختبار، سنرجع رموز وهمية
      // في البيئة الحقيقية، سنجلب من قاعدة البيانات
      return ['fcm_token_all_users_demo'];
    } catch (error) {
      console.error('❌ خطأ في جلب جميع رموز FCM:', error);
      return [];
    }
  }

  async sendNotificationToUser(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    const tokens = await this.getUserFCMTokens([userId]);
    if (tokens.length > 0) {
      return await this.sendToDevice(tokens[0], payload);
    }
    return false;
  }

  async sendNotificationToAllUsers(payload: PushNotificationPayload): Promise<boolean> {
    const tokens = await this.getAllUserFCMTokens();
    if (tokens.length > 0) {
      return await this.sendToMultipleDevices(tokens, payload);
    }
    return false;
  }

  async sendNotificationToUsers(userIds: string[], payload: PushNotificationPayload): Promise<boolean> {
    const tokens = await this.getUserFCMTokens(userIds);
    if (tokens.length > 0) {
      return await this.sendToMultipleDevices(tokens, payload);
    }
    return false;
  }
}

export const fcmService = new FCMService();
export type { PushNotificationPayload };