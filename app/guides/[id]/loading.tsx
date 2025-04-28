import { Skeleton } from "@/components/ui/skeleton"

export default function GuideLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Back button skeleton */}
      <div className="mb-8">
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Guide header skeleton */}
      <div className="mb-8">
        <Skeleton className="h-6 w-24 rounded-full mb-4" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex items-center mb-6">
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-24 mr-4" />
          <Skeleton className="h-4 w-4 mr-1" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Featured image skeleton */}
      <Skeleton className="w-full aspect-[2/1] rounded-lg mb-8" />

      {/* Guide content skeleton */}
      <div className="space-y-4 mb-12">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-8 w-1/3 mt-8" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-8 w-1/3 mt-8" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Related guides skeleton */}
      <div className="mt-16">
        <Skeleton className="h-px w-full mb-8" />
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border rounded-lg p-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <Skeleton className="h-4 w-1/3 mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
