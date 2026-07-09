export interface IErrorReporter {
  captureException(error: any, context?: Record<string, any>): void;
  captureMessage(message: string, level?: 'info' | 'warning' | 'error'): void;
}
