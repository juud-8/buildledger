// Create a new file for the quote view page that includes the logo
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, Download, ThumbsUp, ThumbsDown } from "lucide-react"
import { QuoteHeader } from "@/components/quote/quote-header"

// Mock quote data
const quote = {
  id: "QT-2024-0018",
  status: "sent",
  createdAt: "2024-04-15",
  expiryDate: "2024-05-15",
  client: {
    name: "Wayne Industries",
    email: "procurement@wayneindustries.com",
    address: "1007 Mountain Drive, Gotham City, NJ 07101",
  },
  business: {
    name: "BuildLedger",
    logo: "/abstract-geometric-logo.png",
    address: "456 Contractor Lane, Pittsburgh, PA 15222",
  },
  items: [
    {
      id: 1,
      description: "Security System Installation",
      quantity: 1,
      unitPrice: 4200.0,
    },
    {
      id: 2,
      description: "Access Control Setup",
      quantity: 1,
      unitPrice: 1800.0,
    },
    {
      id: 3,
      description: "Surveillance Cameras",
      quantity: 8,
      unitPrice: 350.0,
    },
    {
      id: 4,
      description: "Monthly Monitoring Service",
      quantity: 12,
      unitPrice: 150.0,
    },
  ],
  taxRate: 7.0,
  notes: "This quote is valid for 30 days from the date of issue. Please contact us if you have any questions.",
  terms: "50% deposit required to begin work. Remaining balance due upon completion.",
}

// Helper functions
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const calculateSubtotal = (items: typeof quote.items) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

const calculateTaxAmount = (subtotal: number, taxRate: number) => {
  return subtotal * (taxRate / 100)
}

const calculateTotalAmount = (subtotal: number, taxAmount: number) => {
  return subtotal + taxAmount
}

export default function QuoteViewPage() {
  const subtotalValue = calculateSubtotal(quote.items)
  const taxAmount = calculateTaxAmount(subtotalValue, quote.taxRate)
  const total = calculateTotalAmount(subtotalValue, taxAmount)

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Quote Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quote</h1>
            <p className="text-xl text-muted-foreground mt-1">{quote.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm font-medium rounded-full
                ${quote.status === "accepted" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : ""}
                ${quote.status === "sent" ? "border-blue-500 bg-blue-500/10 text-blue-500" : ""}
                ${quote.status === "viewed" ? "border-purple-500 bg-purple-500/10 text-purple-500" : ""}
                ${quote.status === "rejected" ? "border-red-500 bg-red-500/10 text-red-500" : ""}
              `}
            >
              {quote.status === "accepted" ? (
                <>
                  <ThumbsUp className="w-4 h-4 mr-1.5" />
                  Accepted
                </>
              ) : quote.status === "sent" ? (
                <>
                  <Clock className="w-4 h-4 mr-1.5" />
                  Sent
                </>
              ) : quote.status === "viewed" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Viewed
                </>
              ) : (
                <>
                  <ThumbsDown className="w-4 h-4 mr-1.5" />
                  Rejected
                </>
              )}
            </Badge>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Quote Content */}
        <Card className="bg-white text-black">
          <CardContent className="p-6 space-y-8">
            {/* Business Logo and Quote Info */}
            <QuoteHeader
              businessName={quote.business.name}
              businessLogo={quote.business.logo}
              businessAddress={quote.business.address}
              quoteNumber={quote.id}
            />

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Prepared For:</h3>
                <p className="font-medium">{quote.client.name}</p>
                <p className="text-gray-600">{quote.client.email}</p>
                <p className="text-gray-600">{quote.client.address}</p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Quote Date:</h3>
                    <p>{formatDate(quote.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Valid Until:</h3>
                    <p>{formatDate(quote.expiryDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Items */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Quote Totals */}
              <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({quote.taxRate}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <Separator className="my-2 bg-gray-200" />
                <div className="flex justify-between">
                  <span className="font-medium text-lg">Total:</span>
                  <span className="font-bold text-xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes:</h3>
                <p className="text-gray-600">{quote.notes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Terms and Conditions:</h3>
                <p className="text-gray-600">{quote.terms}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <ThumbsUp className="mr-2 h-4 w-4" />
            Accept Quote
          </Button>
          <Button variant="outline" size="lg" className="text-red-500 border-red-500 hover:bg-red-500/10">
            <ThumbsDown className="mr-2 h-4 w-4" />
            Decline Quote
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>
            Quote generated by{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              BuildLedger
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
