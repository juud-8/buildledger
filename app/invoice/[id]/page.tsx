import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, Download, ExternalLink } from "lucide-react"
import { InvoiceHeader } from "@/components/invoice/invoice-header"

// Mock invoice data
const invoice = {
  id: "INV-2024-0042",
  status: "outstanding",
  createdAt: "2024-04-15",
  dueDate: "2024-05-15",
  client: {
    name: "Acme Corporation",
    email: "billing@acmecorp.com",
    address: "123 Business Ave, Suite 500, San Francisco, CA 94107",
  },
  business: {
    name: "BuildLedger",
    logo: "/abstract-geometric-logo.png",
    address: "456 Contractor Lane, Pittsburgh, PA 15222",
  },
  items: [
    {
      id: 1,
      description: "Website Design & Development",
      quantity: 1,
      unitPrice: 2400.0,
    },
    {
      id: 2,
      description: "Custom Logo Design",
      quantity: 1,
      unitPrice: 800.0,
    },
    {
      id: 3,
      description: "SEO Optimization Package",
      quantity: 1,
      unitPrice: 600.0,
    },
    {
      id: 4,
      description: "Content Creation (5 pages)",
      quantity: 5,
      unitPrice: 120.0,
    },
  ],
  taxRate: 8.5,
  paymentMethods: {
    zelle: "payments@tradetab.com",
    venmo: "@trade-tab",
    paypal: "payments@tradetab.com",
    cashapp: "$tradetab",
  },
  notes: "Payment is due within 30 days. Please include the invoice number in your payment reference.",
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

const calculateSubtotal = (items: typeof invoice.items) => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

const calculateTaxAmount = (subtotal: number, taxRate: number) => {
  return subtotal * (taxRate / 100)
}

const calculateTotalAmount = (subtotal: number, taxAmount: number) => {
  return subtotal + taxAmount
}

export default function InvoiceViewPage() {
  const subtotalValue = calculateSubtotal(invoice.items)
  const taxAmount = calculateTaxAmount(subtotalValue, invoice.taxRate)
  const total = calculateTotalAmount(subtotalValue, taxAmount)

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoice</h1>
            <p className="text-xl text-muted-foreground mt-1">{invoice.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={`px-3 py-1 text-sm font-medium rounded-full
                ${invoice.status === "paid" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : ""}
                ${invoice.status === "outstanding" ? "border-amber-500 bg-amber-500/10 text-amber-500" : ""}
                ${invoice.status === "overdue" ? "border-red-500 bg-red-500/10 text-red-500" : ""}
              `}
            >
              {invoice.status === "paid" ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Paid
                </>
              ) : invoice.status === "outstanding" ? (
                <>
                  <Clock className="w-4 h-4 mr-1.5" />
                  Outstanding
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-1.5" />
                  Overdue
                </>
              )}
            </Badge>
            <Button variant="outline" size="sm" className="h-9">
              <Download className="w-4 h-4 mr-1.5" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="bg-white text-black">
          <CardContent className="p-6 space-y-8">
            {/* Business Logo and Invoice Info */}
            <InvoiceHeader
              businessName={invoice.business.name}
              businessLogo={invoice.business.logo}
              businessAddress={invoice.business.address}
              invoiceNumber={invoice.id}
            />

            {/* Client Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Bill To:</h3>
                <p className="font-medium">{invoice.client.name}</p>
                <p className="text-gray-600">{invoice.client.email}</p>
                <p className="text-gray-600">{invoice.client.address}</p>
              </div>
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Invoice Date:</h3>
                    <p>{formatDate(invoice.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date:</h3>
                    <p>{formatDate(invoice.dueDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
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
                  {invoice.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Invoice Totals */}
              <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <Separator className="my-2 bg-gray-200" />
                <div className="flex justify-between">
                  <span className="font-medium text-lg">Total:</span>
                  <span className="font-bold text-xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Options */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Payment Options</CardTitle>
            <CardDescription>Choose your preferred payment method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pay Now Button */}
            <div className="flex flex-col items-center justify-center py-4">
              <Button size="lg" className="w-full sm:w-auto px-8">
                Pay Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">Secure payment powered by Lemon Squeezy</p>
            </div>

            <Separator />

            {/* Manual Payment Methods */}
            <div className="space-y-4">
              <h3 className="font-medium">Alternative Payment Methods</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {invoice.paymentMethods.zelle && (
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="font-medium">Zelle</p>
                    <p className="text-sm text-muted-foreground">{invoice.paymentMethods.zelle}</p>
                  </div>
                )}
                {invoice.paymentMethods.venmo && (
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="font-medium">Venmo</p>
                    <p className="text-sm text-muted-foreground">{invoice.paymentMethods.venmo}</p>
                  </div>
                )}
                {invoice.paymentMethods.paypal && (
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">{invoice.paymentMethods.paypal}</p>
                  </div>
                )}
                {invoice.paymentMethods.cashapp && (
                  <div className="p-3 rounded-lg border border-border bg-card">
                    <p className="font-medium">CashApp</p>
                    <p className="text-sm text-muted-foreground">{invoice.paymentMethods.cashapp}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-card/50 border-t border-border/50 text-sm text-muted-foreground">
            <p>{invoice.notes}</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
