# Graph Report - repo  (2026-09-06)

## Corpus Check
- 34 files · ~127,330 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 306 nodes · 449 edges · 26 communities (22 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `507864f9`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- main.ts
- compilerOptions
- Tempo Earcheck
- domain.ts
- scripts
- Findings
- db.ts
- Metronome
- postbuild.mjs
- Defects
- release-policy.test.ts
- verify-live.mjs
- Verification report 2 — FAIL
- Verification report 6 — FAIL
- Verification report 5 — FAIL
- Verification report — FAIL
- Verification report 7 — PASS
- Tempo Earcheck copy audit
- TestAudioContext
- Tempo Earcheck sample notebook
- Tempo Earcheck (`tempo-earcheck`) — factory product contract
- claims-registry.test.ts

## God Nodes (most connected - your core abstractions)
1. `bindHomeEvents()` - 20 edges
2. `handleCardAction()` - 13 edges
3. `homePage()` - 11 edges
4. `resetDemo()` - 11 edges
5. `scripts` - 10 edges
6. `Verification report 6 — FAIL` - 10 edges
7. `putCard()` - 9 edges
8. `validateImport()` - 9 edges
9. `setBpm()` - 9 edges
10. `handleCardSubmit()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `handleCardAction()` --calls--> `deleteCard()`  [EXTRACTED]
  src/main.ts → src/db.ts
- `resetDemo()` --calls--> `clearCards()`  [EXTRACTED]
  src/main.ts → src/db.ts
- `handleCardSubmit()` --calls--> `clampBpm()`  [EXTRACTED]
  src/main.ts → src/domain.ts
- `setBpm()` --calls--> `clampBpm()`  [EXTRACTED]
  src/main.ts → src/domain.ts
- `tapTempo()` --calls--> `bpmFromTaps()`  [EXTRACTED]
  src/main.ts → src/domain.ts

## Import Cycles
- None detected.

## Communities (26 total, 4 thin omitted)

### Community 0 - "main.ts"
Cohesion: 0.09
Nodes (59): getCards(), mergeCards(), putCard(), tempoName(), announceCards(), beatCells(), bindHomeEvents(), bindSharedEvents() (+51 more)

### Community 1 - "compilerOptions"
Cohesion: 0.11
Nodes (17): DOM, DOM.Iterable, ES2022, node, src, vite/client, vite.config.ts, compilerOptions (+9 more)

### Community 2 - "Tempo Earcheck"
Cohesion: 0.08
Nodes (22): Asset plan and provenance, Direction, Layout and interaction grammar, Motion policy, Tempo Earcheck — visual thesis, Tokens, Type, Browser, accessibility, offline, and performance checks (+14 more)

### Community 3 - "domain.ts"
Cohesion: 0.26
Nodes (16): Attempt, AttemptOutcome, bpmFromTaps(), cardsToCsv(), clampBpm(), createCard(), csvCell(), importAttempt() (+8 more)

### Community 4 - "scripts"
Cohesion: 0.07
Nodes (27): @axe-core/playwright, devDependencies, @axe-core/playwright, @playwright/test, @types/node, typescript, vite, vitest (+19 more)

### Community 5 - "Findings"
Cohesion: 0.12
Nodes (16): Clean checkout commands, Current product evidence, Earlier finding disposition, Evidence files, F1 — P1 — The required demo sandbox does not exist, F2 — P1 — Public claims have no claim registry or claim tests, F3 — P2 — “Hearing-safe level” is not a supportable browser claim, F4 — P2 — The first screen and headings do not meet the plain-words contract (+8 more)

### Community 6 - "db.ts"
Cohesion: 0.33
Nodes (9): clearCards(), database(), databaseName(), deleteCard(), deleteStorage(), StorageScope, transaction(), PracticeCard (+1 more)

### Community 8 - "postbuild.mjs"
Cohesion: 0.29
Nodes (6): compiled, hash, indexPath, localAssets, precache, workerPath

### Community 9 - "Defects"
Cohesion: 0.14
Nodes (13): Accessibility, responsive behavior, and visual review, Clean checkout and repository gates, Defects, P1 — imported attempt history is interpreted as active HTML, P1 — the advertised $9 purchase flow is unavailable, P2 — live security and cache response policy is incomplete, P2 — visible interactive targets miss the 44 × 44px contract, Passing evidence (+5 more)

### Community 16 - "Verification report 2 — FAIL"
Cohesion: 0.15
Nodes (12): Clean candidate and quality gates, Fresh evidence that passed, Functional, accessibility, privacy, and PWA checks, Live identity and response evidence, Other defects, P1 — imported attempt history is stored XSS, P2 — production response policy and cache policy are incomplete, P2 — visible interactive targets are below the 44px minimum (+4 more)

### Community 17 - "Verification report 6 — FAIL"
Cohesion: 0.15
Nodes (12): Accessibility, responsive behavior, and visual review, Candidate and deployment identity, Clean quality gates, Defects, P2 — fresh mobile Lighthouse performance misses the ≥90 gate, P2 — Import backup has no visible keyboard focus indicator, Product workflow and recovery evidence, Purchase boundary (+4 more)

### Community 18 - "Verification report 5 — FAIL"
Cohesion: 0.17
Nodes (11): Accessibility, responsive UI, privacy, and performance, Clean checkout and repository gates, Defects, Independent product exercise, P1 — the advertised $9 one-time purchase cannot start, P2 — Space suppresses native activation for focused buttons, P2 — two links remain below the 44 × 44px target contract, PWA, response policy, and live identity (+3 more)

### Community 19 - "Verification report — FAIL"
Cohesion: 0.18
Nodes (10): Blocking defects, P0 — live deployment is unavailable and cannot match the candidate, P1 — JSON import permits stored XSS and arbitrary outbound requests, P2 — several visible touch targets miss the 44px acceptance requirement, Product, accessibility, privacy, and PWA evidence, Reproducible build and automated checks, Required before re-verification, Verdict (+2 more)

### Community 20 - "Verification report 7 — PASS"
Cohesion: 0.20
Nodes (9): Accessibility, keyboard, responsive, and visual QA, Candidate and deployment identity, Clean quality gates, End-to-end product and recovery checks, Performance and bundle budgets, PWA, privacy, and response policy, Scope notes, Verdict (+1 more)

### Community 21 - "Tempo Earcheck copy audit"
Cohesion: 0.29
Nodes (6): First screen, Offline fallback, Product sections and states, Sample route, Tempo Earcheck copy audit, Terminology

### Community 23 - "Tempo Earcheck sample notebook"
Cohesion: 0.33
Nodes (5): Entry points, Included sample, Isolation and reset, Tempo Earcheck sample notebook, Verification

### Community 24 - "Tempo Earcheck (`tempo-earcheck`) — factory product contract"
Cohesion: 0.50
Nodes (3): Definition of done (a worker may not claim completion without all of these), Tempo Earcheck (`tempo-earcheck`) — factory product contract, Working rules

### Community 25 - "claims-registry.test.ts"
Cohesion: 0.50
Nodes (3): Claim, claims, claimTests

## Knowledge Gaps
- **151 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+146 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Metronome` connect `Metronome` to `main.ts`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 10 inferred relationships involving `bindHomeEvents()` (e.g. with `closeCardDialog()` and `exportCsv()`) actually correct?**
  _`bindHomeEvents()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `handleCardAction()` (e.g. with `bindHomeEvents()` and `undoDelete()`) actually correct?**
  _`handleCardAction()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _151 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `main.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08743169398907104 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `Tempo Earcheck` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._