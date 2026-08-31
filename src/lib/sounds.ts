// Short UI sounds synthesised with the Web Audio API — no assets to ship.
// Browsers block audio until the user interacts with the page, so
// unlockAudio() must be wired to a first gesture; the play* functions are
// no-ops until the context is running.

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
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

/**
 * Incoming direct message: a serene rising fifth (C6 -> G6), bell-like
 * shimmer, ~1.4s soft decay. Reads as calm / "holy".
 */
export function playMessageChime() {
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const now = c.currentTime;
  const master = c.createGain();
  master.gain.setValueAtTime(0.22, now);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.7);
  master.connect(c.destination);

  const notes: Array<[number, number]> = [
    [1046.5, 0],
    [1567.98, 0.15],
  ];
  for (const [freq, delay] of notes) {
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

/**
 * Someone knocking to join a group: two soft, low wooden knocks
 * (~180 -> 90 Hz drop each), ~0.3s total, quiet. Distinct from the
 * message chime.
 */
export function playKnock() {
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const now = c.currentTime;
  [0, 0.15].forEach((delay) => {
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(180, now + delay);
    osc.frequency.exponentialRampToValueAtTime(90, now + delay + 0.09);

    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now + delay);
    g.gain.linearRampToValueAtTime(0.14, now + delay + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.13);

    osc.connect(g);
    g.connect(c.destination);
    osc.start(now + delay);
    osc.stop(now + delay + 0.17);
  });
}
