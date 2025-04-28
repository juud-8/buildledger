import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Mock guide data - this would typically come from a database or CMS
const guides = [
  {
    id: "getting-started",
    title: "Getting Started with BuildLedger",
    description: "Learn the basics of setting up your account and navigating the BuildLedger platform.",
    image: "/abstract-geometric-shapes.png",
    category: "Basics",
    publishDate: "April 15, 2024",
    readTime: "5 min read",
    content: `
      <h2>Welcome to BuildLedger</h2>
      <p>BuildLedger is designed to make invoicing and project management simple for contractors and construction professionals. This guide will walk you through the essential first steps to get you up and running quickly.</p>
      
      <h3>Creating Your Account</h3>
      <p>To get started with BuildLedger, you'll need to create an account:</p>
      <ol>
        <li>Visit the BuildLedger signup page</li>
        <li>Enter your business email and create a secure password</li>
        <li>Fill in your basic business information</li>
        <li>Verify your email address</li>
      </ol>
      
      <h3>Setting Up Your Business Profile</h3>
      <p>Once your account is created, you'll want to complete your business profile:</p>
      <ul>
        <li>Add your company logo</li>
        <li>Enter your business address and contact information</li>
        <li>Set up your tax information</li>
        <li>Customize your invoice template</li>
      </ul>
      
      <h3>Navigating the Dashboard</h3>
      <p>The BuildLedger dashboard is your command center. Here you'll find quick access to all the key features:</p>
      <ul>
        <li><strong>Invoices:</strong> Create, manage, and track all your invoices</li>
        <li><strong>Quotes:</strong> Create professional quotes for potential clients</li>
        <li><strong>Clients:</strong> Manage your client database</li>
        <li><strong>Library:</strong> Store commonly used services and materials</li>
        <li><strong>Analytics:</strong> Track your business performance</li>
      </ul>
      
      <h3>Creating Your First Invoice</h3>
      <p>Ready to create your first invoice? It's simple:</p>
      <ol>
        <li>Click the "New Invoice" button from the dashboard</li>
        <li>Select a client or create a new one</li>
        <li>Add line items from your library or create new ones</li>
        <li>Set payment terms and due dates</li>
        <li>Preview and send your invoice</li>
      </ol>
      
      <h3>Next Steps</h3>
      <p>Now that you've got the basics down, consider exploring these features next:</p>
      <ul>
        <li>Setting up recurring invoices</li>
        <li>Creating project templates</li>
        <li>Connecting payment processors</li>
        <li>Exploring the mobile app</li>
      </ul>
    `,
    related: ["client-setup", "invoice-mastery", "quote-creation"],
  },
  {
    id: "client-setup",
    title: "Setting Up Your First Client",
    description: "A step-by-step walkthrough for adding and managing client information effectively.",
    image: "/abstract-geometric-shapes.png",
    category: "Clients",
    publishDate: "April 18, 2024",
    readTime: "4 min read",
    content: `<p>Content for client setup guide...</p>`,
    related: ["getting-started", "invoice-mastery", "payment-tracking"],
  },
  {
    id: "invoice-mastery",
    title: "Mastering Invoice Itemization",
    description: "Learn advanced techniques for detailed and professional invoice creation.",
    image: "/abstract-geometric-shapes.png",
    category: "Invoicing",
    publishDate: "April 20, 2024",
    readTime: "7 min read",
    content: `<p>Content for invoice mastery guide...</p>`,
    related: ["client-setup", "payment-tracking", "library-management"],
  },
  {
    id: "quote-creation",
    title: "Creating Winning Quotes",
    description: "Tips and best practices for creating quotes that win more business.",
    image: "/abstract-geometric-shapes.png",
    category: "Quotes",
    publishDate: "April 22, 2024",
    readTime: "6 min read",
    content: `<p>Content for quote creation guide...</p>`,
    related: ["getting-started", "client-setup", "library-management"],
  },
  {
    id: "dashboard-analytics",
    title: "Understanding Dashboard Analytics",
    description: "Make data-driven decisions by mastering BuildLedger's powerful analytics dashboard.",
    image: "/abstract-geometric-shapes.png",
    category: "Analytics",
    publishDate: "April 25, 2024",
    readTime: "8 min read",
    content: `<p>Content for dashboard analytics guide...</p>`,
    related: ["payment-tracking", "ai-features", "mobile-usage"],
  },
  {
    id: "payment-tracking",
    title: "Efficient Payment Tracking",
    description: "Stay on top of your finances with BuildLedger's payment tracking features.",
    image: "/abstract-geometric-shapes.png",
    category: "Payments",
    publishDate: "April 28, 2024",
    readTime: "5 min read",
    content: `<p>Content for payment tracking guide...</p>`,
    related: ["invoice-mastery", "dashboard-analytics", "mobile-usage"],
  },
  {
    id: "library-management",
    title: "Managing Your Service & Material Library",
    description: "Organize and optimize your service and material items for faster document creation.",
    image: "/abstract-geometric-shapes.png",
    category: "Library",
    publishDate: "May 2, 2024",
    readTime: "6 min read",
    content: `<p>Content for library management guide...</p>`,
    related: ["invoice-mastery", "quote-creation", "ai-features"],
  },
  {
    id: "ai-features",
    title: "Leveraging AI Assistant Features",
    description: "Maximize productivity with BuildLedger's AI-powered tools and automations.",
    image: "/abstract-geometric-shapes.png",
    category: "AI Features",
    publishDate: "May 5, 2024",
    readTime: "9 min read",
    content: `<p>Content for AI features guide...</p>`,
    related: ["dashboard-analytics", "library-management", "mobile-usage"],
  },
  {
    id: "mobile-usage",
    title: "BuildLedger on the Go",
    description: "Access and manage your business from anywhere using mobile-friendly features.",
    image: "/abstract-geometric-shapes.png",
    category: "Mobile",
    publishDate: "May 8, 2024",
    readTime: "4 min read",
    content: `<p>Content for mobile usage guide...</p>`,
    related: ["payment-tracking", "ai-features", "dashboard-analytics"],
  },
]

export default function GuidePage({ params }: { params: { id: string } }) {
  const guide = guides.find((g) => g.id === params.id) || guides[0]

  // Find related guides
  const relatedGuides = guides.filter((g) => guide.related.includes(g.id))

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Back button */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="group pl-0">
          <Link href="/guides">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Guides
          </Link>
        </Button>
      </div>

      {/* Guide header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          {guide.category}
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">{guide.title}</h1>
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="mr-4">{guide.publishDate}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>{guide.readTime}</span>
        </div>
      </div>

      {/* Featured image */}
      <div className="mb-8 rounded-lg overflow-hidden">
        <Image
          src={guide.image || "/placeholder.svg"}
          alt={guide.title}
          width={800}
          height={400}
          className="w-full object-cover"
        />
      </div>

      {/* Guide content */}
      <div className="prose prose-invert max-w-none mb-12" dangerouslySetInnerHTML={{ __html: guide.content }} />

      {/* Related guides */}
      {relatedGuides.length > 0 && (
        <div className="mt-16">
          <Separator className="mb-8" />
          <h2 className="text-2xl font-bold mb-6">Related Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedGuides.map((relatedGuide) => (
              <Link href={`/guides/${relatedGuide.id}`} key={relatedGuide.id} className="block h-full">
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:translate-y-[-2px]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{relatedGuide.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">{relatedGuide.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="ghost" className="group p-0 h-auto font-medium text-primary hover:text-primary">
                      Read Guide
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
