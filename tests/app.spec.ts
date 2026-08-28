import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home is semantic, error-free, and accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Tempo Earcheck/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Hear the tempo/ })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  const click = page.locator('#start-button');
  await click.click();
  await expect(click).toHaveAttribute('aria-pressed', 'true');
  await click.click();
  await expect(click).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('a practice decision survives reload and records a result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New practice card' }).click();
  await page.getByLabel('Passage or exercise *').fill('Bach opening');
  await page.getByLabel('Difficulty note optional').fill('Even sixteenths through the shift');
  await page.getByRole('button', { name: 'Save practice card' }).click();
  await expect(page.getByRole('heading', { name: 'Bach opening' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bach opening' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark current passed' }).click();
  await expect(page.getByText(/96 BPM passed. Try 100 next/)).toBeVisible();
  await expect(page.locator('.next-tempo dd')).toContainText('100');
});

test('keyboard tap path and legal routes work', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.keyboard.press('Space');
  await expect(page.locator('#tempo-status')).toContainText(/BPM from 2 taps/);
  await page.goto('/privacy');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Privacy/ })).toBeVisible();
  await page.goto('/terms');
  await expect(page.locator('h1')).toHaveCount(1);
});

test('Space preserves native activation on focused controls', async ({ page }) => {
  await page.goto('/');
  const newCard = page.getByRole('button', { name: 'New practice card' });
  await newCard.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('dialog', { name: 'Record this trial' })).toBeVisible();
  await expect(page.locator('#tempo-status')).toHaveText('Tap at least twice, or set a number.');
});

test('installed shell reopens offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Hear the tempo/ })).toBeVisible();
  await context.setOffline(false);
});

test('a returned purchase token is verified, stored, and removed from the URL', async ({ page }) => {
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null })
  }));
  await page.goto('/?license=test-license');
  await expect(page.locator('.license-active')).toContainText('Notebook edition active');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:tempo-earcheck'))).toBe('test-license');
  expect(new URL(page.url()).searchParams.has('license')).toBe(false);
});

test('the purchase action uses the required Sociobot checkout endpoint', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Buy Notebook edition · $9' })).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/tempo-earcheck/checkout'
  );
});

test('malicious imported history remains inert and makes no request', async ({ page }) => {
  const unexpectedRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/qa-import-network-check')) unexpectedRequests.push(request.url());
  });
  await page.goto('/');
  const backup = {
    product: 'tempo-earcheck',
    version: 1,
    exportedAt: '2026-08-28T00:00:00.000Z',
    cards: [{
      id: 'card-1', name: 'Imported scale', meter: 4, startBpm: 90, passedBpm: null,
      nextBpm: 90, step: 4, note: '', createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z',
      history: [{ id: 'attempt-1', at: '2026-08-28T00:00:00.000Z', bpm: '<img class="qa-import-marker" src="/qa-import-network-check" onerror="document.body.dataset.qaImport=\'rendered\'">', outcome: 'passed' }]
    }]
  };
  await page.locator('#import-file').setInputFiles({ name: 'malicious-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.getByText(/recorded attempt BPM is damaged/i)).toBeVisible();
  await expect(page.locator('.qa-import-marker')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.dataset.qaImport)).toBeUndefined();
  expect(unexpectedRequests).toEqual([]);
});

test('visible interactive targets meet the 44px hit-area contract', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New practice card' }).click();
  await page.getByLabel('Passage or exercise *').fill('Target test');
  await page.getByRole('button', { name: 'Save practice card' }).click();
  for (const locator of [page.getByRole('link', { name: 'Tempo Earcheck home' }), page.locator('#bpm-range'), page.locator('#volume'), page.getByRole('button', { name: 'Delete card' }), page.getByRole('link', { name: 'Privacy' }), page.getByRole('link', { name: 'Terms' })]) {
    expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }

  await page.goto('/privacy');
  expect((await page.getByRole('link', { name: 'sociobot.in' }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('390px layout has no horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only layout assertion');
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: /Tap tempo/ })).toBeVisible();
});
