import { ILoggerProvider } from './ILoggerProvider';
import { ConsoleLoggerProvider } from './ConsoleLoggerProvider';
import { PinoLoggerProvider } from './PinoLoggerProvider';
import { IErrorReporter } from './IErrorReporter';
import { SentryErrorReporter } from './SentryErrorReporter';
import { NullReporter } from './NullReporter';

// In a real app, you would determine this based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

export const logger: ILoggerProvider = isProduction 
  ? new PinoLoggerProvider() 
  : new ConsoleLoggerProvider();

const hasSentryDsn = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export const errorReporter: IErrorReporter = hasSentryDsn
  ? new SentryErrorReporter()
  : new NullReporter();
