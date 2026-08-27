export class Metronome {
  private context: AudioContext | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private beat = 0;
  private bpm = 96;
  private meter = 4;
  private volume = 0.08;
  private onBeat: (beat: number) => void = () => undefined;

  get running(): boolean {
    return this.timer !== null;
  }

  async start(bpm: number, meter: number, volume: number, onBeat: (beat: number) => void): Promise<void> {
    this.context ??= new AudioContext();
    await this.context.resume();
    this.bpm = bpm;
    this.meter = meter;
    this.volume = volume;
    this.onBeat = onBeat;
    this.beat = 0;
    this.nextTime = this.context.currentTime + 0.06;
    this.timer = window.setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  update(bpm: number, meter: number, volume: number): void {
    this.bpm = bpm;
    this.meter = meter;
    this.volume = volume;
    this.beat %= meter;
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    this.beat = 0;
  }

  private schedule(): void {
    if (!this.context) return;
    while (this.nextTime < this.context.currentTime + 0.1) {
      const beat = this.beat;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.frequency.value = beat === 0 ? 1260 : 850;
      gain.gain.setValueAtTime(this.volume, this.nextTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.nextTime + 0.035);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start(this.nextTime);
      oscillator.stop(this.nextTime + 0.04);
      const delay = Math.max(0, (this.nextTime - this.context.currentTime) * 1000);
      window.setTimeout(() => {
        if (this.timer !== null) this.onBeat(beat);
      }, delay);
      this.nextTime += 60 / this.bpm;
      this.beat = (this.beat + 1) % this.meter;
    }
  }
}
