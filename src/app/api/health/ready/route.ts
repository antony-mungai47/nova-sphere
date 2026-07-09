import { NextResponse } from 'next/server';

export async function GET() {
  const configs = {
    database: !!process.env.DATABASE_URL,
    redis: !!process.env.UPSTASH_REDIS_REST_URL,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    clerk: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };

  const isReady = Object.values(configs).every(Boolean);

  if (isReady) {
    return NextResponse.json({ status: 'ready', configs }, { status: 200 });
  } else {
    return NextResponse.json({ status: 'not_ready', configs }, { status: 503 }); 
  }
}
