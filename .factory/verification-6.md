# Verification report 6 — FAIL

**Verified:** 2026-08-28 05:20 UTC

**Candidate:** `942162141617a575edd5253e59f6ba3eefed718e`

**Live URL:** <https://tempo-earcheck.sociobot.in/>

**Clean checkout:** `/tmp/tempo-earcheck-verify6`, detached at the candidate

## Verdict

**FAIL — do not release this candidate.** The deployed application is the exact
candidate build, the previously reported deployment and checkout failures are
resolved, and the core offline rehearsal workflow works end to end. Two P2
acceptance failures remain: keyboard focus is invisible on the Import backup
control, and the median fresh mobile Lighthouse performance score is 87, below
the required 90.

There are no P0 or P1 findings in this run.

## Defects

### P2 — Import backup has no visible keyboard focus indicator

Reproduced in fresh Chromium on both the clean local production build and the
live deployment, at desktop and 390 × 844:

1. Focus **Export summary (.csv)**.
2. Press Tab once.
3. `document.activeElement` becomes `#import-file`, and pressing Enter opens
   the file chooser, so the control is keyboard-operable.
4. No focus indicator is visible on **Import backup**.

Computed evidence at 390px:

- focused element: `INPUT#import-file`
- input opacity: `0`
- input box: 22 × 20 CSS px
- input outline: `3px solid rgb(181, 50, 32)`, hidden by the input's opacity
- visible `.file-button` label outline: `none 0px`
- the label matches `:focus-within`, but no style uses that state

A screenshot of the focused ownership section likewise showed no visual
change. This violates the explicit visible-focus baseline even though Axe does
not detect it. Apply the designed focus treatment to the visible label when its
file input is `:focus-visible`/`:focus-within`.

### P2 — fresh mobile Lighthouse performance misses the ≥90 gate

Lighthouse 12.8.2 was run against the exact local production preview three
times with its default simulated-mobile throttling:

| Run | Performance | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local 1 | 87 | 100 | 100 | 100 | 0.98s | 1.74s | 487ms | 0 |
| Local 2 | 95 | 100 | 100 | 100 | 1.03s | 1.93s | 243ms | 0 |
| Local 3 | 87 | 100 | 100 | 100 | 0.90s | 1.66s | 491ms | 0 |
| Live | 87 | 100 | 100 | 100 | 1.3s | 1.8s | 500ms | 0 |

The local median is **87**, and the independent live run is also **87**. LCP,
CLS, transfer size, and interaction latency pass, but the acceptance contract
also explicitly requires a Lighthouse performance score of at least 90. The
failed runs attributed the largest main-thread cost to style/layout and
reported approximately 490–500ms total blocking time.

## Candidate and deployment identity

- The detached worktree was clean before and after verification.
- All 18 publicly deployed files (excluding the deployment-only
  `staticwebapp.config.json`) returned HTTP 200 and were byte-identical to the
  fresh candidate `dist/` output.
- Key SHA-256 digests:

| File | SHA-256 |
| --- | --- |
| `index.html` | `1623419feab24cf901363e989b285515ab504c2be14d74a5cacc76d2336739f8` |
| `sw.js` | `6fe5377ed8ec4eb9df478c2b1b1e6c188b7eb79b37cbaad01e9b23c8a44391e5` |
| `manifest.webmanifest` | `dde6c27896e77f080265821ed8596a4fa3ae0d0529b7a73b0b3a1a111a0a4fbd` |
| JS | `85f1c15f47205c7b831487b3e7c31e4f7f0327ed0a8b16813ee05ff4ad434401` |
| CSS | `f8cb4bb15e127e11d5630b1b088fa75f9d26440aaa93273cd0997122289e94fb` |

- The factory `verify-url.sh` passed: HTTPS 200, 706ms browser load in that
  run, title/lang/one h1/main/alt/button checks passed, and no console errors.
- HTTP redirects 301 to HTTPS.

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
- Vitest: 2 files, 11/11 tests passed.
- Playwright: 19 passed and one intentional desktop skip for the mobile-only
  overflow assertion; both desktop Chromium and 390 × 844 ran.
- Strict TypeScript passed. The repository has no lint script; supplemental
  Oxlint checked 11 files with 93 rules and found zero errors/warnings.
- The exact production build passed and produced `dist/`.
- Initial JS: 30,972 bytes / 10.69 kB gzip (budget 200 KB).
- CSS: 15,479 bytes / 4.25 kB gzip (budget 50 KB).
- No web fonts. Mobile-selected hero WebP is at most 89,654 bytes (budget
  300 KB). Lighthouse transferred 105–144 KiB total.

## Product workflow and recovery evidence

The following passed against the clean production build and was repeated on
the byte-identical live deployment where applicable:

- BPM entry clamps 29, blank, and 241 to 30, 30, and 240; 2/4 and 12/4 render
  the expected beat counts.
- Two timed taps calculated a plausible 113 BPM. Start/stop Web Audio changed
  `aria-pressed` correctly; the default gain is 0.08 against a capped 0.16
  control (50%), and no microphone API was called.
- A free custom step of 3 produced specific inline recovery guidance; changing
  it to 4 saved normally.
- Five cards saved, survived reload, and enforced the free limit with a clear
  export/upgrade message. A pass at 240 BPM kept the next tempo clamped at 240;
  needs-work added a retry result.
- JSON and CSV downloads contained all five cards. Malformed JSON produced a
  visible error and reset the picker. A 1,001-entry history was rejected.
- An older imported edit did not overwrite the local card; a newer edit did,
  confirming the documented last-write-wins boundary.
- The prior stored-XSS case remains repaired: tests cover hostile attempt id,
  date, BPM, and outcome; the browser test produced neither DOM insertion nor
  an outbound request.
- Delete cancellation retained the card; confirmed delete followed by Undo
  restored it and it remained after reload.
- Blank license restore gave actionable feedback. Controlled valid return-token
  handling stored the token, stripped it from the URL, unlocked, verified only
  once within a day, and stayed optimistically unlocked offline. A controlled
  invalid verdict kept the free desk enabled.

## Accessibility, responsive behavior, and visual review

- Local and live home, Privacy, and Terms pages were tested at 1440 × 1000 and
  390 × 844. All 12 full Axe scans returned zero violations at any impact level.
- Each route has `lang=en`, the correct title, one `h1`, one `main`, no missing
  image alt, no horizontal overflow, and no console/page/request failures.
- All measured visible controls and links are at least 44 × 44 CSS px. The file
  input focus defect above is the exception to the focus-state requirement.
- Focused-button Space opens **New practice card** without triggering tap tempo.
  The modal receives focus, keeps keyboard traversal out of background
  controls, closes with Escape, and returns focus to its opener.
- Reduced motion computes transitions and animations to 0.001ms and restores
  automatic scrolling.
- Desktop and 390px screenshots were reviewed. The recorded monochrome
  rehearsal-broadsheet system remains coherent and intentionally stacked on
  mobile; the original hero has no apparent text, logo, anatomy, seam, crop, or
  contrast defect.

## PWA, privacy, and response policy

- Chromium parsed both local and live manifests with zero errors. They specify
  standalone display, versioned `/?v=1` start URL, matching theme/background
  colors, real 192/512 PNGs, and a 512px maskable icon.
- A live 390px session became service-worker controlled, saved a card, went
  offline, reloaded the full application, and retained the card with zero
  browser errors.
- A fresh controlled update simulation displayed **A fresh edition is ready /
  Update now**. Activating it replaced the old cache with only
  `tempo-earcheck-qa6-update-shell`, retained control, and preserved the card.
- Fresh local and live loads made only same-origin requests. There are no
  analytics, trackers, CDN fonts/scripts, microphone calls, or unexpected data
  egress. The only code path for cross-origin runtime traffic is the disclosed
  Sociobot purchase/license service.
- Live HTML has restrictive CSP, HSTS, XFO DENY, COOP/CORP, `nosniff`, strict
  referrer policy, and a permissions policy denying microphone/camera/location.
- HTML, manifest, and offline fallback revalidate after five minutes; `sw.js`
  is no-store/no-cache; hashed assets and icons are immutable for one year; the
  manifest MIME is `application/manifest+json`.

## Purchase boundary

- `npm run test:live` passed.
- The public checkout returned HTTP 303 to
  `checkout.dodopayments.com/session/cks_*`; the hosted page returned 200 and
  displayed **Tempo Earcheck — Notebook edition** at **$9.00** with no page
  errors.
- The live invalid-token endpoint returned HTTP 200 with
  `{valid:false, reason:"invalid"}` and `Cache-Control: no-store`.
- No charge or refund was submitted. A real provider-webhook-issued license was
  therefore not generated; return/unlock behavior is covered with controlled
  valid and invalid verification responses.

## Required before re-verification

1. Give the visible Import backup control the same designed focus treatment as
   other controls when its hidden input receives keyboard focus.
2. Reduce or defer the style/layout/main-thread work enough for the median
   default mobile Lighthouse performance score to reach at least 90, then
   repeat several clean runs to account for variance.
