"use server";

import { NotificationService } from "./NotificationService";
import { getFeatureFlag } from "@/domains/Foundation/feature-flags/actions";
import { FeatureFlags } from "@/domains/Foundation/feature-flags/flags";
import { prisma } from "@/lib/prisma";

export async function getUserNotifications(userId: string, skip: number = 0, take: number = 20) {
  const isEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);
  if (!isEnabled) return { notifications: [], unreadCount: 0 };

  const notifications = await NotificationService.getUserNotifications(userId, skip, take);
  const unreadCount = await NotificationService.getUnreadCount(userId);

  return { notifications, unreadCount };
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  const isEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);
  if (!isEnabled) return { success: false };

  await NotificationService.markAsRead(notificationId, userId);
  return { success: true };
}

export async function markAllNotificationsAsRead(userId: string) {
  const isEnabled = await getFeatureFlag(FeatureFlags.LIVE_NOTIFICATIONS);
  if (!isEnabled) return { success: false };

  await NotificationService.markAllAsRead(userId);
  return { success: true };
}

export async function getUserNotificationPreferences(userId: string) {
  return prisma.notificationPreference.findMany({
    where: { userId },
  });
}

export async function updateNotificationPreference(userId: string, type: any, updates: { inApp?: boolean; email?: boolean; push?: boolean; sms?: boolean }) {
  const prefs = await prisma.notificationPreference.upsert({
    where: {
      userId_type: {
        userId,
        type,
      }
    },
    update: updates,
    create: {
      userId,
      type,
      ...updates,
    }
  });
  return { success: true, prefs };
}
