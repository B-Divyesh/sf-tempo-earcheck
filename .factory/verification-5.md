# Verification report 5 — FAIL

**Verified:** 2026-08-28 03:58 UTC

**Candidate:** `7706f29b67b6deb0d92b127e1a8adb920c06e504`

**Live URL:** <https://tempo-earcheck.sociobot.in/>

**Clean checkout:** `/tmp/tempo-earcheck-verify5`, detached at the candidate

## Verdict

**FAIL — do not release.** The earlier hostname/deployment-only failure is no
longer present: the live site has valid HTTPS and all 18 checked deployed files
match the fresh candidate build byte-for-byte. The core offline tempo and
practice-card job works. However, the advertised one-time purchase still cannot
start because the required live Sociobot checkout returns 404. Two keyboard and
touch-target acceptance defects also remain.

## Defects

### P1 — the advertised $9 one-time purchase cannot start

The live **Buy Notebook edition · $9** link correctly targets the contract URL,
but a fresh request at 2026-08-28 03:50 UTC returned:

```text
GET https://api.sociobot.in/api/v1/products/tempo-earcheck/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The adjacent verification API is reachable and returned HTTP 200 with
`{"expires_at":null,"reason":"invalid","valid":false}` for a QA token. The
live UI also handled that invalid token and left the free desk enabled. This
isolates the failure to product registration/enabling in the billing service,
not the frontend link or general API availability. Register and enable the live
`tempo-earcheck` product at the advertised price, then verify hosted checkout,
return URL, token storage, and a real valid-license unlock.

### P2 — Space suppresses native activation for focused buttons

The global Space shortcut does not exclude buttons. On both the candidate and
live deployment, at 390 × 844:

1. Focus **New practice card**.
2. Press Space, the standard native button activation key.
3. The dialog does not open; instead the tempo status changes to **One tap
   heard. Keep going.**
4. Pressing Enter on the same focused button does open the dialog.

This affects buttons outside the dialog because the global keydown handler
prevents Space's default action. Do not intercept Space when focus is on any
interactive control.

### P2 — two links remain below the 44 × 44px target contract

Bounding-box measurements on both candidate and live output found:

| Link | Viewport | Rendered size |
| --- | --- | ---: |
| Masthead **Tempo Earcheck** home link | 390 × 844, all routes | 254 × 24px |
| Privacy-page `sociobot.in` link | desktop and 390px | 76.5 × 17px |

All other visible controls checked on the home, Privacy, and Terms pages met
44 × 44px. Lighthouse's spacing-aware target audit passed, but the explicit
factory contract requires the target itself to be at least 44 × 44px.

## Clean checkout and repository gates

Environment: Node 22.23.2, npm 10.9.8, Chromium 145 supplied for Playwright
1.58.2.

```sh
npm ci --include=dev
npm test
npx tsc --noEmit
npm audit --audit-level=high
npm run build
```

- Clean install: 56 packages installed; 0 vulnerabilities.
- Vitest: 2 files, 11/11 tests passed.
- Playwright: 16 passed, 2 intentional project skips for mobile-only checks.
- Strict TypeScript: passed. No lint script or lint configuration is declared.
- Exact production build: passed and created `dist/`; the clean worktree
  remained unmodified.
- Initial JS: 30,873 bytes (10,557 gzip); CSS: 15,329 bytes (4,212 gzip).
  The mobile hero WebP is 24,934 bytes and the 1280px WebP is 89,654 bytes.
  These pass the 200 KB JS, 50 KB CSS, and 300 KB hero budgets.

## Independent product exercise

The same fresh 390px journey passed against the local production preview and
the live deployment:

- Direct BPM values 1, 999, and blank recovered to 30, 240, and 30. Meter 2/4
  and 12/4 produced 2 and 12 beat cells. Two 500ms taps produced a tempo result.
- Keyboard `M` started/stopped synthesized Web Audio with correct pressed state;
  a forced AudioContext failure produced a specific recovery message.
- Blank required name kept the modal open with native validation. Free step 3
  produced the specific preset error; correcting it to 4 saved successfully.
- A named 240 BPM card persisted across reload. Passed BPM and next BPM remained
  clamped to 240; passed and needs-work results were recorded.
- A separate return-day flow passed at 80 BPM, offered 84 next, loaded that
  value with the saved 7/4 meter, then persisted a renamed card and 8 BPM step.
- Four results retained full export history while the free on-screen history
  correctly showed three and explained the limit.
- JSON and CSV downloads contained the saved card and all four attempts.
- Malformed JSON showed an error. A hostile history BPM was rejected, rendered
  no injected node, and caused no `/qa-outbound` request. A valid escaped-name
  import merged successfully.
- Delete cancellation retained the card; confirmed deletion followed by
  **Undo** restored it.
- Five cards could be created; the sixth was blocked with the stated free-limit
  message while export remained available.
- The native dialog focused its name field, closed with Escape, and returned
  focus to **New practice card**. The first Tab focused the visible skip link,
  whose focus outline was 3px solid `rgb(181, 50, 32)`.
- Forced IndexedDB failure showed **The local notebook did not open** and a
  working **Try again** action.

The P2 Space conflict above is the only failed keyboard behavior in this
exercise.

## Accessibility, responsive UI, privacy, and performance

- Axe 4.13 returned 0 violations at any impact level (therefore 0 serious or
  critical) on home, Privacy, and Terms, for both local/live and 1440 × 1000 /
  390 × 844: 12 scans total.
- Every scan had `lang=en`, one `h1`, one `main`, correct titles, no missing alt
  text, no horizontal overflow, and no console, page, or request errors.
- Reduced-motion contexts computed transitions/animations to `1e-06s`
  (0.001ms) and `scroll-behavior: auto` locally and live.
- Fresh normal loads requested only their own origin. Source inspection found
  no analytics, telemetry, CDN font/script, microphone, or hidden remote data
  path. The only runtime cross-origin request is the disclosed Sociobot license
  verification after a token is supplied. Practice data persisted in IndexedDB;
  settings and optional license data used localStorage.
- Fresh Lighthouse 12.8.2 mobile simulated throttling against live: Performance
  **94**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0s,
  LCP 1.4s, TBT 290ms, CLS 0, total transfer 104 KiB. A separate Event Timing
  sample across repeated tap/card interactions observed a maximum 96ms live
  interaction duration (32ms local), below the 200ms interaction budget.
- Desktop and 390px full-page screenshots were visually reviewed. The original
  monochrome rehearsal-broadsheet direction remained coherent and readable;
  the mobile layout intentionally stacked without cropping or overlap.

## PWA, response policy, and live identity

- Chromium parsed the live manifest with no errors: standalone display,
  versioned `/?v=1` start URL, matching theme/background colors, 192/512 icons,
  and a 512px maskable icon.
- After service-worker control, local and live reloads succeeded offline with
  the main product and persisted cards available and no browser errors.
- A fresh update simulation served the unmodified candidate shell, then a new
  worker version. The app displayed **A fresh edition is ready / Update now**;
  activating it preserved control, left no waiting worker, removed the old
  cache, and left only `tempo-earcheck-qa-update-2-shell`.
- `/opt/fleet/lib/verify-url.sh` passed the live URL: HTTPS 200, 883ms load in
  that run, correct title/lang/one h1/main, no missing alt or unnamed buttons,
  and no browser errors.
- HTTP redirects 301 to HTTPS. TLS is valid for
  `tempo-earcheck.sociobot.in` (2026-08-27 through 2027-02-27).
- Live HTML has CSP (`script-src 'self'`, `frame-ancestors 'none'`), XFO DENY,
  COOP/CORP, permissions policy including `microphone=()`, nosniff, strict
  referrer policy, and HSTS. HTML/manifest/offline responses revalidate at five
  minutes, `sw.js` is no-store/no-cache, and hashed assets/icons are immutable
  for one year. The manifest MIME is `application/manifest+json`.
- All 18 checked live build files matched candidate `dist/` byte-for-byte,
  including HTML entries, offline shell, worker, manifest, robots/sitemap,
  JS/CSS/source map, both WebPs, JPEG, and all icons. Key SHA-256 values:

| File | SHA-256 |
| --- | --- |
| `index.html` | `6b9e18667772edac0da1a129aeccd10025830d411d4534a7feecb451a9eb2cea` |
| `sw.js` | `5ce73ed1dd395237f9482b0a1b03094db1e1cf1c600e21f4bffe75785237bc18` |
| `manifest.webmanifest` | `dde6c27896e77f080265821ed8596a4fa3ae0d0529b7a73b0b3a1a111a0a4fbd` |
| `assets/main-CueWJMHJ.js` | `1afc90aa3b9470d976cea6c99be9ccce47f0ba0fc8d63978ecd2f2df6521ee96` |
| `assets/style-Bsp8zWWd.css` | `7baaa57fc3e776f1c527bc0509100f0c6a9d013902c05fb85f701c88fc0a8dc4` |

## Required before re-verification

1. Enable the live Sociobot product and complete a real checkout/return/unlock
   test.
2. Preserve native Space activation when focus is on a button or other
   interactive control.
3. Increase the two undersized link hit regions to at least 44 × 44px.
