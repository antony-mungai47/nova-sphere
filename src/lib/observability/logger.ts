import { ILoggerProvider } from './ILoggerProvider';
import { ConsoleLoggerProvider } from './ConsoleLoggerProvider';
import { PinoLoggerProvider } from './PinoLoggerProvider';
import { IErrorReporter } from './IErrorReporter';
import { SentryErrorReporter } from './SentryErrorReporter';

// In a real app, you would determine this based on NODE_ENV
const isProduction = process.env.NODE_ENV === 'production';

export const logger: ILoggerProvider = isProduction 
  ? new PinoLoggerProvider() 
  : new ConsoleLoggerProvider();

export const errorReporter: IErrorReporter = new SentryErrorReporter();
