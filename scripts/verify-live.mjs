import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const productUrl = 'https://tempo-earcheck.sociobot.in/';
const checkoutUrl = 'https://api.sociobot.in/api/v1/products/tempo-earcheck/checkout';
const localIndex = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');

const liveIndexResponse = await fetch(productUrl);
assert.equal(liveIndexResponse.status, 200, 'live product must return HTTP 200');
assert.equal(await liveIndexResponse.text(), localIndex, 'live HTML must match the local production build');

const checkoutResponse = await fetch(checkoutUrl, { redirect: 'manual' });
assert.equal(checkoutResponse.status, 303, 'checkout must redirect to the hosted payment page');
const hostedCheckout = new URL(checkoutResponse.headers.get('location') ?? '');
assert.equal(hostedCheckout.hostname, 'checkout.dodopayments.com');
assert.match(hostedCheckout.pathname, /^\/session\/cks_/);

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(hostedCheckout.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  const checkoutText = await page.locator('body').innerText();
  assert.match(checkoutText, /Tempo Earcheck — Notebook edition/);
  assert.match(checkoutText, /\$9\.00/);
  assert.deepEqual(pageErrors, []);
} finally {
  await browser.close();
}

console.log(JSON.stringify({
  product: 'HTTP 200 and byte-identical to dist/index.html',
  checkout: 'HTTP 303 to a hosted Dodo session',
  offer: 'Tempo Earcheck — Notebook edition · $9.00'
}));
