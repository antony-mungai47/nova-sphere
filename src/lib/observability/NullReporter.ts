import { IErrorReporter } from './IErrorReporter';

export class NullReporter implements IErrorReporter {
  captureException(error: any, context?: Record<string, any>): void {
    // No-op
  }
  
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void {
    // No-op
  }
}
