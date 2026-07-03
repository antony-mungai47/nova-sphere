import { test, expect } from '@playwright/test';

test.describe('Nova Sphere - Auctions Bidding Engine', () => {
  test('Bidding requires authentication', async ({ page }) => {
    await page.goto('/auctions');
    // Assuming the first auction has a link to detail page
    const firstAuction = page.locator('[data-testid="auction-card-link"]').first();
    await firstAuction.click();
    
    // As guest, bid input should be disabled or redirect to login
    const bidBtn = page.locator('[data-testid="place-bid-btn"]');
    await expect(bidBtn).toBeDisabled();
    const loginPrompt = page.locator('[data-testid="login-to-bid-prompt"]');
    await expect(loginPrompt).toBeVisible();
  });

  // Mocking authenticated user would require auth state setup, which we simulate for PAT
  test('Prevents bid lower than current reserve/highest', async ({ page }) => {
    // Go to a simulated authenticated auction page
    await page.goto('/auctions/mock-active?testAuth=user1');
    
    const bidInput = page.locator('[data-testid="bid-amount-input"]');
    const bidBtn = page.locator('[data-testid="place-bid-btn"]');
    
    // Suppose current bid is $100. Try bidding $90.
    await bidInput.fill('90');
    await bidBtn.click();
    
    const errorToast = page.locator('[data-testid="bid-error-msg"]');
    await expect(errorToast).toContainText(/Bid must be higher/i);
  });
});
