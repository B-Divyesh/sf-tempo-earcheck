import { expect, test, type Page } from '@playwright/test';

const checkoutUrl = 'https://api.sociobot.in/api/v1/products/tempo-earcheck/checkout';

async function openDemo(page: Page): Promise<void> {
  await page.goto('/demo');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.practice-card')).toHaveCount(3);
}

async function addCard(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'New practice card' }).click();
  await page.locator('#card-name').fill(name);
  await page.getByRole('button', { name: 'Save practice card' }).click();
  await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
}

test('sample changes never reach the real notebook @claim:demo-isolation', async ({ page }) => {
  await page.goto('/');
  await addCard(page, 'My real warm-up');

  await openDemo(page);
  await expect(page.getByRole('heading', { name: 'My real warm-up' })).toHaveCount(0);
  await addCard(page, 'Changed sample card');
  await page.locator('#bpm-number').fill('150');
  await page.locator('#bpm-number').blur();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.practice-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Changed sample card' })).toHaveCount(0);
  await expect(page.locator('#bpm-output strong')).toHaveText('96');
  await addCard(page, 'Changed sample card');
  await page.getByRole('button', { name: 'Start for real' }).click();

  await expect(page).toHaveURL(/\/#earcheck$/);
  await expect(page.getByRole('heading', { name: 'My real warm-up' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Changed sample card' })).toHaveCount(0);

  await page.goto('/demo');
  await expect(page.locator('.practice-card')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Changed sample card' })).toHaveCount(0);

  await page.goto('/?demo=1');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('.practice-card')).toHaveCount(3);
});

test('the sample notebook reloads offline @claim:offline-reload', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await openDemo(page);
    await addCard(page, 'Offline scale pattern');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Cello shift study' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Offline scale pattern' })).toBeVisible();
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test('the demo has an installable app shell @claim:installable-pwa', async ({ page }) => {
  await openDemo(page);
  const manifestResponse = await page.request.get('/manifest.webmanifest');
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json() as { display: string; start_url: string; icons: Array<{ sizes: string; purpose?: string }> };
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toMatch(/^\/?\?v=/);
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(true);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
});

test('two steady taps calculate tempo @claim:tap-tempo', async ({ page }) => {
  await openDemo(page);
  await page.locator('body').click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.keyboard.press('Space');
  await expect(page.locator('#tempo-status')).toContainText('BPM from 2 taps');
  const result = Number(await page.locator('#bpm-output strong').textContent());
  expect(result).toBeGreaterThanOrEqual(90);
  expect(result).toBeLessThanOrEqual(140);
});

test('tempo input enforces both BPM boundaries @claim:bpm-range', async ({ page }) => {
  await openDemo(page);
  const input = page.locator('#bpm-number');
  await input.fill('29');
  await input.blur();
  await expect(page.locator('#bpm-output strong')).toHaveText('30');
  await input.fill('241');
  await input.blur();
  await expect(page.locator('#bpm-output strong')).toHaveText('240');
});

test('listed boundary meters play an accented first beat @claim:accented-meter', async ({ page }) => {
  await page.addInitScript(() => {
    const frequencies: number[] = [];
    class TestAudioContext {
      currentTime = 0;
      destination = {};
      resume = () => Promise.resolve();
      createOscillator() {
        const frequency = { value: 0 };
        return {
          frequency,
          connect: <T>(node: T) => node,
          start: () => frequencies.push(frequency.value),
          stop: () => undefined
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined },
          connect: <T>(node: T) => node
        };
      }
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: TestAudioContext });
    (window as unknown as { __claimFrequencies: number[] }).__claimFrequencies = frequencies;
  });
  await openDemo(page);
  const meters = ['2', '3', '4', '5', '6', '7', '9', '12'];
  expect(await page.locator('#meter option').evaluateAll((options) => options.map((option) => option.getAttribute('value')))).toEqual(meters);
  for (const meter of meters) {
    await page.locator('#meter').selectOption(meter);
    await expect(page.locator('.beat-cell')).toHaveCount(Number(meter));
    await page.locator('#start-button').click();
    await expect(page.locator('#tempo-status')).toContainText('Beat one is accented');
    await expect(page.locator('#start-button')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#start-button').click();
  }
  expect(await page.evaluate(() => (window as unknown as { __claimFrequencies: number[] }).__claimFrequencies)).toEqual(meters.map(() => 1260));
});

test('the local click uses no microphone or audio file @claim:local-click', async ({ page }) => {
  const mediaRequests: string[] = [];
  await page.addInitScript(() => {
    (window as unknown as { __microphoneCalls: number }).__microphoneCalls = 0;
    if (navigator.mediaDevices) {
      Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
        configurable: true,
        value: () => {
          (window as unknown as { __microphoneCalls: number }).__microphoneCalls += 1;
          return Promise.reject(new Error('Microphone must not be requested.'));
        }
      });
    }
  });
  page.on('request', (request) => {
    if (request.resourceType() === 'media' || /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(request.url())) mediaRequests.push(request.url());
  });
  await openDemo(page);
  await page.locator('#start-button').click();
  await expect(page.locator('#start-button')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#start-button').click();
  expect(await page.evaluate(() => (window as unknown as { __microphoneCalls: number }).__microphoneCalls)).toBe(0);
  expect(mediaRequests).toEqual([]);
  await expect(page.locator('audio, video, input[accept*="audio"], input[accept*="video"]')).toHaveCount(0);
  await expect(page.locator('[data-performance-score]')).toHaveCount(0);
});

test('a sample card exposes every recorded practice field @claim:practice-card-fields', async ({ page }) => {
  await openDemo(page);
  const card = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  await expect(card).toContainText('4/4');
  await expect(card).toContainText('Third-position shift stays clean');
  await expect(card.locator('.tempo-ledger')).toContainText('Started');
  await expect(card.locator('.tempo-ledger')).toContainText('72');
  await expect(card.locator('.tempo-ledger')).toContainText('Last passed');
  await expect(card.locator('.tempo-ledger')).toContainText('80');
  await expect(card.locator('.tempo-ledger')).toContainText('Try next');
  await expect(card.locator('.tempo-ledger')).toContainText('84');
});

test('attempt history shows dated passed and needs-work results @claim:attempt-history', async ({ page }) => {
  await openDemo(page);
  const card = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  await card.locator('summary').click();
  await expect(card.locator('.history li')).toHaveCount(3);
  await expect(card.locator('.history')).toContainText('Passed');
  await expect(card.locator('.history')).toContainText('Needs work');
  const dates = await card.locator('.history time').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('datetime')));
  expect(dates).toHaveLength(3);
  expect(dates.every((value) => value && Number.isFinite(Date.parse(value)))).toBe(true);
});

test('a recorded result persists after reload @claim:card-persistence', async ({ page }) => {
  await openDemo(page);
  expect(await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name))).toContain('demo:tempo-earcheck');
  const card = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  await card.getByRole('button', { name: 'Mark current passed' }).click();
  await expect(page.locator('.practice-card').filter({ hasText: 'Cello shift study' }).locator('summary')).toContainText('6');
  await page.reload();
  await expect(page.locator('.practice-card').filter({ hasText: 'Cello shift study' }).locator('summary')).toContainText('6');
});

test('matching imports keep only the newest edit @claim:newest-import', async ({ page }) => {
  await openDemo(page);
  page.on('dialog', (dialog) => dialog.accept());
  const base = {
    id: 'sample-cello-shifts', meter: 4, startBpm: 72, passedBpm: 80, nextBpm: 84, step: 4,
    note: 'Imported note', createdAt: '2026-08-28T18:10:00.000Z', history: []
  };
  const importCard = async (name: string, updatedAt: string) => {
    const backup = { product: 'tempo-earcheck', cards: [{ ...base, name, updatedAt }] };
    await page.locator('#import-file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  };
  await importCard('Older imported name', '2026-09-01T00:00:00.000Z');
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Older imported name' })).toHaveCount(0);
  await importCard('Newest imported name', '2026-09-05T00:00:00.000Z');
  await expect(page.getByRole('heading', { name: 'Newest imported name' })).toBeVisible();
});

test('JSON export contains every sample card @claim:json-export', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-json').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const payload = JSON.parse(Buffer.concat(chunks).toString()) as { product: string; cards: Array<{ name: string; note: string }> };
  expect(payload.product).toBe('tempo-earcheck');
  expect(payload.cards).toHaveLength(3);
  expect(payload.cards.map((card) => card.name)).toContain('Cello shift study');
  expect(payload.cards.every((card) => card.note.length > 0)).toBe(true);
});

test('CSV export has a header and one row per sample card @claim:csv-export', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-csv').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const rows = Buffer.concat(chunks).toString().trim().split('\n');
  expect(rows[0]).toContain('"Name","Meter","Starting BPM"');
  expect(rows).toHaveLength(4);
  expect(rows.join('\n')).toContain('"Cello shift study"');
});

test('the three documented keyboard controls work @claim:keyboard-controls', async ({ page }) => {
  await openDemo(page);
  await page.locator('body').click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('Space');
  await expect(page.locator('#tempo-status')).toContainText('One tap heard');
  await page.keyboard.press('m');
  await expect(page.locator('#start-button')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('m');
  await expect(page.locator('#start-button')).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'New practice card' }).click();
  await expect(page.locator('#card-dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#card-dialog')).toBeHidden();
});

test('the free notebook stops at five cards @claim:free-card-limit', async ({ page }) => {
  await openDemo(page);
  await addCard(page, 'Arpeggio pattern');
  await addCard(page, 'Long-tone set');
  await expect(page.locator('.practice-card')).toHaveCount(5);
  await page.getByRole('button', { name: 'New practice card' }).click();
  await expect(page.getByText('The free edition holds 5 cards.')).toBeVisible();
  await expect(page.locator('#card-dialog')).toBeHidden();
  await expect(page.locator('.practice-card')).toHaveCount(5);
});

test('free history shows three entries while JSON keeps all five @claim:history-limit', async ({ page }) => {
  await openDemo(page);
  const card = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  await card.locator('summary').click();
  await expect(card.locator('.history li')).toHaveCount(3);
  await expect(card.getByText('Notebook edition shows all 5 attempts.')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-json').click();
  const stream = await (await downloadPromise).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  const payload = JSON.parse(Buffer.concat(chunks).toString()) as { cards: Array<{ id: string; history: unknown[] }> };
  expect(payload.cards.find((item) => item.id === 'sample-cello-shifts')?.history).toHaveLength(5);
});

test('the paid action opens the registered $9 hosted offer @claim:paid-offer', async ({ browser, request }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', serviceWorkers: 'block' });
  await context.route('https://api.sociobot.in/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null })
  }));
  const page = await context.newPage();
  await openDemo(page);
  const panel = page.locator('#edition');
  await expect(panel).toContainText('$9 once');
  await expect(panel).toContainText('unlimited cards');
  await expect(panel).toContainText('complete on-screen history');
  await expect(panel).toContainText('1–24 BPM step');
  await expect(panel.getByRole('link', { name: 'Buy Notebook edition · $9' })).toHaveAttribute('href', checkoutUrl);

  await page.goto('/demo?license=paid-claim-token');
  await expect(page.locator('.license-active')).toContainText('Notebook edition active');

  const historyCard = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  await historyCard.locator('summary').click();
  await expect(historyCard.locator('.history li')).toHaveCount(5);
  await page.getByRole('button', { name: 'New practice card' }).click();
  await page.locator('#card-name').fill('Chromatic run');
  await page.locator('#card-step').fill('3');
  await page.getByRole('button', { name: 'Save practice card' }).click();
  await addCard(page, 'Scale sequence');
  await addCard(page, 'Ensemble opening');
  await expect(page.locator('.practice-card')).toHaveCount(6);
  await expect(page.locator('.practice-card').filter({ hasText: 'Chromatic run' })).toContainText('+3');

  const response = await request.get(checkoutUrl, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  const location = response.headers().location;
  expect(location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\/cks_/);
  await page.goto(location);
  await expect(page.locator('body')).toContainText('Tempo Earcheck — Notebook edition', { timeout: 30_000 });
  await expect(page.locator('body')).toContainText('$9.00');
  await context.close();
});

test('sample practice data stays on the product origin @claim:local-practice-data', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.locator('#bpm-number').fill('132');
  await page.locator('#bpm-number').blur();
  await page.locator('#meter').selectOption('7');
  await page.locator('#volume').fill('12');
  await page.locator('.practice-card').first().getByRole('button', { name: 'Mark current passed' }).click();
  await addCard(page, 'Private sample exercise');
  expect(await page.evaluate(() => ({
    bpm: localStorage.getItem('demo:tempo:bpm'),
    meter: localStorage.getItem('demo:tempo:meter'),
    realBpm: localStorage.getItem('tempo:bpm')
  }))).toEqual({ bpm: '132', meter: '7', realBpm: null });
  const origins = [...new Set(requests.map((url) => new URL(url).origin))];
  expect(origins).toEqual(['http://127.0.0.1:4173']);
});

test('the demo loads no tracking or third-party runtime assets @claim:no-tracking-assets', async ({ page }) => {
  const requests: Array<{ url: string; type: string }> = [];
  page.on('request', (request) => requests.push({ url: request.url(), type: request.resourceType() }));
  await openDemo(page);
  await page.locator('#start-button').click();
  await page.locator('#start-button').click();
  expect(requests.filter((item) => new URL(item.url).origin !== 'http://127.0.0.1:4173')).toEqual([]);
  expect(requests.filter((item) => ['font', 'media'].includes(item.type))).toEqual([]);
  expect(requests.some((item) => /analytics|doubleclick|googletagmanager/i.test(item.url))).toBe(false);
  await expect(page.locator('iframe, script[src^="http"]')).toHaveCount(0);
});

test('a cached license is verified once within a day @claim:license-daily', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173', serviceWorkers: 'block' });
  const page = await context.newPage();
  let verificationRequests = 0;
  await context.route('https://api.sociobot.in/**', (route) => {
    verificationRequests += 1;
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/demo?license=claim-token');
  await expect(page.locator('.license-active')).toContainText('Notebook edition active');
  await page.reload();
  await expect(page.locator('.license-active')).toContainText('Notebook edition active');
  expect(verificationRequests).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:tempo-earcheck'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('demo:sb_license:tempo-earcheck'))).toBe('claim-token');
  await context.close();
});

test('click volume starts halfway along its control @claim:default-volume', async ({ page }) => {
  await openDemo(page);
  const values = await page.locator('#volume').evaluate((element: HTMLInputElement) => ({ value: Number(element.value), max: Number(element.max) }));
  expect(values.value / values.max).toBe(0.5);
  await expect(page.locator('#volume-value')).toHaveText('50%');
  await expect(page.getByText('Click volume starts at 50% of this control.')).toBeVisible();
});

test('a deleted card can be restored immediately @claim:card-delete', async ({ page }) => {
  await openDemo(page);
  page.once('dialog', (dialog) => dialog.accept());
  const card = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  await card.getByRole('button', { name: 'Delete card' }).click();
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toBeVisible();
});

test('license restore accepts valid and rejects inactive tokens @claim:license-restore', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4173' });
  const page = await context.newPage();
  let valid = true;
  await context.route('https://api.sociobot.in/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ valid, reason: valid ? 'ok' : 'revoked', expires_at: null })
  }));
  await openDemo(page);
  await page.getByText('Have a license? Restore it').click();
  await page.locator('#license-token').fill('restored-token');
  await page.getByRole('button', { name: 'Verify license' }).click();
  await expect(page.locator('.license-active')).toContainText('Notebook edition active');

  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.license-active')).toContainText('Notebook edition active');
  await context.setOffline(false);

  valid = false;
  await page.evaluate(() => localStorage.setItem('demo:sb_license_verdict:tempo-earcheck', JSON.stringify({ valid: true, checkedAt: 0 })));
  await page.reload();
  await expect(page.getByText('License no longer active.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Notebook edition · $9' })).toBeVisible();
  await addCard(page, 'Free limit card one');
  await addCard(page, 'Free limit card two');
  await expect(page.locator('.practice-card')).toHaveCount(5);
  await page.getByRole('button', { name: 'New practice card' }).click();
  await expect(page.getByText('The free edition holds 5 cards.')).toBeVisible();
  await expect(page.locator('#card-dialog')).toBeHidden();
  await context.close();
});

test('the free notebook works without an account @claim:no-account', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/');
  await expect(page.locator('input[type="password"], [autocomplete="username"], [autocomplete="email"]')).toHaveCount(0);
  await addCard(page, 'Account-free warm-up');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Account-free warm-up' })).toBeVisible();
  expect(requests.some((url) => /login|signin|oauth|authorize/i.test(url))).toBe(false);
});
