import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, NextRequest, NextFetchEvent } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let generalLimiter: Ratelimit | null = null;
let mutationLimiter: Ratelimit | null = null;

if (redisUrl && redisToken) {
  const redis = new Redis({ url: redisUrl, token: redisToken });
  generalLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '10 s') });
  mutationLimiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m') });
}

const isMutationRoute = createRouteMatcher(['/api/checkout(.*)', '/api/vendor(.*)']);
const isProtectedRoute = createRouteMatcher(['/admin(.*)', '/vendor(.*)', '/account(.*)', '/orders(.*)', '/checkout(.*)']);

const clerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

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

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const limiter = isMutationRoute(req) ? mutationLimiter : generalLimiter;
  
  if (limiter) {
    try {
      const rateLimitResult = await limiter.limit(isMutationRoute(req) ? `mutation_${ip}` : `general_${ip}`);
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
      
      // We'll set the headers later down
      requestHeaders.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      requestHeaders.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      requestHeaders.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
    } catch (err) {
      console.warn("Upstash Rate Limiter failed to execute, bypassing:", err);
    }
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
  
  // Forward rate limit headers if they exist
  if (requestHeaders.has('X-RateLimit-Limit')) {
    response.headers.set('X-RateLimit-Limit', requestHeaders.get('X-RateLimit-Limit')!);
    response.headers.set('X-RateLimit-Remaining', requestHeaders.get('X-RateLimit-Remaining')!);
    response.headers.set('X-RateLimit-Reset', requestHeaders.get('X-RateLimit-Reset')!);
  }

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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
