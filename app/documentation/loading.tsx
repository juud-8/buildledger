import { Skeleton } from "@/components/ui/skeleton"

export default function DocumentationLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Skeleton */}
      <header className="border-b border-border/40 bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-9 w-9 rounded-md md:hidden" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:block w-72 border-r border-border/40 bg-card overflow-y-auto">
          <div className="p-4 border-b border-border/40">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="p-4">
            <Skeleton className="h-8 w-full rounded-md mb-6" />
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-md" />
                  <div className="pl-4 space-y-2">
                    <Skeleton className="h-5 w-5/6 rounded-md" />
                    <Skeleton className="h-5 w-4/6 rounded-md" />
                    <Skeleton className="h-5 w-5/6 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <Skeleton className="h-5 w-32 mb-4" />
              <Skeleton className="h-12 w-3/4 mb-2" />
              <Skeleton className="h-6 w-full" />
            </div>

            <Skeleton className="h-[800px] w-full rounded-lg mb-8" />

            <div className="flex items-center justify-between mt-8 pt-6">
              <Skeleton className="h-10 w-32 rounded-md" />
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </main>
      </div>

      {/* Footer Skeleton */}
      <footer className="border-t border-border/40 bg-background py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
