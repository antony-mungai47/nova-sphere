export interface INotificationPayload {
  userId: string;
  templateId: string;
  data: Record<string, any>;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface INotificationEngine {
  /**
   * Primary entry point for sending a notification.
   * Passes the notification through the full pipeline:
   * Template -> Renderer -> Preferences -> Providers -> Tracker -> Analytics
   */
  dispatch(payload: INotificationPayload): Promise<{ trackingId: string }>;
}
