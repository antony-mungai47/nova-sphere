import { NextRequest, NextResponse } from 'next/server';

export function attachMarketingCookies(req: NextRequest, res: NextResponse) {
  const url = req.nextUrl;
  
  // Extract UTM parameters
  const utmSource = url.searchParams.get('utm_source');
  const utmMedium = url.searchParams.get('utm_medium');
  const utmCampaign = url.searchParams.get('utm_campaign');
  
  // Extract Referrer
  const referrer = req.headers.get('referer') || '';
  const landingPage = url.pathname;

  // Set cookies with 30-day expiration if UTMs exist
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  
  if (utmSource) res.cookies.set('utm_source', utmSource, { maxAge });
  if (utmMedium) res.cookies.set('utm_medium', utmMedium, { maxAge });
  if (utmCampaign) res.cookies.set('utm_campaign', utmCampaign, { maxAge });
  
  // Only set referrer/landing on the very first visit
  if (!req.cookies.get('initial_referrer') && referrer) {
    res.cookies.set('initial_referrer', referrer, { maxAge });
  }
  if (!req.cookies.get('landing_page')) {
    res.cookies.set('landing_page', landingPage, { maxAge });
  }
}
