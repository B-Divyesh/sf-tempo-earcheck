# Tempo Earcheck repair handoff

**Repair commits:** `9599bd5` (import, target, policy, and regression repair),
`6f5cb43` (manifest MIME correction)

**Deployed:** <https://tempo-earcheck.sociobot.in/> on 2026-08-28 UTC via the
static work-order deployment (`dist/`). The original Vite + TypeScript offline
PWA artifact and its researched product scope are unchanged.

## Repaired findings

- Import history now has a strict trust boundary. Every attempt requires a
  safe ID, canonical ISO timestamp, integer 30–240 BPM, and either `passed` or
  `needs-work`; malformed history rejects the backup before merge. Card
  metadata is likewise typed and bounded. Ledger markup escapes rendered
  values, including history values and attributes, as defense in depth.
- All flagged mobile controls now have measured 44px-or-larger hit areas:
  tempo/volume ranges, delete card, and Privacy/Terms links.
- `staticwebapp.config.json` supplies CSP (`script-src 'self'` and
  `frame-ancestors 'none'`), frame protection, COOP, CORP, permissions policy,
  nosniff, and referrer policy. Hashed assets/icons are immutable for one year;
  HTML/offline/manifest revalidate in five minutes and `sw.js` is no-cache.
  `.webmanifest` is explicitly served as `application/manifest+json`.
- Playwright is pinned to `1.58.2`, matching the supplied browser binary, so a
  clean install runs the browser suite reproducibly.

## Exact regression coverage

- Unit coverage rejects malicious `id`, `at`, `bpm`, and `outcome` fields and
  accepts a complete valid history without coercion.
- Browser coverage uploads a history BPM containing an `<img onerror>` network
  payload and proves that no marker is rendered, no script marker is set, and
  no `/qa-import-network-check` request is made.
- Browser coverage measures all verifier-flagged 390px controls at 44px+ and
  asserts the $9 button points to the required Sociobot checkout URL.
- Release-policy unit coverage pins the CSP/isolation/permissions headers,
  immutable asset cache policy, shell/SW revalidation, and manifest MIME map.

## Verification performed

Environment: Node 22.23.2, npm 10.9.8, Chromium supplied for Playwright 1.58.2.

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npm run build
npm audit --audit-level=high
```

All passed: 11 unit tests; 16 Playwright desktop/mobile tests passed with 2
intentional desktop-project skips for mobile-only assertions; TypeScript,
production build, and audit passed with 0 vulnerabilities. `dist/index.html`
is present. Initial JS is 30,873 bytes (10,650 gzip), CSS is 15,329 bytes
(4,230 gzip), and the mobile hero WebP is 24,934 bytes.

Lighthouse 12.8.2 against the live mobile profile: Performance **100**,
Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9s, LCP
1.4s, TBT 0ms, CLS 0.

Post-deploy checks passed:

- `/opt/fleet/lib/verify-url.sh` returned HTTPS 200, title/lang/one h1/main,
  no missing image alt text or unlabeled buttons, and no browser errors.
- Live desktop (1440x1000) and mobile (390x844) Chromium checks passed title,
  console, zero horizontal overflow, Axe serious/critical = 0, and 44px target
  measurements. Keyboard tap, Web Audio, dialog flow, persistence, and license
  return are covered by the browser suite.
- The live controlled service worker reloaded the main experience offline with
  no console errors. The existing versioned cache/update implementation remains
  covered by the previously passing PWA flow; this repair did not alter it.
- Live headers confirm CSP, frame protection, COOP, CORP, permissions policy,
  immutable `/assets/*` caching, revalidated HTML/SW, and
  `Content-Type: application/manifest+json` for the manifest. HTTPS/HSTS is
  active.
- SHA-256 live identity matched the final local `dist/` for index, service
  worker, manifest, offline page, hashed JS/CSS, both WebPs, and all three PNG
  icons.

## Known release blocker outside this repository

The deployed product still cannot begin the advertised one-time purchase:

```text
GET https://api.sociobot.in/api/v1/products/tempo-earcheck/checkout
HTTP 404
{"error":"enabled factory product","status":404}
```

The frontend link and license verification endpoint are correct (invalid-token
verification returns HTTP 200), but the Sociobot billing service has not
registered/enabled the `tempo-earcheck` product at $9. No billing registration
tool or credential is available in this repository/work order, and the product
contract prohibits embedding or replacing the Sociobot checkout. Register the
live product in the factory billing system with return URL
`https://tempo-earcheck.sociobot.in/`, then verify the hosted checkout and
license-return journey before release. This is the sole unresolved verifier
finding; do not mark the paid edition release-ready until it returns a hosted
checkout redirect.
