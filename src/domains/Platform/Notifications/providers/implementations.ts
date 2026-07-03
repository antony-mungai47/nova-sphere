import { INotificationProvider, providerRegistry } from './ProviderRegistry';

export class EmailProvider implements INotificationProvider {
  channel = 'email';
  
  async send(userId: string, subject: string, body: string, metadata?: any): Promise<boolean> {
    console.log(`[EmailProvider] Sending to User ${userId}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    // Actually integrate SendGrid / Resend here
    return true;
  }
}

export class WebhookProvider implements INotificationProvider {
  channel = 'webhook';
  
  async send(userId: string, subject: string, body: string, metadata?: any): Promise<boolean> {
    console.log(`[WebhookProvider] Firing webhook for User ${userId}`);
    return true;
  }
}

providerRegistry.register(new EmailProvider());
providerRegistry.register(new WebhookProvider());
