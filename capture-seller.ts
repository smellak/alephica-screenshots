import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "https://seller.alephica.eu";
const EMAIL = "admin-seller@alephica.eu";
const PASSWORD = "admin123";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots-seller");

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch();

  // ═══ MOBILE FIRST (375x812) — Seller es 100% mobile ═══
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, ignoreHTTPSErrors: true });
  const page = await mobile.newPage();

  console.log("=== LOGIN (mobile) ===");
  await page.goto(`${BASE}/auth/login`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-login-mobile.png"), fullPage: true });
  console.log("  ✓ 01-login-mobile.png");

  await page.fill('input[type="email"], input[name="email"]', EMAIL);
  await page.fill('input[type="password"], input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log("  Logged in → " + page.url());

  console.log("=== HOME (mobile) ===");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-home-mobile.png"), fullPage: true });
  console.log("  ✓ 02-home-mobile.png");

  console.log("=== SCAN (mobile) ===");
  await page.goto(`${BASE}/scan`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-scan-mobile.png"), fullPage: true });
  console.log("  ✓ 03-scan-mobile.png");

  console.log("=== MANUAL (mobile) ===");
  await page.goto(`${BASE}/manual`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-manual-mobile.png"), fullPage: true });
  console.log("  ✓ 04-manual-mobile.png");

  // Rellenar inputs de NUN si existen
  const nunInputs = page.locator('input[type="text"], input[inputmode="numeric"]');
  const inputCount = await nunInputs.count();
  if (inputCount >= 4) {
    await nunInputs.nth(0).fill("ES");
    await nunInputs.nth(1).fill("GR");
    await nunInputs.nth(2).fill("2603");
    await nunInputs.nth(3).fill("00005");
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04b-manual-filled.png"), fullPage: true });
    console.log("  ✓ 04b-manual-filled.png");
  }

  console.log("=== INVENTARIO (mobile) ===");
  await page.goto(`${BASE}/inventory`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-inventory-mobile.png"), fullPage: true });
  console.log("  ✓ 05-inventory-mobile.png");

  console.log("=== WALLET (mobile) ===");
  await page.goto(`${BASE}/wallet`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-wallet-mobile.png"), fullPage: true });
  console.log("  ✓ 06-wallet-mobile.png");

  console.log("=== NOTIFICACIONES (mobile) ===");
  await page.goto(`${BASE}/notifications`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-notifications-mobile.png"), fullPage: true });
  console.log("  ✓ 07-notifications-mobile.png");

  // Bottom nav states
  console.log("=== BOTTOM NAV ===");
  for (const [name, url] of [
    ["tab-inicio", `${BASE}/`],
    ["tab-inventario", `${BASE}/inventory`],
    ["tab-wallet", `${BASE}/wallet`],
  ]) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `08-${name}.png`), fullPage: false });
    console.log(`  ✓ 08-${name}.png`);
  }

  await mobile.close();

  // ═══ DESKTOP (1440x900) — ver cómo se adapta ═══
  console.log("\n=== DESKTOP CAPTURES ===");
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const dpage = await desktop.newPage();

  await dpage.goto(`${BASE}/auth/login`);
  await dpage.waitForTimeout(1000);
  await dpage.fill('input[type="email"], input[name="email"]', EMAIL);
  await dpage.fill('input[type="password"], input[name="password"]', PASSWORD);
  await dpage.click('button[type="submit"]');
  await dpage.waitForTimeout(4000);

  for (const [name, url] of [
    ["desktop-home", `${BASE}/`],
    ["desktop-scan", `${BASE}/scan`],
    ["desktop-inventory", `${BASE}/inventory`],
    ["desktop-wallet", `${BASE}/wallet`],
  ]) {
    await dpage.goto(url, { waitUntil: "networkidle" });
    await dpage.waitForTimeout(3000);
    await dpage.screenshot({ path: path.join(SCREENSHOT_DIR, `09-${name}.png`), fullPage: true });
    console.log(`  ✓ 09-${name}.png`);
  }

  await browser.close();

  console.log("\n=== SCREENSHOTS CAPTURED ===");
  const files = fs.readdirSync(SCREENSHOT_DIR).sort();
  for (const f of files) {
    const stat = fs.statSync(path.join(SCREENSHOT_DIR, f));
    console.log(`  ${f} (${Math.round(stat.size / 1024)}KB)`);
  }
  console.log(`\nTotal: ${files.length} screenshots in ${SCREENSHOT_DIR}`);
}

main().catch(console.error);
