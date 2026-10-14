import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteInfo";
import DeleteAccountForm from "./DeleteAccountForm";

export const metadata: Metadata = {
  title: "Hapus Akun",
  description: `Cara menghapus akun dan data ${SITE_NAME}.`,
};
export const dynamic = "force-dynamic";

export default async function DeleteAccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#121417] text-[#EAE5D9]">
      <div className="max-w-xl mx-auto px-5 py-10 leading-relaxed text-[15px]">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>Hapus Akun</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">{SITE_NAME} · Account deletion</p>

        <p className="mt-6">
          Anda dapat menghapus akun {SITE_NAME} beserta datanya kapan saja. Berikut yang akan dihapus secara permanen:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Akun dan profil Anda (nama, email, foto, dan info profil)</li>
          <li>Kiriman, komentar, dan suka Anda</li>
          <li>Ayat favorit, kemajuan baca, dan streak Anda</li>
        </ul>
        <p className="mt-3 text-sm text-[#9CA3AF]">Cadangan teknis dapat bertahan hingga 30 hari sebelum terhapus sepenuhnya. Tidak ada data yang kami simpan untuk tujuan lain.</p>

        <h2 className="text-lg font-semibold text-[#D6B072] mt-8 mb-3" style={{ fontFamily: "'Lora', Georgia, serif" }}>Hapus sekarang</h2>
        <DeleteAccountForm signedIn={!!user} />

        <h2 className="text-lg font-semibold text-[#D6B072] mt-8 mb-2" style={{ fontFamily: "'Lora', Georgia, serif" }}>Tidak bisa masuk?</h2>
        <p>
          Kirim email dari alamat yang terdaftar ke{" "}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Hapus%20akun%20Ruang%20Iman`} className="text-[#D6B072] underline">{SUPPORT_EMAIL}</a>{" "}
          dengan subjek &ldquo;Hapus akun&rdquo;. Kami akan memprosesnya dalam 7 hari kerja.
        </p>

        <p className="mt-8 text-sm"><Link href="/privacy" className="text-[#D6B072] underline">Kebijakan Privasi</Link></p>
      </div>
    </main>
  );
}
