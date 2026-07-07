import { OutboxRelayWorker } from '../../src/domains/Platform/Workflow/OutboxRelayWorker';
import { NotificationQueueWorker } from '../../src/domains/Platform/Notifications/queue/NotificationQueueWorker';
import { prisma } from '../../src/lib/prisma';
import { DomainEvents as eventBus } from '../../src/domains/Foundation/events/event-bus';
import { NotificationType, NotificationPriority } from '@prisma/client';
import { NotificationQueue } from '../../src/domains/Platform/Notifications/queue/NotificationQueue';
import { templateRegistry } from '../../src/domains/Platform/Notifications/templates/TemplateRegistry';

jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    outboxEvent: {
      update: jest.fn()
    },
    notification: {
      create: jest.fn(),
      update: jest.fn()
    },
    notificationPreference: {
      findFirst: jest.fn()
    }
  }
}));

jest.mock('../../src/domains/Foundation/events/event-bus', () => ({
  DomainEvents: {
    publish: jest.fn(),
    subscribe: jest.fn()
  }
}));

jest.mock('../../src/domains/Platform/Notifications/providers/ProviderRegistry', () => {
  const mockProvider = {
    name: 'ConsoleProvider',
    channel: 'console',
    send: jest.fn().mockResolvedValue({ messageId: 'console-123' })
  };
  return {
    providerRegistry: {
      get: jest.fn().mockImplementation((channel) => {
        if (channel === 'console') return mockProvider;
        return undefined;
      })
    }
  };
});

describe('Notification & Outbox Systems', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('OutboxRelayWorker', () => {
    it('claims pending events and dispatches to EventBus', async () => {
      const mockEvents = [
        { id: 'event-1', eventType: 'OrderCreated', payload: { orderId: 'ord-1' }, retryCount: 0 }
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockEvents);

      const processedCount = await OutboxRelayWorker.processOutbox();

      expect(processedCount).toBe(1);
      expect(eventBus.publish).toHaveBeenCalledWith('OrderCreated', { orderId: 'ord-1' });
      expect(prisma.outboxEvent.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'event-1' },
        data: expect.objectContaining({ status: 'PROCESSED' })
      }));
    });

    it('routes to DLQ when max retries exceeded', async () => {
      const mockEvents = [
        { id: 'event-2', eventType: 'OrderCreated', payload: {}, retryCount: 9 }
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockEvents);
      (eventBus.publish as jest.Mock).mockRejectedValueOnce(new Error('Bus Error'));

      await OutboxRelayWorker.processOutbox();

      expect(prisma.outboxEvent.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'event-2' },
        data: expect.objectContaining({
          status: 'FAILED',
          retryCount: 10,
          nextRetryAt: new Date('2099-12-31') // DLQ marker
        })
      }));
    });
  });

  describe('NotificationQueueWorker', () => {
    it('respects user preferences and formats templates', async () => {
      const mockNotifs = [
        {
          id: 'notif-1',
          userId: 'user-1',
          status: 'PENDING',
          metadata: {
            templateId: 'ORDER_CREATED',
            data: { orderId: '123', customerName: 'Alice' }
          }
        }
      ];
      
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockNotifs);
      
      // Opted out of email, opted into SMS
      (prisma.notificationPreference.findFirst as jest.Mock).mockResolvedValueOnce({
        email: false,
        inApp: false,
        sms: true,
        push: false
      });

      await NotificationQueueWorker.processQueue();

      // Email and InApp are turned off, SMS is on, but ORDER_CREATED template doesn't support sms.
      // So only console should be processed.
      expect(prisma.notification.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'SENT',
          channel: 'console',
          title: 'Order Confirmation #123'
        })
      }));
    });
  });
});
