import { Skeleton } from "@/components/ui/skeleton"

export default function AboutLoading() {
  return (
    <div className="container max-w-5xl py-12 space-y-16">
      {/* Page Title Skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-1 w-24 mx-auto" />
      </div>

      {/* Introduction Section Skeleton */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 order-2 md:order-1">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <Skeleton className="aspect-square rounded-lg order-1 md:order-2" />
      </section>

      {/* Our Story Section Skeleton */}
      <section className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </section>

      {/* Our Mission Section Skeleton */}
      <section className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </section>

      {/* Meet the Team Section Skeleton */}
      <section className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      </section>

      {/* Call to Action Section Skeleton */}
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
