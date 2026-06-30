import { IErrorReporter } from './IErrorReporter';
// import * as Sentry from '@sentry/nextjs';

export class SentryErrorReporter implements IErrorReporter {
  captureException(error: Error, context?: Record<string, any>): void {
    // Sentry.captureException(error, { extra: context });
    console.error(`[Sentry] Exception Captured:`, error, context);
  }
  
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    // Sentry.captureMessage(message, level);
    console.log(`[Sentry] Message Captured (${level}):`, message);
  }
}
