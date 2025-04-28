import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Mock guide data
const guides = [
  {
    id: "getting-started",
    title: "Getting Started with BuildLedger",
    description: "Learn the basics of setting up your account and navigating the BuildLedger platform.",
    image: "/abstract-geometric-shapes.png",
    category: "Basics",
  },
  {
    id: "client-setup",
    title: "Setting Up Your First Client",
    description: "A step-by-step walkthrough for adding and managing client information effectively.",
    image: "/abstract-geometric-shapes.png",
    category: "Clients",
  },
  {
    id: "invoice-mastery",
    title: "Mastering Invoice Itemization",
    description: "Learn advanced techniques for detailed and professional invoice creation.",
    image: "/abstract-geometric-shapes.png",
    category: "Invoicing",
  },
  {
    id: "quote-creation",
    title: "Creating Winning Quotes",
    description: "Tips and best practices for creating quotes that win more business.",
    image: "/abstract-geometric-shapes.png",
    category: "Quotes",
  },
  {
    id: "dashboard-analytics",
    title: "Understanding Dashboard Analytics",
    description: "Make data-driven decisions by mastering BuildLedger's powerful analytics dashboard.",
    image: "/abstract-geometric-shapes.png",
    category: "Analytics",
  },
  {
    id: "payment-tracking",
    title: "Efficient Payment Tracking",
    description: "Stay on top of your finances with BuildLedger's payment tracking features.",
    image: "/abstract-geometric-shapes.png",
    category: "Payments",
  },
  {
    id: "library-management",
    title: "Managing Your Service & Material Library",
    description: "Organize and optimize your service and material items for faster document creation.",
    image: "/abstract-geometric-shapes.png",
    category: "Library",
  },
  {
    id: "ai-features",
    title: "Leveraging AI Assistant Features",
    description: "Maximize productivity with BuildLedger's AI-powered tools and automations.",
    image: "/abstract-geometric-shapes.png",
    category: "AI Features",
  },
  {
    id: "mobile-usage",
    title: "BuildLedger on the Go",
    description: "Access and manage your business from anywhere using mobile-friendly features.",
    image: "/abstract-geometric-shapes.png",
    category: "Mobile",
  },
]

export default function GuidesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">BuildLedger Guides & Tutorials</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore our comprehensive collection of guides and tutorials to help you get the most out of BuildLedger.
          Whether you're just getting started or looking to master advanced features, we've got you covered.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Link href={`/guides/${guide.id}`} key={guide.id} className="block h-full">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/50 hover:translate-y-[-2px]">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
                    {guide.category}
                  </span>
                </div>
                <Image
                  src={guide.image || "/placeholder.svg"}
                  alt={guide.title}
                  width={400}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{guide.title}</CardTitle>
                <CardDescription className="text-base">{guide.description}</CardDescription>
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

      {/* Additional Resources Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
        <p className="text-muted-foreground mb-6">
          Can't find what you're looking for? Check out our additional resources.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/documentation">Browse Documentation</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
