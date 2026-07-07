import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { OutboxEvent } from '@prisma/client';
import { DomainEvents as eventBus } from '@/domains/Foundation/events/event-bus';

export class OutboxRelayWorker {
  private static MAX_RETRIES = 10;
  private static BATCH_SIZE = 100;

  /**
   * Polls the OutboxEvent table for pending events, claiming them safely
   * and routing them to the internal Event Bus.
   */
  static async processOutbox(): Promise<number> {
    const workerId = randomUUID();
    const now = new Date();
    // If a worker crashed while processing, release locks older than 5 minutes
    const lockTimeout = new Date(Date.now() - 5 * 60 * 1000);

    try {
      // Safely claim a batch of events using Postgres FOR UPDATE SKIP LOCKED
      // This ensures multiple workers don't process the same event
      const claimedEvents = await prisma.$queryRaw<OutboxEvent[]>`
        UPDATE "OutboxEvent"
        SET "lockedBy" = ${workerId},
            "lockedAt" = ${now},
            "status" = 'PROCESSING'::"OutboxStatus"
        WHERE id IN (
          SELECT id FROM "OutboxEvent"
          WHERE (
              "status" = 'PENDING'::"OutboxStatus" 
              OR ("status" = 'FAILED'::"OutboxStatus" AND "nextRetryAt" <= ${now})
              OR ("status" = 'PROCESSING'::"OutboxStatus" AND "lockedAt" <= ${lockTimeout})
            )
          ORDER BY "createdAt" ASC
          LIMIT ${OutboxRelayWorker.BATCH_SIZE}
          FOR UPDATE SKIP LOCKED
        )
        RETURNING *;
      `;

      if (!claimedEvents || claimedEvents.length === 0) {
        return 0; // Nothing to process
      }

      for (const event of claimedEvents) {
        await this.dispatchToEventBus(event);
      }

      return claimedEvents.length;
    } catch (error) {
      console.error('[OutboxRelayWorker] Error claiming events', error);
      return 0;
    }
  }

  private static async dispatchToEventBus(event: OutboxEvent): Promise<void> {
    try {
      // 1. Dispatch payload to EventBus 
      // The payload structure is expected to match the eventType signature
      await eventBus.publish(event.eventType, event.payload);

      // 2. Mark as processed
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          lockedBy: null,
          lockedAt: null
        }
      });
    } catch (error: any) {
      // 3. Handle Failure and calculate next retry (Exponential Backoff)
      const newRetryCount = event.retryCount + 1;
      
      if (newRetryCount >= this.MAX_RETRIES) {
        // Send to Dead Letter Queue (by leaving it as FAILED and pushing nextRetryAt far into future, or marking DLQ)
        console.error(`[OutboxRelayWorker] Event ${event.id} exhausted retries. Sending to DLQ.`);
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'FAILED',
            lastError: error.message || 'Unknown Error',
            retryCount: newRetryCount,
            lockedBy: null,
            lockedAt: null,
            nextRetryAt: new Date('2099-12-31') // Pseudo-DLQ marker
          }
        });
      } else {
        // Exponential backoff: 2^retryCount * 10 seconds (e.g. 10s, 20s, 40s, 80s...)
        const backoffMs = Math.pow(2, newRetryCount) * 10000;
        const nextRetry = new Date(Date.now() + backoffMs);

        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'FAILED',
            lastError: error.message || 'Unknown Error',
            retryCount: newRetryCount,
            lockedBy: null,
            lockedAt: null,
            nextRetryAt: nextRetry
          }
        });
      }
    }
  }
}
