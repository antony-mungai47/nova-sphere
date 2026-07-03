import crypto from 'crypto';

export class DataAnonymizer {
  private static readonly HASH_SALT = process.env.ANONYMIZATION_SALT || 'default-salt';

  /**
   * Masks a string, keeping only the last N characters visible (e.g., ****1234)
   */
  static mask(value: string, visibleChars: number = 4): string {
    if (!value || value.length <= visibleChars) return value;
    return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
  }

  /**
   * One-way cryptographic hash for PII (e.g., emails) to allow grouping without exposing the value.
   */
  static hash(value: string): string {
    if (!value) return '';
    return crypto.createHmac('sha256', this.HASH_SALT).update(value).digest('hex');
  }

  /**
   * Drops the field entirely.
   */
  static remove(): null {
    return null;
  }
}
