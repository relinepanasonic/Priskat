export default function Loading() {
  return (
    <div className="min-h-[80vh] bg-white relative pb-32 animate-pulse">
      {/* Top Navigation Skeleton */}
      <div className="flex items-center px-4 py-4 md:px-8">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>

      {/* Chapter Header Skeleton */}
      <div className="px-6 md:px-12 mt-2 mb-10 text-center flex flex-col items-center">
        <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="h-24 w-16 bg-gray-200 rounded"></div>
      </div>

      {/* Verses Skeleton */}
      <div className="px-6 md:px-12 lg:px-24 mx-auto max-w-4xl space-y-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-10/12"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-9/12"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Floating Bottom Navigation Skeleton */}
      <div className="fixed bottom-24 md:bottom-8 left-0 right-0 z-50 px-4 md:px-0 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="h-14 w-14 bg-gray-200 rounded-full shadow-lg border border-gray-300"></div>
          <div className="flex-1 bg-gray-200 rounded-full h-14 shadow-lg border border-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

