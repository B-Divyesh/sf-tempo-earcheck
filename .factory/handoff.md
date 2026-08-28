# Tempo Earcheck repair 3 handoff

**Status: PASS — repaired and deployed.**

**Repair commit:** `7036ed4` (`fix: restore import focus and first-paint budget`)

**Base verifier report:** `.factory/verification-6.md` for candidate
`942162141617a575edd5253e59f6ba3eefed718e`.

**Live URL:** <https://tempo-earcheck.sociobot.in/>

## Release-blocking fixes

1. **Visible Import backup focus:** the hidden but keyboard-operable file input
   now transfers its designed 3px vermilion, 3px-offset focus outline to the
   visible `.file-button` with `:focus-within`. The new Playwright regression
   tabs from Export summary to `#import-file` and asserts the label's computed
   `rgb(181, 50, 32) solid 3px` outline on desktop and 390px mobile.
2. **Mobile first-paint performance:** removed the repeated page-wide radial
   paint and deferred below-fold ownership, purchase, and footer layout with
   `content-visibility: auto`. This preserves the broadsheet visual system and
   passed workflows. Browser regression coverage asserts the deferral.

## Verification evidence

Clean local checks, Node 22.23.2 / Playwright 1.58.2:

```sh
npm ci --include=dev
npm test                         # 11 Vitest + 23 Playwright passed; 1 expected desktop skip
npx tsc --noEmit                 # passed
npx -y oxlint@1.48.0 src tests scripts playwright.config.ts vite.config.ts  # 0 warnings/errors
npm audit --audit-level=high     # 0 vulnerabilities
npm run build                    # passed; dist/index.html present
```

The browser suite covered desktop Chromium and Pixel-5 390 × 844, including
practice cards, keyboard, offline, purchase-return, import safety, and both
repair regressions. Separate desktop/mobile scans of home, Privacy, and Terms
found zero Axe violations, one `h1` and one `main` per route, no console/page
errors, and no horizontal overflow.

Lighthouse 12.8.2, fresh local production preview, default simulated mobile:

| Run | Performance | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 0.9s | 1.8s | 110ms | 0 |
| 2 | 98 | 100 | 100 | 100 | 1.1s | 1.8s | 130ms | 0 |
| 3 | 98 | 100 | 100 | 100 | 1.0s | 1.8s | 160ms | 0 |

Median performance is **98** (gate: 90). Build output is 30.97 kB JS (10.69
kB gzip) and 15.56 kB CSS (4.26 kB gzip); no web fonts are loaded.

Live 390px PWA smoke testing confirmed a service-worker-controlled offline
reload rendered “Hear the tempo. Keep the evidence.” with no errors. The worker
update/activation code is unchanged from the prior independent controlled update
test; this CSS-only shell revision uses the normal versioned worker update.

After `/opt/fleet/lib/deploy-static.sh tempo-earcheck dist`, live `index.html`
was byte-identical to `dist/index.html`. A fresh live load was same-origin-only;
there are no analytics, CDN fonts, microphone calls, or unexpected egress. CSP,
HSTS, COOP/CORP, XFO DENY, `nosniff`, referrer, and permissions headers passed.
`npm run test:live` passed: HTTP 200 and byte identity, plus the required
Sociobot 303 hosted Dodo checkout for “Tempo Earcheck — Notebook edition” at
$9.00. No charge/refund was submitted.

## Run / deploy

```sh
npm ci
npm test
npm run build
npm run preview
npm run test:live  # after matching dist deployment
```

The artifact remains a Vite + TypeScript static offline PWA from `dist/`; the
brief, privacy posture, and passed product behavior are unchanged.

## Known gaps

No release blockers are known. No real provider-issued license, payment, or
refund was created; controlled license tests and the live hosted checkout check
cover the allowed boundary.
