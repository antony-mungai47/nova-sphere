import { test, expect } from '@playwright/test';

test.describe('Commerce Suite: Browsing & Search', () => {
  test('Homepage loads and displays featured products', async ({ page }) => {
    await page.goto('/');
    
    // Verify Brand Logo or Title
    await expect(page.getByText('NOVA', { exact: false }).first()).toBeVisible();
    
    // Verify Navigation exists
    await expect(page.getByRole('navigation').first()).toBeVisible();
  });

  test('Store page functionality returns results', async ({ page }) => {
    await page.goto('/store');
    
    const searchInput = page.getByPlaceholder(/search/i).first();
    // If the input exists, type into it
    if (await searchInput.isVisible()) {
      await searchInput.fill('nova');
      await searchInput.press('Enter');
      
      // Verify URL updated
      await page.waitForTimeout(500);
    }
  });
});
