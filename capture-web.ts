import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "https://alephica.eu";
const SCREENSHOT_DIR = path.join(__dirname, "screenshots-web");

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const browser = await chromium.launch();

  // ═══ DESKTOP (1440x900) — Landing es desktop-first ═══
  console.log("=== DESKTOP CAPTURES ===");
  const desktop = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await desktop.newPage();

  // Landing — home completa
  console.log("=== LANDING ===");
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-landing-hero.png"), fullPage: false });
  console.log("  ✓ 01-landing-hero.png (above the fold)");
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01-landing-full.png"), fullPage: true });
  console.log("  ✓ 01-landing-full.png (full page)");

  // Navbar estado
  const navbar = page.locator("nav").first();
  if (await navbar.count() > 0) {
    await navbar.screenshot({ path: path.join(SCREENSHOT_DIR, "02-navbar.png") });
    console.log("  ✓ 02-navbar.png");
  }

  // Scroll a cada sección de la landing y capturar
  const sections = [
    { name: "featured-designs", selector: 'section:has-text("Diseños"), [class*="featured"], [class*="designs"]' },
    { name: "how-it-works", selector: 'section:has-text("Cómo funciona"), [class*="how-it-works"]' },
    { name: "for-vendors", selector: 'section:has-text("vendor"), section:has-text("Vendor"), section:has-text("emprendedor")' },
    { name: "for-shops", selector: 'section:has-text("tienda"), section:has-text("seller"), section:has-text("Tienda")' },
    { name: "vendor-kit", selector: 'section:has-text("kit"), section:has-text("sublimación"), section:has-text("equipo")' },
    { name: "street-videos", selector: 'section:has-text("calle"), section:has-text("vídeo"), section:has-text("video")' },
    { name: "cta-final", selector: 'section:has-text("Empieza"), section:has-text("únete"), section:has-text("Comienza")' },
  ];

  for (const { name, selector } of sections) {
    try {
      const section = page.locator(selector).first();
      if (await section.count() > 0) {
        await section.scrollIntoViewIfNeeded();
        await page.waitForTimeout(1000);
        await section.screenshot({ path: path.join(SCREENSHOT_DIR, `03-section-${name}.png`) });
        console.log(`  ✓ 03-section-${name}.png`);
      } else {
        console.log(`  ✗ Section "${name}" not found`);
      }
    } catch (e) {
      console.log(`  ✗ Section "${name}" error: ${(e as Error).message.slice(0, 60)}`);
    }
  }

  // Footer
  const footer = page.locator("footer").first();
  if (await footer.count() > 0) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await footer.screenshot({ path: path.join(SCREENSHOT_DIR, "04-footer.png") });
    console.log("  ✓ 04-footer.png");
  }

  // Catálogo de diseños
  console.log("\n=== CATÁLOGO ===");
  await page.goto(`${BASE}/designs`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05-designs-catalog.png"), fullPage: true });
  console.log("  ✓ 05-designs-catalog.png");

  // QR Page — NUN válido
  console.log("\n=== QR PAGES ===");
  await page.goto(`${BASE}/nun/NUN-ES-GR-2603-00005`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06-qr-page-desktop.png"), fullPage: true });
  console.log("  ✓ 06-qr-page-desktop.png");

  // QR Page — otro NUN
  await page.goto(`${BASE}/nun/NUN-ES-GR-2603-00001`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06b-qr-page-2-desktop.png"), fullPage: true });
  console.log("  ✓ 06b-qr-page-2-desktop.png");

  // QR Page — idioma EN
  await page.goto(`${BASE}/nun/NUN-ES-GR-2603-00005?lang=en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06c-qr-page-english.png"), fullPage: true });
  console.log("  ✓ 06c-qr-page-english.png");

  // QR Page — idioma FR
  await page.goto(`${BASE}/nun/NUN-ES-GR-2603-00005?lang=fr`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06d-qr-page-french.png"), fullPage: true });
  console.log("  ✓ 06d-qr-page-french.png");

  // 404 QR — NUN inválido
  console.log("\n=== 404 PAGES ===");
  await page.goto(`${BASE}/nun/NUN-XX-XX-0000-99999`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07-404-qr-parchment.png"), fullPage: true });
  console.log("  ✓ 07-404-qr-parchment.png");

  // 404 genérico
  await page.goto(`${BASE}/pagina-que-no-existe`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07b-404-generic.png"), fullPage: true });
  console.log("  ✓ 07b-404-generic.png");

  // robots.txt
  console.log("\n=== SEO ===");
  await page.goto(`${BASE}/robots.txt`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08-robots-txt.png"), fullPage: true });
  console.log("  ✓ 08-robots-txt.png");

  // sitemap.xml
  await page.goto(`${BASE}/sitemap.xml`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08b-sitemap-xml.png"), fullPage: true });
  console.log("  ✓ 08b-sitemap-xml.png");

  await desktop.close();

  // ═══ MOBILE (375x812) ═══
  console.log("\n=== MOBILE CAPTURES ===");
  const mobile = await browser.newContext({
    viewport: { width: 375, height: 812 },
    ignoreHTTPSErrors: true,
  });
  const mpage = await mobile.newPage();

  await mpage.goto(BASE, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "09-mobile-landing-hero.png"), fullPage: false });
  console.log("  ✓ 09-mobile-landing-hero.png");
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "09-mobile-landing-full.png"), fullPage: true });
  console.log("  ✓ 09-mobile-landing-full.png");

  // Hamburger menu
  const hamburger = mpage.locator('button[aria-label*="enú"], button[aria-label*="enu"], nav button').first();
  if (await hamburger.count() > 0) {
    try {
      await hamburger.click();
      await mpage.waitForTimeout(1000);
      await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "09b-mobile-menu-open.png"), fullPage: false });
      console.log("  ✓ 09b-mobile-menu-open.png");
    } catch (e) {
      console.log("  ✗ hamburger click failed");
    }
  }

  await mpage.goto(`${BASE}/designs`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "10-mobile-designs.png"), fullPage: true });
  console.log("  ✓ 10-mobile-designs.png");

  await mpage.goto(`${BASE}/nun/NUN-ES-GR-2603-00005`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "11-mobile-qr-page.png"), fullPage: true });
  console.log("  ✓ 11-mobile-qr-page.png");

  await mpage.goto(`${BASE}/nun/NUN-XX-XX-0000-99999`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(2000);
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "12-mobile-404-qr.png"), fullPage: true });
  console.log("  ✓ 12-mobile-404-qr.png");

  // Tablet
  console.log("\n=== TABLET CAPTURES ===");
  await mpage.setViewportSize({ width: 768, height: 1024 });
  await mpage.goto(BASE, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "13-tablet-landing.png"), fullPage: false });
  console.log("  ✓ 13-tablet-landing.png");

  await mpage.goto(`${BASE}/nun/NUN-ES-GR-2603-00005`, { waitUntil: "networkidle" });
  await mpage.waitForTimeout(3000);
  await mpage.screenshot({ path: path.join(SCREENSHOT_DIR, "13b-tablet-qr-page.png"), fullPage: true });
  console.log("  ✓ 13b-tablet-qr-page.png");

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
