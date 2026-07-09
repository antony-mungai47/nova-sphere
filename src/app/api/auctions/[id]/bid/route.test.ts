import { POST } from '@/app/api/auctions/[id]/bid/route';
import { NextRequest } from 'next/server';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'test-user-123' })
}));

// Mock BidEngine
jest.mock('@/domains/Auction/BidEngine', () => ({
  BidEngine: {
    placeBid: jest.fn().mockResolvedValue({ success: true, newBidAmount: 150 })
  }
}));

describe('Bidding API - Idempotency & Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
    return new Request('http://localhost/api/auctions/123/bid', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        ...headers
      }),
      body: JSON.stringify(body)
    });
  };

  it('should reject requests without Idempotency-Key', async () => {
    const req = createMockRequest({ amount: 150 });
    const res = await POST(req, { params: Promise.resolve({ id: 'auction-123' }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Idempotency-Key is required/i);
  });

  it('should process identical requests with the same Idempotency-Key only once', async () => {
    const idempotencyKey = 'test-idemp-key-123';
    const req1 = createMockRequest({ amount: 200 }, { 'Idempotency-Key': idempotencyKey });
    const req2 = createMockRequest({ amount: 200 }, { 'Idempotency-Key': idempotencyKey });

    const [res1, res2] = await Promise.all([
      POST(req1, { params: Promise.resolve({ id: 'auction-123' }) }),
      POST(req2, { params: Promise.resolve({ id: 'auction-123' }) })
    ]);

    expect(res1.status).toBe(201);
    expect(res2.status).toBe(409); // The second one should hit the 'PROCESSING' check
    const data2 = await res2.json();
    expect(data2.error).toMatch(/Concurrent request processing/i);
  });

  it('should return cached response if request succeeds and is re-sent', async () => {
    const idempotencyKey = 'test-idemp-key-456';
    const req1 = createMockRequest({ amount: 300 }, { 'Idempotency-Key': idempotencyKey });
    
    // First request
    const res1 = await POST(req1, { params: Promise.resolve({ id: 'auction-123' }) });
    expect(res1.status).toBe(201);

    // Second request sent sequentially (after the first is done)
    const req2 = createMockRequest({ amount: 300 }, { 'Idempotency-Key': idempotencyKey });
    const res2 = await POST(req2, { params: Promise.resolve({ id: 'auction-123' }) });
    
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.success).toBe(true);
  });
});
