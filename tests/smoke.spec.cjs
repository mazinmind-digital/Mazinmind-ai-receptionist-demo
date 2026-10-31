const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads demo and switches between main views', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /every call matters/i })).toBeVisible();
  await page.getByRole('button', { name: /settings/i }).click();
  await expect(page.locator('#view-settings')).toBeVisible();
  await page.getByRole('button', { name: /leads/i }).first().click();
  await expect(page.locator('#view-leads')).toBeVisible();
  await page.getByRole('button', { name: /live demo/i }).click();
  await expect(page.locator('#view-demo')).toBeVisible();
});

test('switches business profile', async ({ page }) => {
  await page.locator('#industry').selectOption('auto');
  await expect(page.locator('#profile-name')).toHaveText('Harborline Auto Repair');
  await page.locator('#industry').selectOption('general');
  await expect(page.locator('#profile-name')).toHaveText('MazinMind Service Desk');
});

test('saves missed-call lead and displays it in dashboard', async ({ page }) => {
  await page.locator('#caller-name').fill('Jordan Lee');
  await page.locator('#caller-contact').fill('jordan@example.com');
  await page.locator('#caller-service').fill('Leaking pipe');
  await page.getByRole('button', { name: /save demo lead/i }).click();
  await page.getByRole('button', { name: /leads/i }).first().click();
  await expect(page.locator('#total')).toHaveText('1');
  await expect(page.locator('#lead-list')).toContainText('Jordan Lee');
  await expect(page.locator('#lead-list')).toContainText('Leaking pipe');
});

test('persists settings and leads after reload', async ({ page }) => {
  await page.locator('#business-name').fill('Test Service Co');
  await page.locator('#business-description').fill('Playwright smoke test');
  await page.getByRole('button', { name: /save settings/i }).click();
  await page.locator('#caller-name').fill('Morgan Test');
  await page.locator('#caller-contact').fill('morgan@example.com');
  await page.locator('#caller-service').fill('Routine service');
  await page.getByRole('button', { name: /save demo lead/i }).click();
  await page.reload();
  await expect(page.locator('#business-name')).toHaveValue('Test Service Co');
  await page.getByRole('button', { name: /leads/i }).first().click();
  await expect(page.locator('#lead-list')).toContainText('Morgan Test');
});

test('chat captures a lead and flags urgent requests', async ({ page }) => {
  await page.locator('#message').fill('My name is Alex and I need urgent furnace repair');
  await page.locator('#chat-form button[type="submit"]').click();
  await page.locator('#message').fill('alex@example.com');
  await page.locator('#chat-form button[type="submit"]').click();
  await expect(page.locator('#lead-count')).toHaveText('1');
  await page.getByRole('button', { name: /leads/i }).first().click();
  await expect(page.locator('#lead-list')).toContainText('Alex');
  await expect(page.locator('#lead-list')).toContainText('Urgent');
});

test('renders without horizontal overflow on mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.locator('#chat-form')).toBeVisible();
});
