import { test, expect } from '@playwright/test';

test('Homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Verify basic elements
  await expect(page.locator('text=NOVA')).toBeVisible();
  await expect(page.locator('text=Store')).toBeVisible();
});

test('Search API works', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/search?q=nova');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(Array.isArray(data.results)).toBeTruthy();
});

test('Coupons API validates properly', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/coupons', {
    data: { code: 'NOVA10' }
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.success).toBeTruthy();
  expect(data.discountPercent).toBe(10);
});
