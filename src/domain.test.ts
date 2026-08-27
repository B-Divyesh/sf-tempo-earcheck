import { describe, expect, it, vi } from 'vitest';
import { bpmFromTaps, cardsToCsv, clampBpm, createCard, recordAttempt, validateImport } from './domain';

describe('tempo calculations', () => {
  it('uses the median interval and rejects implausible gaps', () => {
    expect(bpmFromTaps([0, 500, 1005, 1500])).toBe(120);
    expect(bpmFromTaps([0, 2300])).toBeNull();
  });

  it('keeps BPM inside the hearing tool range', () => {
    expect(clampBpm(5)).toBe(30);
    expect(clampBpm(900)).toBe(240);
  });
});

describe('practice cards', () => {
  it('advances the next tempo only after a pass', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'test-id' });
    const card = createCard({ name: 'Scale', bpm: 80, meter: 4, step: 4, note: '' });
    const retry = recordAttempt(card, 80, 'needs-work');
    expect(retry.nextBpm).toBe(80);
    const passed = recordAttempt(retry, 80, 'passed');
    expect(passed.passedBpm).toBe(80);
    expect(passed.nextBpm).toBe(84);
    vi.unstubAllGlobals();
  });

  it('round-trips a valid export and escapes CSV cells', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'test-id' });
    const card = createCard({ name: 'Tune, A', bpm: 90, meter: 3, step: 3, note: 'steady' });
    const payload = { product: 'tempo-earcheck', cards: [card] };
    expect(validateImport(payload)).toHaveLength(1);
    expect(cardsToCsv([card])).toContain('"Tune, A"');
    expect(() => validateImport({ cards: [] })).toThrow(/not a Tempo/);
    vi.unstubAllGlobals();
  });
});
