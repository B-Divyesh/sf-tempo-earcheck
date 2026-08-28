import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type StaticConfig = {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers: Record<string, string> }>;
};

const config = JSON.parse(readFileSync(new URL('../public/staticwebapp.config.json', import.meta.url), 'utf8')) as StaticConfig;
const route = (path: string) => config.routes.find((entry) => entry.route === path)?.headers;

describe('production response policy', () => {
  it('ships a CSP and isolation protections that keep imported data from executing', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("script-src 'self'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.globalHeaders['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(config.globalHeaders['Cross-Origin-Resource-Policy']).toBe('same-origin');
    expect(config.globalHeaders['Permissions-Policy']).toContain('microphone=()');
  });

  it('keeps hashed assets immutable while HTML, worker, and manifest revalidate', () => {
    expect(route('/assets/*')?.['Cache-Control']).toContain('immutable');
    expect(route('/icons/*')?.['Cache-Control']).toContain('immutable');
    expect(route('/sw.js')?.['Cache-Control']).toContain('no-cache');
    expect(route('/manifest.webmanifest')?.['Content-Type']).toContain('application/manifest+json');
    expect(route('/*')?.['Cache-Control']).toContain('must-revalidate');
  });
});
