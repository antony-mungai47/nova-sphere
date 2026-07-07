import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationPriority } from '@prisma/client';

export interface NotificationCommand {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  templateId: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

export class NotificationQueue {
  /**
   * Enqueues a notification command. The worker will pick it up,
   * check preferences, render templates, and dispatch to providers.
   */
  static async enqueue(command: NotificationCommand): Promise<void> {
    await prisma.notification.create({
      data: {
        userId: command.userId,
        type: command.type,
        priority: command.priority,
        title: 'PENDING_TEMPLATE', // Placeholder until worker processes it
        message: 'PENDING_TEMPLATE',
        metadata: {
          templateId: command.templateId,
          data: command.data,
          ...command.metadata
        },
        status: 'PENDING'
      }
    });
  }
}
