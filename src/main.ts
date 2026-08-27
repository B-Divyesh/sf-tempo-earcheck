import './styles.css';
import { Metronome } from './audio';
import { deleteCard, getCards, mergeCards, putCard } from './db';
import {
  bpmFromTaps,
  cardsToCsv,
  clampBpm,
  createCard,
  recordAttempt,
  tempoName,
  validateImport,
  type PracticeCard
} from './domain';

const app = document.querySelector<HTMLDivElement>('#app')!;
const meterOptions = [2, 3, 4, 5, 6, 7, 9, 12];
const freeCardLimit = 5;
const licenseKey = 'sb_license:tempo-earcheck';
const verdictKey = 'sb_license_verdict:tempo-earcheck';
const billingBase = 'https://api.sociobot.in/api/v1/products/tempo-earcheck';
const checkoutUrl = `${billingBase}/checkout`;

let bpm = clampBpm(Number(localStorage.getItem('tempo:bpm')) || 96);
let meter = Math.min(12, Math.max(2, Number(localStorage.getItem('tempo:meter')) || 4));
let volume = Math.min(0.16, Math.max(0.02, Number(localStorage.getItem('tempo:volume')) || 0.08));
let taps: number[] = [];
let cards: PracticeCard[] = [];
let returningFocus: HTMLElement | null = null;
let deletedCard: PracticeCard | null = null;
let licensed = cachedLicenseIsValid();
let licenseNotice = licensed ? 'Notebook edition active.' : '';
const metronome = new Metronome();
let refreshForUpdate = false;

const escapeHtml = (value: string): string => value.replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character]!);

function cachedLicenseIsValid(): boolean {
  try {
    const cached = JSON.parse(localStorage.getItem(verdictKey) || 'null') as { valid?: boolean } | null;
    return Boolean(localStorage.getItem(licenseKey) && cached?.valid);
  } catch {
    return false;
  }
}

function masthead(): string {
  return `<header class="masthead">
    <a class="wordmark" href="/" aria-label="Tempo Earcheck home">
      <span class="edition">No. 01 · rehearsal desk</span>
      <span>Tempo Earcheck</span>
    </a>
    <nav aria-label="Primary">
      <a href="/#earcheck">Earcheck</a>
      <a href="/#notebook">Notebook</a>
      <a href="/#own-your-data">Your data</a>
    </nav>
    <span class="network-state" id="network-state">${navigator.onLine ? 'Ready offline' : 'Offline · all local'}</span>
  </header>`;
}

function footer(): string {
  return `<footer>
    <p><strong>Tempo Earcheck</strong> · Your rehearsal data stays on this device.</p>
    <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
    <p class="generated-note">Original illustration generated for this product with the factory image model.</p>
  </footer>`;
}

function legalPage(kind: 'privacy' | 'terms'): void {
  const isPrivacy = kind === 'privacy';
  document.title = `${isPrivacy ? 'Privacy' : 'Terms'} — Tempo Earcheck`;
  app.innerHTML = `${masthead()}<main id="main" class="legal-page">
    <p class="kicker">Tempo Earcheck · policy desk</p>
    <h1>${isPrivacy ? 'Privacy, in plain time.' : 'Terms of use.'}</h1>
    ${isPrivacy ? `<p class="lede">Your practice notebook belongs to you. Tempo Earcheck works without an account and does not send your cards, notes, taps, or audio anywhere.</p>
      <h2>What stays on your device</h2><p>Practice cards and result history are stored in your browser’s IndexedDB. Tempo, meter, volume, and any license token are stored locally. You can export or erase cards at any time.</p>
      <h2>What crosses the network</h2><p>The app makes no analytics or advertising requests. If you buy or restore Notebook edition, your browser contacts the Sociobot billing API to open checkout and verify the license. Sociobot/Dodo is the merchant of record and handles payment information; Tempo Earcheck never receives card details.</p>
      <h2>Microphone and audio</h2><p>No microphone permission is requested. Click sounds are synthesized on your device with Web Audio and are not recorded.</p>
      <h2>Contact</h2><p>Questions may be sent through <a href="https://sociobot.in">sociobot.in</a>. Last updated 27 August 2026.</p>`
      : `<p class="lede">Use Tempo Earcheck as a personal tempo and rehearsal notebook. It is a decision aid, not a hearing test or medical device.</p>
      <h2>License</h2><p>The free edition may be used without an account. A $9 one-time purchase unlocks Notebook edition for the purchaser. A valid license may be restored on the purchaser’s devices and can be revoked after a refund or misuse.</p>
      <h2>Purchases and refunds</h2><p>Sociobot/Dodo is the merchant of record. Checkout, receipts, taxes, and refunds are handled by that service. Refunded licenses are automatically revoked.</p>
      <h2>Your responsibilities</h2><p>Keep listening levels comfortable, back up important notes with the included export tools, and do not rely on browser storage as your only archival copy. The software is provided “as is” without warranty.</p>
      <h2>Changes</h2><p>Material changes will be dated here. Last updated 27 August 2026.</p>`}
    <p><a class="text-link" href="/">← Return to the rehearsal desk</a></p>
  </main>${footer()}`;
  bindSharedEvents();
}

function homePage(): void {
  document.title = 'Tempo Earcheck — hear it, then keep it';
  app.innerHTML = `${masthead()}
    <main id="main">
      <section class="hero" aria-labelledby="page-title">
        <div class="hero-copy">
          <p class="kicker">The rehearsal tempo paper · works offline</p>
          <h1 id="page-title">Hear the tempo.<br><em>Keep the evidence.</em></h1>
          <p class="lede">Tap what you mean, audition the accented click, then record the next honest step for the passage—not just another number to forget.</p>
          <a class="text-link" href="#earcheck">Open today’s tempo desk ↓</a>
        </div>
        <figure>
          <picture>
            <source srcset="/assets/tempo-desk-720.webp 720w, /assets/tempo-desk-1280.webp 1280w" type="image/webp" sizes="(max-width: 760px) 100vw, 48vw" />
            <img src="/assets/tempo-desk-720.jpg" width="720" height="480" alt="Engraved mechanical metronome beside blank rehearsal cards and a red pencil" fetchpriority="high" decoding="async" />
          </picture>
          <figcaption>Listen first. Write down what happened.</figcaption>
        </figure>
      </section>

      <section class="tempo-desk" id="earcheck" aria-labelledby="earcheck-title">
        <div class="section-rule"><p>Desk A · live audition</p><p>30—240 beats per minute</p></div>
        <div class="desk-grid">
          <div class="tempo-readout">
            <h2 id="earcheck-title">Your current finding</h2>
            <output id="bpm-output" class="bpm-output" for="bpm-range bpm-number"><strong>${bpm}</strong><span>BPM</span></output>
            <p id="tempo-name" class="tempo-name">${tempoName(bpm)} · ${meter}/4</p>
            <div id="beat-strip" class="beat-strip" aria-label="Meter beats">${beatCells()}</div>
          </div>
          <div class="controls">
            <div class="field-row">
              <label for="bpm-number">Tempo</label>
              <input id="bpm-number" type="number" min="30" max="240" inputmode="numeric" value="${bpm}" />
              <span aria-hidden="true">BPM</span>
            </div>
            <input id="bpm-range" class="range" type="range" min="30" max="240" value="${bpm}" aria-label="Tempo in beats per minute" />
            <div class="control-pair">
              <label for="meter">Meter<select id="meter">${meterOptions.map((value) => `<option value="${value}" ${value === meter ? 'selected' : ''}>${value}/4</option>`).join('')}</select></label>
              <label for="volume">Click volume <span id="volume-value">${Math.round(volume / 0.16 * 100)}%</span><input id="volume" class="range" type="range" min="2" max="16" value="${Math.round(volume * 100)}" /></label>
            </div>
            <p class="safety-note"><span aria-hidden="true">◉</span> Starts at a hearing-safe level. Raise volume gradually.</p>
          </div>
          <div class="desk-actions">
            <button class="tap-button" id="tap-button" type="button"><span>Tap tempo</span><kbd>Space</kbd></button>
            <button class="start-button" id="start-button" type="button" aria-pressed="false"><span aria-hidden="true">▶</span> Start click <kbd>M</kbd></button>
            <button class="save-trial" id="save-trial" type="button">Record this trial →</button>
            <p class="live-status" id="tempo-status" role="status" aria-live="polite">Tap at least twice, or set a number.</p>
          </div>
        </div>
      </section>

      <section class="notebook" id="notebook" aria-labelledby="notebook-title">
        <div class="section-heading">
          <div><p class="kicker">Desk B · practice ledger</p><h2 id="notebook-title">What happens next?</h2></div>
          <button id="new-card" class="primary-button" type="button">New practice card</button>
        </div>
        <p class="section-intro">Return later, try the recorded next tempo, and mark the result. That small trail is the reason this is more than a metronome.</p>
        <div id="cards-status" role="status" aria-live="polite"></div>
        <div id="cards" class="card-list" aria-busy="true"><div class="loading-state">Opening your local notebook…</div></div>
      </section>

      <section class="ownership" id="own-your-data" aria-labelledby="ownership-title">
        <div><p class="kicker">Desk C · ownership</p><h2 id="ownership-title">A notebook with an exit.</h2><p>Everything is local-first. Keep an independent copy whenever you like; imports merge by the newest edit.</p></div>
        <div class="data-actions">
          <button id="export-json" type="button">Export backup (.json)</button>
          <button id="export-csv" type="button">Export summary (.csv)</button>
          <label class="file-button" for="import-file">Import backup<input id="import-file" type="file" accept="application/json,.json" /></label>
        </div>
      </section>

      <section class="edition-panel" id="edition" aria-labelledby="edition-title">
        <div class="edition-stamp" aria-hidden="true">N<span>∞</span></div>
        <div><p class="kicker">Optional desk extension</p><h2 id="edition-title">Notebook edition</h2><p><strong>$9 once.</strong> Unlimited cards, the complete on-screen attempt history, and any 1–24 BPM step. The free desk stays useful forever; export, accessibility, and safety are never gated.</p></div>
        <div class="license-actions" id="license-actions">${licenseMarkup()}</div>
      </section>
    </main>
    ${cardDialog()}
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
    ${footer()}`;
  bindHomeEvents();
  void loadCards();
  void processLicense();
}

function beatCells(): string {
  return Array.from({ length: meter }, (_, index) => `<span class="beat-cell" data-beat="${index}" aria-label="Beat ${index + 1}${index === 0 ? ', accented' : ''}">${index + 1}</span>`).join('');
}

function cardDialog(): string {
  return `<dialog id="card-dialog" aria-labelledby="card-dialog-title">
    <form method="dialog" id="card-form">
      <div class="dialog-head"><div><p class="kicker">Practice decision</p><h2 id="card-dialog-title">Record this trial</h2></div><button class="close-button" type="button" id="close-dialog" aria-label="Close dialog">×</button></div>
      <input type="hidden" id="edit-id" />
      <label for="card-name">Passage or exercise <span aria-hidden="true">*</span><input id="card-name" maxlength="80" required autocomplete="off" /></label>
      <div class="form-grid">
        <label for="card-bpm">Starting BPM<input id="card-bpm" type="number" min="30" max="240" required /></label>
        <label for="card-meter">Meter<select id="card-meter">${meterOptions.map((value) => `<option value="${value}">${value}/4</option>`).join('')}</select></label>
      </div>
      <label for="card-step">Next step (BPM)<input id="card-step" type="number" min="1" max="24" value="4" list="step-presets" /><datalist id="step-presets"><option value="2"><option value="4"><option value="6"><option value="8"></datalist><span class="field-help" id="step-help">Free edition presets: 2, 4, 6, or 8.</span></label>
      <label for="card-note">Difficulty note <span class="optional">optional</span><textarea id="card-note" maxlength="500" rows="3" placeholder="e.g. clean until the last shift"></textarea></label>
      <p id="form-error" class="form-error" role="alert"></p>
      <div class="dialog-actions"><button type="button" id="cancel-dialog">Cancel</button><button type="submit" class="primary-button">Save practice card</button></div>
    </form>
  </dialog>`;
}

function licenseMarkup(): string {
  if (licensed) return `<p class="license-active"><span aria-hidden="true">✓</span> Notebook edition active</p><p class="muted">Unlimited cards and complete history are unlocked on this device.</p>`;
  return `<a class="buy-button" href="${checkoutUrl}">Buy Notebook edition · $9</a>
    <details><summary>Have a license? Restore it</summary><form id="license-form"><label for="license-token">License token<input id="license-token" type="text" autocomplete="off" spellcheck="false" /></label><button type="submit">Verify license</button></form></details>
    <p class="license-notice" id="license-notice" role="status">${escapeHtml(licenseNotice)}</p>`;
}

async function loadCards(): Promise<void> {
  try {
    cards = await getCards();
    renderCards();
  } catch (error) {
    const container = document.querySelector('#cards');
    if (container) container.innerHTML = `<div class="error-state"><strong>The local notebook did not open.</strong><p>${escapeHtml(error instanceof Error ? error.message : 'Browser storage is unavailable.')}</p><button type="button" id="retry-load">Try again</button></div>`;
    document.querySelector('#retry-load')?.addEventListener('click', () => void loadCards());
  }
}

function renderCards(): void {
  const container = document.querySelector<HTMLDivElement>('#cards');
  if (!container) return;
  container.setAttribute('aria-busy', 'false');
  if (!cards.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-mark" aria-hidden="true">01</span><div><h3>No tempo has made the ledger yet.</h3><p>Find a tempo above, then record the passage and your next honest step.</p><button type="button" class="text-button" data-action="new">Record the current ${bpm} BPM trial →</button></div></div>`;
    return;
  }
  container.innerHTML = cards.map((card, index) => cardMarkup(card, index)).join('');
}

function cardMarkup(card: PracticeCard, index: number): string {
  const visibleHistory = licensed ? card.history : card.history.slice(0, 3);
  return `<article class="practice-card" data-id="${card.id}">
    <header><span class="folio">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(card.name)}</h3><p>${card.meter}/4 · updated <time datetime="${card.updatedAt}">${formatDate(card.updatedAt)}</time></p></div><button type="button" class="more-button" data-action="edit" aria-label="Edit ${escapeHtml(card.name)}">Edit</button></header>
    ${card.note ? `<blockquote>“${escapeHtml(card.note)}”</blockquote>` : ''}
    <dl class="tempo-ledger">
      <div><dt>Started</dt><dd>${card.startBpm}</dd></div>
      <div><dt>Last passed</dt><dd>${card.passedBpm ?? '—'}</dd></div>
      <div class="next-tempo"><dt>Try next</dt><dd>${card.nextBpm}<small> +${card.step}</small></dd></div>
    </dl>
    <div class="card-actions"><button type="button" data-action="try">Load ${card.nextBpm} BPM</button><button type="button" data-action="pass" class="pass-button">Mark current passed</button><button type="button" data-action="retry">Needs work</button></div>
    <details class="history"><summary>Attempt history <span>${card.history.length}</span></summary>
      ${visibleHistory.length ? `<ol>${visibleHistory.map((attempt) => `<li><time datetime="${attempt.at}">${formatDate(attempt.at)}</time><strong>${attempt.bpm} BPM</strong><span>${attempt.outcome === 'passed' ? 'Passed' : 'Needs work'}</span></li>`).join('')}</ol>` : '<p>No results recorded yet.</p>'}
      ${!licensed && card.history.length > 3 ? `<p class="history-limit">Notebook edition shows all ${card.history.length} attempts. Your full history is still included in exports.</p>` : ''}
    </details>
    <button type="button" class="delete-button" data-action="delete">Delete card</button>
  </article>`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: new Date(value).getFullYear() === new Date().getFullYear() ? undefined : 'numeric' }).format(new Date(value));
}

function bindSharedEvents(): void {
  updateNetwork();
  window.addEventListener('online', updateNetwork);
  window.addEventListener('offline', updateNetwork);
}

function bindHomeEvents(): void {
  bindSharedEvents();
  document.querySelector('#bpm-range')?.addEventListener('input', (event) => setBpm(Number((event.target as HTMLInputElement).value)));
  document.querySelector('#bpm-number')?.addEventListener('change', (event) => setBpm(Number((event.target as HTMLInputElement).value)));
  document.querySelector('#meter')?.addEventListener('change', (event) => setMeter(Number((event.target as HTMLSelectElement).value)));
  document.querySelector('#volume')?.addEventListener('input', (event) => setVolume(Number((event.target as HTMLInputElement).value) / 100));
  document.querySelector('#tap-button')?.addEventListener('click', tapTempo);
  document.querySelector('#start-button')?.addEventListener('click', () => void toggleMetronome());
  document.querySelector('#save-trial')?.addEventListener('click', () => openCardDialog());
  document.querySelector('#new-card')?.addEventListener('click', () => openCardDialog());
  document.querySelector('#cards')?.addEventListener('click', handleCardAction);
  document.querySelector('#card-form')?.addEventListener('submit', handleCardSubmit);
  document.querySelector('#close-dialog')?.addEventListener('click', closeCardDialog);
  document.querySelector('#cancel-dialog')?.addEventListener('click', closeCardDialog);
  document.querySelector('#export-json')?.addEventListener('click', exportJson);
  document.querySelector('#export-csv')?.addEventListener('click', exportCsv);
  document.querySelector('#import-file')?.addEventListener('change', importJson);
  document.querySelector('#license-form')?.addEventListener('submit', restoreLicense);
  window.addEventListener('keydown', keyboardShortcuts);
}

function setBpm(value: number, announcement?: string): void {
  bpm = clampBpm(value);
  localStorage.setItem('tempo:bpm', String(bpm));
  const range = document.querySelector<HTMLInputElement>('#bpm-range');
  const number = document.querySelector<HTMLInputElement>('#bpm-number');
  const output = document.querySelector<HTMLOutputElement>('#bpm-output strong');
  if (range) range.value = String(bpm);
  if (number) number.value = String(bpm);
  if (output) output.textContent = String(bpm);
  updateTempoName();
  metronome.update(bpm, meter, volume);
  if (announcement) setStatus(announcement);
}

function setMeter(value: number): void {
  meter = value;
  localStorage.setItem('tempo:meter', String(meter));
  const strip = document.querySelector('#beat-strip');
  if (strip) strip.innerHTML = beatCells();
  updateTempoName();
  metronome.update(bpm, meter, volume);
}

function setVolume(value: number): void {
  volume = Math.min(0.16, Math.max(0.02, value));
  localStorage.setItem('tempo:volume', String(volume));
  const label = document.querySelector('#volume-value');
  if (label) label.textContent = `${Math.round(volume / 0.16 * 100)}%`;
  metronome.update(bpm, meter, volume);
}

function updateTempoName(): void {
  const label = document.querySelector('#tempo-name');
  if (label) label.textContent = `${tempoName(bpm)} · ${meter}/4`;
}

function tapTempo(): void {
  const now = performance.now();
  if (taps.length && now - taps.at(-1)! > 2200) taps = [];
  taps.push(now);
  const result = bpmFromTaps(taps);
  const button = document.querySelector('#tap-button');
  button?.classList.remove('is-tapped');
  requestAnimationFrame(() => button?.classList.add('is-tapped'));
  if (result) setBpm(result, `${result} BPM from ${Math.min(taps.length, 9)} taps.`);
  else setStatus('One tap heard. Keep going.');
}

async function toggleMetronome(): Promise<void> {
  const button = document.querySelector<HTMLButtonElement>('#start-button');
  if (!button) return;
  if (metronome.running) {
    metronome.stop();
    clearBeat();
    button.setAttribute('aria-pressed', 'false');
    button.innerHTML = '<span aria-hidden="true">▶</span> Start click <kbd>M</kbd>';
    setStatus(`Click stopped at ${bpm} BPM.`);
    return;
  }
  try {
    await metronome.start(bpm, meter, volume, showBeat);
    button.setAttribute('aria-pressed', 'true');
    button.innerHTML = '<span aria-hidden="true">■</span> Stop click <kbd>M</kbd>';
    setStatus(`Playing ${bpm} BPM in ${meter}/4. Beat one is accented.`);
  } catch {
    setStatus('Sound could not start. Check this browser’s audio permission and try again.');
  }
}

function showBeat(beat: number): void {
  clearBeat();
  const cell = document.querySelector<HTMLElement>(`[data-beat="${beat}"]`);
  cell?.classList.add('is-active');
  cell?.setAttribute('aria-current', 'true');
}

function clearBeat(): void {
  document.querySelectorAll('.beat-cell').forEach((cell) => {
    cell.classList.remove('is-active');
    cell.removeAttribute('aria-current');
  });
}

function setStatus(message: string): void {
  const status = document.querySelector('#tempo-status');
  if (status) status.textContent = message;
}

function openCardDialog(card?: PracticeCard): void {
  if (!card && !licensed && cards.length >= freeCardLimit) {
    showToast(`The free ledger holds ${freeCardLimit} cards. Export remains available, or unlock unlimited cards below.`, 'View Notebook edition', () => document.querySelector('#edition')?.scrollIntoView());
    return;
  }
  returningFocus = document.activeElement as HTMLElement;
  const dialog = document.querySelector<HTMLDialogElement>('#card-dialog')!;
  const title = dialog.querySelector('#card-dialog-title')!;
  title.textContent = card ? 'Edit practice card' : 'Record this trial';
  (dialog.querySelector('#edit-id') as HTMLInputElement).value = card?.id ?? '';
  (dialog.querySelector('#card-name') as HTMLInputElement).value = card?.name ?? '';
  (dialog.querySelector('#card-bpm') as HTMLInputElement).value = String(card?.startBpm ?? bpm);
  (dialog.querySelector('#card-meter') as HTMLSelectElement).value = String(card?.meter ?? meter);
  (dialog.querySelector('#card-step') as HTMLInputElement).value = String(card?.step ?? 4);
  (dialog.querySelector('#card-note') as HTMLTextAreaElement).value = card?.note ?? '';
  dialog.querySelector('#step-help')!.textContent = licensed ? 'Notebook edition: choose any step from 1 to 24.' : 'Free edition presets: 2, 4, 6, or 8.';
  dialog.querySelector('#form-error')!.textContent = '';
  dialog.showModal();
  window.setTimeout(() => (dialog.querySelector('#card-name') as HTMLInputElement).focus(), 0);
}

function closeCardDialog(): void {
  document.querySelector<HTMLDialogElement>('#card-dialog')?.close();
  returningFocus?.focus();
}

async function handleCardSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const errorElement = document.querySelector('#form-error')!;
  const id = (document.querySelector('#edit-id') as HTMLInputElement).value;
  const name = (document.querySelector('#card-name') as HTMLInputElement).value.trim();
  const nextStep = Number((document.querySelector('#card-step') as HTMLInputElement).value);
  if (!name) {
    errorElement.textContent = 'Name the passage or exercise before saving.';
    return;
  }
  if (!licensed && ![2, 4, 6, 8].includes(nextStep)) {
    errorElement.textContent = 'Choose a free step of 2, 4, 6, or 8 BPM—or unlock custom steps.';
    return;
  }
  const existing = cards.find((card) => card.id === id);
  const values = {
    name,
    bpm: Number((document.querySelector('#card-bpm') as HTMLInputElement).value),
    meter: Number((document.querySelector('#card-meter') as HTMLSelectElement).value),
    step: nextStep,
    note: (document.querySelector('#card-note') as HTMLTextAreaElement).value
  };
  const card = existing ? {
    ...existing,
    name: values.name,
    startBpm: clampBpm(values.bpm),
    meter: values.meter,
    step: values.step,
    note: values.note.trim(),
    updatedAt: new Date().toISOString()
  } : createCard(values);
  try {
    await putCard(card);
    cards = [card, ...cards.filter((item) => item.id !== card.id)];
    renderCards();
    closeCardDialog();
    announceCards(existing ? `${card.name} updated.` : `${card.name} added to the practice ledger.`);
    document.querySelector('#notebook')?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    errorElement.textContent = error instanceof Error ? error.message : 'The card could not be saved.';
  }
}

async function handleCardAction(event: Event): Promise<void> {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'new') {
    openCardDialog();
    return;
  }
  const article = button.closest<HTMLElement>('[data-id]');
  const card = cards.find((item) => item.id === article?.dataset.id);
  if (!card) return;
  if (button.dataset.action === 'edit') return openCardDialog(card);
  if (button.dataset.action === 'try') {
    setBpm(card.nextBpm, `${card.name} loaded at ${card.nextBpm} BPM.`);
    const select = document.querySelector<HTMLSelectElement>('#meter');
    if (select) select.value = String(card.meter);
    setMeter(card.meter);
    document.querySelector('#earcheck')?.scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (button.dataset.action === 'delete') {
    if (!confirm(`Delete “${card.name}” and its ${card.history.length} recorded attempt${card.history.length === 1 ? '' : 's'}?`)) return;
    await deleteCard(card.id);
    deletedCard = card;
    cards = cards.filter((item) => item.id !== card.id);
    renderCards();
    showToast(`${card.name} deleted.`, 'Undo', undoDelete);
    return;
  }
  const outcome = button.dataset.action === 'pass' ? 'passed' : 'needs-work';
  const updated = recordAttempt(card, bpm, outcome);
  try {
    await putCard(updated);
    cards = [updated, ...cards.filter((item) => item.id !== updated.id)];
    renderCards();
    announceCards(outcome === 'passed' ? `${card.name}: ${bpm} BPM passed. Try ${updated.nextBpm} next.` : `${card.name}: ${bpm} BPM recorded as needs work. Try it again next.`);
  } catch (error) {
    announceCards(error instanceof Error ? error.message : 'That result could not be saved.');
  }
}

async function undoDelete(): Promise<void> {
  if (!deletedCard) return;
  await putCard(deletedCard);
  cards = [deletedCard, ...cards];
  deletedCard = null;
  renderCards();
  announceCards('Practice card restored.');
}

function announceCards(message: string): void {
  const status = document.querySelector('#cards-status');
  if (status) status.textContent = message;
}

function keyboardShortcuts(event: KeyboardEvent): void {
  const target = event.target as HTMLElement;
  const enteringText = target.matches('input, textarea, select') || target.isContentEditable || Boolean(target.closest('dialog'));
  if (enteringText || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.code === 'Space') {
    event.preventDefault();
    tapTempo();
  } else if (event.key.toLowerCase() === 'm') {
    event.preventDefault();
    void toggleMetronome();
  }
}

function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportJson(): void {
  download(`tempo-earcheck-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ product: 'tempo-earcheck', version: 1, exportedAt: new Date().toISOString(), cards }, null, 2), 'application/json');
  showToast(`${cards.length} practice card${cards.length === 1 ? '' : 's'} exported.`);
}

function exportCsv(): void {
  download(`tempo-earcheck-${new Date().toISOString().slice(0, 10)}.csv`, cardsToCsv(cards), 'text/csv;charset=utf-8');
  showToast('Practice summary exported.');
}

async function importJson(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const imported = validateImport(JSON.parse(await file.text()));
    if (!confirm(`Merge ${imported.length} practice card${imported.length === 1 ? '' : 's'} into this notebook? Newer edits win.`)) return;
    await mergeCards(imported);
    await loadCards();
    showToast(`${imported.length} practice card${imported.length === 1 ? '' : 's'} imported.`);
  } catch (error) {
    showToast(error instanceof Error ? error.message : 'That backup could not be imported.');
  } finally {
    input.value = '';
  }
}

async function processLicense(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const returnedLicense = params.get('license');
  if (returnedLicense) {
    localStorage.setItem(licenseKey, returnedLicense);
    params.delete('license');
    history.replaceState({}, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
    licenseNotice = 'Purchase received. Verifying your license…';
  }
  const token = localStorage.getItem(licenseKey);
  if (!token) return;
  let cached: { checkedAt?: number } | null = null;
  try { cached = JSON.parse(localStorage.getItem(verdictKey) || 'null'); } catch { /* verify below */ }
  if (!returnedLicense && cached?.checkedAt && Date.now() - cached.checkedAt < 86_400_000) return;
  await verifyLicense(token);
}

async function verifyLicense(token: string): Promise<void> {
  try {
    const response = await fetch(`${billingBase}/verify?license=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Verification service unavailable.');
    const verdict = await response.json() as { valid: boolean; reason?: string };
    localStorage.setItem(verdictKey, JSON.stringify({ ...verdict, checkedAt: Date.now() }));
    licensed = verdict.valid;
    licenseNotice = verdict.valid ? 'Notebook edition active.' : 'License no longer active. Check the token or purchase again.';
    renderLicense();
    renderCards();
  } catch {
    licenseNotice = licensed ? 'Offline: using the last valid license check.' : 'Could not verify while offline. The free desk is still ready.';
    renderLicense();
  }
}

function renderLicense(): void {
  const panel = document.querySelector('#license-actions');
  if (!panel) return;
  panel.innerHTML = licenseMarkup();
  panel.querySelector('#license-form')?.addEventListener('submit', restoreLicense);
}

function restoreLicense(event: Event): void {
  event.preventDefault();
  const input = document.querySelector<HTMLInputElement>('#license-token');
  const token = input?.value.trim();
  if (!token) {
    licenseNotice = 'Paste the license token from your receipt.';
    renderLicense();
    return;
  }
  localStorage.setItem(licenseKey, token);
  licenseNotice = 'Verifying license…';
  renderLicense();
  void verifyLicense(token);
}

function updateNetwork(): void {
  const state = document.querySelector('#network-state');
  if (state) state.textContent = navigator.onLine ? 'Ready offline' : 'Offline · all local';
}

function showToast(message: string, actionLabel?: string, action?: () => void): void {
  const toast = document.querySelector<HTMLDivElement>('#toast');
  if (!toast) return;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>${actionLabel ? `<button type="button">${escapeHtml(actionLabel)}</button>` : ''}`;
  toast.hidden = false;
  const button = toast.querySelector('button');
  button?.addEventListener('click', () => { action?.(); toast.hidden = true; }, { once: true });
  window.setTimeout(() => { toast.hidden = true; }, 8000);
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          showToast('A fresh edition is ready.', 'Update now', () => {
            refreshForUpdate = true;
            worker.postMessage({ type: 'SKIP_WAITING' });
          });
        }
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshForUpdate) location.reload();
    });
  } catch {
    // The app remains fully usable; offline installation is simply unavailable.
  }
}

if (location.pathname === '/privacy' || location.pathname === '/privacy/') legalPage('privacy');
else if (location.pathname === '/terms' || location.pathname === '/terms/') legalPage('terms');
else homePage();

void registerServiceWorker();
