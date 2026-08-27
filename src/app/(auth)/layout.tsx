import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue-50 to-brand-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-xl overflow-hidden shadow-lg border-2 border-brand-gold/30">
            <Image src="/logo.png" alt="Catholic Family Ministry Logo" width={96} height={96} className="object-cover" />
          </div>
          <h1 className="text-xl font-bold text-brand-gold leading-tight px-4">Alumni Camp<br />Catholic Family Ministry</h1>
        </div>
        <div className="rounded-2xl bg-brand-surface p-8 shadow-sm border border-brand-border">
          {children}
        </div>
      </div>
    </div>
  );
}
