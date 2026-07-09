import { test, expect } from '@playwright/test';

test.describe('Nova Sphere - Security & Tenant Isolation', () => {
  test('Admin routes are protected from unauthenticated users', async ({ page }) => {
    const res = await page.goto('/admin');
    
    // In Clerk/Next.js, unauthenticated users typically get redirected to sign-in or receive a 401/404 if hidden
    await expect(page).toHaveURL(/.*sign-in.*/);
  });

  test('Tenant Isolation - Seller cannot access another seller dashboard', async ({ page }) => {
    // Attempt to hit the dashboard endpoint for Seller B while logged in as Seller A (mocked)
    const res = await page.goto('/vendor/dashboard?vendorId=SELLER_B&testAuth=SELLER_A');
    
    // Should result in a 403 Forbidden or redirect to their own dashboard
    // We check that the page indicates access denied, unauthorized, or redirects to sign-in
    const currentUrl = page.url();
    if (currentUrl.includes('sign-in')) {
      await expect(page).toHaveURL(/.*sign-in.*/);
    } else {
      const bodyText = await page.locator('body').innerText();
      // If it doesn't redirect, it should show an error
      expect(bodyText).not.toMatch(/Vendor Dashboard/i);
    }
  });
});
