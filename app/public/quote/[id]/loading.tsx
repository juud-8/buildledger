import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-5xl mx-auto space-y-8">
          {/* Quote Header */}
          <Skeleton className="h-24 w-full rounded-lg" />

          {/* Client and Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>

          {/* Quote Items */}
          <Skeleton className="h-80 w-full rounded-lg" />

          {/* Notes and Terms */}
          <Skeleton className="h-40 w-full rounded-lg" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Skeleton className="h-12 w-full sm:w-40 rounded-lg" />
            <Skeleton className="h-12 w-full sm:w-40 rounded-lg" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-8">
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <Skeleton className="h-4 w-60 mx-auto" />
        </div>
      </footer>
    </div>
  )
}
