export default function Loading() {
  return (
    <div className="w-full p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-white/10 rounded-xl" />
      <div className="h-4 w-72 bg-white/5 rounded-xl" />

      {/* Search skeleton */}
      <div className="h-11 w-full bg-white/10 rounded-2xl" />

      {/* Category pills skeleton */}
      <div className="grid grid-cols-2 gap-2.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-white/10 rounded-full" />
        ))}
      </div>

      {/* Shelf skeleton */}
      <div className="space-y-8">
        <div className="h-5 w-40 bg-white/10 rounded-lg" />
        <div className="flex gap-4 pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-[120px] aspect-[3/4] bg-white/10 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
