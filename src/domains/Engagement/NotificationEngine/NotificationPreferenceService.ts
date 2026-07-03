import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

export class NotificationPreferenceService {
  /**
   * Retrieves a user's notification preferences, merging with defaults for missing types.
   */
  static async getPreferences(userId: string) {
    const prefs = await prisma.notificationPreference.findMany({
      where: { userId }
    });

    const allTypes = Object.values(NotificationType);
    
    return allTypes.map(type => {
      const existing = prefs.find(p => p.type === type);
      if (existing) return existing;
      
      // Default fallback
      return {
        userId,
        type,
        inApp: true,
        email: true,
        push: false,
        sms: false
      };
    });
  }

  /**
   * Updates a specific preference.
   */
  static async updatePreference(userId: string, type: NotificationType, data: { inApp?: boolean; email?: boolean; push?: boolean; sms?: boolean }) {
    return prisma.notificationPreference.upsert({
      where: {
        userId_type: { userId, type }
      },
      update: data,
      create: {
        userId,
        type,
        inApp: data.inApp ?? true,
        email: data.email ?? true,
        push: data.push ?? false,
        sms: data.sms ?? false,
      }
    });
  }
}
