export default function Loading() {
  return (
    <div className="w-full h-full pb-8 px-4 pt-6 animate-pulse">
      {/* Testament toggle skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-9 w-32 bg-white/10 rounded-full" />
        <div className="h-9 w-32 bg-white/10 rounded-full" />
        <div className="h-9 w-32 bg-white/10 rounded-full" />
      </div>

      {/* Book grid skeleton */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="h-14 bg-white/10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

