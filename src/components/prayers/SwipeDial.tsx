"use client";

import { useRef, useState } from "react";

const S = 176;        // dial square (px); the corner is the circle centre
const R_OUT = 172;
const R_IN = 102;
const R_BEADS = 118;
const R_TEXT = 150;
const STEP_DEG = 9;   // one bead along the ring
const COMMIT_DEG = 16;

interface Props {
  accent: string;
  big: string;
  small: string;
  onNext: () => void;
  onPrev: () => void;
}

/** Quarter-circle "geser" dial anchored to the bottom-right corner (phone only). */
export default function SwipeDial({ accent, big, small, onNext, onPrev }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [rot, setRot] = useState(0);
  const [live, setLive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const g = useRef({ startAng: 0, x: 0, y: 0, moved: 0, t: 0 });

  const angleAt = (x: number, y: number) => {
    const r = ref.current!.getBoundingClientRect();
    return (Math.atan2(r.bottom - y, r.right - x) * 180) / Math.PI;
  };

  const buzz = () => { try { navigator.vibrate?.(12); } catch { /* not supported */ } };

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    g.current = { startAng: angleAt(e.clientX, e.clientY), x: e.clientX, y: e.clientY, moved: 0, t: performance.now() };
    setDragging(true);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    g.current.moved = Math.max(g.current.moved, Math.hypot(e.clientX - g.current.x, e.clientY - g.current.y));
    const delta = g.current.startAng - angleAt(e.clientX, e.clientY);
    setLive(Math.max(-40, Math.min(40, -delta)));
  };

  const finish = (e: React.PointerEvent, cancelled = false) => {
    if (!dragging) return;
    setDragging(false);
    setLive(0);
    if (cancelled) return;
    const delta = g.current.startAng - angleAt(e.clientX, e.clientY);
    if (delta > COMMIT_DEG) {
      setRot((r) => r - STEP_DEG); buzz(); onNext();
    } else if (delta < -COMMIT_DEG) {
      setRot((r) => r + STEP_DEG); buzz(); onPrev();
    } else if (g.current.moved < 8 && performance.now() - g.current.t < 450) {
      setRot((r) => r - STEP_DEG); buzz(); onNext();
    }
  };

  const arc = (r: number) => `M ${S - r} ${S} A ${r} ${r} 0 0 1 ${S} ${S - r}`;

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Geser untuk lanjut ke manik berikutnya"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onNext(); } }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={(e) => finish(e)}
      onPointerCancel={(e) => finish(e, true)}
      className="md:hidden absolute bottom-0 right-0 z-30 select-none overflow-hidden"
      style={{
        width: S, height: S,
        borderTopLeftRadius: "100%",
        touchAction: "none",
        WebkitTapHighlightColor: "transparent",
        transform: dragging ? "scale(0.985)" : "scale(1)",
        transformOrigin: "100% 100%",
        transition: "transform .2s ease",
      }}
    >
      {/* Glass band */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{
          borderTopLeftRadius: "100%",
          background: `radial-gradient(circle at 100% 100%, transparent ${R_IN - 1}px, ${accent}38 ${R_IN}px, ${accent}1a ${R_OUT}px)`,
          boxShadow: `0 0 40px ${accent}33`,
        }}
      />

      <svg width={S} height={S} className="absolute inset-0 pointer-events-none" aria-hidden>
        <defs>
          <path id="dial-text-arc" d={arc(R_TEXT)} />
          <radialGradient id="dial-bead" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <path d={arc(R_OUT - 0.5)} fill="none" stroke={`${accent}80`} strokeWidth="1" />
        <path d={arc(R_IN)} fill="none" stroke={`${accent}66`} strokeWidth="1" />

        {/* Bead ring — turns one bead per step, follows the finger while dragging */}
        <g
          style={{
            transform: `rotate(${rot + live}deg)`,
            transformOrigin: `${S}px ${S}px`,
            transformBox: "view-box",
            transition: dragging ? "none" : "transform .45s cubic-bezier(.2,.9,.25,1.15)",
          }}
        >
          {Array.from({ length: 360 / STEP_DEG }).map((_, i) => {
            const a = (i * STEP_DEG * Math.PI) / 180;
            return (
              <circle
                key={i}
                cx={S - R_BEADS * Math.cos(a)}
                cy={S - R_BEADS * Math.sin(a)}
                r={i % 11 === 0 ? 5.5 : 4}
                fill="url(#dial-bead)"
              />
            );
          })}
        </g>

        <text fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="600" letterSpacing="3">
          <textPath href="#dial-text-arc" startOffset="50%" textAnchor="middle">
            ‹‹  geser
          </textPath>
        </text>
      </svg>

      {/* Inner disc with the counter */}
      <div
        className="absolute bottom-0 right-0 flex flex-col items-end justify-end pr-4 pb-5"
        style={{
          width: R_IN - 2, height: R_IN - 2,
          borderTopLeftRadius: "100%",
          background: "radial-gradient(circle at 100% 100%, rgba(0,0,0,0.55), rgba(0,0,0,0.25))",
        }}
      >
        <span className="text-white font-bold leading-none text-[28px] drop-shadow" style={{ textShadow: `0 0 14px ${accent}` }}>
          {big}
        </span>
        <span className="text-white/55 text-[9px] uppercase tracking-widest mt-1">{small}</span>
      </div>
    </div>
  );
}
