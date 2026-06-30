import { ILoggerProvider } from './ILoggerProvider';

export class ConsoleLoggerProvider implements ILoggerProvider {
  info(message: string, context?: Record<string, any>): void {
    console.info(`[INFO] ${message}`, context || '');
  }
  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, context || '');
  }
  error(message: string, error?: Error, context?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, error || '', context || '');
  }
  debug(message: string, context?: Record<string, any>): void {
    console.debug(`[DEBUG] ${message}`, context || '');
  }
}
