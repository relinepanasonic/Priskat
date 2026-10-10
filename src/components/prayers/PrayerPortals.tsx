import Link from "next/link";
import type { ReactNode } from "react";

const GOLD = "#D6B072";

// ─── LINE ICONS (gold, hand-drawn feel) ───────────────────────────────────────
const IconSOS = () => (
  <svg viewBox="0 0 32 32" className="h-[25px] w-[25px]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 27s-9.5-5.6-9.5-12.4A5.3 5.3 0 0 1 16 11.4a5.3 5.3 0 0 1 9.5 3.2C25.5 21.4 16 27 16 27Z" />
    <path d="M9.5 17.5h3.6l1.7-3.2 2.6 5.6 1.6-2.4h3.5" />
  </svg>
);

const IconRosary = () => (
  <svg viewBox="0 0 32 32" className="h-[25px] w-[25px]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2 + Math.PI / 12;
      return <circle key={i} cx={16 + 8.2 * Math.cos(a)} cy={12 + 7.4 * Math.sin(a)} r="1.15" fill="currentColor" stroke="none" />;
    })}
    <path d="M16 19.4v2.2" />
    <circle cx="16" cy="22.6" r="1" fill="currentColor" stroke="none" />
    <path d="M16 24.2v5.3M14 26h4" />
  </svg>
);

const IconCross = () => (
  <svg viewBox="0 0 32 32" className="h-[25px] w-[25px]" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 3.5v25M10 10.5h12" />
    <path d="M6.5 28.5c3-2.4 6.2-3.4 9.5-3.4s6.5 1 9.5 3.4" opacity=".55" />
    <path d="M11.6 7.6c1.3-.9 2.8-1.3 4.4-1.3s3.1.4 4.4 1.3" opacity=".55" />
  </svg>
);

// ─── TILE ─────────────────────────────────────────────────────────────────────
function Portal({
  href, title, caption, glow, icon, badge,
}: {
  href: string; title: string; caption: string; glow: string; icon: ReactNode; badge?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative block rounded-[18px] p-px transition-transform duration-500 ease-out hover:-translate-y-0.5 active:scale-[0.97]"
      style={{
        // Gold hairline frame
        background: `linear-gradient(155deg, ${GOLD}b3 0%, ${GOLD}1f 38%, ${GOLD}0d 62%, ${GOLD}66 100%)`,
        boxShadow: `0 14px 30px -14px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(0,0,0,0.6)`,
      }}
    >
      <div
        className="relative h-[138px] overflow-hidden rounded-[17px] flex flex-col items-center justify-center text-center"
        style={{ background: "linear-gradient(170deg, #2A2D34 0%, #1B1D22 55%, #141519 100%)" }}
      >
        {/* Ambient colour glow — keeps each prayer's identity, quietly */}
        <div
          className="absolute -bottom-14 left-1/2 h-24 w-28 -translate-x-1/2 rounded-full blur-2xl opacity-40 transition-opacity duration-500 group-hover:opacity-80"
          style={{ background: glow }}
        />
        {/* Top sheen */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}80, transparent)` }} />
        {/* Light sweep on hover */}
        <div className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent transition-[left] duration-1000 ease-out group-hover:left-[150%]" />
        {/* Inner engraved frame */}
        <div className="pointer-events-none absolute inset-[5px] rounded-[13px] border" style={{ borderColor: `${GOLD}14` }} />

        {badge}

        {/* Medallion */}
        <div
          className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-105"
          style={{
            color: GOLD,
            background: `radial-gradient(circle at 50% 30%, ${GOLD}26, ${GOLD}08 60%, transparent 75%)`,
            border: `0.75px solid ${GOLD}66`,
            boxShadow: `inset 0 1px 0 ${GOLD}40, 0 0 18px -4px ${GOLD}55`,
          }}
        >
          {icon}
        </div>

        <span
          className="relative text-[15px] leading-tight text-[#EAE5D9] tracking-[0.01em]"
          style={{ fontFamily: "'Lora', Georgia, serif", fontWeight: 500 }}
        >
          {title}
        </span>

        <span className="relative mt-1.5 flex items-center gap-1.5 whitespace-nowrap text-[8px] sm:text-[9px] font-medium uppercase tracking-[0.18em] sm:tracking-[0.24em]" style={{ color: `${GOLD}b0` }}>
          <span className="hidden sm:block h-px w-2.5" style={{ background: `${GOLD}66` }} />
          {caption}
          <span className="hidden sm:block h-px w-2.5" style={{ background: `${GOLD}66` }} />
        </span>
      </div>
    </Link>
  );
}

export default function PrayerPortals({ lang }: { lang: string }) {
  const id = lang === "id";
  return (
    <nav aria-label={id ? "Doa pilihan" : "Featured prayers"} className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-9">
      <Portal
        href="/faith/prayers/sos"
        title="SOS Doa"
        caption={id ? "Darurat" : "Urgent"}
        glow="rgba(225,29,72,0.45)"
        icon={<IconSOS />}
        badge={
          <span className="absolute right-3 top-3 flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60 [animation-duration:2.4s]" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
          </span>
        }
      />
      <Portal
        href="/faith/prayers/rosario"
        title="Rosario"
        caption={id ? "5 Peristiwa" : "5 Mysteries"}
        glow="rgba(139,92,246,0.45)"
        icon={<IconRosary />}
      />
      <Portal
        href="/faith/prayers/jalan-salib"
        title={id ? "Jalan Salib" : "Via Crucis"}
        caption={id ? "14 Perhentian" : "14 Stations"}
        glow="rgba(217,119,6,0.45)"
        icon={<IconCross />}
      />
    </nav>
  );
}
