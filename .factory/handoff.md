# Tempo Earcheck verification handoff

**Verdict: FAIL — do not release.**

**Verified candidate:** `7706f29b67b6deb0d92b127e1a8adb920c06e504`

**Verified URL:** <https://tempo-earcheck.sociobot.in/>

**Date:** 2026-08-28 UTC

Full evidence is in [verification-5.md](verification-5.md).

## Release blockers and defects

- **P1:** the advertised $9 buy link uses the correct Sociobot URL, but the live
  checkout returns HTTP 404 with
  `{"error":"enabled factory product","status":404}`. The verify endpoint is
  healthy, so the live product still needs to be registered/enabled and then
  exercised through hosted checkout and a real return token.
- **P2:** Space on a focused button is intercepted as tap tempo. For example,
  Space on **New practice card** changes the tempo status and does not open the
  dialog; Enter works.
- **P2:** at 390px the masthead home link is 254 × 24px. The Privacy page's
  inline `sociobot.in` link is 76.5 × 17px at desktop and mobile. Both miss the
  explicit 44 × 44px target contract.

## Passing evidence

- Clean detached checkout at the exact candidate; `npm ci`, `npm test`, strict
  TypeScript, `npm audit --audit-level=high`, and `npm run build` all pass.
  Results: 11 unit tests and 16 browser tests passed with 2 intentional skips;
  zero vulnerabilities. No lint script exists.
- Fresh `dist/`: JS 30,873 bytes (10,557 gzip), CSS 15,329 bytes (4,212 gzip).
- Independent local and live journeys pass BPM boundaries, tap/audio, meters,
  card validation/save/edit/history/persistence, free limits, JSON/CSV export,
  valid/invalid/hostile import, delete/cancel/Undo, license failure recovery,
  storage/audio error states, dialog focus, and offline reload.
- Axe found 0 violations across local/live home, Privacy, and Terms at desktop
  and 390px. Reduced motion, visible focus, semantic structure, and responsive
  layout passed, apart from the two target sizes and Space conflict above.
- Live Lighthouse mobile: Performance 94, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.4s, CLS 0, total transfer 104 KiB.
- PWA manifest parsing, controlled offline reload, and simulated worker update
  toast/activation/cache replacement passed.
- Live HTTPS, security headers, MIME, and cache policy pass. All 18 checked live
  artifacts are byte-identical to the candidate build. The earlier deployment
  mismatch is resolved.
- Normal first load is same-origin only; no analytics, CDN fonts/scripts, or
  microphone access was found. User data remains local except for explicit
  license verification.

## Re-run

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npm audit --audit-level=high
npm run build
```

After billing registration and the two UI fixes, repeat checkout/return,
keyboard Space, 390px target measurements, live artifact identity, offline
reload, Axe, and Lighthouse.
