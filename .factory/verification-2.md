# Verification report 2 — FAIL

**Verified:** 2026-08-28 UTC  
**Candidate:** `abaab38a45d2e70681fa77bb38429f93ab6b8094`  
**Live URL:** <https://tempo-earcheck.sociobot.in/>

## Verdict

**FAIL — do not release.** The live deployment is now healthy and is exactly
the requested candidate, but importing a valid-looking user backup executes
arbitrary JavaScript in the Tempo Earcheck origin. This can read and exfiltrate
the locally stored notebook and optional license. The accessibility target-size
contract and production cache/response-policy expectations also fail.

## Release-blocking defect

### P1 — imported attempt history is stored XSS

In a fresh Chromium profile against the exact local production build, I used
the normal Import backup control and accepted its normal merge confirmation.
The otherwise valid Tempo Earcheck JSON contained this value in
`cards[0].history[0].bpm`:

```html
<img class='injected' src=x onerror="document.body.dataset.xss='yes'">
```

After import, the resulting attempt history contained `.injected` and
`document.body.dataset.xss` was `yes`. The candidate's import validator copies
`history` without validating its fields and the card template interpolates
`attempt.bpm` into `innerHTML`. Arbitrary script therefore runs under the app
origin and can access IndexedDB, localStorage (including
`sb_license:tempo-earcheck`), and make outbound requests.

Fix the trust boundary before release: validate every imported attempt to the
declared types/ranges and render all imported values as text, never HTML. Add a
regression test for malicious `bpm`, `at`, `id`, and `outcome` values.

## Other defects

### P2 — visible interactive targets are below the 44px minimum

At the required 390px viewport, fresh browser measurement found both range
inputs at 322 x 24px, Delete card at 93.8 x 36px, and footer Privacy/Terms
links at 56.9 x 24px and 46.8 x 24px. The product contract requires touch and
click targets of at least 44 x 44 CSS pixels. Masthead navigation is hidden at
this width; its desktop links are likewise text-height controls. Increase the
actual hit areas, not merely visual spacing.

### P2 — production response policy and cache policy are incomplete

Fresh HTTPS responses from the live candidate have HSTS, `nosniff`, and a
strict referrer policy, but no `Content-Security-Policy`, `Permissions-Policy`,
COOP, or CORP header. The missing CSP materially weakens containment of the P1
issue. The HTML, service worker, manifest, hashed JS, CSS, and image all use
`Cache-Control: public, must-revalidate, max-age=30`; hashed assets should be
long-lived immutable assets under the performance/PWA contract. The manifest is
also served as `application/octet-stream` instead of a manifest/JSON MIME type.

## Fresh evidence that passed

### Clean candidate and quality gates

- Created a detached clean worktree at exactly `abaab38a45d2e70681fa77bb38429f93ab6b8094`.
- `npm ci`: completed with zero reported vulnerabilities.
- `npm run test:unit`: 4/4 pass.
- `npx tsc --noEmit`: pass. There is no lint script in `package.json`.
- After installing the browser matching declared Playwright 1.62.1,
  `npm test`: 11 pass and 1 intentional desktop-project skip (the
  mobile-only overflow assertion).
- `npm run build`: pass and produces `dist/`. Initial JS is 29,708 bytes
  (10,310 gzip) and CSS 15,236 bytes (4,220 gzip), within the 200 KB/50 KB
  static budgets. The 1280px hero WebP is 89,654 bytes.

### Functional, accessibility, privacy, and PWA checks

- Independently exercised 30 and 240 BPM bounds, blank-number recovery to 30,
  a 7/4 accented click, two-tap tempo, Web Audio start and keyboard `M` stop,
  free-tier invalid step `3` followed by recovery to `4`, card save/reload,
  240 BPM passed/next-tempo clamping, CSV export, invalid JSON import feedback,
  delete/Undo, and IndexedDB persistence.
- Axe found zero serious/critical violations locally and at the live URL on
  desktop and 390 x 844 mobile. Live desktop/mobile both had zero horizontal
  overflow, a visible solid focus style, keyboard Space tap feedback, and no
  console, page, or failed-request errors.
- Local and live installed shells reloaded offline after service-worker control.
  A controlled alternate worker proved the update flow: `controlled: true`,
  toast “A fresh edition is ready. Update now”, then reload under a controller
  with no waiting worker.
- Normal first-load requests were same-origin only; no analytics, third-party
  font/CDN, microphone, or unexpected outbound request was observed. The only
  shipped runtime cross-origin endpoint is the explicit Sociobot billing API
  when a license is supplied. The P1 exploit voids the privacy guarantee for
  a malicious import.

### Live identity and response evidence

The deployment failure in the earlier report is resolved. HTTPS returned 200
for `/`, `/privacy/`, `/terms/`, `/sw.js`, and the manifest. Candidate and live
files were byte-identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `edb326fe19c8d24c3a35be47033ec2a4d45be26b3ebc0bbf3b7901ba16face45` |
| `sw.js` | `868424709035929d72452a4208006d9888bb65534734d3ea5213d36a954c9881` |
| `manifest.webmanifest` | `dde6c27896e77f080265821ed8596a4fa3ae0d0529b7a73b0b3a1a111a0a4fbd` |
| `assets/main-DCBmwgJn.js` | `58328efe7f2f2d29cbc47fcd64ab693f442938fb2ad77269376a7aa9ad086dc6` |
| `assets/style-8AIejL1m.css` | `b885ca41efad3c7a959dc5a53fa716eaa01a6dfb780cb592e71d20a8f0f70505` |

## Required before re-verification

1. Repair import validation/rendering and add an XSS regression test.
2. Make all interactive hit areas at least 44 x 44 CSS px.
3. Configure production CSP and related response policies, correct the manifest
   MIME type, and apply immutable long-lived caching to content-hashed assets
   while keeping the service worker updateable.
4. Re-run the clean-checkout, production, mobile, offline, and live checks.
