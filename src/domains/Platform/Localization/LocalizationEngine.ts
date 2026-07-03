export class LocalizationEngine {
  /**
   * Formats a date according to regional standards.
   */
  static formatDate(date: Date, locale: string = 'en-US'): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date);
  }

  /**
   * Formats a number with regional separators.
   */
  static formatNumber(value: number, locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(value);
  }

  /**
   * Evaluates if a given locale reads Right-To-Left.
   */
  static isRTL(locale: string): boolean {
    const rtlLocales = ['ar', 'he', 'fa', 'ur'];
    const baseLocale = locale.split('-')[0].toLowerCase();
    return rtlLocales.includes(baseLocale);
  }
}
