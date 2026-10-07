const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const OUT_DIR = path.join(__dirname, 'portfolio-screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Helper to take screenshot
  async function shot(name, waitMs = 1000) {
    await sleep(waitMs);
    const file = path.join(OUT_DIR, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`📸 ${name}.png`);
  }

  // Helper to wait for navigation
  async function go(url, name) {
    await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' });
    await shot(name);
  }

  console.log('🚀 Starting screenshot capture...');

  // 1. Login page
  await go('/', '01-login');
  // Fill login form - admin user
  await page.fill('input[name="email"], input[type="email"], input[id="email"]', 'admin@elfogon.com');
  await page.fill('input[name="password"], input[type="password"], input[id="password"]', 'password123');
  await page.click('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")');
  await page.waitForURL(/\/dashboard/, { timeout: 5000 }).catch(() => {});

  // 2. Dashboard
  await sleep(1500);
  await shot('02-dashboard');

  // 3. POS / Órdenes
  await page.goto(`${BASE_URL}/#/pos`, { waitUntil: 'networkidle' });
  await shot('03-pos');

  // 3b. POS with a table selected - click a table
  await page.click('button:has-text("Mesa 1"), [data-table-id="table-1"], .table-card:first-child').catch(() => {});
  await sleep(500);
  await shot('03b-pos-with-table');

  // 4. Kitchen
  await go('/#/kitchen', '04-kitchen');

  // 5. Tables
  await go('/#/tables', '05-tables');

  // 6. Reservations
  await go('/#/reservations', '06-reservations');

  // 7. Inventory
  await go('/#/inventory', '07-inventory');

  // 8. Payments
  await go('/#/payments', '08-payments');

  // 9. Reports
  await go('/#/reports', '09-reports');

  // 10. Menu
  await go('/#/menu', '10-menu');

  // 11. Settings
  await go('/#/settings', '11-settings');

  // 12. Notifications (new module)
  await go('/#/notifications', '12-notifications');

  // Mobile view - 375px
  await page.setViewportSize({ width: 375, height: 812 });
  await shot('13-mobile-dashboard');
  await page.goto(`${BASE_URL}/#/pos`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await shot('14-mobile-pos');
  await page.goto(`${BASE_URL}/#/notifications`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await shot('15-mobile-notifications');
  await page.goto(`${BASE_URL}/#/tables`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await shot('16-mobile-tables');

  // Notification bell dropdown - desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}/#/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1000);
  // Click notification bell
  await page.click('#notifBellToggle, button[aria-label="Notificaciones"]').catch(() => {});
  await sleep(500);
  await shot('17-notification-dropdown');

  // Role switcher - change to chef
  await page.click('#demo-role-switcher-container button, button:has-text("Cambiar rol"), [data-lucide="user"]').catch(() => {});
  await sleep(300);
  await page.click('text=Cocinero, text=Chef, [data-role="chef"]').catch(() => {});
  await sleep(500);
  await shot('18-chef-role');

  // Kitchen view as chef
  await go('/#/kitchen', '19-kitchen-chef');

  // Role switcher - change to waiter
  await page.click('#demo-role-switcher-container button, button:has-text("Cambiar rol"), [data-lucide="user"]').catch(() => {});
  await sleep(300);
  await page.click('text=Mesero, text=Waiter, [data-role="waiter"]').catch(() => {});
  await sleep(500);
  await shot('20-waiter-role');

  // POS as waiter
  await go('/#/pos', '21-pos-waiter');

  // Role switcher - change to cashier
  await page.click('#demo-role-switcher-container button, button:has-text("Cambiar rol"), [data-lucide="user"]').catch(() => {});
  await sleep(300);
  await page.click('text=Cajero, text=Cashier, [data-role="cashier"]').catch(() => {});
  await sleep(500);
  await shot('22-cashier-role');

  // Payments as cashier
  await go('/#/payments', '23-payments-cashier');

  // Mobile notification dropdown
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE_URL}/#/dashboard`, { waitUntil: 'networkidle' });
  await sleep(1000);
  await page.click('#notifBellToggle, button[aria-label="Notificaciones"]').catch(() => {});
  await sleep(500);
  await shot('24-mobile-notification-dropdown');

  console.log('✅ All screenshots captured!');
  await browser.close();
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});