import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ChangelogLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border bg-card py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-6 w-32" />
            </div>
            <nav>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-12 md:px-6">
        <Skeleton className="mx-auto mb-8 h-10 w-64" />
        <Skeleton className="mx-auto mb-12 h-5 w-96" />

        <div className="mx-auto max-w-3xl space-y-10">
          {[1, 2, 3].map((_, index) => (
            <Card key={index} className="border-border bg-card shadow-md">
              <CardHeader className="pb-2">
                <Skeleton className="h-7 w-32" />
                <Separator className="mt-2" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-6">
                  {[1, 2, 3].map((_, changeIndex) => (
                    <div key={changeIndex} className="flex flex-col gap-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-full" />
                      </div>
                      {changeIndex === 0 && <Skeleton className="mt-2 h-[200px] w-full rounded-md" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="mt-20 border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center md:px-6">
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
      </footer>
    </div>
  )
}
