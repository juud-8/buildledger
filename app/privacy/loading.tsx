import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function PrivacyLoading() {
  return (
    <div className="container max-w-4xl mx-auto pt-16 pb-20 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />

            <Skeleton className="h-8 w-64 mt-8" />

            <Skeleton className="h-6 w-48 mt-6" />
            <Skeleton className="h-20 w-full" />
            <div className="pl-6 space-y-2 my-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/5" />
            </div>

            <Skeleton className="h-6 w-48 mt-6" />
            <Skeleton className="h-20 w-full" />
            <div className="pl-6 space-y-2 my-4">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
            </div>

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />
            <div className="pl-6 space-y-2 my-4">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />
            <div className="pl-6 space-y-2 my-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-4/5" />
            </div>

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />

            <Skeleton className="h-8 w-64 mt-8" />
            <Skeleton className="h-20 w-full" />
            <div className="mt-4 p-4 bg-secondary rounded-md">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64 mt-2" />
              <Skeleton className="h-5 w-80 mt-2" />
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
