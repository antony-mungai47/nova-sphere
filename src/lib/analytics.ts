import { prisma } from './prisma';
import { inngest } from './inngest/client';

export interface BaseEventPayload {
  eventName: string;
  eventVersion?: string;
  userId?: string;
  sessionId?: string;
  tenantId?: string;
  vendorId?: string;
  device?: string;
  country?: string;
  currency?: string;
  source?: string; // UTM source
  metadata?: Record<string, any>;
}

export async function trackEvent(payload: BaseEventPayload) {
  // Create an eventId to enforce idempotency
  const eventId = crypto.randomUUID();

  // Save to DB Outbox (AnalyticsEvent table)
  await prisma.analyticsEvent.create({
    data: {
      eventId,
      eventName: payload.eventName,
      eventVersion: payload.eventVersion || 'v1',
      userId: payload.userId,
      sessionId: payload.sessionId,
      tenantId: payload.tenantId,
      vendorId: payload.vendorId,
      device: payload.device,
      country: payload.country,
      currency: payload.currency,
      source: payload.source,
      metadata: payload.metadata || {},
      status: 'PENDING'
    }
  });

  // Fire Inngest immediately
  try {
    await inngest.send({
      name: 'analytics/event.received',
      data: { eventId }
    });
  } catch (err) {
    // Suppress error so the main API response is never blocked by telemetry
    console.error('Failed to dispatch analytics to Inngest immediately', err);
  }
}
