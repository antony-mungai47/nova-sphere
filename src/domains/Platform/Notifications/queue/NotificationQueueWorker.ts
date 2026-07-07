import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { Notification } from '@prisma/client';
import { templateRegistry } from '../templates/TemplateRegistry';
import { NotificationRenderer } from '../renderer/NotificationRenderer';
import { PreferenceEngine } from '../preferences/PreferenceEngine';
import { providerRegistry } from '../providers/ProviderRegistry';

export class NotificationQueueWorker {
  private static BATCH_SIZE = 50;

  static async processQueue(): Promise<number> {
    const workerId = randomUUID();
    const now = new Date();
    // Assuming a simple lock timeout, though we don't have lockedAt on Notification table yet.
    // We can use a combination of status='PENDING' and limit.
    // For production, we'd add lockedBy to Notification table too. Since we didn't, we will do a standard Prisma find/update for this mock.
    // To prevent overlap, we will just use findMany and update one by one for now, or raw SQL.
    
    try {
      const claimedNotifications = await prisma.$queryRaw<Notification[]>`
        UPDATE "Notification"
        SET "status" = 'PROCESSING',
            "updatedAt" = ${now}
        WHERE id IN (
          SELECT id FROM "Notification"
          WHERE "status" = 'PENDING'
          ORDER BY "priority" DESC, "createdAt" ASC
          LIMIT ${NotificationQueueWorker.BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `;

      if (!claimedNotifications || claimedNotifications.length === 0) {
        return 0;
      }

      for (const notification of claimedNotifications) {
        await this.processNotification(notification);
      }

      return claimedNotifications.length;
    } catch (error) {
      console.error('[NotificationQueueWorker] Error processing queue', error);
      return 0;
    }
  }

  private static async processNotification(notification: Notification): Promise<void> {
    try {
      const meta = notification.metadata as any || {};
      const templateId = meta.templateId || 'SYSTEM_DEFAULT';
      const data = meta.data || {};

      const template = templateRegistry.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const subject = NotificationRenderer.render(template.subjectTemplate, data);
      const body = NotificationRenderer.render(template.bodyTemplate, data);

      const channels = await PreferenceEngine.getUserPreferences(notification.userId, templateId);

      let sentCount = 0;
      for (const channel of channels) {
        if (!template.supportedChannels.includes(channel)) continue;

        const provider = providerRegistry.get(channel);
        if (provider) {
          try {
            const result = await provider.send(notification.userId, subject, body, data);
            
            // Mark as sent in DB
            await prisma.notification.update({
              where: { id: notification.id },
              data: {
                title: subject,
                message: body,
                channel: channel,
                provider: provider.name || 'UNKNOWN',
                providerMessageId: result?.messageId || `msg-${randomUUID()}`,
                sentAt: new Date(),
                status: 'SENT'
              }
            });
            sentCount++;
          } catch (providerError) {
            console.error(`[NotificationQueueWorker] Provider failed for ${channel}`, providerError);
          }
        }
      }

      if (sentCount === 0) {
        // If no providers succeeded or user disabled all channels
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: 'FAILED' }
        });
      }

    } catch (error) {
      console.error(`[NotificationQueueWorker] Failed to process ${notification.id}`, error);
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'FAILED' }
      });
    }
  }
}
