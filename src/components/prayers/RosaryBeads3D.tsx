"use client";

import { useEffect, useRef } from "react";

// ─── ROSARY GEOMETRY ──────────────────────────────────────────────────────────
// Node order follows the path the fingers travel:
//   0 cross · 1 Bapa Kami · 2-4 Salam Maria · 5 Kemuliaan/Bapa Kami dekade 1
//   6 medali · 7-60 lingkaran (50 Salam Maria + 4 Bapa Kami) · 61 kembali ke medali
type NodeKind = "cross" | "our-father" | "hail-mary" | "center" | "virtual";

interface RosaryNode {
  kind: NodeKind;
  theta: number; // angle around the ring
  out: number;   // distance outward from the ring (pendant)
}

const R = 1;
const LOOP_START = 7;
const CENTER = 6;
const END = 61;

function buildNodes(): RosaryNode[] {
  const nodes: RosaryNode[] = [
    { kind: "cross", theta: 0, out: 0.8 },
    { kind: "our-father", theta: 0, out: 0.6 },
    { kind: "hail-mary", theta: 0, out: 0.46 },
    { kind: "hail-mary", theta: 0, out: 0.37 },
    { kind: "hail-mary", theta: 0, out: 0.28 },
    { kind: "our-father", theta: 0, out: 0.16 },
    { kind: "center", theta: 0, out: 0 },
  ];

  // Loop beads: an Our Father bead sits before decades 2-5
  const loopKinds: NodeKind[] = [];
  for (let d = 0; d < 5; d++) {
    if (d > 0) loopKinds.push("our-father");
    for (let j = 0; j < 10; j++) loopKinds.push("hail-mary");
  }

  // Spacing units between neighbours, normalised to a full turn
  const gaps: number[] = [1.7];
  for (let k = 1; k < loopKinds.length; k++) {
    gaps.push(loopKinds[k] === "our-father" || loopKinds[k - 1] === "our-father" ? 1.45 : 1);
  }
  gaps.push(1.7);
  const total = gaps.reduce((a, b) => a + b, 0);

  let cum = 0;
  loopKinds.forEach((kind, k) => {
    cum += gaps[k];
    nodes.push({ kind, theta: (cum / total) * Math.PI * 2, out: 0 });
  });
  nodes.push({ kind: "virtual", theta: Math.PI * 2, out: 0 });
  return nodes;
}

const NODES = buildNodes();

const CHAIN: [number, number][] = [
  ...Array.from({ length: CENTER }, (_, i) => [i, i + 1] as [number, number]),
  ...Array.from({ length: END - CENTER - 1 }, (_, i) => [CENTER + i, CENTER + i + 1] as [number, number]),
  [END - 1, CENTER],
];

/** Maps a prayer step to a (possibly fractional) position along NODES. */
export function stepToBeadPos(beadType: string | undefined, decade = 0, beadIndex = 0): number {
  const hm = (d: number, j: number) => LOOP_START + (d - 1) * 11 + (j - 1);
  switch (beadType) {
    case "cross": return 0;
    case "our-father":
    case "mystery":
      if (decade <= 0) return 1;
      return decade === 1 ? 5 : hm(decade, 1) - 1;
    case "hail-mary": return decade <= 0 ? 1 + beadIndex : hm(decade, beadIndex);
    case "glory": return decade <= 0 ? 4.5 : hm(decade, 10) + 0.5;
    case "closing": return END;
    default: return 0;
  }
}

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgba = ([r, g, b]: RGB, a: number) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
const mix = (c: RGB, t: RGB, k: number): RGB => [c[0] + (t[0] - c[0]) * k, c[1] + (t[1] - c[1]) * k, c[2] + (t[2] - c[2]) * k];

const PEARL: RGB = [196, 200, 214];

function sphere(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, base: RGB, a: number) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.42, r * 0.08, x, y, r);
  g.addColorStop(0, rgba([255, 255, 255], a));
  g.addColorStop(0.28, rgba(mix(base, [255, 255, 255], 0.35), a));
  g.addColorStop(0.72, rgba(base, a));
  g.addColorStop(1, rgba(mix(base, [0, 0, 0], 0.65), a));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: RGB, a: number) {
  const g = ctx.createRadialGradient(x, y, r * 0.4, x, y, r);
  g.addColorStop(0, rgba(c, a));
  g.addColorStop(1, rgba(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function RosaryBeads3D({ pos, accent }: { pos: number; accent: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef(pos);
  const accentRef = useRef(hexToRgb(accent));

  useEffect(() => { targetRef.current = pos; }, [pos]);
  useEffect(() => { accentRef.current = hexToRgb(accent); }, [accent]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Drag to turn the rosary; it eases back when released
    let dragging = false, dragX = 0, dragY = 0, yawDrag = 0, tiltDrag = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true; dragX = e.clientX; dragY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      yawDrag = Math.max(-1.2, Math.min(1.2, yawDrag + (e.clientX - dragX) * 0.006));
      tiltDrag = Math.max(-0.35, Math.min(0.25, tiltDrag + (e.clientY - dragY) * 0.003));
      dragX = e.clientX; dragY = e.clientY;
    };
    const onUp = () => { dragging = false; };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    let anim = targetRef.current;
    let last = performance.now();
    let raf = 0;

    const lerpNode = (p: number) => {
      const i = Math.max(0, Math.min(END - 1, Math.floor(p)));
      const t = Math.max(0, Math.min(1, p - i));
      const a = NODES[i], b = NODES[i + 1];
      return { theta: a.theta + (b.theta - a.theta) * t, out: a.out + (b.out - a.out) * t };
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      const target = targetRef.current;
      anim = reduceMotion ? target : anim + (target - anim) * (1 - Math.exp(-dt * 4.5));
      if (Math.abs(target - anim) < 0.001) anim = target;
      if (!dragging) {
        const k = Math.exp(-dt * 2.2);
        yawDrag *= k; tiltDrag *= k;
      }

      const acc = accentRef.current;
      const focus = lerpNode(anim);
      const spin = -focus.theta;
      const tilt = 1.1 + tiltDrag + (reduceMotion ? 0 : Math.sin(t * 0.5) * 0.02);
      const yaw = 0.28 + yawDrag + (reduceMotion ? 0 : Math.sin(t * 0.35) * 0.06);
      const sinT = Math.sin(tilt), cosT = Math.cos(tilt);
      const sinY = Math.sin(yaw), cosY = Math.cos(yaw);

      const world = (theta: number, out: number) => {
        const rad = R + out;
        const x0 = rad * Math.sin(theta + spin);
        const z0 = -rad * Math.cos(theta + spin);
        // The pendant hangs down from the medal rather than lying flat
        return { x: x0, y: -z0 * sinT + out * 0.75, z: z0 * cosT - out * 0.35 };
      };
      const f = world(focus.theta, focus.out);

      const F = Math.min(h * 1.15, w * 1.4);
      // Pull back while on the pendant so the loop stays in frame
      const DZ = 0.95 + focus.out * 1.1;
      const cx = w * 0.5, cy = h * (h > w ? 0.56 : 0.66);

      const proj = NODES.map((n) => {
        const p = world(n.theta, n.out);
        const x = p.x - f.x, y = p.y - f.y, z = p.z - f.z;
        const xr = x * cosY + z * sinY;
        const zr = -x * sinY + z * cosY + DZ;
        return { sx: cx + (F * xr) / zr, sy: cy + (F * y) / zr, z: zr };
      });

      const fog = (z: number) => Math.max(0.12, Math.min(1, 1.3 - (z - DZ) * 0.5));
      const activeIdx = Number.isInteger(target) ? (target === END ? CENTER : target) : -1;
      const isPast = (i: number) => (i === CENTER ? target >= END : i < target);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Chain
      ctx.lineCap = "round";
      for (const [a, b] of CHAIN) {
        const pa = proj[a], pb = proj[b];
        if (pa.z < 0.08 || pb.z < 0.08) continue;
        const z = (pa.z + pb.z) / 2;
        const done = isPast(a) && isPast(b);
        ctx.strokeStyle = done ? rgba(acc, 0.45 * fog(z)) : rgba([255, 255, 255], 0.22 * fog(z));
        ctx.lineWidth = Math.max(0.6, (F * 0.006) / z);
        ctx.beginPath();
        ctx.moveTo(pa.sx, pa.sy);
        ctx.lineTo(pb.sx, pb.sy);
        ctx.stroke();
      }

      // Beads, far to near
      const order = NODES.map((_, i) => i)
        .filter((i) => NODES[i].kind !== "virtual" && proj[i].z > 0.08)
        .sort((a, b) => proj[b].z - proj[a].z);

      for (const i of order) {
        const n = NODES[i], p = proj[i];
        const a = fog(p.z);
        const active = i === activeIdx;
        const past = isPast(i);
        const pulse = active && !reduceMotion ? 1 + Math.sin(t * 2.6) * 0.05 : 1;
        const base: RGB = active ? mix(acc, [255, 255, 255], 0.15) : past ? acc : PEARL;
        const alpha = active ? 1 : past ? 0.9 * a : 0.6 * a;

        if (n.kind === "cross") {
          const s = ((F * 0.07) / p.z) * (active ? 1.1 * pulse : 1);
          const up = proj[1];
          const ang = Math.atan2(up.sy - p.sy, up.sx - p.sx) + Math.PI / 2;
          if (active) glow(ctx, p.sx, p.sy, s * 1.9, acc, 0.5);
          ctx.save();
          ctx.translate(p.sx, p.sy);
          ctx.rotate(ang);
          const g = ctx.createLinearGradient(-s * 0.4, -s, s * 0.4, s);
          g.addColorStop(0, rgba([255, 255, 255], alpha));
          g.addColorStop(0.45, rgba(base, alpha));
          g.addColorStop(1, rgba(mix(base, [0, 0, 0], 0.55), alpha));
          ctx.fillStyle = g;
          const bw = s * 0.2;
          ctx.fillRect(-bw / 2, -s * 0.55, bw, s * 1.45);
          ctx.fillRect(-s * 0.38, -s * 0.25, s * 0.76, bw);
          ctx.restore();
          continue;
        }

        if (n.kind === "center") {
          const rx = ((F * 0.045) / p.z) * (active ? 1.15 * pulse : 1);
          if (active) glow(ctx, p.sx, p.sy, rx * 3.4, acc, 0.55);
          const g = ctx.createRadialGradient(p.sx - rx * 0.3, p.sy - rx * 0.5, rx * 0.1, p.sx, p.sy, rx * 1.3);
          g.addColorStop(0, rgba([255, 255, 255], alpha));
          g.addColorStop(0.5, rgba(base, alpha));
          g.addColorStop(1, rgba(mix(base, [0, 0, 0], 0.6), alpha));
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.ellipse(p.sx, p.sy, rx, rx * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = rgba([255, 255, 255], 0.35 * alpha);
          ctx.lineWidth = Math.max(0.5, rx * 0.12);
          ctx.beginPath();
          ctx.ellipse(p.sx, p.sy, rx * 0.68, rx * 0.95, 0, 0, Math.PI * 2);
          ctx.stroke();
          continue;
        }

        const size = n.kind === "our-father" ? 0.048 : 0.034;
        const r = ((F * size) / p.z) * (active ? 1.3 * pulse : 1);
        if (active) glow(ctx, p.sx, p.sy, r * 3.4, acc, 0.6);
        else if (past) glow(ctx, p.sx, p.sy, r * 1.8, acc, 0.18 * a);
        sphere(ctx, p.sx, p.sy, r, base, alpha);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        aria-label="Rosario 3D — geser untuk memutar"
        role="img"
      />
    </div>
  );
}
