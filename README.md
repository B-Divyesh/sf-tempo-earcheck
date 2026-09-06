# Tempo Earcheck

Tempo Earcheck helps instrumentalists hear, test, and record practice tempos. It joins an accented click with a small local practice notebook.

Live product: [tempo-earcheck.sociobot.in](https://tempo-earcheck.sociobot.in)

One-click sample: [tempo-earcheck.sociobot.in/demo](https://tempo-earcheck.sociobot.in/demo)

## What it includes

- Tap tempo and direct input from 30–240 BPM
- Accented click meters from 2/4 through 12/4
- Click sounds made with Web Audio, without audio files or microphone access
- Practice cards with names, starting tempos, passed tempos, next tempos, meters, and notes
- Dated passed and needs-work history
- Local browser storage that persists across reloads
- JSON backup, JSON import, and CSV summary export
- Keyboard controls: Space taps, M starts or stops the click, and Escape closes dialogs
- An installable app shell that works offline after the first visit

The free edition holds five cards. It shows three history entries per card, while JSON exports retain complete history.

Notebook edition costs $9 once. It adds unlimited cards, complete on-screen history, and 1–24 BPM steps.

Purchases use the Sociobot hosted checkout. No payment provider is embedded in this app.

## Try the separate sample notebook

Open `/demo` or choose **Try it with sample data** on the home page. The sample contains three realistic practice cards.

The demo uses `demo:tempo-earcheck` IndexedDB storage and `demo:` localStorage keys. It never reads or writes the real notebook.

Choose **Reset demo** to restore the sample. Choose **Start for real** to delete demo changes and open the real notebook.

## Clean setup

Node.js 22 or newer is required. Playwright 1.58.2 is pinned in `package.json`.

```sh
npm ci --include=dev
npx playwright install chromium
npm run dev
```

Open `http://localhost:5173`. Use a production preview when checking the service worker.

## Test and build

```sh
npm test
npm run test:claims
npx tsc --noEmit
npm audit --audit-level=high
npm run build
npm run preview
```

Every public promise is listed in `.factory/claims.json`. Each entry includes its exact tagged test command and clean sandbox.

After deployment, `npm run test:live` compares live HTML with `dist/index.html`. It also checks the registered $9 hosted offer without paying.

The deployment root is `dist/`. Static routes include `/demo`, `/privacy`, `/terms`, and the designed `404.html` response.

## Data and privacy

Practice cards stay in IndexedDB. Settings and an optional license token stay in namespaced localStorage.

The app makes no analytics or advertising requests. It loads no third-party fonts, scripts, or audio files.

License verification uses `https://api.sociobot.in` after a purchase or restore. A cached license is checked at most once each day.

See the [privacy page](https://tempo-earcheck.sociobot.in/privacy) and [terms](https://tempo-earcheck.sociobot.in/terms).

## Design and handoff

See [.factory/design.md](.factory/design.md) for the visual system and image provenance. See [.factory/handoff.md](.factory/handoff.md) for verification details.

## License

MIT — see [LICENSE](LICENSE).
