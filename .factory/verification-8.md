# Verification 8 — practice tempo notebook

**Verdict: PASS.**

Verified 2026-09-06 UTC against <https://tempo-earcheck.sociobot.in/>.

- Findings: **0** (P0: 0, P1: 0, P2: 0, P3: 0)
- Untested public claims: **0**
- Implementation candidate reviewed: `4cef30cc6b2815a78d529a10bbc969a0025cfb78`
- Documentation/Graphify commit: `c50443af121a5787031ab628fcfef86f8241a5cf`
- Clean checkout: `/tmp/tempo-earcheck-verify-8`, detached at the implementation candidate

## Job, audience, and first action

The job is to hear, test, and record practice tempos. It is for instrumentalists choosing practice or ensemble tempos. Before scrolling, the page says this plainly, offers **Try it with sample data**, and explains that it loads three filled practice cards. The same first screen shows offline, local-storage, and price facts.

## Clean candidate verification

From a new detached checkout of the implementation candidate:

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npx -y oxlint@1.48.0 src tests scripts playwright.config.ts vite.config.ts
npm audit --audit-level=high
npm run build
npm run test:live
```

All commands passed. `npm test` reported 14 unit tests and 74 browser tests passing. Oxlint reported zero warnings/errors and the audit found zero high-or-higher vulnerabilities. The build produced `dist/` with 39.44 kB JavaScript (13.02 kB gzip) and 19.75 kB CSS (5.13 kB gzip).

Every one of the 24 exact commands listed in `.factory/claims.json` was then run separately in that clean checkout. All passed, including demo isolation, offline reload, all tempo/audio/card/export/keyboard limits, privacy and no-account behavior, checkout offer, and license paths. No public claim is missing, duplicate, false, incomplete, or untested.

`npm run test:live` passed: the live home and all 22 deployed public build files are byte-identical to the fresh `dist/`; `/demo` is live; the unknown-route response is the designed HTTP 404; and the public $9 checkout redirects to the hosted offer. No payment or refund was submitted.

## Live browser verification

Fresh desktop (1440 × 1000) and phone (390 × 844) contexts exercised the live page. There were no console or page errors and no horizontal overflow.

- The desktop sample action opened `/demo` with title `Demo — Tempo Earcheck`, a persistent **Demo — sample data, nothing is saved** label, and three realistic cards: Cello shift study, Brass chorale entrance, and Violin string crossing.
- The sample BPM boundary recovered 241 as 240. Reset demo restored three cards and 96 BPM. Start for real removed the sample label and opened an empty real notebook; the sample never appeared in real storage.
- A new phone demo context became service-worker controlled, went offline, reloaded, and still showed all three cards and the sample label with no errors.
- The sample flow made only same-origin requests. Existing independent claim tests also cover recorded card persistence, import recovery and newest-edit behavior, delete/undo, free limits, keyboard shortcuts, Web Audio start/stop, and unavailable-license recovery.
- Keyboard smoke checks found the skip link first in tab order, native invalid required-field feedback, a visible focus state on the Import backup control, and reduced-motion durations of `1e-06s`.

`/opt/fleet/lib/verify-url.sh` passed for the live URL: HTTP 200, title, `lang=en`, one h1, main landmark, image alt basics, and no console errors. Axe ran on home, demo, privacy, terms, and the unknown route in both desktop and phone layouts: 10 scans, zero violations. All normal pages returned 200 with their own titles; the unknown route returned the expected designed HTTP 404 with `Page not found — Tempo Earcheck`.

A fresh Lighthouse mobile run completed without runtime error and scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100. It recorded LCP 1,399 ms, TBT 87 ms, and CLS 0.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Live hostname/TLS unavailable | Resolved; live smoke and byte-identity checks pass. |
| Stored XSS through imported history | Resolved; the regression browser test passes and no unsafe rendering was found. |
| Interactive targets below 44 px | Resolved; the target-size browser test and live Axe scans pass. |
| Missing response/cache policy and manifest MIME | Resolved; current live checks and candidate build pass. |
| Hosted $9 checkout unavailable | Resolved; live endpoint returns the hosted offer. |
| Space interfered with focused controls | Resolved; covered by browser tests. |
| Import backup focus was not visible | Resolved; direct keyboard check shows visible control focus. |
| Mobile Lighthouse performance below the gate | Resolved; fresh live mobile run is 100. |
| Demo sandbox, claim registry, plain first screen, site sections, metadata, and designed 404 missing | Resolved; direct live checks and all 24 tagged claim commands pass. |

## Evidence

- `/work/.evidence/verify-url-8/verify.json`
- `/work/.evidence/verify-8-desktop-landing.png`
- `/work/.evidence/verify-8-desktop-demo.png`
- `/work/.evidence/verify-8-phone-offline-demo.png`
- `/work/.evidence/lighthouse-verify-8-clean.json`

This static local-first PWA has no backend tenant, restart, health, or 429 surface. CLI/library/desktop artifact checks do not apply.
