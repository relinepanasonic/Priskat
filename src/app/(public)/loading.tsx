// Shown instantly on navigation (and prefetched with each link) while the next page loads.
export default function Loading() {
  return (
    <div className="w-full p-4 md:p-6 space-y-5 animate-pulse" aria-busy="true" aria-label="Memuat">
      <div className="h-8 w-40 bg-white/10 rounded-xl" />
      <div className="h-4 w-64 bg-white/5 rounded-xl" />
      <div className="h-40 w-full bg-white/10 rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-white/10 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-white/10 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
