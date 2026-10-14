import type { Metadata } from "next";
import Link from "next/link";
import { POLICY_UPDATED, SITE_NAME, SUPPORT_EMAIL } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: `Kebijakan Privasi aplikasi ${SITE_NAME}.`,
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold text-[#D6B072] mt-8 mb-2" style={{ fontFamily: "'Lora', Georgia, serif" }}>{children}</h2>;
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#121417] text-[#EAE5D9]">
      <div className="max-w-2xl mx-auto px-5 py-10 leading-relaxed text-[15px]">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Lora', Georgia, serif" }}>Kebijakan Privasi</h1>
        <p className="text-sm text-[#9CA3AF] mt-1">{SITE_NAME} · Terakhir diperbarui: {POLICY_UPDATED}</p>
        <p className="text-sm text-[#9CA3AF] mt-1 italic">English summary: we collect only the data needed to run your account and community features, we never sell it, and you can delete your account and data at any time at /hapus-akun.</p>

        <p className="mt-6">
          {SITE_NAME} (&ldquo;kami&rdquo;) adalah aplikasi komunitas Katolik yang menyediakan Alkitab, doa, renungan, dan ruang komunitas.
          Kebijakan ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan hak Anda atas data tersebut.
        </p>

        <H>1. Data yang kami kumpulkan</H>
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Data akun:</b> nama, email, nomor telepon (jika diisi), dan kata sandi (disimpan terenkripsi oleh penyedia autentikasi kami; kami tidak dapat membacanya).</li>
          <li><b>Data profil (opsional):</b> foto profil, nama panggilan, tanggal lahir, status, komunitas, kota, Instagram, bio, dan ayat favorit.</li>
          <li><b>Konten buatan pengguna:</b> kiriman &ldquo;Pikiran&rdquo;, komentar, pesan, dan permintaan pertemanan.</li>
          <li><b>Aktivitas penggunaan aplikasi:</b> ayat favorit, rencana bacaan, kemajuan membaca, dan streak doa harian.</li>
          <li><b>Data teknis:</b> bahasa yang dipilih, dan preferensi tampilan yang disimpan di perangkat Anda.</li>
        </ul>
        <p className="mt-2">Kami <b>tidak</b> mengumpulkan lokasi, kontak telepon, atau data kesehatan, dan kami tidak menampilkan iklan.</p>

        <H>2. Untuk apa data digunakan</H>
        <ul className="list-disc pl-5 space-y-1">
          <li>Membuat dan mengelola akun Anda serta masuk ke aplikasi.</li>
          <li>Menampilkan profil, kiriman, dan fitur komunitas kepada anggota lain.</li>
          <li>Menyimpan kemajuan membaca, favorit, dan streak Anda.</li>
          <li>Menjaga keamanan dan moderasi konten komunitas.</li>
          <li>Menghubungi Anda terkait akun atau dukungan.</li>
        </ul>

        <H>3. Dengan siapa data dibagikan</H>
        <p>
          Kami tidak menjual data Anda. Data diproses oleh penyedia layanan yang kami gunakan untuk menjalankan aplikasi:
          <b> Supabase</b> (basis data, autentikasi, dan penyimpanan berkas) dan <b>Vercel</b> (hosting situs).
          Konten yang Anda bagikan di komunitas (misalnya kiriman dan nama profil) dapat dilihat oleh anggota lain.
          Kami dapat mengungkapkan data bila diwajibkan oleh hukum.
        </p>

        <H>4. Keamanan</H>
        <p>Data dikirim melalui koneksi terenkripsi (HTTPS). Akses ke basis data dibatasi dengan aturan keamanan tingkat baris. Tidak ada sistem yang sepenuhnya aman, namun kami berupaya menjaga data Anda sebaik mungkin.</p>

        <H>5. Penyimpanan dan penghapusan</H>
        <p>
          Data disimpan selama akun Anda aktif. Anda dapat menghapus akun beserta datanya kapan saja di halaman{" "}
          <Link href="/hapus-akun" className="text-[#D6B072] underline">Hapus Akun</Link>.
          Setelah dihapus, data akun dan kiriman Anda dihapus dari sistem kami. Cadangan teknis dapat bertahan hingga 30 hari sebelum terhapus sepenuhnya.
        </p>

        <H>6. Hak Anda</H>
        <p>Anda berhak mengakses, memperbaiki, dan menghapus data Anda. Anda dapat mengubah profil di menu Profil, atau menghubungi kami untuk permintaan lain.</p>

        <H>7. Konten komunitas dan keselamatan</H>
        <p>Anda dapat melaporkan kiriman atau komentar yang tidak pantas, dan memblokir pengguna lain, langsung dari aplikasi. Kami meninjau laporan dan dapat menghapus konten atau menonaktifkan akun yang melanggar.</p>

        <H>8. Anak-anak</H>
        <p>Aplikasi ini ditujukan untuk pengguna berusia 13 tahun ke atas. Kami tidak dengan sengaja mengumpulkan data anak di bawah 13 tahun.</p>

        <H>9. Perubahan kebijakan</H>
        <p>Jika kebijakan ini berubah, tanggal pembaruan di atas akan diperbarui. Perubahan penting akan diumumkan di aplikasi.</p>

        <H>10. Hubungi kami</H>
        <p>Pertanyaan tentang privasi: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#D6B072] underline">{SUPPORT_EMAIL}</a></p>
      </div>
    </main>
  );
}
