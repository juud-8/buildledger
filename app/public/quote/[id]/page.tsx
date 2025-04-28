"use client"

import { useState } from "react"
import Image from "next/image"
import { CheckCircle, XCircle, Calendar, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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
    contactPerson: "Bruce Wayne",
  },
  business: {
    name: "BuildLedger Construction",
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
  terms:
    "50% deposit required to begin work. Remaining balance due upon completion. All work to be completed according to local building codes and regulations.",
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

export default function PublicQuotePage() {
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false)
  const [declineReason, setDeclineReason] = useState("")
  const [quoteStatus, setQuoteStatus] = useState<"pending" | "accepted" | "declined">("pending")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotalValue = calculateSubtotal(quote.items)
  const taxAmount = calculateTaxAmount(subtotalValue, quote.taxRate)
  const total = calculateTotalAmount(subtotalValue, taxAmount)

  const handleAcceptQuote = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setQuoteStatus("accepted")
    setIsSubmitting(false)
  }

  const handleDeclineQuote = async () => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setQuoteStatus("declined")
    setDeclineDialogOpen(false)
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Simple Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 relative">
              <Image
                src={quote.business.logo || "/placeholder.svg"}
                alt={`${quote.business.name} logo`}
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold">{quote.business.name}</span>
          </div>
          <div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <FileText className="mr-1 h-4 w-4" />
              Quote
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="container max-w-5xl mx-auto space-y-8">
          {/* Status Messages */}
          {quoteStatus === "accepted" && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Quote Accepted!</AlertTitle>
              <AlertDescription>
                Thank you for accepting this quote. We will be in touch shortly to discuss next steps.
              </AlertDescription>
            </Alert>
          )}

          {quoteStatus === "declined" && (
            <Alert className="bg-destructive/10 border-destructive/20 text-destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Quote Declined</AlertTitle>
              <AlertDescription>
                This quote has been declined. If you have any questions or would like to discuss alternatives, please
                contact us.
              </AlertDescription>
            </Alert>
          )}

          {/* Quote Header */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">Quote #{quote.id}</CardTitle>
                  <p className="text-muted-foreground mt-1 flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Created: {formatDate(quote.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <p className="text-muted-foreground flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Valid until: {formatDate(quote.expiryDate)}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Client and Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{quote.client.name}</p>
                <p className="text-muted-foreground">{quote.client.contactPerson}</p>
                <p className="text-muted-foreground">{quote.client.email}</p>
                <p className="text-muted-foreground">{quote.client.address}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">From</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{quote.business.name}</p>
                <p className="text-muted-foreground">{quote.business.address}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quote Items */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Quote Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
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
              </div>

              {/* Quote Totals */}
              <div className="mt-6 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(subtotalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({quote.taxRate}%):</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium text-lg">Total:</span>
                  <span className="font-bold text-xl">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes:</h3>
                <p>{quote.notes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Terms and Conditions:</h3>
                <p>{quote.terms}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {quoteStatus === "pending" && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAcceptQuote}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-5 w-5 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Accept Quote
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => setDeclineDialogOpen(true)}
                disabled={isSubmitting}
              >
                <XCircle className="mr-2 h-5 w-5" />
                Decline Quote
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-8">
        <div className="container max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Quote generated by <span className="font-medium text-foreground">{quote.business.name}</span>
          </p>
        </div>
      </footer>

      {/* Decline Quote Dialog */}
      <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Decline Quote</DialogTitle>
            <DialogDescription>
              Please let us know why you're declining this quote. This feedback helps us improve our services.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Optional: Provide a reason for declining this quote..."
              className="min-h-[120px]"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeclineDialogOpen(false)} className="sm:order-1">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeclineQuote} disabled={isSubmitting} className="sm:order-2">
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin"></span>
                  Processing...
                </>
              ) : (
                "Submit Decline"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
