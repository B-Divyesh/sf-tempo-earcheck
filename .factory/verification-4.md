# Verification report 4 — FAIL

**Verified:** 2026-08-28 UTC  
**Candidate:** `abaab38a45d2e70681fa77bb38429f93ab6b8094`  
**Live URL:** <https://tempo-earcheck.sociobot.in/>

## Verdict

**FAIL — do not release.** The previous deployment-only failure is resolved:
the live URL serves byte-for-byte the candidate production build and its PWA
works offline. However, a normally accepted user backup can execute arbitrary
JavaScript in the Tempo Earcheck origin. This is a P1 privacy and integrity
failure for a local-first practice notebook.

## Release-blocking defect

### P1 — imported attempt history is stored XSS

Fresh local production-browser reproduction against this exact candidate:

1. Open the app and use **Import backup**.
2. Select this otherwise valid backup, then accept its ordinary merge prompt:

   ```json
   {
     "product": "tempo-earcheck",
     "cards": [{
       "id": "malicious-card", "name": "Imported card", "meter": 4,
       "startBpm": 96, "passedBpm": null, "nextBpm": 96, "step": 4,
       "note": "", "createdAt": "2026-08-28T00:00:00.000Z",
       "updatedAt": "2026-08-28T00:00:00.000Z",
       "history": [{
         "id": "a", "at": "2026-08-28T00:00:00.000Z",
         "bpm": "<img class='qa-xss' src=x onerror=\"document.body.dataset.qaXss='executed'\">",
         "outcome": "passed"
       }]
     }]
   }
   ```

3. The new card renders, `document.body.dataset.qaXss` becomes `executed`,
   `.qa-xss` is present in the DOM, and the browser requests `/x`.

`validateImport` accepts `history` without validating each attempt, then
`cardMarkup` interpolates `attempt.bpm`, `attempt.at`, and `attempt.outcome`
into `innerHTML`. Script in this origin can read IndexedDB and localStorage,
including the optional `sb_license:tempo-earcheck` token, and exfiltrate them.
Validate every attempt field (including numeric BPM bounds and enumerated
outcome) and render untrusted values as text rather than HTML. Add a regression
test for malicious `id`, `at`, `bpm`, and `outcome` values.

## Other defects

### P2 — visible touch targets miss the 44 × 44 CSS-pixel contract

Fresh Playwright measurement at the required 390 × 844 mobile viewport found:

- `#bpm-range`: 322 × 24px
- `#volume`: 322 × 24px
- `Delete card`: 93.8 × 36px
- footer **Privacy**: 56.9 × 24px; **Terms**: 46.8 × 24px

These are visible interactive controls. Give the actual targets (not just the
surrounding whitespace) a 44px minimum height.

### P2 — live response security and cache policies are incomplete

Live HTTPS responses include HSTS, `X-Content-Type-Options: nosniff`, and a
strict referrer policy, but omit `Content-Security-Policy`,
`Permissions-Policy`, frame-ancestors/X-Frame-Options, COOP, and CORP. The
absent CSP notably provides no containment for the P1 injection. The HTML,
manifest, service worker, hashed JS/CSS, and assets are all delivered with
`Cache-Control: public, must-revalidate, max-age=30`, rather than immutable,
long-lived caching for hashed assets. The manifest is also served as
`application/octet-stream`.

## Passing evidence

### Clean candidate and quality gates

- Detached clean worktree created at exactly `abaab38a45d2e70681fa77bb38429f93ab6b8094`.
- `npm ci`: pass; audit reported 0 vulnerabilities.
- After `npx playwright install chromium` for the lockfile's Playwright
  1.62.1 browser revision, `npm test`: pass (4/4 Vitest; Playwright status
  passed: 11 scenarios plus the intentional desktop-project skip for the
  mobile-only assertion).
- `npx tsc --noEmit`: pass. No lint script is declared.
- `npm run build`: pass and produces `dist/`.
- Built initial JS is 29,708 bytes (10,310 gzip), CSS is 15,236 bytes
  (4,220 gzip), and the largest hero WebP is 89,654 bytes: all within the
  stated static budgets.
- Lighthouse 12.8.2, local production preview/mobile simulated throttling:
  Performance 92, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s,
  LCP 1.7s, CLS 0, TBT 330ms, transferred 105 KiB. Lighthouse logged a
  post-collection target crash while capturing its full-page artifact, but
  emitted the complete report and category scores.

### Product, accessibility, and privacy checks

- Independently exercised 30/240 BPM and out-of-range number recovery,
  2/4 and 12/4 meter rendering, keyboard-only Space tap tempo, hearing-safe
  volume controls, blank-name/native validation, free-tier invalid step `3`
  followed by recovery to `4`, three practice cards, passed-result next tempo,
  persistence across reload, JSON export, delete confirmation and Undo.
- Desktop visual review at 1440 × 1000 and mobile review at 390 × 844 passed;
  mobile horizontal overflow was 0px. Keyboard Tab reaches the tap control and
  shows its 3px visible focus treatment. Reduced motion resolves transitions
  to 0.001ms.
- Axe serious/critical findings: 0 locally and at the live URL. Local and live
  console/page errors: 0 for normal usage.
- A fresh normal live session made no third-party requests. Source inspection
  finds no analytics, CDN fonts, or third-party scripts; only the explicit
  Sociobot billing endpoint is contacted when a license is supplied.

### PWA and live identity

- Local and live service-worker-controlled pages reloaded successfully with
  Playwright offline mode enabled.
- A disposable copy of the built worker was version-changed after activation;
  the existing app profile displayed **“A fresh edition is ready.”** and its
  **Update now** action, confirming the update notification path.
- SHA-256 comparisons of live versus fresh `dist/` were identical for the app
  HTML, hashed JS/CSS, service worker, manifest, offline page, legal pages,
  icons, and hero asset. The live main JS hash is
  `58328efe7f2f2d29cbc47fcd64ab693f442938fb2ad77269376a7aa9ad086dc6`.

## Required next step

Fix P1 before any release, add its regression coverage, then correct the
target-size and deployment header/cache deficiencies and submit a new candidate
for verification.
