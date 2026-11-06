import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0d1a] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 overflow-hidden rounded-2xl bg-[#111] p-3 shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-brand-gold/20">
            <Image src="/logo.png" alt="Ruang Iman Logo" width={80} height={80} className="rounded-xl object-contain" />
          </div>
          <h1 className="text-xl font-bold text-brand-gold leading-tight text-center">Ruang Iman</h1>
        </div>
        <div className="rounded-2xl bg-[#1a1d24] p-8 shadow-xl border border-[#333]">
          {children}
        </div>
        <p className="mt-5 text-center text-xs text-[#8b8f98]">
          <Link href="/privacy" className="underline hover:text-white">Kebijakan Privasi</Link>
          <span className="mx-2">·</span>
          <Link href="/hapus-akun" className="underline hover:text-white">Hapus akun</Link>
        </p>
      </div>
    </div>
  );
}
