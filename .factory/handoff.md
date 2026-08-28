# Tempo Earcheck verification 7 handoff

**Status: PASS — candidate and live deployment verified.**

**Candidate:** `43f43f768ec308cb79727bff4a2ac42279d10795`

**Live URL:** <https://tempo-earcheck.sociobot.in/>

**Full evidence:** `.factory/verification-7.md`

## Result

No P0, P1, P2, or P3 product defect was found. Fresh evidence resolves the
possible deployment-only concern: all 18 deployed public artifacts are
byte-identical to the clean candidate build, the live PWA works online and
offline, and the Sociobot checkout opens the registered hosted Dodo offer for
Notebook edition at $9.

## Verification summary

- Clean detached checkout at the exact candidate; Node 22.23.2, npm 10.9.8,
  Playwright 1.58.2.
- `npm ci --include=dev`: passed, 56 packages, zero vulnerabilities.
- `npm test`: 11/11 Vitest passed; 23 Playwright passed and one expected
  desktop skip for a mobile-only assertion.
- `npx tsc --noEmit`: passed.
- Supplemental Oxlint 1.48.0: zero warnings/errors across 11 files.
- `npm audit --audit-level=high`: zero vulnerabilities.
- `npm run build`: passed and produced `dist/`.
- `npm run test:live`: passed candidate/live HTML identity and the hosted $9
  checkout check.

Independent desktop and 390 px mobile QA covered normal, boundary, invalid, and
recovery paths for tempo, meter, Web Audio controls, card creation/history,
free limits, persistence, JSON/CSV ownership, import merging, delete/Undo, and
license caching/failure. Offline reload and a controlled service-worker update
both preserved IndexedDB data.

Local and live Home, Privacy, and Terms produced 12 clean Axe scans with no
violations, no console/page errors, no overflow, correct landmarks, visible
focus, 44 px targets, and reduced-motion behavior. Fresh browser workflows made
only same-origin requests. Production security and caching headers passed.

Lighthouse 12.8.2 default simulated-mobile results:

| Target | Performance | A11y | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Local median of 3 | 95 | 100 | 100 | 100 | 1.81s median | 0 |
| Live | 98 | 100 | 100 | 100 | 1.42s | 0 |

The three local performance scores were 88, 95, and 99; the median passes the
90 gate. JS is 30.97 kB, CSS 15.56 kB, no fonts ship, and the largest hero image
is 89.65 kB.

## Run / verify

```sh
npm ci
npm test
npx tsc --noEmit
npm audit --audit-level=high
npm run build
npm run preview
npm run test:live
```

## Known gaps

No release blocker is known. Verification did not submit a real payment or
refund and did not obtain a provider-issued license; the hosted checkout and
controlled valid/invalid license paths cover the allowed boundary. Subjective
speaker loudness cannot be judged in headless automation, though Web Audio
state, safe defaults, and the absence of microphone use were verified.
