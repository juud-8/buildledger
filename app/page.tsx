import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CreditCard, BarChart3, ChevronRight, Menu, CheckCircle, Star, X } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary"></div>
            <span className="text-xl font-bold">BuildLedger</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#testimonials"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
              <div className="flex flex-col gap-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Streamline Your Contracting Business
                </h1>
                <p className="text-xl text-muted-foreground">
                  Effortless Invoicing & Quoting for Tradespeople. Save time, look professional, and get paid faster.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/auth/signup">
                      Get Started Free
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#features">See How It Works</a>
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>Free 14-day trial</span>
                  </div>
                </div>
              </div>
              <div className="relative aspect-video md:aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-border/50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <span className="text-sm">App Screenshot</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 border-y border-border/30 bg-muted/20">
          <div className="container">
            <p className="text-center text-sm font-medium text-muted-foreground mb-8">
              TRUSTED BY CONTRACTORS ACROSS THE COUNTRY
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-muted/30 rounded-md flex items-center justify-center px-4">
                  <span className="text-xs text-muted-foreground">Company Logo</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Run Your Business</h2>
              <p className="text-muted-foreground text-lg">
                BuildLedger gives you the tools to create professional invoices and quotes, track payments, and manage
                your business finances all in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card hover:bg-card/80 border border-border/50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional Invoices</h3>
                <p className="text-muted-foreground">
                  Create polished, professional invoices in seconds. Customize with your logo and send directly to
                  clients.
                </p>
              </div>

              <div className="bg-card hover:bg-card/80 border border-border/50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Time-Saving Quotes</h3>
                <p className="text-muted-foreground">
                  Create detailed quotes quickly, convert to invoices with one click, and track when clients view them.
                </p>
              </div>

              <div className="bg-card hover:bg-card/80 border border-border/50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Paid Faster</h3>
                <p className="text-muted-foreground">
                  Accept online payments directly from your invoices. Send automatic payment reminders to clients.
                </p>
              </div>

              <div className="bg-card hover:bg-card/80 border border-border/50 rounded-lg p-6 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Business Insights</h3>
                <p className="text-muted-foreground">
                  Track your income, expenses, and outstanding payments with easy-to-understand reports and dashboards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-muted/20 border-y border-border/30">
          <div className="container">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Contractors Are Saying</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "BuildLedger has completely transformed how I handle invoicing. I save hours every week and my clients are impressed with the professional look.",
                  name: "Michael Johnson",
                  title: "Electrical Contractor",
                  rating: 5,
                },
                {
                  quote:
                    "The ability to create quotes on-site and have clients approve them instantly has been a game changer for my plumbing business.",
                  name: "Sarah Williams",
                  title: "Plumbing Services",
                  rating: 5,
                },
                {
                  quote:
                    "I used to spend weekends doing paperwork. Now with BuildLedger, I can create and send invoices right from the job site in minutes.",
                  name: "David Martinez",
                  title: "General Contractor",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-card border border-border/50 rounded-lg p-6">
                  <div className="flex mb-4">
                    {Array(testimonial.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                  </div>
                  <blockquote className="text-lg mb-6">"{testimonial.quote}"</blockquote>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted"></div>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA Section */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Simplify Your Workflow?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of contractors who are saving time and getting paid faster with BuildLedger.
              </p>
              <Button size="lg" className="gap-2" asChild>
                <Link href="/auth/signup">
                  Sign Up Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">No credit card required. Free 14-day trial.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 bg-muted/20 border-y border-border/30">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground text-lg">
                Choose the plan that works best for your contracting business.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="bg-card border border-border/50 rounded-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-xl font-semibold mb-2">BuildLedger Solo</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Perfect for freelancers just starting out</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Up to 5 active invoices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Up to 5 active quotes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Manage up to 5 clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Basic dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Mobile-friendly layout</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">PDF export</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">AI features</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup?plan=free">Get Started</Link>
                  </Button>
                </div>
              </div>

              {/* Standard Tier */}
              <div className="bg-card border-2 border-primary rounded-lg overflow-hidden flex flex-col relative">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Most Popular
                </div>
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-xl font-semibold mb-2">BuildLedger Growth</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$19</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">For growing contracting businesses</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Unlimited invoices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Unlimited quotes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Unlimited clients</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>PDF export</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Quote-to-invoice conversion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Basic dashboard analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Limited AI features (10 prompts/month)</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup?plan=growth">Get Started</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Save 20% with annual billing ($182/year)
                  </p>
                </div>
              </div>

              {/* Pro Tier */}
              <div className="bg-card border border-border/50 rounded-lg overflow-hidden flex flex-col">
                <div className="p-6 border-b border-border/50">
                  <h3 className="text-xl font-semibold mb-2">BuildLedger Professional</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">$49</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">For established contracting companies</p>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Everything in Growth</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Multiple users (up to 3)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>In-depth analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Quote view and acceptance tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Full AI chatbot access</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Unlimited AI-assisted inputs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Notification center</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signup?plan=professional">Get Started</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Save 20% with annual billing ($470/year)
                  </p>
                </div>
              </div>
            </div>

            {/* Enterprise/Team Tier Teaser */}
            <div className="mt-12 bg-card border border-border/50 rounded-lg p-6 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">BuildLedger Team</h3>
                  <p className="text-muted-foreground">
                    Need more users or custom features? Our team plan is perfect for larger businesses.
                  </p>
                </div>
                <Button variant="outline" asChild className="md:w-auto w-full">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>

            {/* Pricing Comparison Note */}
            <div className="mt-12 max-w-3xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> More comprehensive trade-specific platforms like Jobber or ServiceTitan can range
                from $30 - $300+ per month. BuildLedger offers competitive pricing with powerful AI features that set us
                apart.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <Link
                    href="/changelog"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/documentation"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/40">
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary"></div>
              <span className="text-xl font-bold">BuildLedger</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BuildLedger. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
