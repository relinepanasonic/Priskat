import Link from "next/link";

/** A card with a picture behind its title, like the devotion plans. */
export default function PicCard({
  href, title, text, image, tall = false,
}: { href: string; title: string; text: string; image: string; tall?: boolean }) {
  return (
    <Link
      href={href}
      prefetch={true}
      className={`group relative block overflow-hidden rounded-2xl border border-[#2a2d35] bg-black transition-transform active:scale-[0.98] ${tall ? "h-44" : "h-32"}`}
    >
      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url("${image}")` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
      <div className="relative flex h-full flex-col justify-end p-3.5">
        <span className="text-[15px] font-bold leading-tight text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>{title}</span>
        <span className="mt-0.5 text-[11px] leading-snug text-gray-300">{text}</span>
      </div>
    </Link>
  );
}
