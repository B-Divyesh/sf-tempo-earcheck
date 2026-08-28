# Verification report 7 — PASS

**Verified:** 2026-08-28 06:23 UTC

**Candidate:** `43f43f768ec308cb79727bff4a2ac42279d10795`

**Live URL:** <https://tempo-earcheck.sociobot.in/>

**Clean checkout:** `/tmp/tempo-earcheck-verify.nSoxbX`, detached at the candidate

## Verdict

**PASS — release this candidate.** Fresh verification found no product defect
at P0, P1, P2, or P3. The previously reported deployment-only concern does not
reproduce: all 18 public deployment artifacts are byte-identical to a clean
candidate build, and the live checkout, offline PWA, and core rehearsal workflow
work end to end.

| Severity | Count | Result |
| --- | ---: | --- |
| P0 critical | 0 | None found |
| P1 high | 0 | None found |
| P2 medium | 0 | None found |
| P3 low | 0 | None found |

## Candidate and deployment identity

- The detached candidate worktree was clean before installation and clean again
  after QA. Temporary verifier-only harnesses were removed.
- A fresh `npm run build` produced `dist/`; every deployed file other than the
  deployment-only `staticwebapp.config.json` returned HTTP 200 and matched its
  local bytes: **18/18 matched, 0 mismatched**.
- `npm run test:live` passed. Live `/` is byte-identical to `dist/index.html`;
  the Sociobot checkout returned HTTP 303 to a hosted Dodo session showing
  **Tempo Earcheck — Notebook edition** at **$9.00**.
- HTTP redirects 301 to HTTPS. The factory URL smoke check returned HTTPS 200,
  loaded in 741 ms in that run, found title/lang/one h1/main/alt basics, and
  recorded no console errors.

Key SHA-256 digests:

| Artifact | SHA-256 |
| --- | --- |
| `dist/index.html` | `c4691a2d9509fd64809bace5a978b8739265cd100b823b9b844b04b0c18a7f88` |
| `dist/sw.js` | `4dff061fb2b7d507281216866fe3375ba572cfb375e3f300774f71ddf75eec44` |
| `dist/manifest.webmanifest` | `dde6c27896e77f080265821ed8596a4fa3ae0d0529b7a73b0b3a1a111a0a4fbd` |
| `dist/assets/main-B_r8ufoK.js` | `85f1c15f47205c7b831487b3e7c31e4f7f0327ed0a8b16813ee05ff4ad434401` |
| `dist/assets/style-DVw3TVNb.css` | `1904cfec9a311b3abe63b3585b407a7f59c79e221ae3266c2b2649ae3c265dd3` |

## Clean quality gates

Environment: Node 22.23.2, npm 10.9.8, Playwright 1.58.2.

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npx -y oxlint@1.48.0 src tests scripts playwright.config.ts vite.config.ts
npm audit --audit-level=high
npm run build
```

- Clean install: 56 packages; zero vulnerabilities.
- Vitest: 2 files, **11/11 passed**.
- Playwright: **23 passed**, with one expected desktop skip for the mobile-only
  overflow assertion. The suite ran desktop Chromium and Pixel-5 390 × 844.
- Strict TypeScript passed. The repository has no lint script; supplemental
  Oxlint checked 11 files with 93 rules and reported zero warnings/errors.
- The exact production build passed and emitted `dist/`.

## End-to-end product and recovery checks

Independent browser checks, in addition to the repository suite, passed these
acceptance cases against the clean production build and the byte-identical live
deployment where applicable:

- The empty notebook gives a next action. Tempo entry recovers from 29, blank,
  and 241 as 30, 30, and 240 BPM. The 2/4 and 12/4 boundaries render the correct
  number of beat cells. Two timed taps calculated tempo.
- Start/stop click works by button and `M`, updates `aria-pressed`, announces
  tempo/meter, and does not request microphone access. Default gain is 0.08,
  half of the capped 0.16 control, with hearing-safety guidance.
- Blank required card name and a 29 BPM card value are blocked by native field
  validation. A free custom step of 3 gives specific recovery copy; changing it
  to 4 saves normally.
- Five named cards persist across reload and enforce the free limit with a clear
  export/upgrade path. A pass at 240 remains clamped at 240 next; needs-work
  records a retry without advancing.
- JSON and CSV exports contained all five cards and notes. Malformed JSON gives
  a visible error and resets the file input. A newer imported edit wins and an
  older edit does not overwrite it.
- Delete cancellation preserves the card; confirmed delete followed by Undo
  restores it, including after reload.
- Blank license restore gives actionable guidance. A controlled valid return
  token is stored, stripped from the URL, verified once, cached for the daily
  window, and remains optimistically unlocked offline. A controlled invalid
  verdict keeps the free desk enabled.
- The live desktop and mobile sessions each created a 72 BPM card, retained it
  after reload, then retained and rendered it through a service-worker-controlled
  offline reload.

## Accessibility, keyboard, responsive, and visual QA

- Home, Privacy, and Terms were scanned locally and live at 1440 × 1000 and
  390 × 844: **12 Axe scans, zero violations at any impact**, with one h1, one
  main, `lang=en`, titles, image alt, and no horizontal overflow on every route.
- All measured visible links, buttons, fields, summaries, and the visible file
  label meet the 44 px target requirement on mobile. The hidden file input
  transfers focus to the visible Import backup control with a computed
  `3px solid rgb(181, 50, 32)` outline.
- Keyboard-only checks covered Space tap, `M` click toggle, native focused-button
  activation, modal focus placement, Escape close/focus return, file import, and
  the skip link. The skip link becomes visible at top 8 px with the same 3 px
  focus ring and navigates to `#main`.
- Reduced-motion mode computes beat transition/animation durations as 0.001 ms
  and uses automatic scrolling.
- Desktop and mobile screenshots were reviewed after scrolling deferred sections
  into view. The broadsheet hierarchy, original metronome illustration, stacked
  mobile layout, cards, ownership controls, purchase panel, and footer render
  coherently without clipping or apparent image artifacts.
- No console errors, page errors, unexpected request failures, or manifest parse
  errors were found locally or live.

## Performance and bundle budgets

Lighthouse 12.8.2 used its default simulated-mobile profile against fresh local
production preview sessions. All final reports completed without runtime error:

| Run | Performance | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local 1 | 88 | 100 | 100 | 100 | 0.97s | 1.87s | 444ms | 0 |
| Local 2 | 95 | 100 | 100 | 100 | 0.90s | 1.66s | 238ms | 0 |
| Local 3 | 99 | 100 | 100 | 100 | 0.90s | 1.81s | 70ms | 0 |
| Live | 98 | 100 | 100 | 100 | 0.97s | 1.42s | 164ms | 0 |

The local median performance score is **95** (gate: 90). The first run shows
normal CPU-throttling variance, while median, live score, LCP, and CLS pass.

- Initial JS: 30,972 bytes / 10.69 kB gzip (budget 200 KB).
- CSS: 15,563 bytes / 4.26 kB gzip (budget 50 KB).
- Fonts: none. Mobile WebP: 24,934 bytes; largest hero variant: 89,654
  bytes (budget 300 KB).
- Lighthouse transfer was about 108 kB on the recorded local/live runs.

## PWA, privacy, and response policy

- Local and live manifests parse with zero browser errors and specify standalone
  display, versioned `/?v=1` start URL, matching theme/background colors, real
  192/512 PNG icons, and a 512 px maskable icon.
- Offline reload retains IndexedDB cards and permits local tempo changes. A
  controlled old-to-new worker test displayed **A fresh edition is ready / Update
  now**, activated the new worker, removed the old cache, retained control, and
  preserved the saved card. Only the new shell cache remained.
- Fresh local and live workflows made only same-origin requests. Source inspection
  found no analytics, trackers, remote fonts/scripts, media files, microphone
  API, or undisclosed egress. The only runtime cross-origin code path is the
  disclosed Sociobot license API; the external contact link requires user action.
- Live responses include CSP, HSTS, COOP/CORP, XFO DENY, `nosniff`, strict
  referrer policy, and a permissions policy denying microphone/camera/location.
  HTML and manifest revalidate after five minutes; `sw.js` is no-store/no-cache;
  hashed assets and icons are immutable for one year; manifest MIME is correct.
- The live invalid-license endpoint returned HTTP 200, `Cache-Control: no-store`,
  the expected invalid verdict, and the correct origin-specific CORS response.

## Scope notes

- This is a static offline PWA, not a library, CLI, or backend; consumer-package,
  concurrency, health, and server-persistence tests are not applicable.
- No real payment, refund, or provider-issued license was created. The hosted
  offer was inspected without submitting payment; valid/invalid client behavior
  was exercised with controlled API responses.
- Automated checks confirmed Web Audio scheduling and observable start/stop
  state; headless QA cannot make a subjective loudness judgment.
