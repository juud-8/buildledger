import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-[500px] w-full rounded-lg" />
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
