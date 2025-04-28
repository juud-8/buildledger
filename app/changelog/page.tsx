import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Mock changelog data
const changelogEntries = [
  {
    date: "2024-04-15",
    changes: [
      {
        type: "new",
        description: "Added Service & Material Library for quick item selection in invoices and quotes",
        image: "/changelog/library-feature.png",
      },
      {
        type: "improved",
        description: "Enhanced dashboard with new financial insights and trend analysis",
        image: null,
      },
      {
        type: "fixed",
        description: "Resolved issue where tax calculations were occasionally incorrect on edited invoices",
        image: null,
      },
    ],
  },
  {
    date: "2024-03-28",
    changes: [
      {
        type: "new",
        description: "Introduced public quote acceptance page for clients to approve or decline quotes online",
        image: "/changelog/quote-acceptance.png",
      },
      {
        type: "new",
        description: "Added bulk import functionality for client contacts",
        image: null,
      },
      {
        type: "improved",
        description: "Optimized invoice generation process, now 40% faster",
        image: null,
      },
    ],
  },
  {
    date: "2024-03-10",
    changes: [
      {
        type: "new",
        description: "Launched PDF export for invoices and quotes with customizable templates",
        image: "/changelog/pdf-export.png",
      },
      {
        type: "improved",
        description: "Redesigned navigation for better usability on mobile devices",
        image: null,
      },
      {
        type: "fixed",
        description: "Fixed bug where quote status wasn't updating after client actions",
        image: null,
      },
      {
        type: "fixed",
        description: "Addressed issue with date picker on Safari browsers",
        image: null,
      },
    ],
  },
  {
    date: "2024-02-22",
    changes: [
      {
        type: "new",
        description: "Introduced AI-powered invoice description suggestions",
        image: "/changelog/ai-suggestions.png",
      },
      {
        type: "improved",
        description: "Enhanced search functionality across all modules",
        image: null,
      },
      {
        type: "improved",
        description: "Updated client information form with additional fields for better organization",
        image: null,
      },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/abstract-geometric-logo.png"
                alt="BuildLedger Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="text-xl font-bold text-foreground">BuildLedger</span>
            </div>
            <nav>
              <ul className="flex items-center gap-6">
                <li>
                  <a href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="/changelog" className="text-sm font-medium text-foreground">
                    Changelog
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:px-6">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          BuildLedger Changelog
        </h1>
        <p className="mb-12 text-center text-muted-foreground">
          Stay up to date with the latest improvements and new features
        </p>

        <div className="mx-auto max-w-3xl space-y-10">
          {changelogEntries.map((entry, index) => (
            <Card key={index} className="border-border bg-card shadow-md">
              <CardHeader className="pb-2">
                <h2 className="text-xl font-semibold text-foreground">{entry.date}</h2>
                <Separator className="mt-2" />
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-6">
                  {entry.changes.map((change, changeIndex) => (
                    <li key={changeIndex} className="group">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <Badge
                            className={`shrink-0 px-2 py-1 text-xs font-medium uppercase ${
                              change.type === "new"
                                ? "bg-blue-900/50 text-blue-300 hover:bg-blue-900/50"
                                : change.type === "improved"
                                  ? "bg-green-900/50 text-green-300 hover:bg-green-900/50"
                                  : "bg-amber-900/50 text-amber-300 hover:bg-amber-900/50"
                            }`}
                          >
                            {change.type}
                          </Badge>
                          <p className="text-foreground">{change.description}</p>
                        </div>

                        {change.image && (
                          <div className="mt-2 overflow-hidden rounded-md border border-border">
                            <div className="relative h-[200px] w-full overflow-hidden bg-muted/20">
                              <Image
                                src={`/abstract-ledger.png?height=400&width=800&query=BuildLedger ${change.description}`}
                                alt={`Screenshot for ${change.description}`}
                                fill
                                className="object-cover transition-all duration-300 group-hover:scale-105"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center md:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BuildLedger. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
