import { NextRequest } from 'next/server';

export interface PrivacyContext {
  hasTrackingConsent: boolean;
  canSendPII: boolean;
}

export function getPrivacyContext(req: NextRequest): PrivacyContext {
  // Check cookies for user's consent preferences
  const consentCookie = req.cookies.get('nova_privacy_consent')?.value;
  
  if (!consentCookie) {
    // Default to strict privacy before consent is given (GDPR compliance)
    return { hasTrackingConsent: false, canSendPII: false };
  }

  try {
    const preferences = JSON.parse(consentCookie);
    return {
      hasTrackingConsent: preferences.analytics === true,
      canSendPII: preferences.personalization === true,
    };
  } catch {
    return { hasTrackingConsent: false, canSendPII: false };
  }
}

/**
 * Utility to mask PII from event payloads before dispatching to PostHog
 */
export function maskPII(payload: any) {
  const masked = { ...payload };
  if (masked.email) masked.email = '***@***.***';
  if (masked.name) masked.name = '***';
  if (masked.phone) masked.phone = '***-***-****';
  return masked;
}
