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
 * Someone knocking to join a group: two firm wooden knocks — a broadband
 * noise "tap" plus a low body tone with a fast pitch drop — ~0.35s total.
 * Distinct from the message chime, audible on laptop speakers, not loud.
 */
export function playKnock() {
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const now = c.currentTime;

  // one short noise buffer, reused for both taps
  const dur = 0.2;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1;

  const knock = (delay: number) => {
    const t0 = now + delay;

    // wooden "tap" transient
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 260;
    bp.Q.value = 6;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.5, t0);
    ng.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09);
    src.connect(bp);
    bp.connect(ng);
    ng.connect(c.destination);
    src.start(t0);
    src.stop(t0 + 0.12);

    // low body thump
    const osc = c.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(190, t0);
    osc.frequency.exponentialRampToValueAtTime(95, t0 + 0.08);
    const og = c.createGain();
    og.gain.setValueAtTime(0.0001, t0);
    og.gain.linearRampToValueAtTime(0.32, t0 + 0.006);
    og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.16);
    osc.connect(og);
    og.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + 0.2);
  };

  knock(0);
  knock(0.17);
}
