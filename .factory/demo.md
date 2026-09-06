# Tempo Earcheck sample notebook

## Entry points

- Production: `https://tempo-earcheck.sociobot.in/demo`
- Local production preview: `http://127.0.0.1:4173/demo`
- Query fallback: `/?demo=1`

The home-page action **Try it with sample data** opens the sample in one click.

## Included sample

The sample opens with three practice cards:

1. Cello shift study at 72 BPM, passed at 80 BPM, with 84 BPM next
2. Brass chorale entrance at 60 BPM, passed at 64 BPM, with 66 BPM next
3. Violin string crossing at 108 BPM, marked as needing work

The cards include useful notes and eight dated attempts. One card has five attempts to demonstrate the free three-entry screen limit and complete JSON export.

## Isolation and reset

Demo cards use the IndexedDB database `demo:tempo-earcheck`. Demo settings and license checks use localStorage keys beginning with `demo:`.

The real notebook uses the IndexedDB database `tempo-earcheck`. Its settings and license keys have no `demo:` prefix.

**Reset demo** clears only the demo database and keys, then restores the three original cards. **Start for real** deletes the demo database and keys before opening `/`.

The persistent banner identifies sample mode on every scroll position. The demo never reads or writes the real notebook.

## Verification

Run the isolation claim from a clean checkout:

```sh
npm ci --include=dev
npm run test:claims -- --grep @claim:demo-isolation
```

The test creates real data, changes the sample, leaves the demo, and proves that only the real card remains.
