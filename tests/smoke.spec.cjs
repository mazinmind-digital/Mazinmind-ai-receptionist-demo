const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('shows clear top navigation and switches between all main views', async ({ page }) => {
  await expect(page.getByRole('button', { name: /receptionist/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /chatbot/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /dashboard/i }).first()).toBeVisible();
  await page.getByRole('button', { name: /chatbot/i }).first().click();
  await expect(page.locator('#view-chatbot')).toBeVisible();
  await expect(page.getByRole('heading', { name: /try a customer conversation/i })).toBeVisible();
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await expect(page.locator('#view-leads')).toBeVisible();
  await page.getByRole('button', { name: /settings/i }).first().click();
  await expect(page.locator('#view-settings')).toBeVisible();
  await page.getByRole('button', { name: /receptionist/i }).first().click();
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
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await expect(page.locator('#total')).toHaveText('1');
  await expect(page.locator('#lead-list')).toContainText('Jordan Lee');
  await expect(page.locator('#lead-list')).toContainText('Leaking pipe');
});

test('persists settings and leads after reload', async ({ page }) => {
  await page.getByRole('button', { name: /settings/i }).first().click();
  await page.locator('#business-name').fill('Test Service Co');
  await page.locator('#business-description').fill('Playwright smoke test');
  await page.getByRole('button', { name: /save settings/i }).click();
  await page.getByRole('button', { name: /receptionist/i }).first().click();
  await page.locator('#caller-name').fill('Morgan Test');
  await page.locator('#caller-contact').fill('morgan@example.com');
  await page.locator('#caller-service').fill('Routine service');
  await page.getByRole('button', { name: /save demo lead/i }).click();
  await page.reload();
  await page.getByRole('button', { name: /settings/i }).first().click();
  await expect(page.locator('#business-name')).toHaveValue('Test Service Co');
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await expect(page.locator('#lead-list')).toContainText('Morgan Test');
});

test('chatbot captures a lead and flags urgent requests', async ({ page }) => {
  await page.getByRole('button', { name: /chatbot/i }).first().click();
  await page.locator('#message').fill('My name is Alex and I need urgent furnace repair');
  await page.locator('#chat-form button').click();
  await page.locator('#message').fill('alex@example.com');
  await page.locator('#chat-form button').click();
  await expect(page.locator('#top-count')).toHaveText('1');
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await expect(page.locator('#lead-list')).toContainText('Alex');
  await expect(page.locator('#lead-list')).toContainText('Urgent');
});

test('dashboard shortcut works from chatbot and responsive layout has no horizontal overflow', async ({ page }) => {
  await page.getByRole('button', { name: /chatbot/i }).first().click();
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await expect(page.locator('#view-leads')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth
  }));
  expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole('button', { name: /dashboard/i }).first()).toBeVisible();
  await expect(page.locator('#view-demo')).toBeVisible();
});


test('search, status filters, and lead status changes stay in sync', async ({ page }) => {
  await page.locator('#caller-name').fill('Casey Example');
  await page.locator('#caller-contact').fill('casey@example.com');
  await page.locator('#caller-service').fill('Brake inspection');
  await page.getByRole('button', { name: /save demo lead/i }).click();
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await page.locator('#search').fill('brake');
  await expect(page.locator('#lead-list')).toContainText('Casey Example');
  await page.locator('#search').fill('does-not-exist');
  await expect(page.locator('#lead-list')).toContainText('No matching leads');
  await page.locator('#search').fill('');
  await page.locator('#lead-list select').selectOption('Contacted');
  await expect(page.locator('#lead-list select')).toHaveValue('Contacted');
  await page.locator('#filter').selectOption('New');
  await expect(page.locator('#lead-list')).toContainText('No matching leads');
  await page.locator('#filter').selectOption('Contacted');
  await expect(page.locator('#lead-list')).toContainText('Casey Example');
});

test('malformed localStorage does not prevent the redesigned demo from loading', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('mazinmind-demo', '{not valid json'));
  await page.reload();
  await expect(page.getByRole('heading', { name: /every call matters/i })).toBeVisible();
  await expect(page.locator('#profile-name')).toHaveText('Northstar Heating & Plumbing');
});

test('lead text is rendered as text rather than executable HTML', async ({ page }) => {
  await page.evaluate(() => { window.__md3XssExecuted = false; });
  await page.locator('#caller-name').fill('<img src=x onerror=window.__md3XssExecuted=true>');
  await page.locator('#caller-contact').fill('safe@example.com');
  await page.locator('#caller-service').fill('<script>window.__md3XssExecuted=true</script>');
  await page.getByRole('button', { name: /save demo lead/i }).click();
  await page.getByRole('button', { name: /dashboard/i }).first().click();
  await expect(page.locator('#lead-list')).toContainText('<img src=x onerror=window.__md3XssExecuted=true>');
  await expect(page.locator('#lead-list img, #lead-list script')).toHaveCount(0);
  expect(await page.evaluate(() => window.__md3XssExecuted)).toBe(false);
});

test('missed-call recovery remains simulated and sends no SMS', async ({ page }) => {
  await expect(page.getByText(/message preview · not sent/i)).toBeVisible();
  await page.locator('#caller-name').fill('Taylor Demo');
  await page.locator('#caller-contact').fill('taylor@example.com');
  await page.locator('#caller-service').fill('Routine maintenance');
  await page.getByRole('button', { name: /save demo lead/i }).click();
  await expect(page.getByRole('status')).toContainText(/no sms was sent/i);
});
