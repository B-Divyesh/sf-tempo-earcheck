import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const productUrl = 'https://tempo-earcheck.sociobot.in/';
const checkoutUrl = 'https://api.sociobot.in/api/v1/products/tempo-earcheck/checkout';
const distUrl = new URL('../dist/', import.meta.url);
const localIndex = await readFile(new URL('index.html', distUrl), 'utf8');

const liveIndexResponse = await fetch(productUrl);
assert.equal(liveIndexResponse.status, 200, 'live product must return HTTP 200');
assert.equal(await liveIndexResponse.text(), localIndex, 'live HTML must match the local production build');
assert.match(liveIndexResponse.headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/, 'live HTML must include the response CSP');

async function publicFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = `${prefix}${entry.name}`;
    if (entry.isDirectory()) files.push(...await publicFiles(new URL(`${entry.name}/`, directory), `${relative}/`));
    else if (relative !== 'staticwebapp.config.json') files.push(relative);
  }
  return files;
}

const deployedFiles = await publicFiles(distUrl);
for (const relative of deployedFiles) {
  const response = await fetch(new URL(relative, productUrl));
  assert.equal(response.status, 200, `${relative} must return HTTP 200`);
  const local = Buffer.from(await readFile(new URL(relative, distUrl)));
  const live = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(live, local, `${relative} must match the local production build`);
}

const demoResponse = await fetch(new URL('/demo', productUrl));
assert.equal(demoResponse.status, 200, 'the demo route must return HTTP 200');
assert.match(await demoResponse.text(), /<title>Demo — Tempo Earcheck<\/title>/);

const missingResponse = await fetch(new URL('/definitely-missing-live-check', productUrl));
assert.equal(missingResponse.status, 404, 'an unknown route must return deliberate HTTP 404');
assert.equal(await missingResponse.text(), await readFile(new URL('404.html', distUrl), 'utf8'), 'the HTTP 404 must use the designed missing page');

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
  product: `HTTP 200 and ${deployedFiles.length} public files byte-identical to dist`,
  missingRoute: 'HTTP 404 with the designed missing page',
  checkout: 'HTTP 303 to a hosted Dodo session',
  offer: 'Tempo Earcheck — Notebook edition · $9.00'
}));
