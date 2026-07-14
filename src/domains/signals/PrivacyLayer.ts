import { BaseSignal } from "./types";

export class PrivacyLayer {
  private consentGranted = true; // In real app, tied to CookieConsentBanner

  setConsent(granted: boolean) {
    this.consentGranted = granted;
  }

  canTrack(signal: BaseSignal): boolean {
    // Some signals might be strictly anonymous and essential, bypassing consent.
    // But generally, we block PII-related analytics if no consent.
    if (!this.consentGranted && signal.category !== "performance") {
      return false;
    }
    return true;
  }

  sanitize(signal: BaseSignal): BaseSignal {
    // Remove PII if consent is partial, etc.
    if (!this.consentGranted && signal.context.userId) {
       const sanitized = { ...signal };
       sanitized.context = { ...signal.context, userId: undefined };
       return sanitized;
    }
    return signal;
  }
}
