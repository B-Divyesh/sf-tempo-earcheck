# Review 2 — hear, test, and record practice tempos

**Verdict: PASS.**

Reviewed 2026-09-06 UTC at <https://tempo-earcheck.sociobot.in/>.

- Findings: **0** (P0: 0, P1: 0, P2: 0, P3: 0)
- Untested public claims: **0**
- Implementation candidate: `4cef30cc6b2815a78d529a10bbc969a0025cfb78`
- Prior documentation/report commit: `97d5e7c0bf8f2f8ae6c5c73698cb004e48c004aa`
- Review baseline: `e04a328256fab5ca61d717ef8f961f496a40d892`
- Clean checkout: `/tmp/tempo-earcheck-review-2`, detached at the implementation candidate

The prior QA record identifies `c50443af121a5787031ab628fcfef86f8241a5cf`
as its documentation/Graphify candidate, with its verification report committed
at `97d5e7c`. The current baseline adds Graphify output only. A path-level diff
proves that runtime code, tests, assets, claims, README, and the brief/design/
demo/copy documents are unchanged from `4cef30c`. The separately referenced
`factory-evidence/tempo-earcheck-verify-8/qa-report.md` was not mounted in this
worker; the full committed `.factory/verification-8.md` was read before review,
and every required check was repeated independently.

## Job, audience, and first action

The job is to hear, test, and record practice tempos. The audience is
instrumentalists choosing practice or ensemble tempos. Before scrolling on both
desktop and phone, the page states both facts and offers **Try it with sample
data**. Adjacent text says that the action loads three filled practice cards.
The same first screen shows the offline, local-storage, and price facts.

The title is `Tempo Earcheck — record practice tempos`. The h1 is `Hear, test,
and record practice tempos`. The copy uses direct product terms and no
metaphorical section headings.

## Clean candidate verification

The following commands passed from the detached clean checkout:

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npx -y oxlint@1.48.0 src tests scripts playwright.config.ts vite.config.ts
npm audit --audit-level=high
npm run build
npm run test:live
```

Vitest passed 14 tests. Playwright collected 74 tests: 73 passed and one
desktop-project skip for a mobile-only overflow assertion; that assertion
passed in the mobile project. TypeScript, Oxlint, and the dependency audit
reported no errors, warnings, or vulnerabilities. The build produced `dist/`.
Initial JavaScript is 39.44 kB raw and 13.02 kB gzip. CSS is 19.75 kB raw and
5.13 kB gzip. There are no web fonts, and the largest hero image is 89.65 kB.

`npm run test:live` proved HTTP 200 for the product and byte identity for all 22
deployed public files. It also proved the designed HTTP 404 and the hosted $9
offer. No runtime or tested public-contract file differs between the
implementation candidate and the review baseline.

## Public claim audit

`.factory/claims.json` contains 24 claims. Each ID appears in exactly one tagged
test. Every exact command in the registry was run separately from the clean
checkout and passed.

| Claim | Result |
| --- | --- |
| `demo-isolation` | Pass |
| `offline-reload` | Pass |
| `installable-pwa` | Pass |
| `tap-tempo` | Pass |
| `bpm-range` | Pass |
| `accented-meter` | Pass |
| `local-click` | Pass |
| `practice-card-fields` | Pass |
| `attempt-history` | Pass |
| `card-persistence` | Pass |
| `newest-import` | Pass |
| `json-export` | Pass |
| `csv-export` | Pass |
| `keyboard-controls` | Pass |
| `free-card-limit` | Pass |
| `history-limit` | Pass |
| `paid-offer` | Pass |
| `local-practice-data` | Pass |
| `no-tracking-assets` | Pass |
| `license-daily` | Pass |
| `default-volume` | Pass |
| `card-delete` | Pass |
| `license-restore` | Pass |
| `no-account` | Pass |

The live pages, legal copy, README, manifest, and product controls were
cross-checked against the registry. No additional testable public promise was
found. The copy audit reports no sentence over 22 words and no banned wording.

## Live desktop and phone verification

Fresh 1440 × 1000 desktop and 390 × 844 phone contexts opened the live page.
There were no product console errors, page errors, failed requests, or
horizontal overflow. The expected network status from deliberately navigating
to the HTTP 404 was classified as the intended 404, not an application error.

The desktop sample flow opened `/demo` and showed the title `Demo — Tempo
Earcheck`, the persistent **Demo — sample data, nothing is saved** label, Reset
demo, Start for real, and these realistic cards:

- Cello shift study: 72 BPM start, 80 BPM last passed, 84 BPM next, 4/4, note,
  and dated passed/needs-work history
- Brass chorale entrance
- Violin string crossing

The live click started and stopped, two taps calculated a tempo, 29 and blank
BPM recovered to 30, and 241 recovered to 240. A result persisted after a live
reload. An invalid 3 BPM step produced specific recovery text; changing it to 4
saved the card. Malformed JSON produced a clear import error without losing the
notebook. Reset restored three cards, 96 BPM, 4/4, and the original sample data.

The sample used `demo:tempo-earcheck`. Start for real removed that database,
removed the persistent sample label, and opened an empty real notebook. The
registered isolation test additionally created real and sample cards, reset and
left the sample, and proved only the real card remained. All browser profiles
were disposable; no existing visitor data was read or changed.

A fresh phone context became service-worker controlled, went offline, reloaded
`/demo`, and retained the three cards and sample label. The phone remained
exactly 390 CSS pixels wide without overflow. The sample flows made only
same-origin requests.

Keyboard checks proved the skip link is first and gets a 3 px vermilion focus
ring, Space activates a focused button instead of tapping tempo, dialog focus
starts at the name field, blank required input remains invalid, Escape closes
the dialog and returns focus, and the visible Import backup control receives a
3 px focus ring. Reduced-motion mode uses automatic scrolling and 0.001 ms
transition/animation durations.

## Accessibility, routes, privacy, and performance

- `/opt/fleet/lib/verify-url.sh` passed the live page: HTTP 200, title,
  `lang=en`, one h1, main landmark, image alt text, button names, and no console
  errors.
- Axe scanned home, demo, privacy, terms, and the missing-page route at desktop
  and phone sizes: 10 scans, zero violations.
- Home, demo, privacy, and terms return HTTP 200 with route-specific titles,
  one h1, header, main, and footer. The unknown route returns the expected HTTP
  404 with `Page not found — Tempo Earcheck`, a designed page, and routes home.
- The sitemap lists all four public routes. The manifest, icons, social image,
  robots file, and internal links return the expected successful responses.
  The Param Factory link returns 200.
- Live HTML has CSP, frame protection, permissions policy, HSTS, COOP/CORP,
  `nosniff`, and a strict referrer policy. The service worker is not cached;
  hashed assets are cached immutable for one year; the manifest has the correct
  MIME type.
- Fresh practice/demo flows made no analytics, advertising, font, script,
  media, microphone, or undisclosed cross-origin request. The explicit license
  path is limited to the documented Sociobot billing origin.
- Fresh live mobile Lighthouse scored Performance 100, Accessibility 100, Best
  Practices 100, and SEO 100. LCP was 1,454 ms, TBT 91 ms, and CLS 0.

The automated suite also covered storage/audio failure recovery, XSS-safe
imports, newest-edit merge behavior, export content, delete/undo, free limits,
controlled update activation, and valid, invalid, revoked, unavailable, cached,
and offline license states.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Live hostname and TLS unavailable | Resolved: HTTPS 200, HTTP-to-HTTPS redirect, and live byte identity pass. |
| Imported-history stored XSS and outbound request | Resolved: hostile import test rejects the data, creates no node, and makes no request. |
| Controls and links below 44 px | Resolved: desktop/mobile target test passes. |
| Missing response policy, cache policy, and manifest MIME | Resolved: current live headers and MIME pass direct inspection. |
| Hosted $9 checkout unavailable | Resolved: live endpoint returns HTTP 303 to the named $9 hosted offer. |
| Space suppressed focused controls | Resolved: direct live keyboard test and regression test pass. |
| Import backup focus was invisible | Resolved: direct live check reports a visible 3 px vermilion outline. |
| Mobile Lighthouse below 90 | Resolved: fresh live result is 100. |
| No isolated one-click sample | Resolved: direct desktop/phone/offline flows and the isolation claim pass. |
| No claim registry or tagged claim tests | Resolved: 24 claims, one tag each, and all 24 commands pass. |
| Unsupported “hearing-safe” wording | Resolved: removed; the measured 50% default claim passes. |
| First screen and headings were indirect | Resolved: job, audience, action, outcome, and facts appear before scrolling. |
| Required sections and shared navigation were missing | Resolved: direct live inspection and structure tests pass. |
| Social metadata and route metadata were incomplete | Resolved: metadata tests and live route checks pass. |
| Unknown routes returned the home page with 200 | Resolved: deployed unknown routes return the designed HTTP 404. |

## Scope and evidence

This is a static local-first PWA. Backend tenant isolation, server restart
persistence, health, and 429/Retry-After checks do not apply. CLI, library, and
desktop consumer-install checks do not apply. No payment or refund was
submitted; the public hosted offer and controlled license outcomes were tested.

Evidence:

- `/work/.evidence/review-2/live-browser-evidence.json`
- `/work/.evidence/review-2/desktop-home-before-scroll.png`
- `/work/.evidence/review-2/desktop-demo-populated.png`
- `/work/.evidence/review-2/phone-home-before-scroll.png`
- `/work/.evidence/review-2/phone-demo-offline.png`
- `/work/.evidence/review-2/verify-url/verify.json`
- `/work/.evidence/review-2/lighthouse-live.json`

## Release decision

**PASS — zero findings of every severity and zero untested claims.**
