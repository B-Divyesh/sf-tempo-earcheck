import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const indexPath = new URL('../dist/index.html', import.meta.url);
const workerPath = new URL('../dist/sw.js', import.meta.url);
const index = await readFile(indexPath, 'utf8');
const worker = await readFile(workerPath, 'utf8');
const localAssets = [...index.matchAll(/(?:src|href)="(\/(?:assets\/[^"?]+|manifest\.webmanifest|icons\/[^"?]+))"/g)].map((match) => match[1]);
const precache = [...new Set([
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/assets/tempo-desk-720.webp',
  '/icons/icon-192.png',
  ...localAssets
])];
const hash = createHash('sha256').update(index).digest('hex').slice(0, 10);
const compiled = worker
  .replace("const VERSION = 'tempo-earcheck-v1';", `const VERSION = 'tempo-earcheck-${hash}';`)
  .replace('self.__PRECACHE__', JSON.stringify(precache));
await writeFile(workerPath, compiled);
