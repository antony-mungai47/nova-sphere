import { prisma } from '@/lib/prisma';

export class PreferenceEngine {
  static async getUserPreferences(userId: string, templateId: string): Promise<string[]> {
    // In a real system, we look up granular preferences.
    // Default to 'in-app' and 'email' for now.
    const prefs = await prisma.notificationPreference.findMany({
      where: { userId }
    });

    // Dummy logic: return email if they want it, always return realtime for in-app
    const channels = ['realtime'];
    const emailPref = prefs.find(p => p.type === templateId as any);
    if (!emailPref || emailPref.email) {
      channels.push('email');
    }
    
    return channels;
  }
}
