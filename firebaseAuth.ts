import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// تهيئة Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "tajer-ee602",
  private_key_id: "019f750331c73fb1f40a70e732e516bc9106ccc2",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDdN7GMKa7VDnT4\nFS+mXflgu74+gTs7buvG73yYfhgNxYVtJgV7DpmRw3NHcTTgtf0LLZl2EHY8/wsg\n625G6b/YoMYgM4+5fKGKGAMi3BucqWpuvs2S75kFlOaDE74eM7KJEm4+izKId9R9\nqus1hAA5++CQUrtKIE6qxvmevz23hOkRwM6uCdZG/kAFh9bvpcvC3mBkMqpkBF2E\nbrBPNm4Md/I/hRcu2DrGa21BMefwJa8OsWhA4zlIcx/PLU6Ob7dJOEIwECFNdGeS\nLOZi84gDnOExbqBN4+cCamniNE/5HfXtDovof5nb3Y9xL7HmqrW+RFhE9/E47KYw\nUPH1sm8JAgMBAAECggEAEeX8LQmAVketqhbYvJ602yEn+m+ZNE+Y2/7Jv8vgAAOj\nvtUj3QY2z+6VGa3SoN+tF1LMR+VvUGBOEbOlYWO+T/nKrKVYCJHgK2nX9Q9xdgha\ndhNUODa7DWRJWKlKJBgNK/IqlzeBgZK8vL8W9AYl2cVCZp+K6l8yvI0tBdD5wS1d\nQVdYmkn+L3Nq7a6nGfTYZXhQR6kQ5K7Z9vPAT8vhk8L7QVd9EXMS2nF+Lm6EHsV2\ncL5k8Z2+nF2J7E3Yo6vGW9YHcOi8A1K8fVk3LKN3x7J8Q7Y0qjDMPL2B8iUWHm4D\nAGgYL+jKE3ZGfKn4PYI2o3tYSo7X9J6kKJq2Q8vWmQKBgQD2M7j3D8zL8nNqwJ2t\n0fL2P7b6Q7Y3fPm8V8tN8L4N9cZWKJhKxGz3k9L6P3jJ8D1q8Q7J2VGl8z2K4E+S\ndyK4M7W2M1J8F5zAcJ3qGJ5M6K1H7L8e2YzJ5xQ8nW9l7V4k3C5z4vGmWf8E9Jd\n2J8I7K+zV3eM4N7yZ2CJsQ4g9JQKBgQDmjpkBcFqN3F3qO8gYfJ2H8S3e4VzJ+nD\n7uK1Z4f8LH6C9gC2k9N6E5YSRvJ8P2q6vL2fWk+8z7M4T2R3vVGm8cL2c7J9DKd3\nLWW9R6V8z5M7k8J3fV2N8z9K8P1cY7Q8nJ7L5C9V2K3z1fJ8M8v9GcL2N7J4K+W\nQKBgC8zG4K7Q2K7Y3N2P8e9V8D5K3J1k2M3v4Q7f+J2L3z2Q7I8V7k9O6z3N4H8K\nJ8v7g9W3zQ2Y8cJ4F6m8V3J1H7Q3e4Y2k8vG9J6z1N3L8V7K4O8z3M7Y1k9P2J8V\ntC3fV2J4K8N7L1z9Q8M3Y7K6V4J8z2N1L3Q8M7Y4K8V2J7z3Q1N8L7K9z2M4YV6J\nAoGBAMkF2V8z7J3K8Y2L6z9Q4M7V3J8K2L7z1Q8N4Y6K7z3M9V2J8L1K4Y7z9Q3N\n8L2K6z4M7Y1J8V3K9L2z7Q8N4Y3K6z1M9V2J7L4K8Y7z3Q9N1L8K2z6M4Y7J3V9K\nL8z2Q1N7Y4K6z3M8V1J9L2K7Y8z4Q3N6L1K9z2M7Y4J8V3K6L7z1Q9N2Y8K4z3M\nAoGAZkV2J8K7z3Q9N1L4Y6K8z2M7V3J1L9K4Y8z7Q2N6L3K9z1M4Y7J8V2K6L8z\n4Q3N9Y1K7z2M8V4J6L1K9Y3z7Q8N2L4K6z9M1Y8J3V7K2L9z4Q1N8Y6K7z3M2V9J\n1L4K8Y7z2Q9N3L6K1z8M4Y7J2V3K9L8z1Q7N4Y2K6z3M9V1J8L7K4Y9z2Q8N3L\n1K6z7M4Y8J3V2K9L1z8Q7N4Y6K2z3M8V9J7L1K4Y3z9Q2N8L6K7z1M3Y4J8V9K\nLg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@tajer-ee602.iam.gserviceaccount.com",
  client_id: "103450024116632974406",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tajer-ee602.iam.gserviceaccount.com"
};

// تهيئة Firebase Admin إذا لم يتم تهيئته من قبل
let adminApp;
try {
  adminApp = initializeApp({
    credential: cert(serviceAccount as any),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  }, 'admin');
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    // التطبيق موجود بالفعل
    adminApp = initializeApp(undefined, 'admin');
  } else {
    console.error('خطأ في تهيئة Firebase Admin:', error);
  }
}

export const adminAuth = getAuth(adminApp);

// إنشاء رابط تحقق مخصص للهاتف
export async function createCustomVerificationToken(phoneNumber: string): Promise<string> {
  try {
    // تنسيق رقم الهاتف
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+964${phoneNumber.slice(1)}`;
    
    // إنشاء مستخدم مؤقت أو الحصول على المستخدم الموجود
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByPhoneNumber(formattedPhone);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // إنشاء مستخدم جديد للتحقق
        userRecord = await adminAuth.createUser({
          phoneNumber: formattedPhone,
        });
      } else {
        throw error;
      }
    }

    // إنشاء رمز تحقق مخصص
    const customToken = await adminAuth.createCustomToken(userRecord.uid);
    
    return customToken;
  } catch (error) {
    console.error('خطأ في إنشاء رمز التحقق:', error);
    throw error;
  }
}

// إرسال رمز تحقق عبر Firebase
export async function sendVerificationSMS(phoneNumber: string): Promise<{ success: boolean; sessionInfo?: string }> {
  try {
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+964${phoneNumber.slice(1)}`;
    
    // ملاحظة: Firebase Admin SDK لا يدعم إرسال SMS مباشرة
    // نحتاج لاستخدام Firebase Client SDK في المقدمة
    // أو خدمة SMS خارجية مثل Twilio
    
    console.log(`🚀 محاولة إرسال رمز تحقق إلى: ${formattedPhone}`);
    
    // للآن، سنستخدم رمز محاكي
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`📱 رمز التحقق: ${verificationCode}`);
    
    return {
      success: true,
      sessionInfo: verificationCode // في البيئة الحقيقية، هذا سيكون session ID
    };
    
  } catch (error) {
    console.error('خطأ في إرسال رمز التحقق:', error);
    return {
      success: false
    };
  }
}