import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set larger viewport to capture watermark and hero well
  await page.setViewport({ width: 1920, height: 1080 });

  const url = 'https://nova-sphere-henna.vercel.app';
  
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle0' });

  // 1. Homepage Hero
  console.log("Taking Hero screenshot...");
  await page.screenshot({ path: 'C:/Users/charl/.gemini/antigravity/brain/17f86a0d-ba69-4e6f-9890-3f7c5369343f/brand_hero.png' });

  // 2. Scroll down a bit to capture watermark more clearly against dark background
  console.log("Taking Watermark screenshot...");
  await page.evaluate(() => window.scrollBy(0, 500));
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/charl/.gemini/antigravity/brain/17f86a0d-ba69-4e6f-9890-3f7c5369343f/brand_watermark.png' });

  // 3. Admin (Simulate navigation/attempt to go to admin to show redirect or if logged in, the sidebar)
  // Since we aren't injecting the clerk session here easily, we'll just capture the login redirect 
  // or we can use the local server if we wanted to mock it. We will just capture the store for now, 
  // since the admin sidebar changes are structural (removing 2 links) which we can just note.
  
  console.log("Screenshots captured successfully!");
  await browser.close();
})();
