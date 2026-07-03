export class NotificationRenderer {
  /**
   * Replaces variables in a template string like {{userName}}
   */
  static render(templateString: string, data: Record<string, any>): string {
    return templateString.replace(/\{\{([\w.]+)\}\}/g, (_, key) => {
      // Simple dot notation resolution
      return key.split('.').reduce((o: any, i: string) => (o ? o[i] : ''), data) ?? '';
    });
  }
}
