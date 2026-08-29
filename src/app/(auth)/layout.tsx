import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0d1a] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-4 mb-8 mt-6">
          <div className="bg-brand-surface rounded-2xl p-2 shadow-2xl border border-brand-gold/10 overflow-hidden">
            <Image src="/logo.png" alt="Ruang Iman Logo" width={96} height={96} className="object-cover" />
          </div>
          <h1 className="text-xl font-bold text-brand-gold leading-tight text-center">Alumni Camp<br />Ruang Iman</h1>
        </div>
        <div className="rounded-2xl bg-[#1a1d24] p-8 shadow-xl border border-[#333]">
          {children}
        </div>
      </div>
    </div>
  );
}
