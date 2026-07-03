import { INotificationEngine, INotificationPayload } from './contracts';
import { templateRegistry } from './templates/TemplateRegistry';
import { NotificationRenderer } from './renderer/NotificationRenderer';
import { PreferenceEngine } from './preferences/PreferenceEngine';
import { providerRegistry } from './providers/ProviderRegistry';
import { DeliveryTracker } from './tracker/DeliveryTracker';
import { NotificationAnalytics } from './analytics/NotificationAnalytics';
import { randomUUID } from 'crypto';

export class NotificationEngine implements INotificationEngine {
  async dispatch(payload: INotificationPayload): Promise<{ trackingId: string }> {
    const trackingId = `notif-${randomUUID()}`;

    try {
      // 1. Template
      const template = templateRegistry.get(payload.templateId);

      // 2. Renderer
      const subject = NotificationRenderer.render(template.subjectTemplate, payload.data);
      const body = NotificationRenderer.render(template.bodyTemplate, payload.data);

      // 3. Preferences
      const channels = await PreferenceEngine.getUserPreferences(payload.userId, payload.templateId);

      // 4. Providers & 5. Tracker
      for (const channel of channels) {
        if (!template.supportedChannels.includes(channel)) continue;

        const provider = providerRegistry.get(channel);
        if (provider) {
          try {
            await provider.send(payload.userId, subject, body, payload.metadata);
            await DeliveryTracker.logAttempt(trackingId, channel, 'SUCCESS');
          } catch (error: any) {
            await DeliveryTracker.logAttempt(trackingId, channel, 'FAILED', error.message);
          }
        }
      }

      // 6. Analytics
      NotificationAnalytics.trackEvent(trackingId, 'SENT');

      return { trackingId };
    } catch (error) {
      console.error(`[NotificationEngine] Failed to dispatch ${trackingId}`, error);
      throw error;
    }
  }
}

export const notificationEngine = new NotificationEngine();
