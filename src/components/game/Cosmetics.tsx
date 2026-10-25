import { frameByKey, nameColorClass } from "@/lib/gameCatalog";

/** Avatar with the frame the person wears. Pass any <img>/<Image> as children, sized to `size`. */
export function FramedAvatar({
  frame,
  size = 48,
  children,
}: {
  frame?: string | null;
  size?: number;
  children: React.ReactNode;
}) {
  const f = frameByKey(frame);
  if (!f) return <div className="shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>{children}</div>;
  const pad = Math.max(2, Math.round(size / 14));
  return (
    <div className="relative shrink-0" style={{ width: size + pad * 2, height: size + pad * 2 }}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: f.ring, boxShadow: f.glow ? `0 0 ${Math.round(size / 3)}px ${f.glow}` : undefined }}
      />
      <div className="absolute overflow-hidden rounded-full bg-[#1a1d24]" style={{ inset: pad }}>{children}</div>
      {f.emoji && (
        <span className="absolute -right-1 -top-1 leading-none drop-shadow" style={{ fontSize: Math.max(12, Math.round(size / 3.2)) }} aria-hidden>{f.emoji}</span>
      )}
    </div>
  );
}

/** A name in the colour the person wears (plain text when none). */
export function NameText({ name, color, className = "" }: { name: string; color?: string | null; className?: string }) {
  return <span className={`${nameColorClass(color)} ${className}`}>{name}</span>;
}
