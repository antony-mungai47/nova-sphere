import { registerOTel } from '@vercel/otel';

export function register() {
  // Initialize OpenTelemetry for Vercel/Next.js
  registerOTel({ serviceName: 'nova-sphere-marketplace' });

  // If we had the @sentry/nextjs SDK installed, we would initialize it here:
  // if (process.env.NEXT_RUNTIME === 'nodejs') {
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: 1.0,
  //   });
  // }
  //
  // if (process.env.NEXT_RUNTIME === 'edge') {
  //   Sentry.init({
  //     dsn: process.env.SENTRY_DSN,
  //     tracesSampleRate: 1.0,
  //   });
  // }
}
