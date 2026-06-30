import { test, expect } from '@playwright/test';

test.describe('API & Server Action Validation', () => {
  test('Search API handles valid and invalid queries', async ({ request }) => {
    // Valid query
    const validRes = await request.get('/api/search?q=nova');
    expect(validRes.ok()).toBeTruthy();
    
    // Check structure
    const validData = await validRes.json();
    expect(Array.isArray(validData.results)).toBeTruthy();

    // Invalid/Empty query
    const emptyRes = await request.get('/api/search?q=');
    expect(emptyRes.ok()).toBeTruthy(); // Assuming it returns empty results or 200 with empty array
  });

  test('Coupon API rejects invalid coupons', async ({ request }) => {
    const res = await request.post('/api/coupons', {
      data: { code: 'INVALID_COUPON_123' }
    });
    
    const data = await res.json();
    expect(data.success).toBeFalsy();
  });
});
