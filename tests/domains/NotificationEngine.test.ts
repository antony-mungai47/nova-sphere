import { NotificationEngine } from '@/domains/Platform/Notifications/NotificationEngine';
import { templateRegistry } from '@/domains/Platform/Notifications/templates/TemplateRegistry';
import { NotificationRenderer } from '@/domains/Platform/Notifications/renderer/NotificationRenderer';
import { PreferenceEngine } from '@/domains/Platform/Notifications/preferences/PreferenceEngine';
import { providerRegistry } from '@/domains/Platform/Notifications/providers/ProviderRegistry';
import { DeliveryTracker } from '@/domains/Platform/Notifications/tracker/DeliveryTracker';
import { NotificationAnalytics } from '@/domains/Platform/Notifications/analytics/NotificationAnalytics';
import { INotificationProvider } from '@/domains/Platform/Notifications/contracts';

jest.mock('@/domains/Platform/Notifications/templates/TemplateRegistry');
jest.mock('@/domains/Platform/Notifications/renderer/NotificationRenderer');
jest.mock('@/domains/Platform/Notifications/preferences/PreferenceEngine');
jest.mock('@/domains/Platform/Notifications/providers/ProviderRegistry');
jest.mock('@/domains/Platform/Notifications/tracker/DeliveryTracker');
jest.mock('@/domains/Platform/Notifications/analytics/NotificationAnalytics');

describe('NotificationEngine', () => {
  let engine: NotificationEngine;

  beforeEach(() => {
    engine = new NotificationEngine();
    jest.clearAllMocks();
  });

  describe('dispatch', () => {
    it('dispatches notification to allowed channels and logs success', async () => {
      // Mock Template
      (templateRegistry.get as jest.Mock).mockReturnValue({
        subjectTemplate: 'Hello {{name}}',
        bodyTemplate: 'Welcome {{name}}',
        supportedChannels: ['EMAIL', 'SMS']
      });

      // Mock Renderer
      (NotificationRenderer.render as jest.Mock).mockImplementation((template, data) => template.replace('{{name}}', data.name));

      // Mock Preferences
      (PreferenceEngine.getUserPreferences as jest.Mock).mockResolvedValue(['EMAIL']);

      // Mock Provider
      const mockProvider: INotificationProvider = {
        name: 'MockEmail',
        send: jest.fn().mockResolvedValue(undefined)
      };
      (providerRegistry.get as jest.Mock).mockReturnValue(mockProvider);

      const result = await engine.dispatch({
        templateId: 'WELCOME',
        userId: 'USER_1',
        data: { name: 'Alice' }
      });

      expect(result.trackingId).toBeDefined();
      expect(mockProvider.send).toHaveBeenCalledWith('USER_1', 'Hello Alice', 'Welcome Alice', undefined);
      expect(DeliveryTracker.logAttempt).toHaveBeenCalledWith(result.trackingId, 'EMAIL', 'SUCCESS');
      expect(NotificationAnalytics.trackEvent).toHaveBeenCalledWith(result.trackingId, 'SENT');
    });

    it('logs failure if provider throws an error', async () => {
      // Mock Template
      (templateRegistry.get as jest.Mock).mockReturnValue({
        subjectTemplate: 'Subj',
        bodyTemplate: 'Body',
        supportedChannels: ['SMS']
      });

      (NotificationRenderer.render as jest.Mock).mockReturnValue('Rendered');
      (PreferenceEngine.getUserPreferences as jest.Mock).mockResolvedValue(['SMS']);

      // Mock Provider
      const mockProvider: INotificationProvider = {
        name: 'MockSMS',
        send: jest.fn().mockRejectedValue(new Error('SMS Gateway Down'))
      };
      (providerRegistry.get as jest.Mock).mockReturnValue(mockProvider);

      const result = await engine.dispatch({
        templateId: 'ALERT',
        userId: 'USER_1',
        data: {}
      });

      expect(mockProvider.send).toHaveBeenCalled();
      expect(DeliveryTracker.logAttempt).toHaveBeenCalledWith(result.trackingId, 'SMS', 'FAILED', 'SMS Gateway Down');
    });

    it('does not send if channel is not supported by template', async () => {
      (templateRegistry.get as jest.Mock).mockReturnValue({
        subjectTemplate: 'Subj',
        bodyTemplate: 'Body',
        supportedChannels: ['PUSH'] // Only PUSH supported
      });

      (NotificationRenderer.render as jest.Mock).mockReturnValue('Rendered');
      (PreferenceEngine.getUserPreferences as jest.Mock).mockResolvedValue(['EMAIL']); // User wants EMAIL

      const mockProvider = { send: jest.fn() };
      (providerRegistry.get as jest.Mock).mockReturnValue(mockProvider);

      await engine.dispatch({
        templateId: 'ALERT',
        userId: 'USER_1',
        data: {}
      });

      expect(mockProvider.send).not.toHaveBeenCalled();
      expect(DeliveryTracker.logAttempt).not.toHaveBeenCalled();
    });
  });
});
