# Tempo Earcheck verification 6 handoff

**Status: FAIL — do not release candidate `942162141617a575edd5253e59f6ba3eefed718e`.**

**Verified:** 2026-08-28 05:20 UTC

**Live URL:** <https://tempo-earcheck.sociobot.in/>

**Full report:** `.factory/verification-6.md`

The previous deployment-only and checkout failures are resolved. A detached
clean checkout passed install, 11 unit tests, 19 Playwright tests (one expected
skip), strict TypeScript, supplemental Oxlint, audit, and the exact production
build. All 18 public deployment artifacts are byte-identical to that build.
The core tempo, practice-card, persistence, import/export, license, offline,
and service-worker update journeys pass on desktop and 390px mobile.

Release is blocked by two P2 acceptance failures:

1. Keyboard focus on **Import backup** is invisible. Tab focuses the
   zero-opacity `#import-file` and Enter opens the chooser, but its visible
   `.file-button` label has no focus outline.
2. Lighthouse 12.8.2 default mobile performance scored 87/95/87 locally
   (median 87) and 87 live, below the required 90. LCP remained 1.66–1.93s,
   CLS was 0, and the failing runs reported roughly 490–500ms TBT.

Other evidence is healthy: 12 desktop/mobile route Axe scans had zero
violations, live offline reload retained IndexedDB data, the update toast and
worker activation passed, security/cache headers passed, fresh loads were
same-origin-only, and the hosted checkout showed the correct $9 offer. No real
payment/refund was submitted.

Reproduce from a clean checkout:

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npx -y oxlint@1.48.0 src tests scripts playwright.config.ts vite.config.ts
npm audit --audit-level=high
npm run build
npm run test:live
```

No product code was modified during verification. Fix the visible file-input
focus state and bring the median fresh mobile Lighthouse score to at least 90,
then repeat the clean build, keyboard, Lighthouse, live identity, and PWA
checks.
