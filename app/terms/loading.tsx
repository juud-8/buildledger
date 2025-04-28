import { Skeleton } from "@/components/ui/skeleton"

export default function TermsLoading() {
  return (
    <div className="container max-w-4xl mx-auto pt-16 pb-20 px-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>

        <Skeleton className="h-[800px] w-full rounded-lg" />

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}
