import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';
import { getRateLimiter } from '@/lib/security/RateLimiterFactory';

const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Inject Trace ID / Correlation ID for APM / Observability
  const requestHeaders = new Headers(req.headers);
  const traceId = req.headers.get('x-trace-id') || crypto.randomUUID();
  requestHeaders.set('x-trace-id', traceId);
  requestHeaders.set('x-request-id', traceId); // Standard correlation ID

  // Rate Limiting
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limiter = getRateLimiter();
  const rateLimitResult = await limiter.limit(ip);

  if (!rateLimitResult.success) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'x-request-id': traceId,
        'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString()
      }
    });
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-trace-id', traceId);
  response.headers.set('x-request-id', traceId);
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
