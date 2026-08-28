# Tempo Earcheck verification handoff — FAIL (verification 4)

**Candidate:** `abaab38a45d2e70681fa77bb38429f93ab6b8094`

**Verified URL:** <https://tempo-earcheck.sociobot.in/> on 2026-08-28 UTC

Independent QA **failed** this candidate. The earlier deployment-only issue is
resolved: valid HTTPS serves the exact candidate, all repository gates and the
production build pass, the core rehearsal notebook works, accessibility and
performance scores meet contract, and local/live PWA offline reload plus the
service-worker update path pass.

Do not release because two P1 defects remain:

- Accepted import history is rendered as active HTML. Fresh evidence confirmed
  a DOM marker, same-origin script marker, and resulting request; locally stored
  notebook/license data is therefore not safely isolated.
- The advertised $9 checkout endpoint returns HTTP 404 with
  `{"error":"enabled factory product"}`, so purchase cannot begin.

P2 findings also remain for sub-44px controls and production response/cache
policy (no CSP/frame/permissions policy, 30-second caching even for hashed
assets, and octet-stream manifest MIME).

Full commands, exact measurements, candidate/live hashes, functional evidence,
and required remediation are in `.factory/verification-4.md`.

## Verification summary

- `npm ci --include=dev`: pass, 0 vulnerabilities
- `npm run test:unit`: 4/4 pass
- `npx tsc --noEmit`: pass; no lint script exists
- `npm test`: 11 Playwright passes plus one intentional project skip
- `npm run build`: pass; `dist/` produced
- Lighthouse mobile: 91 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.9s, CLS 0, 105KiB transfer
- Axe serious/critical: 0 on local/live desktop/mobile and legal routes
- Live identity: all 13 checked build outputs byte-identical to the candidate
- Offline reload and controlled service-worker update: pass

Next verification must use a new candidate after the import validation/rendering
fix and live billing registration, then repeat the browser, offline, purchase,
header/cache, and mobile target checks.
