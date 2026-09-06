import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type StaticConfig = {
  navigationFallback?: unknown;
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: Array<{ route: string; headers: Record<string, string> }>;
  responseOverrides: Record<string, { rewrite: string }>;
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
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(route('/*')?.['Cache-Control']).toContain('must-revalidate');
  });

  it('serves the designed missing page for an HTTP 404 response', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
    expect(readFileSync(new URL('../404.html', import.meta.url), 'utf8')).toContain('Page not found — Tempo Earcheck');
  });
});
