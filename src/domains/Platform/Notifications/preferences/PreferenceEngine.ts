import { prisma } from '@/lib/prisma';

export class PreferenceEngine {
  static async getUserPreferences(userId: string, templateId: string): Promise<string[]> {
    // Map templateId to NotificationType to check preferences
    // For this mock, we assume 'ORDER_CREATED', 'PAYMENT_CAPTURED' -> 'ORDER_UPDATED'
    let notifType: any = 'ORDER_UPDATED';
    
    // In a real system, templates would belong to a type.
    
    const prefs = await prisma.notificationPreference.findFirst({
      where: { userId, type: notifType }
    });

    const channels: string[] = ['console']; // Console always on for debugging

    if (!prefs) {
      // Default opt-in
      channels.push('email', 'in_app');
    } else {
      if (prefs.email) channels.push('email');
      if (prefs.inApp) channels.push('in_app');
      if (prefs.sms) channels.push('sms');
      if (prefs.push) channels.push('push');
    }
    
    return channels;
  }
}
