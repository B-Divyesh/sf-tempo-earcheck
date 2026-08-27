# Tempo Earcheck

Tempo Earcheck is an offline rehearsal tempo desk for instrumentalists. Tap or set a tempo, audition an accented meter with a hearing-safe Web Audio click, and turn the result into a practice card that remembers where you began, what passed, and what to try next.

Live product: [tempo-earcheck.sociobot.in](https://tempo-earcheck.sociobot.in)

## What it includes

- Tap tempo with median interval filtering, direct BPM entry, and 30–240 BPM range
- Accented 2/4 through 12/4 meter click, synthesized locally without audio files
- Named practice cards with starting, passed, and next BPM plus difficulty notes
- Timestamped “passed” and “needs work” history
- IndexedDB persistence and last-write-wins JSON import
- JSON backup and CSV summary export in the free edition
- Installable PWA shell that reloads and runs offline
- Keyboard controls: Space taps, M starts/stops the click, Escape closes dialogs
- Privacy and terms pages at `/privacy` and `/terms`

The free edition holds five practice cards and three visible history entries per card. The optional $9 one-time Notebook edition unlocks unlimited cards, full on-screen history, and custom 1–24 BPM increments. Buying and verification use only the Sociobot billing API; no payment provider is embedded.

## Develop

Requires Node.js 22 or newer.

```sh
npm install
npx playwright install chromium
npm run dev
```

Open `http://localhost:5173`. The development server serves the app, although a production build is required to exercise the compiled offline precache manifest.

## Test and build

```sh
npm test       # unit + Chromium desktop/mobile + axe + offline checks
npm run build  # reproducible static output in ./dist
npm run preview
```

The static deployment root is `dist/`; `dist/index.html` is the main entry. The build also emits direct static entries for `/privacy/` and `/terms/`. `scripts/postbuild.mjs` discovers hashed assets and inserts them into the versioned service-worker precache.

## Data and privacy

Practice data never leaves the browser. Cards are stored in IndexedDB; settings and an optional license token are stored in localStorage. No microphone access, analytics, third-party fonts, or runtime CDN scripts are used. License verification contacts `https://api.sociobot.in` at most once per day after a cached unlock.

See [.factory/design.md](.factory/design.md) for the visual system and original image provenance, and [.factory/handoff.md](.factory/handoff.md) for verification results.

## License

MIT — see [LICENSE](LICENSE).
