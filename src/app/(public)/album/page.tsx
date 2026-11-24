import Link from "next/link";
import { redirect } from "next/navigation";
import { Images } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { photoUrl } from "@/lib/albumPhoto";
import { formatWeekdayDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Album" };

type Row = { event_id: string; title: string; event_date: string; photo_count: number; cover_path: string | null };

/** The shelf of my event albums: every event I attended is a book, its cover is one of the photos (my own pick, or the first). */
export default async function AlbumShelfPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/album");
  const { data, error } = await (supabase as any).rpc("my_albums");
  const albums = ((data as Row[]) ?? []);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-10 pt-6 md:px-6">
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-gold">Album</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Album kegiatanmu</h1>
        <p className="mt-1 text-sm text-brand-muted">Foto dari setiap event yang kamu ikuti. Ketuk satu buku untuk membukanya.</p>
      </div>

      {error && <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">Album belum siap. Jalankan 142_event_album.sql di Supabase.</p>}

      {!error && albums.length === 0 && (
        <div className="rounded-2xl border border-[#2a2d35] bg-[#14171c] px-6 py-14 text-center">
          <Images className="mx-auto h-10 w-10 text-brand-muted/50" />
          <p className="mt-3 font-semibold text-white">Belum ada album</p>
          <p className="mt-1 text-sm text-brand-muted">Album muncul di sini setelah pendaftaranmu di sebuah event disetujui.</p>
        </div>
      )}

      {/* the shelf */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4">
        {albums.map((a) => (
          <Link key={a.event_id} href={`/album/${a.event_id}`} className="group flex flex-col items-center">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-l-[2px] rounded-r-md border-l-[4px] border-[#8b6b22] bg-gradient-to-br from-[#333742] to-[#1a1d24] shadow-[-3px_0_8px_rgba(0,0,0,0.5),5px_5px_10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-translate-y-2 group-active:scale-[0.98]">
              {a.cover_path
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={photoUrl(a.cover_path)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                : <div className="absolute inset-0 flex items-center justify-center"><Images className="h-8 w-8 text-brand-gold/50" /></div>}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/20" />
              <div className="absolute inset-x-0 bottom-3 border-y border-[#8b6b22]/50 bg-black/80 px-1.5 py-1.5 text-center backdrop-blur-md">
                <p className="line-clamp-2 font-serif text-[10px] font-bold leading-tight tracking-wide text-brand-gold">{a.title}</p>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-brand-muted">{formatWeekdayDate(a.event_date)}</p>
            <p className="text-[11px] font-semibold text-brand-light">{a.photo_count} foto</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
