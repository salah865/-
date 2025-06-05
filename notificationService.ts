import { firebaseService } from './firebaseService';

export interface Notification {
  id: string;
  type: 'withdraw_request' | 'new_order' | 'new_user' | 'support_message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

class NotificationService {
  // إنشاء إشعار جديد
  async createNotification(notification: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<any> {
    try {
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        isRead: false,
        createdAt: new Date().toISOString()
      };

      const result = await firebaseService.createNotification(newNotification);
      console.log(`🔔 تم إنشاء إشعار جديد: ${notification.type}`);
      return result;
    } catch (error) {
      console.error('خطأ في إنشاء الإشعار:', error);
      throw error;
    }
  }

  // جلب جميع الإشعارات
  async getNotifications(): Promise<Notification[]> {
    try {
      return await firebaseService.getNotifications();
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
      return [];
    }
  }

  // تحديد الإشعار كمقروء
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await firebaseService.updateNotification(notificationId, { isRead: true });
      console.log(`✅ تم تحديد الإشعار ${notificationId} كمقروء`);
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
    }
  }

  // عدد الإشعارات غير المقروءة
  async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('خطأ في حساب الإشعارات غير المقروءة:', error);
      return 0;
    }
  }

  // إنشاء إشعار لطلب سحب جديد
  async notifyWithdrawRequest(userPhone: string, amount: number): Promise<void> {
    await this.createNotification({
      type: 'withdraw_request',
      title: 'طلب سحب جديد',
      message: `طلب سحب جديد من ${userPhone} بمبلغ ${amount.toLocaleString()} د.ع`,
      relatedId: userPhone
    });
  }

  // إنشاء إشعار لطلب جديد
  async notifyNewOrder(orderNumber: string, customerName: string, total: number): Promise<void> {
    await this.createNotification({
      type: 'new_order',
      title: 'طلب جديد',
      message: `طلب جديد من ${customerName} بقيمة ${total.toLocaleString()} د.ع`,
      relatedId: orderNumber
    });
  }

  // إنشاء إشعار لمستخدم جديد
  async notifyNewUser(userPhone: string, userName: string): Promise<void> {
    await this.createNotification({
      type: 'new_user',
      title: 'مستخدم جديد',
      message: `انضم مستخدم جديد: ${userName} (${userPhone})`,
      relatedId: userPhone
    });
  }

  // إنشاء إشعار لرسالة دعم
  async notifySupportMessage(userPhone: string, message: string): Promise<void> {
    await this.createNotification({
      type: 'support_message',
      title: 'رسالة دعم جديدة',
      message: `رسالة جديدة من ${userPhone}: ${message.substring(0, 50)}...`,
      relatedId: userPhone
    });
  }
}

export const notificationService = new NotificationService();