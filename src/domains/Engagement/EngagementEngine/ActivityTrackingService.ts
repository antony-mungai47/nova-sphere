import { prisma } from '@/lib/prisma';

export class ActivityTrackingService {
  /**
   * Logs a customer activity event into the Customer Timeline.
   */
  static async logEvent(userId: string | null, sessionId: string | null, activityType: string, resourceId?: string, metadata?: any) {
    if (!userId && !sessionId) return; // Cannot track anonymously without session

    return prisma.userActivity.create({
      data: {
        userId,
        sessionId,
        activityType,
        resourceId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      }
    });
  }

  /**
   * Retrieves the activity timeline for a customer.
   */
  static async getCustomerTimeline(userId: string, limit = 50) {
    return prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
