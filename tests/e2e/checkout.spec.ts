import { test, expect } from '@playwright/test';

test.describe('Nova Sphere - Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to storefront and simulate adding a product to cart
    await page.goto('/store');
    // Assuming product card has a data-testid="add-to-cart-btn"
    const firstProductAddBtn = page.locator('[data-testid="add-to-cart-btn"]').first();
    await firstProductAddBtn.click();
    
    // Wait for the cart side-drawer or toaster to confirm
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
  });

  test('Guest Checkout Flow creates order successfully', async ({ page }) => {
    await page.goto('/checkout/simulate'); // Using the simulation route for PAT
    
    // Fill out shipping
    await page.fill('[name="firstName"]', 'John');
    await page.fill('[name="lastName"]', 'Doe');
    await page.fill('[name="email"]', 'john.doe@example.com');
    await page.fill('[name="address"]', '123 Enterprise Way');
    await page.fill('[name="city"]', 'San Francisco');
    await page.fill('[name="zipCode"]', '94105');

    // Submit Checkout
    await page.click('[data-testid="submit-checkout-btn"]');

    // Should redirect to success
    await expect(page).toHaveURL(/\/checkout\/success/);
    
    // Cart should be empty
    await page.goto('/store');
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
  });

  test('Out of stock items cannot be added to cart', async ({ page }) => {
    // Navigate to a known out of stock product URL, mocked in tests
    await page.goto('/product/out-of-stock-mock');
    const addBtn = page.locator('[data-testid="add-to-cart-btn"]');
    
    // Button should be disabled or explicitly say Sold Out
    await expect(addBtn).toBeDisabled();
    await expect(addBtn).toHaveText(/Sold Out/i);
  });
});
