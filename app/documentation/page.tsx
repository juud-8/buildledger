"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Search, Menu, X, Home, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function DocumentationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({
    "getting-started": true,
    invoices: true,
    quotes: false,
    settings: false,
    "ai-features": false,
    library: false,
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary"></div>
            <span className="text-xl font-bold">BuildLedger</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link href="/documentation" className="text-sm font-medium text-foreground transition-colors">
              Documentation
            </Link>
            <Link
              href="/changelog"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Changelog
            </Link>
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
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed top-16 bottom-0 left-0 z-50 w-72 border-r border-border/40 bg-card overflow-y-auto md:sticky md:block transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 p-4 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search documentation..." className="w-full pl-9 bg-background/50" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>

          <div className="p-4">
            <nav className="space-y-1">
              <Link
                href="/documentation"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-primary/10 text-primary font-medium"
              >
                <Home className="h-4 w-4" />
                Documentation Home
              </Link>
            </nav>

            <div className="mt-6 space-y-4">
              {/* Getting Started */}
              <div>
                <button
                  onClick={() => toggleCategory("getting-started")}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50"
                >
                  <span>Getting Started</span>
                  {expandedCategories["getting-started"] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategories["getting-started"] && (
                  <div className="mt-1 pl-4 space-y-1">
                    <Link
                      href="/documentation/getting-started/introduction"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Introduction
                    </Link>
                    <Link
                      href="/documentation/getting-started/quick-start"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Quick Start Guide
                    </Link>
                    <Link
                      href="/documentation/getting-started/account-setup"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Account Setup
                    </Link>
                    <Link
                      href="/documentation/getting-started/dashboard-overview"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Dashboard Overview
                    </Link>
                  </div>
                )}
              </div>

              {/* Invoices */}
              <div>
                <button
                  onClick={() => toggleCategory("invoices")}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50"
                >
                  <span>Invoices</span>
                  {expandedCategories["invoices"] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategories["invoices"] && (
                  <div className="mt-1 pl-4 space-y-1">
                    <Link
                      href="/documentation/invoices/creating-invoice"
                      className="block px-3 py-2 text-sm rounded-md bg-primary/10 text-primary"
                    >
                      Creating an Invoice
                    </Link>
                    <Link
                      href="/documentation/invoices/sending-invoice"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Sending an Invoice
                    </Link>
                    <Link
                      href="/documentation/invoices/tracking-payments"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Tracking Payments
                    </Link>
                    <Link
                      href="/documentation/invoices/recurring-invoices"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Recurring Invoices
                    </Link>
                    <Link
                      href="/documentation/invoices/invoice-templates"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Invoice Templates
                    </Link>
                  </div>
                )}
              </div>

              {/* Quotes */}
              <div>
                <button
                  onClick={() => toggleCategory("quotes")}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50"
                >
                  <span>Quotes</span>
                  {expandedCategories["quotes"] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategories["quotes"] && (
                  <div className="mt-1 pl-4 space-y-1">
                    <Link
                      href="/documentation/quotes/creating-quote"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Creating a Quote
                    </Link>
                    <Link
                      href="/documentation/quotes/sending-quote"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Sending a Quote
                    </Link>
                    <Link
                      href="/documentation/quotes/client-acceptance"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Client Acceptance
                    </Link>
                    <Link
                      href="/documentation/quotes/converting-to-invoice"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Converting to Invoice
                    </Link>
                  </div>
                )}
              </div>

              {/* Library */}
              <div>
                <button
                  onClick={() => toggleCategory("library")}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50"
                >
                  <span>Service & Material Library</span>
                  {expandedCategories["library"] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategories["library"] && (
                  <div className="mt-1 pl-4 space-y-1">
                    <Link
                      href="/documentation/library/overview"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Library Overview
                    </Link>
                    <Link
                      href="/documentation/library/adding-items"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Adding Items
                    </Link>
                    <Link
                      href="/documentation/library/categories"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Managing Categories
                    </Link>
                    <Link
                      href="/documentation/library/bulk-import"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Bulk Import
                    </Link>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div>
                <button
                  onClick={() => toggleCategory("settings")}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50"
                >
                  <span>Settings</span>
                  {expandedCategories["settings"] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategories["settings"] && (
                  <div className="mt-1 pl-4 space-y-1">
                    <Link
                      href="/documentation/settings/business-information"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Business Information
                    </Link>
                    <Link
                      href="/documentation/settings/branding"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Branding
                    </Link>
                    <Link
                      href="/documentation/settings/user-management"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      User Management
                    </Link>
                    <Link
                      href="/documentation/settings/notifications"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* AI Features */}
              <div>
                <button
                  onClick={() => toggleCategory("ai-features")}
                  className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-md hover:bg-muted/50"
                >
                  <span>AI Features</span>
                  {expandedCategories["ai-features"] ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {expandedCategories["ai-features"] && (
                  <div className="mt-1 pl-4 space-y-1">
                    <Link
                      href="/documentation/ai-features/ai-chatbot"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      AI Chatbot
                    </Link>
                    <Link
                      href="/documentation/ai-features/smart-suggestions"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Smart Suggestions
                    </Link>
                    <Link
                      href="/documentation/ai-features/content-generation"
                      className="block px-3 py-2 text-sm rounded-md hover:bg-muted/50"
                    >
                      Content Generation
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8">
              <Link
                href="/documentation"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Documentation
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Creating an Invoice</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Learn how to create professional invoices for your clients in just a few steps.
              </p>
            </div>

            <Card className="p-6 md:p-8 mb-8">
              <div className="prose prose-invert max-w-none">
                <h2 className="text-2xl font-semibold tracking-tight mt-0">Overview</h2>
                <p>
                  BuildLedger makes it easy to create professional invoices that help you get paid faster. This guide
                  will walk you through the process of creating an invoice from scratch, adding line items, applying
                  taxes, and finalizing it for your client.
                </p>

                <h2 className="text-2xl font-semibold tracking-tight">Accessing the Invoice Creation Page</h2>
                <p>There are multiple ways to create a new invoice in BuildLedger:</p>
                <ul>
                  <li>
                    From the dashboard, click the <strong>+ Create Invoice</strong> button in the top right corner
                  </li>
                  <li>
                    Navigate to the <strong>Invoices</strong> page and click <strong>Create Invoice</strong>
                  </li>
                  <li>Convert an existing quote to an invoice (covered in a separate guide)</li>
                </ul>

                <h2 className="text-2xl font-semibold tracking-tight">Step 1: Enter Client Information</h2>
                <p>The first section of the invoice form allows you to enter or select client information:</p>
                <ul>
                  <li>Select an existing client from the dropdown, or</li>
                  <li>Enter new client details (name, email, address, etc.)</li>
                  <li>If entering a new client, you can save them to your client list for future use</li>
                </ul>

                <div className="my-8 rounded-lg border border-border overflow-hidden">
                  <Image
                    src="/invoice-screenshot.png"
                    alt="Invoice client information section"
                    width={800}
                    height={400}
                    className="w-full h-auto"
                  />
                  <div className="bg-muted/20 p-3 text-sm text-muted-foreground">
                    The client information section of the invoice creation form
                  </div>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">Step 2: Add Invoice Details</h2>
                <p>Next, fill in the basic invoice details:</p>
                <ul>
                  <li>
                    <strong>Invoice Number:</strong> Automatically generated, but can be customized
                  </li>
                  <li>
                    <strong>Invoice Date:</strong> Defaults to today's date, but can be changed
                  </li>
                  <li>
                    <strong>Due Date:</strong> Set when payment is due (e.g., 15, 30, or 60 days from invoice date)
                  </li>
                  <li>
                    <strong>Reference/PO Number:</strong> Optional field for client's purchase order or reference number
                  </li>
                </ul>

                <h2 className="text-2xl font-semibold tracking-tight">Step 3: Add Line Items</h2>
                <p>The line items section is where you add the products or services you're billing for:</p>
                <ul>
                  <li>
                    Click <strong>Add Item</strong> to add a new line
                  </li>
                  <li>Enter a description, quantity, unit price, and optional tax rate for each item</li>
                  <li>You can select items from your Service & Material Library to quickly add common items</li>
                  <li>Add as many line items as needed</li>
                  <li>The subtotal, tax, and total will calculate automatically</li>
                </ul>

                <div className="my-8 rounded-lg border border-border overflow-hidden">
                  <Image
                    src="/invoice-screenshot.png"
                    alt="Invoice line items section"
                    width={800}
                    height={400}
                    className="w-full h-auto"
                  />
                  <div className="bg-muted/20 p-3 text-sm text-muted-foreground">Adding line items to your invoice</div>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">Step 4: Add Notes and Terms</h2>
                <p>You can add optional notes and payment terms to your invoice:</p>
                <ul>
                  <li>
                    <strong>Notes:</strong> Additional information for your client (e.g., "Thank you for your business")
                  </li>
                  <li>
                    <strong>Terms:</strong> Payment terms and conditions (e.g., "Payment due within 30 days")
                  </li>
                  <li>You can save default notes and terms in your settings to automatically apply to all invoices</li>
                </ul>

                <h2 className="text-2xl font-semibold tracking-tight">Step 5: Preview and Send</h2>
                <p>Before finalizing your invoice:</p>
                <ul>
                  <li>
                    Click <strong>Preview</strong> to see how your invoice will look to clients
                  </li>
                  <li>Make any necessary adjustments</li>
                  <li>Choose to save as draft or send immediately</li>
                  <li>If sending, you can customize the email message that accompanies the invoice</li>
                </ul>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
                  <h3 className="text-lg font-medium text-primary mb-2">Pro Tip</h3>
                  <p className="text-sm mb-0">
                    Use the <strong>Save as Template</strong> option if you frequently create similar invoices. This
                    will save you time in the future by allowing you to start with a pre-filled invoice.
                  </p>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">Next Steps</h2>
                <p>After creating your invoice:</p>
                <ul>
                  <li>Track its status on the Invoices dashboard</li>
                  <li>Send reminders if payment is overdue</li>
                  <li>Record payments when received</li>
                  <li>Generate reports to analyze your invoicing activity</li>
                </ul>

                <p>For more information on managing invoices, see the related guides:</p>
                <ul>
                  <li>
                    <a href="/documentation/invoices/sending-invoice" className="text-primary hover:underline">
                      Sending an Invoice
                    </a>
                  </li>
                  <li>
                    <a href="/documentation/invoices/tracking-payments" className="text-primary hover:underline">
                      Tracking Payments
                    </a>
                  </li>
                  <li>
                    <a href="/documentation/invoices/recurring-invoices" className="text-primary hover:underline">
                      Setting Up Recurring Invoices
                    </a>
                  </li>
                </ul>
              </div>
            </Card>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Button variant="outline" asChild>
                <Link href="/documentation/getting-started/dashboard-overview" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard Overview
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/documentation/invoices/sending-invoice" className="flex items-center">
                  Sending an Invoice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary"></div>
              <span className="text-xl font-bold">BuildLedger</span>
            </Link>
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <Link href="/documentation" className="text-sm text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <Link href="/changelog" className="text-sm text-muted-foreground hover:text-foreground">
                Changelog
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Support
              </Link>
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} BuildLedger</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
