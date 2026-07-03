import { prisma } from "@/lib/prisma";
import { NotificationType, NotificationPriority, Prisma } from "@prisma/client";
import { RealtimeFactory } from "@/domains/Realtime/providers/RealtimeFactory";
import { ChannelRegistry } from "@/domains/Realtime/contracts/ChannelRegistry";
import { RealtimeEvents } from "@/domains/Realtime/contracts/EventRegistry";

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

export class NotificationService {
  /**
   * Creates a notification, stores it in the database, and publishes it via Realtime if the user prefers in-app notifications.
   */
  static async createNotification(data: CreateNotificationDTO) {
    // 1. Check user preferences
    const prefs = await prisma.notificationPreference.findUnique({
      where: {
        userId_type: {
          userId: data.userId,
          type: data.type,
        },
      },
    });

    const inAppEnabled = prefs ? prefs.inApp : true; // Default to true if preference doesn't exist
    const emailEnabled = prefs ? prefs.email : true;

    // 2. Store in Database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        priority: data.priority || "MEDIUM",
        title: data.title,
        message: data.message,
        link: data.link,
        metadata: data.metadata || Prisma.JsonNull,
      },
    });

    // 3. Publish via Realtime Engine (if in-app enabled)
    if (inAppEnabled) {
      const engine = RealtimeFactory.getInstance();
      await engine.publish(
        ChannelRegistry.privateUser(data.userId),
        RealtimeEvents.NOTIFICATION_RECEIVED,
        {
          id: notification.id,
          type: notification.type,
          priority: notification.priority,
          title: notification.title,
          message: notification.message,
          link: notification.link,
          timestamp: notification.createdAt.toISOString(),
          isRead: notification.isRead,
        }
      );
    }

    // 4. Send Email (Stub for future email service)
    if (emailEnabled) {
      console.log(`[Email Service Stub] Sending email to User ${data.userId}: ${data.title}`);
    }

    return notification;
  }

  static async getUserNotifications(userId: string, skip: number = 0, take: number = 20) {
    return prisma.notification.findMany({
      where: { userId, isArchived: false },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false, isArchived: false },
    });
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
}
