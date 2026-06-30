const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Create output dir if needed
  const outDir = "C:/Users/charl/.gemini/antigravity/brain/17f86a0d-ba69-4e6f-9890-3f7c5369343f";
  
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Taking homepage centered watermark screenshot...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });
  await page.screenshot({ path: path.join(outDir, "centered_watermark.png"), fullPage: false });
  
  console.log("Opening live support widget...");
  await page.click("button[aria-label='Live Support']");
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outDir, "live_support_widget.png"), fullPage: false });

  console.log("Taking out of stock product screenshot...");
  await page.goto("http://localhost:3000/product/cmqfsoqox001ktxl4goef3gnf", { waitUntil: "networkidle0" });
  // Wait for the out of stock text
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outDir, "out_of_stock_product.png"), fullPage: false });
  
  await browser.close();
  console.log("Screenshots captured successfully.");
}

run().catch(console.error);
