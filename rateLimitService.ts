import { collection, doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface RateLimitData {
  phoneNumber: string;
  attempts: number;
  lastAttempt: Timestamp;
  blockedUntil?: Timestamp;
}

export class RateLimitService {
  private collectionName = 'rateLimits';
  private maxAttempts = 3;
  private blockDurationHours = 1;

  async checkRateLimit(phoneNumber: string, action: 'login' | 'reset-password'): Promise<{ allowed: boolean; remainingAttempts?: number; blockedUntil?: Date }> {
    try {
      const docRef = doc(db, this.collectionName, `${phoneNumber}_${action}`);
      const docSnap = await getDoc(docRef);
      
      const now = Timestamp.now();
      
      if (!docSnap.exists()) {
        // First attempt
        await setDoc(docRef, {
          phoneNumber,
          action,
          attempts: 1,
          lastAttempt: now
        });
        
        return { 
          allowed: true, 
          remainingAttempts: this.maxAttempts - 1 
        };
      }
      
      const data = docSnap.data() as RateLimitData;
      
      // Check if user is currently blocked
      if (data.blockedUntil && data.blockedUntil.toDate() > now.toDate()) {
        return { 
          allowed: false, 
          blockedUntil: data.blockedUntil.toDate() 
        };
      }
      
      // Reset attempts if more than an hour has passed since last attempt
      const hoursSinceLastAttempt = (now.toMillis() - data.lastAttempt.toMillis()) / (1000 * 60 * 60);
      
      if (hoursSinceLastAttempt >= this.blockDurationHours) {
        await updateDoc(docRef, {
          attempts: 1,
          lastAttempt: now,
          blockedUntil: null
        });
        
        return { 
          allowed: true, 
          remainingAttempts: this.maxAttempts - 1 
        };
      }
      
      // Check if max attempts reached
      if (data.attempts >= this.maxAttempts) {
        const blockedUntil = new Date(now.toMillis() + (this.blockDurationHours * 60 * 60 * 1000));
        
        await updateDoc(docRef, {
          blockedUntil: Timestamp.fromDate(blockedUntil)
        });
        
        return { 
          allowed: false, 
          blockedUntil 
        };
      }
      
      // Increment attempts
      const newAttempts = data.attempts + 1;
      await updateDoc(docRef, {
        attempts: newAttempts,
        lastAttempt: now
      });
      
      return { 
        allowed: true, 
        remainingAttempts: this.maxAttempts - newAttempts 
      };
      
    } catch (error) {
      console.error('خطأ في فحص معدل المحاولات:', error);
      // في حالة خطأ، نسمح بالمحاولة
      return { allowed: true };
    }
  }

  async resetRateLimit(phoneNumber: string, action: 'login' | 'reset-password'): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, `${phoneNumber}_${action}`);
      await updateDoc(docRef, {
        attempts: 0,
        blockedUntil: null
      });
    } catch (error) {
      console.error('خطأ في إعادة تعيين معدل المحاولات:', error);
    }
  }
}

export const rateLimitService = new RateLimitService();