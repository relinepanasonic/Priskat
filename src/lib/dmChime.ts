// A short, gentle two-note bell — synthesised with the Web Audio API so
// there's no asset to ship. Reads as calm / "holy" (a meditation-bell
// fifth, soft attack, ~1.4s exponential decay).
//
// Browsers block audio until the user has interacted with the page, so
// unlockChime() must be wired to a first gesture; playChime() is a no-op
// until the context is running.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

/** Call from a user-gesture handler so the audio context is allowed to run. */
export function unlockChime() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

export function playChime() {
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const now = c.currentTime;
  const master = c.createGain();
  master.gain.setValueAtTime(0.22, now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);
  master.connect(c.destination);

  // C6, then G6 a beat later — a serene rising fifth.
  const notes: Array<[number, number]> = [
    [1046.5, 0],
    [1567.98, 0.15],
  ];
  for (const [freq, delay] of notes) {
    // A few inharmonic partials give it a bell-like shimmer.
    [1, 2.01, 3.03].forEach((mult, i) => {
      const osc = c.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const g = c.createGain();
      const amp = 0.5 / (i + 1);
      g.gain.setValueAtTime(0, now + delay);
      g.gain.linearRampToValueAtTime(amp, now + delay + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.3);
      osc.connect(g);
      g.connect(master);
      osc.start(now + delay);
      osc.stop(now + delay + 1.45);
    });
  }
}
