# Verification report — FAIL

**Verified:** 2026-08-27 (UTC)
**Candidate:** `abaab38a45d2e70681fa77bb38429f93ab6b8094`
**Repository state:** detached clean checkout at that exact commit in `/tmp/tempo-earcheck-qa.gnF34q`
**Expected live URL:** `https://tempo-earcheck.sociobot.in/`

## Verdict

**FAIL. Do not release this candidate.** The production hostname does not serve
the application, and a crafted user-selected JSON import executes script in the
application origin.

## Blocking defects

### P0 — live deployment is unavailable and cannot match the candidate

Fresh checks against the required URL on 2026-08-27 found:

- TLS verification fails: the certificate subject is
  `*.msha-slice-7-eus2-1-ase.p.azurewebsites.net`; its SAN list does not include
  `tempo-earcheck.sociobot.in`.
- An intentionally insecure request (`curl -k`) returns `HTTP/1.1 404 Site Not
  Found`, `Content-Type: text/html`, length 2667, not the candidate app shell.
- Consequently the production app, its response security/cache policies, PWA,
  and candidate build identity cannot be exercised at the promised URL. The
  live HTML digest differs from the fresh local production build.

This is a deployment failure, not a local-build failure.

### P1 — JSON import permits stored XSS and arbitrary outbound requests

`validateImport` accepts unvalidated `history` objects, and `cardMarkup` puts
attempt values into `innerHTML` without escaping. In a fresh local production
browser I imported a syntactically valid Tempo Earcheck backup whose
`history[0].bpm` was:

```html
<img class="injected" src=x onerror="document.body.dataset.xss='yes'">
```

After accepting the app's normal import confirmation, the DOM contained
`.injected`, `document.body.dataset.xss` was `yes`, and the browser requested
`GET /x`. Script at this origin can access locally stored settings, cards, and
the optional license token, then exfiltrate them. This violates the stated
local-first/privacy guarantee. Validate/sanitize every imported attempt field
and render all imported data as text before release.

### P2 — several visible touch targets miss the 44px acceptance requirement

At both desktop and 390px mobile, measured rendered heights include masthead
and footer links at 24px, the range inputs at 24px, and the visible `Delete
card` button at 36px. The product contract requires touch/click targets of at
least 44 by 44 CSS pixels. Give these controls 44px hit areas (without relying
on invisible adjacent space).

## What passed locally

### Reproducible build and automated checks

Using Node 22.23.2 from the clean checkout:

```sh
npm ci --include=dev
npx playwright install chromium   # project pins Playwright 1.62.1
npm test
npx tsc --noEmit
npm run build
npm audit --audit-level=high
```

- Unit tests: 4/4 pass.
- Playwright: 11 pass, 1 expected desktop-project skip for the mobile-only
  overflow assertion; desktop and 390x844 profiles both exercised.
- TypeScript check, exact production build, and audit pass; audit reports zero
  vulnerabilities. No lint script is declared in `package.json`.
- Production output: JS 29,708 bytes / 10,233 bytes gzip; CSS 15,236 bytes /
  4,203 bytes gzip. Both meet the 200 KB JS and 50 KB CSS budgets.

### Product, accessibility, privacy, and PWA evidence

- Representative journey works locally: direct BPM clamps to 30–240; a free
  card saves, persists after reload, records a passed result and next step;
  export produces a dated JSON backup; invalid free step `3` produces the
  specified error and recovery with `2` saves. Included tests also cover tap,
  Web Audio start/stop, keyboard tap, license return stripping/verification,
  legal routes, and normal offline reload.
- Home, 390px home, `/privacy/`, and `/terms/`: one `h1`, one `main`, `lang=en`,
  correct titles, zero horizontal overflow, and zero axe violations (including
  serious/critical). Skip link is first in keyboard order and has a visible
  `rgb(181, 50, 32)` 3px focus outline. Reduced motion computes to a 0.001ms
  transition and `scroll-behavior: auto`.
- Fresh initial load makes only same-origin app/asset requests; source review
  finds no analytics, third-party fonts, CDNs, microphone requests, or runtime
  network call except the explicit Sociobot license endpoint. The P1 defect
  above is the exception when malicious imported data is rendered.
- Service worker: offline reload after activation retained the home screen with
  no console/page errors. A controlled update simulation produced “A fresh
  edition is ready. / Update now”; activation replaced
  `tempo-earcheck-edb326fe19-shell` with
  `tempo-earcheck-update-edb326fe19-shell`.

## Required before re-verification

1. Repair the hostname binding/certificate and deploy this exact build; then
   recheck live headers, caching, CSP/response policy, PWA operation, and build
   identity.
2. Fix the import-to-history rendering trust boundary and add regression tests
   for malicious attempt fields and outbound-request absence.
3. Bring all visible interactive hit areas to at least 44 by 44 CSS pixels.
