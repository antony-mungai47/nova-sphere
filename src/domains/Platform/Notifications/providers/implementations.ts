import { INotificationProvider, providerRegistry } from './ProviderRegistry';
import { randomUUID } from 'crypto';

export class ConsoleProvider implements INotificationProvider {
  name = 'ConsoleProvider';
  channel = 'console';
  
  async send(userId: string, subject: string, body: string, metadata?: any): Promise<{ messageId: string }> {
    console.log(`[ConsoleProvider] 📧 Sending to User ${userId}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    return { messageId: `console-${randomUUID()}` };
  }
}

export class ResendProvider implements INotificationProvider {
  name = 'ResendProvider';
  channel = 'email';
  
  async send(userId: string, subject: string, body: string, metadata?: any): Promise<{ messageId: string }> {
    // In production, this would use the resend SDK: resend.emails.send(...)
    console.log(`[ResendProvider] Sending email to ${userId}`);
    return { messageId: `resend-${randomUUID()}` };
  }
}

export class SendGridProvider implements INotificationProvider {
  name = 'SendGridProvider';
  channel = 'email';
  
  async send(userId: string, subject: string, body: string, metadata?: any): Promise<{ messageId: string }> {
    // In production, this would use @sendgrid/mail
    console.log(`[SendGridProvider] Sending email to ${userId}`);
    return { messageId: `sg-${randomUUID()}` };
  }
}

export class InAppProvider implements INotificationProvider {
  name = 'InAppProvider';
  channel = 'in_app';
  
  async send(userId: string, subject: string, body: string, metadata?: any): Promise<{ messageId: string }> {
    // Handled by the queue writing to the Notification table
    console.log(`[InAppProvider] Delivering to in-app bell for ${userId}`);
    return { messageId: `inapp-${randomUUID()}` };
  }
}

// Depending on environment/feature flags, register the correct one.
// We will default to ResendProvider for emails.
providerRegistry.register(new ConsoleProvider());
providerRegistry.register(new ResendProvider());
providerRegistry.register(new InAppProvider());
