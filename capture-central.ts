import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "https://central.alephica.eu";
const EMAIL = "admin@alephica.eu";
const PASSWORD = "admin123";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots-central");

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // Login
  console.log("=== LOGIN ===");
  await page.goto(`${BASE}/admin/login`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-login.png"), fullPage: true });
  console.log("  ✓ 01-login.png");

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);

  // Dashboard
  console.log("=== DASHBOARD ===");
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02-dashboard.png"), fullPage: true });
  console.log("  ✓ 02-dashboard.png");

  // Diseños lista
  console.log("=== DISEÑOS ===");
  await page.goto(`${BASE}/admin/designs`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03-designs-list.png"), fullPage: true });
  console.log("  ✓ 03-designs-list.png");

  // Diseño detalle
  const designLink = page.locator('a[href*="/admin/designs/"]').first();
  if (await designLink.count() > 0) {
    await designLink.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04-design-detail.png"), fullPage: true });
    console.log("  ✓ 04-design-detail.png");
  } else {
    console.log("  ✗ No design links found");
  }

  // Nuevo diseño
  await page.goto(`${BASE}/admin/designs/new`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-design-new.png"), fullPage: true });
  console.log("  ✓ 05-design-new.png");

  // Vendors lista
  console.log("=== VENDORS ===");
  await page.goto(`${BASE}/admin/vendors`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-vendors-list.png"), fullPage: true });
  console.log("  ✓ 06-vendors-list.png");

  // Vendor detalle
  const vendorLink = page.locator('a[href*="/admin/vendors/"]').first();
  if (await vendorLink.count() > 0) {
    await vendorLink.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-vendor-detail.png"), fullPage: true });
    console.log("  ✓ 07-vendor-detail.png");

    for (const tab of ["Places", "Ventas", "Wallet"]) {
      const tabBtn = page.locator(`button:has-text("${tab}")`).first();
      if (await tabBtn.count() > 0) {
        await tabBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `07-vendor-tab-${tab.toLowerCase()}.png`), fullPage: true });
        console.log(`  ✓ 07-vendor-tab-${tab.toLowerCase()}.png`);
      }
    }
  }

  // Tiendas
  console.log("=== TIENDAS ===");
  await page.goto(`${BASE}/admin/shops`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-shops-list.png"), fullPage: true });
  console.log("  ✓ 08-shops-list.png");

  const shopLink = page.locator('a[href*="/admin/shops/"]').first();
  if (await shopLink.count() > 0) {
    await shopLink.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "09-shop-detail.png"), fullPage: true });
    console.log("  ✓ 09-shop-detail.png");
  }

  // Sellers
  console.log("=== SELLERS ===");
  await page.goto(`${BASE}/admin/sellers`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "10-sellers-list.png"), fullPage: true });
  console.log("  ✓ 10-sellers-list.png");

  const sellerLink = page.locator('a[href*="/admin/sellers/"]').first();
  if (await sellerLink.count() > 0) {
    await sellerLink.click();
    await page.waitForTimeout(5000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "11-seller-detail.png"), fullPage: true });
    console.log("  ✓ 11-seller-detail.png");
  }

  // Places
  console.log("=== PLACES ===");
  await page.goto(`${BASE}/admin/places`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "12-places-list.png"), fullPage: true });
  console.log("  ✓ 12-places-list.png");

  // Devoluciones
  console.log("=== DEVOLUCIONES ===");
  await page.goto(`${BASE}/admin/returns`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "13-returns.png"), fullPage: true });
  console.log("  ✓ 13-returns.png");

  // Audit Log
  console.log("=== AUDIT LOG ===");
  await page.goto(`${BASE}/admin/audit-log`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "14-audit-log.png"), fullPage: true });
  console.log("  ✓ 14-audit-log.png");

  // Mobile captures
  console.log("\n=== MOBILE CAPTURES ===");
  await page.setViewportSize({ width: 375, height: 812 });

  const mobileCaptures: [string, string][] = [
    ["mobile-login", `${BASE}/admin/login`],
    ["mobile-dashboard", `${BASE}/admin`],
    ["mobile-designs", `${BASE}/admin/designs`],
    ["mobile-vendors", `${BASE}/admin/vendors`],
  ];

  for (const [name, url] of mobileCaptures) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `15-${name}.png`), fullPage: true });
    console.log(`  ✓ 15-${name}.png`);
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

main().catch((err) => { console.error(err); process.exit(1); });
