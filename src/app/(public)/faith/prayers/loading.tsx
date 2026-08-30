export default function Loading() {
  return (
    <div className="w-full p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-32 bg-white/10 rounded-xl" />
      <div className="h-4 w-64 bg-white/5 rounded-xl" />

      {/* Search + filter skeleton */}
      <div className="h-11 w-full bg-white/10 rounded-2xl" />
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-7 w-20 bg-white/10 rounded-full shrink-0" />
        ))}
      </div>

      {/* Prayer card skeletons */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-white/10 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
