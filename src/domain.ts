export type AttemptOutcome = 'passed' | 'needs-work';

export interface Attempt {
  id: string;
  at: string;
  bpm: number;
  outcome: AttemptOutcome;
}

export interface PracticeCard {
  id: string;
  name: string;
  meter: number;
  startBpm: number;
  passedBpm: number | null;
  nextBpm: number;
  step: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  history: Attempt[];
}

export const clampBpm = (value: number): number =>
  Math.min(240, Math.max(30, Math.round(Number.isFinite(value) ? value : 96)));

export function tempoName(bpm: number): string {
  if (bpm < 45) return 'Grave';
  if (bpm < 60) return 'Largo';
  if (bpm < 76) return 'Adagio';
  if (bpm < 108) return 'Andante';
  if (bpm < 120) return 'Moderato';
  if (bpm < 168) return 'Allegro';
  if (bpm < 200) return 'Presto';
  return 'Prestissimo';
}

export function bpmFromTaps(timestamps: number[]): number | null {
  const recent = timestamps.slice(-9);
  if (recent.length < 2) return null;
  const intervals = recent
    .slice(1)
    .map((time, index) => time - recent[index])
    .filter((interval) => interval >= 250 && interval <= 2000)
    .sort((a, b) => a - b);
  if (!intervals.length) return null;
  const middle = Math.floor(intervals.length / 2);
  const median = intervals.length % 2
    ? intervals[middle]
    : (intervals[middle - 1] + intervals[middle]) / 2;
  return clampBpm(60000 / median);
}

export function createCard(input: {
  name: string;
  bpm: number;
  meter: number;
  step: number;
  note: string;
}): PracticeCard {
  const now = new Date().toISOString();
  const bpm = clampBpm(input.bpm);
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    meter: Math.min(12, Math.max(2, Math.round(input.meter))),
    startBpm: bpm,
    passedBpm: null,
    nextBpm: bpm,
    step: Math.min(24, Math.max(1, Math.round(input.step))),
    note: input.note.trim(),
    createdAt: now,
    updatedAt: now,
    history: []
  };
}

export function recordAttempt(
  card: PracticeCard,
  bpm: number,
  outcome: AttemptOutcome
): PracticeCard {
  const attemptedBpm = clampBpm(bpm);
  const now = new Date().toISOString();
  const attempt: Attempt = { id: crypto.randomUUID(), at: now, bpm: attemptedBpm, outcome };
  return {
    ...card,
    passedBpm: outcome === 'passed' ? attemptedBpm : card.passedBpm,
    nextBpm: outcome === 'passed' ? clampBpm(attemptedBpm + card.step) : attemptedBpm,
    updatedAt: now,
    history: [attempt, ...card.history]
  };
}

export function validateImport(value: unknown): PracticeCard[] {
  if (!value || typeof value !== 'object') throw new Error('That file is not a Tempo Earcheck export.');
  const candidate = value as { product?: unknown; cards?: unknown };
  if (candidate.product !== 'tempo-earcheck' || !Array.isArray(candidate.cards)) {
    throw new Error('That file is not a Tempo Earcheck export.');
  }
  return candidate.cards.map((raw) => {
    if (!raw || typeof raw !== 'object') throw new Error('One practice card is damaged.');
    const card = raw as Partial<PracticeCard>;
    if (!card.id || !card.name || !card.createdAt || !card.updatedAt) {
      throw new Error('One practice card is missing required fields.');
    }
    return {
      id: String(card.id),
      name: String(card.name).slice(0, 80),
      meter: Math.min(12, Math.max(2, Number(card.meter) || 4)),
      startBpm: clampBpm(Number(card.startBpm)),
      passedBpm: card.passedBpm == null ? null : clampBpm(Number(card.passedBpm)),
      nextBpm: clampBpm(Number(card.nextBpm)),
      step: Math.min(24, Math.max(1, Number(card.step) || 4)),
      note: String(card.note ?? '').slice(0, 500),
      createdAt: String(card.createdAt),
      updatedAt: String(card.updatedAt),
      history: Array.isArray(card.history) ? card.history.slice(0, 1000) as Attempt[] : []
    };
  });
}

const csvCell = (value: string | number | null): string =>
  `"${String(value ?? '').replaceAll('"', '""')}"`;

export function cardsToCsv(cards: PracticeCard[]): string {
  const rows = [['Name', 'Meter', 'Starting BPM', 'Passed BPM', 'Next BPM', 'Step', 'Note', 'Updated']];
  for (const card of cards) {
    rows.push([
      card.name,
      `${card.meter}/4`,
      String(card.startBpm),
      card.passedBpm == null ? '' : String(card.passedBpm),
      String(card.nextBpm),
      String(card.step),
      card.note,
      card.updatedAt
    ]);
  }
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`;
}
