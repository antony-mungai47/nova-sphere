const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const outDir = "C:/Users/charl/.gemini/antigravity/brain/17f86a0d-ba69-4e6f-9890-3f7c5369343f";
  const baseUrl = "https://nova-sphere-d71zemdbr-antonymungai47-3536s-projects.vercel.app";
  
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Taking out of stock product screenshot...");
  await page.goto(`${baseUrl}/product/cmqfsoqox001ktxl4goef3gnf`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(outDir, "out_of_stock_product.png"), fullPage: false });
  
  await browser.close();
  console.log("Screenshots captured successfully.");
}

run().catch(console.error);
