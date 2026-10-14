"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMyAccount } from "@/app/actions/account";

export default function DeleteAccountForm({ signedIn }: { signedIn: boolean }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-[#D6B072]/30 bg-white/5 p-5">
        <p className="text-sm">Masuk ke akun Anda terlebih dahulu untuk menghapusnya langsung dari halaman ini.</p>
        <Link href="/login?next=/hapus-akun" className="mt-3 inline-block rounded-full bg-[#D6B072] px-5 py-2 text-sm font-semibold text-[#121417]">Masuk</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[#D6B072]/30 bg-white/5 p-5">
        <p className="font-semibold text-white">Akun Anda sudah dihapus.</p>
        <p className="mt-1 text-sm text-[#9CA3AF]">Terima kasih telah menjadi bagian dari Ruang Iman. Tuhan memberkati.</p>
        <Link href="/" className="mt-3 inline-block text-sm text-[#D6B072] underline">Kembali ke beranda</Link>
      </div>
    );
  }

  const submit = () => {
    setError("");
    start(async () => {
      const res = await deleteMyAccount(text);
      if (res.success) setDone(true);
      else setError(res.error ?? "Terjadi kesalahan.");
    });
  };

  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
      <p className="text-sm">Ketik <b>HAPUS</b> lalu tekan tombol. Tindakan ini <b>tidak bisa dibatalkan</b>.</p>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="HAPUS"
        autoCapitalize="characters"
        className="mt-3 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-2.5 text-white placeholder-gray-500 focus:border-red-400 focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        onClick={submit}
        disabled={pending || text.trim().toUpperCase() !== "HAPUS"}
        className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
      >
        {pending ? "Menghapus…" : "Hapus akun saya"}
      </button>
    </div>
  );
}
