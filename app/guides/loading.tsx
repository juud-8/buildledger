import { Skeleton } from "@/components/ui/skeleton"

export default function GuidesLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header Skeleton */}
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-2/3 mx-auto mb-2" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>

      {/* Guides Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="h-full">
            <div className="border rounded-lg overflow-hidden h-full">
              <Skeleton className="aspect-video w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Resources Section Skeleton */}
      <div className="mt-16 text-center">
        <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
        <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  )
}
