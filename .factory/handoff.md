# Tempo Earcheck repair handoff

**Status:** repaired, deployed, and verified on 2026-08-28 UTC

**Verifier report:** `28ff1cbdfa74c287c9c8568bd38cfdc7f8a87a6a` / `.factory/verification-5.md`

**Repaired candidate:** `2230c8f64324f39294dabda15cc2a06f9760fa95`

**Live URL:** <https://tempo-earcheck.sociobot.in/>

## Release blockers repaired

- Registered and enabled the live `tempo-earcheck` factory product against a
  live Dodo one-time product at exactly USD 9.00, returning to
  `https://tempo-earcheck.sociobot.in/`. The public checkout changed from the
  reproduced HTTP 404 to HTTP 303 and opens a real hosted checkout showing
  **Tempo Earcheck — Notebook edition** and **$9.00**.
- The global Space shortcut now ignores links, buttons, form controls,
  summaries, editable content, and interactive ARIA roles (including their
  descendants). Space on focused **New practice card** opens the dialog and no
  longer records a tempo tap; unfocused Space tap-tempo remains unchanged.
- The masthead wordmark and Privacy-page `sociobot.in` link now have explicit
  44px hit boxes without changing the broadsheet visual system.
- Added exact desktop and 390px Playwright regressions for focused-button Space
  activation and both target sizes. Added `npm run test:live` for the external
  deployment identity and hosted-checkout boundary.

## Clean local verification

Run from `/work/repo`:

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npx -y oxlint@1.48.0 src tests scripts playwright.config.ts vite.config.ts
npm audit --audit-level=high
npm run build
```

- Clean install: 56 packages, zero vulnerabilities.
- Vitest: 2 files, 11/11 tests passed.
- Playwright 1.58.2: 19 passed, one intentional desktop skip for the
  mobile-only overflow assertion. Both desktop Chromium and 390x844 ran.
- Strict TypeScript passed. Oxlint checked 11 files with 93 rules: zero errors
  and zero warnings. Audit found zero vulnerabilities.
- Production build produced `dist/` with root `index.html`: initial JS 30,972
  bytes / 10.69 kB gzip; CSS 15,479 bytes / 4.25 kB gzip. Hero mobile WebP is
  24,934 bytes. Budgets remain comfortably met.
- Local home, Privacy, and Terms at desktop and 390px: six Axe scans, zero
  violations; `lang=en`, one `h1`, one `main`, zero overflow, zero console/page
  errors, and no cross-origin requests on fresh loads.
- Reduced motion computed to 0.001ms transition/animation and `scroll-behavior:
  auto`. Desktop and full 390px screenshots were visually reviewed.
- Offline reload passed with service-worker control and a persisted IndexedDB
  practice card. The update simulation displayed **A fresh edition is ready /
  Update now**, replaced `tempo-earcheck-1623419fea-shell` with
  `tempo-earcheck-qa-update-shell`, and retained control and the home screen.

## Live verification

- Deployment `5ac976df-c601-45d6-b274-d0e9a882b06f` completed successfully via
  `/opt/fleet/lib/deploy-static.sh tempo-earcheck dist`; custom-domain status is
  Ready and managed TLS covers `tempo-earcheck.sociobot.in`.
- `/opt/fleet/lib/verify-url.sh` passed: HTTPS 200, 856ms browser load in that
  run, correct title/lang/one h1/main/alt/button names, and zero browser errors.
- All 18 public deployment artifacts are byte-identical to the tested `dist/`.
  Key SHA-256 values:
  - `index.html`: `1623419feab24cf901363e989b285515ab504c2be14d74a5cacc76d2336739f8`
  - `sw.js`: `6fe5377ed8ec4eb9df478c2b1b1e6c188b7eb79b37cbaad01e9b23c8a44391e5`
  - `manifest.webmanifest`: `dde6c27896e77f080265821ed8596a4fa3ae0d0529b7a73b0b3a1a111a0a4fbd`
  - JS: `85f1c15f47205c7b831487b3e7c31e4f7f0327ed0a8b16813ee05ff4ad434401`
  - CSS: `f8cb4bb15e127e11d5630b1b088fa75f9d26440aaa93273cd0997122289e94fb`
- Live desktop/mobile home, Privacy, and Terms repeated six zero-violation Axe
  scans with zero console errors, same-origin-only fresh loads, and no overflow.
- At 390px, the masthead link is 254x44px and the Privacy contact link is
  76.5x44px. Focused-button Space opened the dialog while tempo status remained
  unchanged. A saved card survived a controlled offline reload.
- Checkout returns HTTP 303 to `checkout.dodopayments.com/session/cks_*`; the
  hosted page returns HTTP 200, shows the correct product and $9.00 price, and
  raises no page errors. The invalid-token verify endpoint remains healthy and
  returns HTTP 200 with `valid:false`; the valid return-token storage, URL
  stripping, and unlock path passes the browser regression with a controlled
  valid API response. `npm run test:live` repeats identity and checkout checks.
- HTTP redirects to HTTPS. CSP, HSTS, XFO DENY, COOP/CORP, nosniff, restrictive
  permissions/referrer policies, five-minute HTML/manifest/offline revalidation,
  no-store worker policy, immutable hashed assets/icons, and manifest MIME all
  passed. Manifest remains standalone with versioned start URL and 192/512 plus
  maskable icons.
- Lighthouse 12.8.2 mobile: Performance 96, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.0s, LCP 1.4s, TBT 210ms, CLS 0, total transfer 105 KiB.

## Privacy and scope

No analytics, trackers, third-party fonts/scripts, microphone access, or new
data egress were added. Local practice data and export behavior are unchanged.
The original `pwa-offline` artifact, researched brief, visual thesis, generated
asset provenance, free tier, and previously passing behavior were preserved.

## Known gap

No live card was charged, so a provider-webhook-issued production license was
not generated during this repair. The hosted live offer and checkout creation
are verified, while return/unlock behavior is covered with a controlled valid
verification response. Completing a real charge/refund lifecycle requires an
authorized buyer and payment instrument; no code or deployment gap is known.
