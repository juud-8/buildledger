import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
      {/* Page Title */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">About BuildLedger</h1>
        <Separator className="mx-auto w-24" />
      </div>

      {/* Introduction Section */}
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 order-2 md:order-1">
          <h2 className="text-3xl font-semibold tracking-tight">Simplifying Business for Tradespeople</h2>
          <p className="text-muted-foreground text-lg">
            BuildLedger is an AI-enhanced invoicing and business management platform designed specifically for
            contractors and tradespeople. We combine powerful financial tools with intuitive design to help you spend
            less time on paperwork and more time on your craft.
          </p>
          <div className="flex gap-4 pt-4">
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/documentation">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden order-1 md:order-2">
          <Image src="/abstract-ledger.png" alt="BuildLedger Platform" fill className="object-cover" />
        </div>
      </section>

      {/* Our Story Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Our Story</h2>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-4">
            <p className="text-muted-foreground">
              BuildLedger was born from a simple observation: contractors and tradespeople are experts in their craft,
              not in accounting software. Our founder, a third-generation contractor, spent years watching his father
              struggle with complex financial software that was never designed with tradespeople in mind.
            </p>
            <p className="text-muted-foreground">
              In 2021, we assembled a team of developers, designers, and industry experts who shared a vision: to create
              a platform that speaks the language of the trades. After two years of development and testing with real
              contractors, BuildLedger launched with a promise to make business management as straightforward as the
              honest work our users perform every day.
            </p>
          </div>
          <Card className="md:col-span-2 bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-medium">Our Approach</h3>
              <ul className="space-y-2">
                <li className="flex gap-2 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm">1</span>
                  </div>
                  <span>Built for tradespeople, by tradespeople</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm">2</span>
                  </div>
                  <span>Simplicity without sacrificing power</span>
                </li>
                <li className="flex gap-2 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-primary text-sm">3</span>
                  </div>
                  <span>AI assistance that works for you, not the other way around</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Our Mission</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path>
                  <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path>
                  <path d="M12 2v2"></path>
                  <path d="M12 22v-2"></path>
                  <path d="m17 20.66-1-1.73"></path>
                  <path d="M11 10.27 7 3.34"></path>
                  <path d="m20.66 17-1.73-1"></path>
                  <path d="m3.34 7 1.73 1"></path>
                  <path d="M14 12h8"></path>
                  <path d="M2 12h2"></path>
                  <path d="m20.66 7-1.73 1"></path>
                  <path d="m3.34 17 1.73-1"></path>
                  <path d="m17 3.34-1 1.73"></path>
                  <path d="m7 20.66 1-1.73"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium">Simplify</h3>
              <p className="text-muted-foreground">
                To simplify the business side of contracting so our users can focus on what they do best.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                  <path d="m14.5 9-5 5"></path>
                  <path d="m9.5 9 5 5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium">Protect</h3>
              <p className="text-muted-foreground">
                To protect our users' financial health through better record-keeping and business insights.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium">Connect</h3>
              <p className="text-muted-foreground">
                To strengthen the connection between quality craftsmanship and professional business practices.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                  <path d="M12 8v1"></path>
                  <path d="M12 15v1"></path>
                  <path d="M16 12h-1"></path>
                  <path d="M9 12H8"></path>
                  <path d="M15.3 9.3l-.7.7"></path>
                  <path d="M9.4 14.4l-.7.7"></path>
                  <path d="M15.3 14.7l-.7-.7"></path>
                  <path d="M9.4 9.6l-.7-.7"></path>
                  <path d="M22 12h-1"></path>
                  <path d="M3 12h1"></path>
                  <path d="m19.7 9.3-.7.7"></path>
                  <path d="m5 14.4.7.7"></path>
                  <path d="m19.7 14.7-.7-.7"></path>
                  <path d="m5 9.6.7-.7"></path>
                  <path d="M12 3v1"></path>
                  <path d="M12 20v1"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium">Innovate</h3>
              <p className="text-muted-foreground">
                To continuously innovate with technology that serves the unique needs of the trades industry.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-muted/50 rounded-lg p-8 text-center space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Ready to Streamline Your Business?</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join thousands of contractors who are spending less time on paperwork and more time growing their business
          with BuildLedger.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
