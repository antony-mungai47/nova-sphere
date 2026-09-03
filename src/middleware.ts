import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, NextRequest, NextFetchEvent } from 'next/server';
import { getRateLimiter } from '@/lib/security/RateLimiterFactory';

const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/vendor(.*)', '/account(.*)', '/orders(.*)', '/checkout(.*)']);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/login', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Inject W3C Trace Context (traceparent / tracestate)
  const requestHeaders = new Headers(req.headers);
  const incomingTraceParent = req.headers.get('traceparent');
  const incomingTraceState = req.headers.get('tracestate') || '';

  let traceId = '';
  if (incomingTraceParent) {
    const parts = incomingTraceParent.split('-');
    if (parts.length >= 4 && parts[0] === '00') {
      traceId = parts[1];
    }
  }

  if (!traceId) {
    traceId = crypto.randomUUID().replace(/-/g, ''); // 32 hex chars
  }

  const spanId = crypto.randomUUID().replace(/-/g, '').substring(0, 16); // 16 hex chars
  const traceparent = `00-${traceId}-${spanId}-01`;

  requestHeaders.set('traceparent', traceparent);
  if (incomingTraceState) {
    requestHeaders.set('tracestate', incomingTraceState);
  }

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

  response.headers.set('traceparent', traceparent);
  if (incomingTraceState) {
    response.headers.set('tracestate', incomingTraceState);
  }
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());

  return response;
});

export default async function middleware(req: NextRequest, ev: NextFetchEvent) {
  try {
    return await clerk(req, ev);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        error: "Middleware Error",
        message: error?.message,
        name: error?.name,
        stack: error?.stack
      }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

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
