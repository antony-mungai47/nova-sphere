import { prisma } from '@/lib/prisma';
import { DomainEventOutbox } from '@prisma/client';
import { DomainEvents as eventBus } from '@/domains/Foundation/events/event-bus';
import { CheckoutMetrics } from '@/modules/commerce/application/sagas/CheckoutMetrics';

export class OutboxRelayWorker {
  private static BATCH_SIZE = 100;

  /**
   * Polls the DomainEventOutbox table for pending events, claiming them safely
   * and routing them to the internal Event Bus.
   */
  static async processOutbox(): Promise<number> {
    try {
      // 1. Gather backlog metrics before claiming
      const pendingCount = await prisma.domainEventOutbox.count({
        where: { published: false }
      });
      CheckoutMetrics.gauge("outbox_backlog_count", pendingCount);

      if (pendingCount > 0) {
        const oldest = await prisma.domainEventOutbox.findFirst({
          where: { published: false },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true }
        });
        if (oldest) {
          const ageSeconds = Math.max(0, Math.floor((Date.now() - oldest.createdAt.getTime()) / 1000));
          CheckoutMetrics.gauge("outbox_oldest_record_age_seconds", ageSeconds);
        }
      } else {
        CheckoutMetrics.gauge("outbox_oldest_record_age_seconds", 0);
      }

      // 2. Claim events using Postgres FOR UPDATE SKIP LOCKED
      const claimedEvents = await prisma.$queryRaw<DomainEventOutbox[]>`
        UPDATE "DomainEventOutbox"
        SET "published" = true,
            "publishedAt" = NOW()
        WHERE id IN (
          SELECT id FROM "DomainEventOutbox"
          WHERE "published" = false
          ORDER BY "createdAt" ASC
          LIMIT ${OutboxRelayWorker.BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `;

      if (!claimedEvents || claimedEvents.length === 0) {
        return 0;
      }

      for (const event of claimedEvents) {
        await this.dispatchToEventBus(event);
      }

      CheckoutMetrics.increment("outbox_relay_published_total", claimedEvents.length);
      return claimedEvents.length;
    } catch (error: any) {
      CheckoutMetrics.increment("outbox_relay_failures_total", 1, { error: error.message });
      console.error('[OutboxRelayWorker] Error claiming events', error);
      return 0;
    }
  }

  private static async dispatchToEventBus(event: DomainEventOutbox): Promise<void> {
    try {
      await eventBus.publish(event.eventType, event.payload);
      CheckoutMetrics.increment("outbox_event_dispatched_total", 1, { eventType: event.eventType });
    } catch (error: any) {
      CheckoutMetrics.increment("outbox_event_dispatch_failed_total", 1, { eventType: event.eventType });
      console.error(`[OutboxRelayWorker] CRITICAL: Event ${event.id} of type ${event.eventType} failed to dispatch to EventBus!`, error);
    }
  }
}
