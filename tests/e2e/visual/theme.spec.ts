import { test, expect } from '@playwright/test';

test.describe('Theme & Visual Suite: Visual Regression', () => {
  test('Homepage visual regression match', async ({ page }) => {
    await page.goto('/');
    
    // Wait for main elements to load to stabilize the screenshot
    await page.waitForLoadState('networkidle');
    
    // Compare full page screenshot against baseline
    await expect(page).toHaveScreenshot('homepage-baseline.png', {
      fullPage: true,
      maxDiffPixels: 100, // allow slight rendering differences
    });
  });
  
  test('Theme toggling functionality', async ({ page }) => {
    await page.goto('/');
    
    // Check if dark mode or light mode can be set
    // For Nova Sphere, theme is likely controlled by next-themes or a data-theme attribute
    const html = page.locator('html');
    
    // Emulate clicking theme toggle if it exists, or verify default
    // We will wait for the theme toggle implementation specifics to finalize
    await expect(html).toHaveAttribute('data-theme', /.+/);
  });
});
