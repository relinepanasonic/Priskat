export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue-50 to-brand-cream px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue text-white font-bold text-lg">
            P
          </div>
          <h1 className="text-2xl font-bold text-brand-blue">PriskatCFM</h1>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-sm border border-stone-100">
          {children}
        </div>
      </div>
    </div>
  );
}
