import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// Need to create a signin token via Clerk backend
const clerkSecretKey = process.env.CLERK_SECRET_KEY || 'sk_test_31Z5CMvpxxxQwPNnegXNcsfNXq6NQOQreC8ln1xhNu';

async function generateSignInToken(userId: string) {
  const response = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: userId })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create token: ${await response.text()}`);
  }
  
  const data = await response.json();
  return data.url;
}

const SCREENSHOT_DIR = path.join(__dirname, '..', 'pat_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function runUITests() {
  console.log("Starting Puppeteer for PAT UI Validation...");
  
  // Use a testing token for the known SUPER_ADMIN user
  const clerkUserId = 'user_3FAbPk8zkDVEXEZZuZCVE9KTGvf';
  console.log(`Generating Clerk Sign-In Token for SUPER_ADMIN (${clerkUserId})...`);
  const signInUrl = await generateSignInToken(clerkUserId);
  console.log(`Token generated!`);
  
  // Launch headless since we don't need manual intervention anymore!
  const browser = await puppeteer.launch({ 
    headless: "new",
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:3000/");
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await delay(2000);

  // 1. Homepage Screenshots (Unauthenticated)
  console.log("Capturing Homepage Header...");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_homepage_header.png') });
  
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await delay(1000);
  console.log("Capturing Homepage Watermark...");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_homepage_watermark.png') });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await delay(1000);
  console.log("Capturing Footer...");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_footer.png') });

  // 2. Auth Pages
  console.log("Navigating to /login...");
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_login_page.png') });

  console.log("Navigating to /register...");
  await page.goto('http://localhost:3000/register', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_register_page.png') });

  // 3. Automated Login via Clerk Token
  console.log("Authenticating via Clerk Sign-In Token...");
  await page.goto(signInUrl);
  await delay(5000); // Wait for Clerk to redirect
  
  // Navigate explicitly to /admin now that we are authenticated
  await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  console.log("Authentication successful. Captured Admin Portal.");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_admin_dashboard.png') });

  // 4. Admin Portal Screenshots
  const adminRoutes = [
    { url: '/admin/products', name: '07_admin_products.png' },
    { url: '/admin/orders', name: '08_admin_orders.png' },
    { url: '/admin/customers', name: '09_admin_customers.png' },
    { url: '/admin/analytics', name: '10_admin_analytics.png' },
    { url: '/admin/settings', name: '11_admin_settings.png' },
  ];

  for (const route of adminRoutes) {
    console.log(`Navigating to ${route.url}...`);
    await page.goto(`http://localhost:3000${route.url}`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, route.name) });
  }

  // 5. StoreSettings Verification (Modify Branding)
  console.log("Starting StoreSettings Verification Workflow...");
  await page.goto('http://localhost:3000/admin/settings', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  
  console.log("Modifying primary color and watermark opacity...");
  // Clear and type new primary color
  await page.evaluate(() => {
    const primaryColorInput = document.querySelector('input[name="primaryColor"]');
    if (primaryColorInput) {
      primaryColorInput.value = '#FF0055'; // Change to a pink/red for clear visual change
      primaryColorInput.dispatchEvent(new Event('input', { bubbles: true }));
      primaryColorInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    const watermarkOpacityInput = document.querySelector('input[name="watermarkOpacity"]');
    if (watermarkOpacityInput) {
      watermarkOpacityInput.value = '0.5'; // Make it very visible
      watermarkOpacityInput.dispatchEvent(new Event('input', { bubbles: true }));
      watermarkOpacityInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_settings_modified_before_save.png') });
  
  // Click save
  const saveBtn = await page.$('button[type="submit"]');
  if (saveBtn) {
    await saveBtn.click();
    console.log("Settings saved. Waiting for response...");
    await delay(3000); // give it time to save to DB and revalidate
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_settings_after_save.png') });
  }

  // Refresh page to confirm persistence
  console.log("Refreshing to confirm persistence...");
  await page.reload({ waitUntil: 'domcontentloaded' });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_settings_after_refresh.png') });

  // Check storefront for changes
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await delay(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_homepage_with_new_settings.png') });

  // 6. Security Verification
  // Test unauthorized route protection (Logout, then try /admin)
  console.log("Testing unauthorized access restrictions...");
  // Use Clerk's signOut method if possible, or just clear cookies
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  console.log("Cleared cookies. Navigating to /admin...");
  
  await page.goto('http://localhost:3000/admin');
  await delay(3000); // wait for redirect

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_unauthorized_admin_redirect.png') });

  console.log("Closing browser.");
  await browser.close();
  console.log("PAT UI Validation Complete!");
}

runUITests().catch(console.error);
