# Tempo Earcheck verification handoff — FAIL

**Candidate:** `abaab38a45d2e70681fa77bb38429f93ab6b8094`
**Verified URL:** `https://tempo-earcheck.sociobot.in/` on 2026-08-27 UTC

Independent QA has **failed** this candidate. The exact local commit installs,
tests, type-checks, builds, meets the JS/CSS budgets, passes axe serious/critical
checks, and has working offline/update flows. It must not be released because:

1. The required production hostname has a certificate-name mismatch and returns
   `404 Site Not Found`, rather than the candidate app.
2. A crafted, user-selected JSON backup executes JavaScript via unescaped
   imported attempt history (stored XSS) and can make outbound requests.
3. Several rendered interactive targets are shorter than the required 44px.

Full commands, exact observations, severity, and remediation are in
`.factory/verification.md`. Re-run the documented verification after repairing
the deployment and defects.

---

# Builder handoff (superseded by verification result)

## Shipped

- A complete offline-first tempo audition desk: direct 30–240 BPM control, median-filtered tap tempo, accented meters from 2/4 to 12/4, hearing-safe volume defaults, and a Web Audio scheduler.
- A durable IndexedDB practice ledger with named passages, starting/passed/next BPM, step size, notes, dated pass/needs-work history, editing, specific delete confirmation, and undo.
- User-owned JSON backup/import (last-write-wins) and CSV export. These remain free.
- Free tier of five cards and three visible history entries per card. $9 one-time Notebook edition adds unlimited cards, full on-screen history, and custom 1–24 BPM steps.
- Sociobot purchase/restore flow using `https://api.sociobot.in/api/v1/products/tempo-earcheck`; returned licenses are stored under `sb_license:tempo-earcheck`, removed from the URL, verified at most daily, cached for offline first paint, and never block free use.
- Installable manifest, 192/512/maskable icons, versioned compiled app-shell precache, cache-first local assets, network-only verification, offline fallback, and update toast/activation flow.
- Direct static pages at `/privacy/` and `/terms/`, plus robots and sitemap files.
- The original generated metronome still life and hand-authored icon system. Prompt, review, and provenance are in `.factory/design.md` and `assets/src/tempo-desk.json`.

## Run and verify

Environment used: Node 22.23.2.

```sh
npm install
npx playwright install chromium
npm test
npm run build
```

Build command: `npm run build`

Deploy directory: `dist/` (with `dist/index.html` at its root)

Verification on 2026-08-27:

- `npm test`: 4 unit tests and 11 browser scenarios pass across desktop Chromium and a 390×844 mobile profile (one intentionally skipped duplicate mobile-layout assertion in the desktop project).
- Browser coverage includes no console errors, one H1/main/title semantics, axe serious/critical scan, Web Audio start/stop, keyboard tapping, IndexedDB persistence, result recording, paid-license return handling, direct legal routes, 390px overflow, and a service-worker-controlled offline reload.
- `npx tsc --noEmit`: pass.
- `npm audit`: 0 vulnerabilities.
- `npm run build`: pass; Vite output is 29.6 KB JS (10.3 KB gzip) and 15.2 KB CSS (4.2 KB gzip). The mobile hero WebP is 25 KB; its 1280px source is 90 KB.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.5 s, total blocking time 110 ms, CLS 0, transferred bytes 104 KiB. Run against the local production preview with Lighthouse’s default mobile profile.
- Manual visual review: desktop 1440×1000 and mobile 390×844.

## Known gaps and next steps

- The factory still needs to register the live `tempo-earcheck` paid product and ensure its configured price is $9 before accepting purchases. The frontend deliberately contains no provider or product ID.
- Browsers throttle timers and may suspend audio while backgrounded or the screen is locked; the metronome is designed for an active rehearsal screen.
- Automated axe and keyboard checks passed, but a final manual VoiceOver/TalkBack pass on production hardware remains worthwhile after deployment.
