import { test } from '@playwright/test';

test('screenshot auctions', async ({ page }) => {
  await page.goto('http://localhost:3000/auctions');
  // Wait for images
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'C:/Users/charl/.gemini/antigravity/brain/17f86a0d-ba69-4e6f-9890-3f7c5369343f/final_auctions.png', fullPage: true });
});
