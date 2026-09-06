import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home is semantic, error-free, and accessible', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Tempo Earcheck/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Hear, test, and record practice tempos' })).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  const click = page.locator('#start-button');
  await click.click();
  await expect(click).toHaveAttribute('aria-pressed', 'true');
  await click.click();
  await expect(click).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});

test('every public page keeps the semantic and accessibility baseline', async ({ page }) => {
  for (const path of ['/demo', '/privacy', '/terms', '/missing-accessibility-check']) {
    const errors: string[] = [];
    const listener = (message: { type: () => string; text: () => string }) => {
      if (message.type() === 'error') errors.push(message.text());
    };
    page.on('console', listener);
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('body > #app > header.masthead')).toHaveCount(1);
    await expect(page.locator('footer')).toHaveCount(1);
    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
    expect(errors).toEqual([]);
    page.removeListener('console', listener);
  }
});

test('home states the job, audience, sample action, facts, and required sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Hear, test, and record practice tempos' })).toBeVisible();
  await expect(page.getByText(/For instrumentalists choosing practice or ensemble tempos/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toHaveAttribute('href', '/demo');
  await expect(page.getByText('Loads three filled practice cards.')).toBeVisible();
  await expect(page.locator('.plain-facts li')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Choose, test, and record' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What Tempo Earcheck does not do' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Built by Param Factory; opens another site' })).toBeVisible();
  await expect(page.getByText('Build 1.1.0')).toBeVisible();
});

test('demo route has its own title, realistic sample, and persistent controls', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Tempo Earcheck');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start for real' })).toBeVisible();
  await page.locator('#notebook').scrollIntoViewIfNeeded();
  expect((await page.locator('.demo-banner').boundingBox())?.y).toBeLessThanOrEqual(1);
});

test('an unknown route renders the designed missing-page destination', async ({ page }) => {
  await page.goto('/definitely-missing');
  await expect(page).toHaveTitle('Page not found — Tempo Earcheck');
  await expect(page.getByRole('heading', { level: 1, name: 'This page does not exist' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Tempo Earcheck' })).toHaveAttribute('href', '/');
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
});

test('a practice decision survives reload and records a result', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'New practice card' }).click();
  await page.getByLabel(/Passage or exercise/).fill('Bach opening');
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
  await expect(page.getByRole('heading', { name: 'How Tempo Earcheck handles your data' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'Hear, test, and record practice tempos' })).toBeVisible();
  await context.setOffline(false);
});

test('an installed update offers a controlled refresh', async ({ page }) => {
  await page.addInitScript(() => {
    let updateFound: (() => void) | undefined;
    let stateChanged: (() => void) | undefined;
    const worker = {
      state: 'installing',
      addEventListener: (_name: string, listener: () => void) => { stateChanged = listener; },
      postMessage: (message: unknown) => {
        (window as unknown as { __updateMessage?: unknown }).__updateMessage = message;
      }
    };
    const serviceWorker = {
      controller: {},
      register: async () => ({
        installing: worker,
        addEventListener: (_name: string, listener: () => void) => { updateFound = listener; }
      }),
      addEventListener: () => undefined
    };
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: serviceWorker });
    (window as unknown as { __triggerUpdate?: () => void }).__triggerUpdate = () => {
      updateFound?.();
      worker.state = 'installed';
      stateChanged?.();
    };
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as { __triggerUpdate?: unknown }).__triggerUpdate)).toBe('function');
  await page.evaluate(() => (window as unknown as { __triggerUpdate: () => void }).__triggerUpdate());
  await expect(page.getByText('A fresh edition is ready.')).toBeVisible();
  await page.getByRole('button', { name: 'Update now' }).click();
  expect(await page.evaluate(() => (window as unknown as { __updateMessage?: unknown }).__updateMessage)).toEqual({ type: 'SKIP_WAITING' });
});

test('audio and browser-storage failures explain how to recover', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: class BrokenAudioContext { constructor() { throw new Error('audio blocked'); } }
    });
    const workingOpen = indexedDB.open.bind(indexedDB);
    let firstOpen = true;
    Object.defineProperty(indexedDB, 'open', {
      configurable: true,
      value: (...args: Parameters<IDBFactory['open']>) => {
        if (firstOpen) {
          firstOpen = false;
          throw new Error('storage blocked');
        }
        return workingOpen(...args);
      }
    });
  });
  await page.goto('/');
  await expect(page.getByText('The local notebook did not open.')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'No practice cards yet' })).toBeVisible();
  await page.getByRole('button', { name: 'Start click' }).click();
  await expect(page.locator('#tempo-status')).toHaveText('Sound could not start. Check this browser’s audio permission and try again.');
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
  await page.getByLabel(/Passage or exercise/).fill('Target test');
  await page.getByRole('button', { name: 'Save practice card' }).click();
  for (const locator of [page.getByRole('link', { name: 'Tempo Earcheck home' }), page.locator('#bpm-range'), page.locator('#volume'), page.getByRole('button', { name: 'Delete card' }), page.getByLabel('Legal').getByRole('link', { name: 'Privacy' }), page.getByLabel('Legal').getByRole('link', { name: 'Terms' })]) {
    expect((await locator.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  }

  await page.goto('/privacy');
  expect((await page.getByRole('link', { name: /sociobot.in/ }).boundingBox())?.height).toBeGreaterThanOrEqual(44);
});

test('each public route exposes its own title, canonical URL, and social metadata', async ({ page }) => {
  for (const route of [
    { path: '/', title: 'Tempo Earcheck — record practice tempos', canonical: 'https://tempo-earcheck.sociobot.in/' },
    { path: '/demo', title: 'Demo — Tempo Earcheck', canonical: 'https://tempo-earcheck.sociobot.in/demo' },
    { path: '/privacy', title: 'Privacy — Tempo Earcheck', canonical: 'https://tempo-earcheck.sociobot.in/privacy' },
    { path: '/terms', title: 'Terms — Tempo Earcheck', canonical: 'https://tempo-earcheck.sociobot.in/terms' },
    { path: '/missing-metadata-check', title: 'Page not found — Tempo Earcheck', canonical: 'https://tempo-earcheck.sociobot.in/404' }
  ]) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', route.title);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://tempo-earcheck.sociobot.in/assets/tempo-earcheck-social.jpg');
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');

  await page.goto('/');
  const imageSize = await page.locator('meta[property="og:image"]').evaluate(async (meta) => {
    const image = new Image();
    image.src = new URL(meta.getAttribute('content') ?? '', location.href).pathname;
    await image.decode();
    return { width: image.naturalWidth, height: image.naturalHeight };
  });
  expect(imageSize).toEqual({ width: 1200, height: 630 });
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
});

test('keyboard focus on Import backup is shown on its visible control', async ({ page }) => {
  await page.goto('/');
  await page.locator('#export-csv').focus();
  await page.keyboard.press('Tab');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('import-file');
  const focusStyle = await page.locator('.file-button').evaluate((label) => {
    const style = getComputedStyle(label);
    return { color: style.outlineColor, style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(focusStyle).toEqual({ color: 'rgb(181, 50, 32)', style: 'solid', width: '3px' });
});

test('below-the-fold ownership content defers first-paint layout work', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.ownership')).toHaveCSS('content-visibility', 'auto');
  await expect(page.locator('footer')).toHaveCSS('content-visibility', 'auto');
});

test('390px layout has no horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile-only layout assertion');
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await expect(page.getByRole('button', { name: /Tap tempo/ })).toBeVisible();
});

test('invalid card and import input give a clear recovery path', async ({ page }) => {
  await page.goto('/');
  await page.locator('#bpm-number').fill('241');
  await page.locator('#bpm-number').blur();
  await expect(page.locator('#bpm-output strong')).toHaveText('240');
  await page.locator('#bpm-number').fill('');
  await page.locator('#bpm-number').blur();
  await expect(page.locator('#bpm-output strong')).toHaveText('30');

  await page.getByRole('button', { name: 'New practice card' }).click();
  await page.getByLabel(/Passage or exercise/).fill('Recovery study');
  await page.locator('#card-step').fill('3');
  await page.getByRole('button', { name: 'Save practice card' }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose a free step of 2, 4, 6, or 8 BPM, or buy custom steps.');
  await page.locator('#card-step').fill('4');
  await page.getByRole('button', { name: 'Save practice card' }).click();
  await expect(page.getByRole('heading', { name: 'Recovery study' })).toBeVisible();

  await page.locator('#import-file').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.getByText('That file is not valid JSON. Choose a Tempo Earcheck backup.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recovery study' })).toBeVisible();
});

test('card deletion can be cancelled or undone', async ({ page }) => {
  await page.goto('/demo');
  const card = page.locator('.practice-card').filter({ hasText: 'Cello shift study' });
  page.once('dialog', (dialog) => dialog.dismiss());
  await card.getByRole('button', { name: 'Delete card' }).click();
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await card.getByRole('button', { name: 'Delete card' }).click();
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByRole('heading', { name: 'Cello shift study' })).toBeVisible();
});

test('Reset demo restores sample cards and tempo controls', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#bpm-number').fill('150');
  await page.locator('#bpm-number').blur();
  await page.locator('#meter').selectOption('7');
  await page.locator('#volume').fill('12');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('.practice-card')).toHaveCount(3);
  await expect(page.locator('#bpm-number')).toHaveValue('96');
  await expect(page.locator('#meter')).toHaveValue('4');
  await expect(page.locator('#volume')).toHaveValue('8');
  await expect(page.locator('#volume-value')).toHaveText('50%');
});

test('dialog focus is placed, trapped, and returned for keyboard users', async ({ page }) => {
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'New practice card' });
  await opener.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#card-name')).toBeFocused();
  for (let index = 0; index < 10; index += 1) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.closest('dialog')?.id)).toBe('card-dialog');
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#card-dialog')).toBeHidden();
  await expect(opener).toBeFocused();
});

test('reduced motion removes transitions and smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  expect(Number.parseFloat(await page.locator('.beat-cell').first().evaluate((node) => getComputedStyle(node).transitionDuration))).toBeLessThanOrEqual(0.001);
});

test('a visited missing page cannot replace the cached offline home shell', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await page.goto('/missing-cache-check');
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible();
  await context.setOffline(true);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hear, test, and record practice tempos' })).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', '/manifest.webmanifest');
  await context.setOffline(false);
});
