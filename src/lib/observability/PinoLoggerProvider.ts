import { ILoggerProvider } from './ILoggerProvider';
// import pino from 'pino';

export class PinoLoggerProvider implements ILoggerProvider {
  // private logger = pino();

  info(message: string, context?: Record<string, any>): void {
    // this.logger.info(context, message);
    console.info(`[PINO INFO] ${message}`, context || '');
  }
  warn(message: string, context?: Record<string, any>): void {
    // this.logger.warn(context, message);
    console.warn(`[PINO WARN] ${message}`, context || '');
  }
  error(message: string, error?: Error, context?: Record<string, any>): void {
    // this.logger.error({ err: error, ...context }, message);
    console.error(`[PINO ERROR] ${message}`, error || '', context || '');
  }
  debug(message: string, context?: Record<string, any>): void {
    // this.logger.debug(context, message);
    console.debug(`[PINO DEBUG] ${message}`, context || '');
  }
}
