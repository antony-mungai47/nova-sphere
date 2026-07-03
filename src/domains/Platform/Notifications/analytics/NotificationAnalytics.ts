export class NotificationAnalytics {
  static trackEvent(trackingId: string, event: 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED') {
    console.log(`[NotificationAnalytics] ${trackingId} -> ${event}`);
  }
}
