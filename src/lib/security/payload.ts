import { NextResponse } from 'next/server';

export const CHECKOUT_PAYLOAD_LIMIT = 10 * 1024; // 10kb
export const VENDOR_PAYLOAD_LIMIT = 2 * 1024 * 1024; // 2MB

export function validatePayloadSize(req: Request, limitBytes: number): NextResponse | null {
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > limitBytes) {
    return NextResponse.json({ error: 'Payload Too Large - Anti-Bombing Triggered' }, { status: 413 });
  }
  return null;
}
