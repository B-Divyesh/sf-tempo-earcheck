# Review 1 — hear, test, and record practice tempos

**Verdict: FAIL.**

Reviewed on 2026-09-06 UTC at <https://tempo-earcheck.sociobot.in/>.

- Findings: **7** (P0: 0, P1: 2, P2: 5, P3: 0)
- Untested public claims: **23**
- Implementation reviewed: `7036ed4b61a2f15124ce612692ce2166c628edde`
- Documentation reviewed: `8b161a9a18f824a3ee0431ac8885db550d28a90e`
- Live build identity: 18 of 18 public files match a clean build.

The later commits contain reports or Graphify output only. They do not change
the product implementation. The implementation SHA above is therefore the
candidate in this review.

## Job, audience, and first action

The job is to hear or tap a practice tempo, try an accented click, and record
the result and next tempo. It is for instrumentalists choosing practice or
ensemble tempos. Before scrolling, the live page offers **Open today’s tempo
desk**. It does not name the audience, offer the required sample, explain what
the action loads, or show the three required privacy, offline, and price facts.

## Findings

### F1 — P1 — The required demo sandbox does not exist

There is no **Try it with sample data** action on the first screen. Fresh visits
to `/demo` and `/?demo=1` show the same empty home screen. Both have zero sample
cards, no persistent **Demo — sample data, nothing is saved** label, no **Reset
demo**, and no **Start for real** action.

The route uses the production IndexedDB database `tempo-earcheck` and the same
`tempo:*` localStorage keys as `/`. It is not a separate sample namespace.
Writing on `/demo` would therefore write the visitor's normal local notebook.
`.factory/demo.md` is also absent. This prevents the required safe sample flow
and prevents claims from being checked in the required sandbox.

Evidence: `/work/.evidence/live-browser-evidence.json` and
`/work/.evidence/live-demo-route.png`.

### F2 — P1 — Public claims have no claim registry or claim tests

`.factory/claims.json` is absent and the repository contains zero `@claim:`
tests. The general test suite passes, but no public promise has the required
demo-based claim command. The review counts these 23 distinct public claims as
untested:

1. The product works offline after the first visit.
2. The product is installable as a PWA.
3. Tap tempo uses median interval filtering.
4. Direct tempo input supports 30–240 BPM.
5. The click supports accented meters from 2/4 through 12/4.
6. Click audio is synthesized locally without audio files.
7. Practice cards keep the name, start, passed, next BPM, and note.
8. Passed and needs-work results have timestamped history.
9. Cards persist in IndexedDB across reloads.
10. Imported cards merge by the newest edit.
11. The free edition exports a JSON backup.
12. The free edition exports a CSV summary.
13. Space, M, and Escape provide the stated keyboard controls.
14. The free edition holds five cards.
15. The free edition shows three history entries while exports keep all history.
16. A $9 one-time purchase provides the stated Notebook features.
17. The purchase action opens the registered hosted checkout at $9.
18. Practice data never leaves the browser.
19. The product does not request a microphone or record audio.
20. The product makes no analytics or advertising requests.
21. The product loads no third-party fonts or runtime scripts.
22. License verification contacts the Sociobot API at most once per day.
23. The initial click volume is a “hearing-safe level.”

Several behaviors passed direct review, but that does not replace the required
registered test for each claim. Missing, unregistered, or untagged claims are
untested under the claims contract.

### F3 — P2 — “Hearing-safe level” is not a supportable browser claim

The live control says **Starts at a hearing-safe level**. Code can assert its
gain value, but it cannot know the device output, system volume, headphones,
distance, or sound pressure at the listener. No test can prove the stated
hearing outcome. Use a concrete statement such as “Click volume starts at 50%
of this control” and retain the instruction to raise it gradually.

### F4 — P2 — The first screen and headings do not meet the plain-words contract

The title and headings use indirect or metaphorical language instead of naming
the job: **hear it, then keep it**, **Keep the evidence**, **The rehearsal tempo
paper**, **Your current finding**, **What happens next?**, **A notebook with an
exit**, and **Privacy, in plain time**. The first-screen sentence is 23 words,
over the 22-word hard cap. It describes a passage but does not name
instrumentalists as the audience.

The first action is an in-page anchor rather than the required sample action,
and it does not say what will happen after activation. The three short facts
are absent. `.factory/copy-audit.md` is absent.

Evidence: fresh desktop and phone captures in
`/work/.evidence/live-desktop-fresh-before-scroll.png` and
`/work/.evidence/live-phone-fresh-before-scroll.png`.

### F5 — P2 — Required site sections and shared navigation details are missing

The landing page has no three-step **How it works** section and no plain
**What it does not do / privacy** section. The header does not include Demo or
Privacy. The footer has no **Built by Param Factory** link or build/version ID.
External links do not identify that they leave the product. The sitemap lists
only `/`, `/privacy`, and `/terms`; it has no demo route.

These are required parts of the common product-site skeleton, not visual-style
preferences. The broadsheet identity itself is distinctive and matches the
recorded design thesis.

### F6 — P2 — Required page metadata is incomplete

The home page has no Open Graph tags, no Twitter card tags, no 1200 × 630 social
image, and no Apple touch icon link. The title **Tempo Earcheck — hear it, then
keep it** is under 60 characters but does not plainly name the practice-tempo
job. `/demo` has no demo-specific title because it is not implemented.

The existing language, description, canonical URL, favicon, theme color,
manifest, robots file, and titles for Privacy and Terms are present.

### F7 — P2 — Unknown routes return the home page with HTTP 200

`/definitely-missing-review-1` returns HTTP 200, the home title, the home h1,
and the full home product. There is no designed 404 page, no 404 response
override, and no way for a visitor to tell that the address is invalid. The
expected deliberate HTTP 404 is missing.

Evidence: `/work/.evidence/live-missing-route.png` and the route record in
`/work/.evidence/live-browser-evidence.json`.

## Current product evidence

### Clean checkout commands

A detached clean checkout at documentation SHA `8b161a9a...` used Node
22.23.2, npm 10.9.8, and the provided Playwright 1.58.2 Chromium.

| Command | Result |
| --- | --- |
| `npm ci --include=dev` | Pass; 56 packages, zero vulnerabilities |
| `npm test` | Pass; 11 Vitest tests, 23 Playwright passes, 1 intended skip |
| `npx tsc --noEmit` | Pass |
| `npm audit --audit-level=high` | Pass; zero vulnerabilities |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:live` | Pass; live HTML identity and hosted $9 checkout |

There were no claim commands to run because `.factory/claims.json` does not
exist. This absence is finding F2, not a skipped command.

### Live behavior

- Fresh desktop and 390 × 844 phone contexts had no console or page errors,
  no horizontal overflow, one h1, one main, working skip-link focus, and no Axe
  violations on Home, Demo-path, Privacy, Terms, or the unknown path.
- The live normal flow clamped 29 to 30 BPM and 241 to 240 BPM, rendered 2 and
  12 meter beats, blocked a blank name, explained an invalid 3 BPM free step,
  saved a realistic practice card, recorded a pass, and retained it on reload.
- JSON and CSV export included a realistic card. Malformed JSON produced a
  visible error. Delete cancellation, delete, and Undo behaved correctly.
- A service-worker-controlled phone retained the card and app on an offline
  reload. No cross-origin request occurred during the normal practice flow.
- Keyboard Space activated the focused New practice card button. The skip link
  had a 3 px vermilion focus outline. Reduced-motion mode reduced transitions
  and animations to 0.001 ms and used automatic scrolling.
- All crawled product and legal links returned HTTP 200. The checkout endpoint
  returned HTTP 303 to the hosted offer showing Notebook edition at $9.
- Live security headers, correct manifest MIME, no-store service-worker cache,
  and one-year immutable hashed asset caches are present.
- Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 60 ms, CLS 0.
- Build output is small: 30.97 kB JS and 15.56 kB CSS before gzip; no fonts;
  largest hero image 89.65 kB.

The normal and recovery checks used new disposable browser contexts. They did
not read or change an existing visitor's data. The required sample flow could
not be entered because it does not exist.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Live hostname/TLS unavailable | Resolved: HTTPS 200 and 18/18 build files match |
| Imported-history stored XSS | Resolved: hostile-field unit and browser tests pass |
| Targets below 44 px | Resolved: desktop and phone target test passes |
| Security/cache headers and manifest MIME | Resolved on live responses |
| $9 checkout returned 404 | Resolved: 303 to the hosted $9 offer |
| Space blocked focused buttons | Resolved in direct live keyboard use |
| Home and contact links below 44 px | Resolved by target tests |
| Import control lacked visible focus | Resolved: 3 px visible outline test passes |
| Lighthouse performance below 90 | Resolved: fresh live score 100 |

The offline/update implementation is unchanged from the last passing
verification. This review re-proved live offline persistence and inspected the
current update prompt, skip-waiting, controller-change, and cache-version code.

## Evidence files

- `/work/.evidence/live-browser-evidence.json`
- `/work/.evidence/live-build-identity.json`
- `/work/.evidence/live-delete-export-evidence.json`
- `/work/.evidence/lighthouse-live.json`
- `/work/.evidence/verify-url/verify.json`
- `/work/.evidence/live-desktop-fresh-before-scroll.png`
- `/work/.evidence/live-phone-fresh-before-scroll.png`
- `/work/.evidence/live-phone-populated.png`
- `/work/.evidence/live-demo-route.png`
- `/work/.evidence/live-missing-route.png`

## Release decision

**FAIL.** The required sample sandbox, claim registry, and claim tests are
absent, and five additional P2 contract findings remain. PASS requires zero
findings and zero untested public claims.
