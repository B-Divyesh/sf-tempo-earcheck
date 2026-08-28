# Verification report 4 — FAIL

**Verified:** 2026-08-28 UTC

**Candidate:** `abaab38a45d2e70681fa77bb38429f93ab6b8094`

**Live URL:** <https://tempo-earcheck.sociobot.in/>

**Clean checkout:** `/tmp/tempo-earcheck-qa4.7Rff0q`, detached at the candidate

## Verdict

**FAIL — do not release.** The earlier deployment-only failure is resolved: the
live hostname has valid HTTPS and serves the candidate build byte-for-byte.
However, an accepted JSON backup can run script in the application origin, and
the advertised one-time purchase endpoint returns 404. Both are major shipped
flow failures. Target sizing and live response/cache policy also remain below
the acceptance contract.

## Defects

### P1 — imported attempt history is interpreted as active HTML

Fresh reproduction against the clean local production build:

1. I selected a valid-looking Tempo Earcheck JSON backup through **Import
   backup** and accepted the normal merge confirmation.
2. Its `cards[0].history[0].bpm` value was an HTML `img` element with a missing
   same-origin source and an `onerror` marker.
3. After import, `.qa-import-marker` existed in the DOM,
   `document.body.dataset.qaImport` was `rendered`, and Chromium requested
   `/qa-import-network-check`.

`validateImport` copies `history` entries without validating their fields, and
`cardMarkup` interpolates `attempt.at`, `attempt.bpm`, and `attempt.outcome`
into `innerHTML`. Code running in this origin can read IndexedDB practice data
and localStorage, including the optional license token, and can issue outbound
requests. This violates the local-first privacy promise.

Validate every attempt field (`id`, date, numeric BPM bounds, and enumerated
outcome) and render imported values as text. Add a regression test confirming
that HTML-bearing history remains inert and causes no request.

### P1 — the advertised $9 purchase flow is unavailable

The live **Buy Notebook edition · $9** link points to the required Sociobot
endpoint, but a fresh GET on 2026-08-28 returned:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The invalid-license verification endpoint itself responded normally with
`200 {"valid":false,"reason":"invalid",...}`. The frontend's mocked valid and
invalid license handling also worked, but a customer cannot start checkout.
Register and enable the live `tempo-earcheck` product at the advertised price,
then verify the hosted checkout and return flow before release.

### P2 — visible interactive targets miss the 44 × 44px contract

At 390 × 844, measured rendered sizes were:

| Control | Size |
| --- | ---: |
| Tempo range | 322 × 24px |
| Volume range | 322 × 24px |
| Delete card | 93.8 × 36px |
| Privacy footer link | 56.9 × 24px |
| Terms footer link | 46.8 × 24px |

These are visible interactive controls. Increase their actual hit regions to
at least 44px high.

### P2 — live security and cache response policy is incomplete

Live responses include HSTS, `nosniff`, and
`Referrer-Policy: strict-origin-when-cross-origin`, but omit CSP,
`Permissions-Policy`, frame protection (`frame-ancestors` or X-Frame-Options),
COOP, and CORP. A CSP is particularly important given the P1 import behavior.

HTML, the service worker, manifest, hashed JS/CSS, and images all return
`Cache-Control: public, must-revalidate, max-age=30`. Content-hashed assets
should be long-lived and immutable while HTML and `sw.js` remain promptly
revalidatable. The manifest is served as `application/octet-stream` rather
than a manifest/JSON MIME type, although Chromium parsed it without errors.

## Passing evidence

### Clean checkout and repository gates

Environment: Node 22.23.2, npm 10.9.8.

```sh
npm ci --include=dev
npm run test:unit
npx tsc --noEmit
npm test
npm run build
```

- Clean install passed with 0 audit vulnerabilities.
- Vitest: 4/4 passed.
- Playwright: 11 passed and one intentional desktop-project skip for the
  mobile-only overflow assertion.
- TypeScript passed. No lint script is declared in `package.json`.
- Exact production build passed and created `dist/`; the detached worktree
  remained clean.
- Initial JS is 29,708 bytes (10,233 gzip), CSS is 15,236 bytes (4,203 gzip),
  mobile hero WebP is 24,934 bytes, and 1280px WebP is 89,654 bytes. All stated
  static budgets pass.

Fresh Lighthouse 12.8.2 mobile simulated throttling against the local
production preview: Performance **91**, Accessibility **100**, Best Practices
**100**, SEO **100**; FCP 1.0s, LCP 1.9s, CLS 0, TBT 360ms, total transfer
105KiB.

### Product flow and recovery

- Direct BPM clamps low/blank input to 30 and high input to 240; 2/4 and 12/4
  render the correct beat counts. Two keyboard Space taps calculated 119 BPM.
- Keyboard `M` started/stopped Web Audio with correct `aria-pressed` state.
  Initial volume was 50% of the capped control and no microphone permission was
  requested.
- Required-name validation held the dialog open. Free step `3` produced the
  specific error, and changing it to `4` saved successfully.
- Three cards saved and survived reload. A 240 BPM pass stayed clamped at 240;
  needs-work added a second history result. The five-card free limit gave a
  clear upgrade/export message.
- JSON and CSV downloads contained all three cards. Invalid JSON produced
  visible feedback. Delete cancellation retained the card; confirmed delete
  followed by **Undo** restored it.
- The dialog focused its name field, stayed modal during keyboard traversal,
  closed with Escape, and returned focus to **New practice card**.
- License return handling stored the token, removed it from the URL, verified
  once, reused the daily cached verdict on reload, and remained unlocked
  offline. Invalid and blank restore states kept the free desk usable and gave
  explicit feedback.

### Accessibility, responsive behavior, and visual review

- Local and live desktop 1440 × 1000 and mobile 390 × 844 had one `h1`, one
  `main`, `lang=en`, correct titles, descriptive image alt text, and no
  horizontal overflow.
- Axe found **0 serious/critical violations** on local and live home, privacy,
  and terms pages in desktop and mobile profiles (the full local scans returned
  no violations at any impact level).
- The skip link is first in tab order and visibly uses a 3px vermilion focus
  outline. Form labels, live regions, dialog focus/return, and keyboard
  shortcuts worked.
- Reduced motion computed to 0.001ms transitions/animations and automatic
  scrolling. Zoom is not disabled.
- Fresh full-page visual review found the product-specific broadsheet hierarchy
  intact on desktop and intentionally stacked on mobile. The original image
  matches the recorded provenance and showed no visible text artifact, logo,
  seam, or layout distortion.

### Privacy, PWA, and live identity

- A fresh normal session made only same-origin app/asset requests. Source
  inspection found no analytics, telemetry, CDN font/script, microphone, or
  runtime cross-origin call beyond the disclosed Sociobot license endpoint.
  The P1 import behavior is the privacy exception.
- Local and live service-worker-controlled pages reloaded offline with the
  main experience present and no console/page errors.
- A fresh controlled worker version test displayed **A fresh edition is
  ready. / Update now**; activation replaced the old shell cache, retained a
  controller, and left no waiting/installing worker.
- Chromium parsed the local and live manifests without errors; standalone
  display, versioned start URL, theme/background colors, and 192/512/maskable
  icons are present.
- Live desktop/mobile normal journeys produced 0 console errors, page errors,
  and failed requests.
- HTTPS returns 200 and HTTP redirects 301 to HTTPS. Fresh SHA-256 comparison
  matched all 13 checked candidate outputs: home, privacy, terms, offline page,
  service worker, manifest, hashed JS/CSS, both WebPs, and all three PNG icons.
  Key hashes:

| File | SHA-256 |
| --- | --- |
| `index.html` | `edb326fe19c8d24c3a35be47033ec2a4d45be26b3ebc0bbf3b7901ba16face45` |
| `sw.js` | `868424709035929d72452a4208006d9888bb65534734d3ea5213d36a954c9881` |
| `assets/main-DCBmwgJn.js` | `58328efe7f2f2d29cbc47fcd64ab693f442938fb2ad77269376a7aa9ad086dc6` |
| `assets/style-8AIejL1m.css` | `b885ca41efad3c7a959dc5a53fa716eaa01a6dfb780cb592e71d20a8f0f70505` |

## Required before re-verification

1. Make imported attempt history strictly validated and inert, with regression
   coverage for every history field and absence of resulting requests.
2. Enable the live Sociobot product and verify the checkout/return journey.
3. Bring all interactive hit regions to at least 44 × 44px.
4. Add production CSP/frame/permissions policy, correct manifest MIME, and use
   immutable caching for hashed assets while keeping HTML/SW revalidatable.
