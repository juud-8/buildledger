"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Send, FileText } from "lucide-react"

// Mock data for quotes
const quotes = [
  {
    id: "QT-001",
    client: "Acme Corporation",
    dateSent: "2023-04-10",
    expiryDate: "2023-05-10",
    amount: 3500.0,
    status: "sent",
  },
  {
    id: "QT-002",
    client: "Globex Industries",
    dateSent: "2023-04-12",
    expiryDate: "2023-05-12",
    amount: 2200.5,
    status: "viewed",
  },
  {
    id: "QT-003",
    client: "Stark Enterprises",
    dateSent: "2023-04-15",
    expiryDate: "2023-05-15",
    amount: 4800.75,
    status: "accepted",
  },
  {
    id: "QT-004",
    client: "Wayne Industries",
    dateSent: "2023-04-18",
    expiryDate: "2023-05-18",
    amount: 6200.0,
    status: "rejected",
  },
  {
    id: "QT-005",
    client: "Oscorp",
    dateSent: "2023-04-20",
    expiryDate: "2023-05-20",
    amount: 3100.25,
    status: "sent",
  },
  {
    id: "QT-006",
    client: "Umbrella Corporation",
    dateSent: "2023-04-22",
    expiryDate: "2023-05-22",
    amount: 5400.0,
    status: "viewed",
  },
  {
    id: "QT-007",
    client: "LexCorp",
    dateSent: "2023-04-25",
    expiryDate: "2023-05-25",
    amount: 2900.5,
    status: "accepted",
  },
]

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export default function QuotesPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <p className="text-muted-foreground">Create and manage quotes for your clients.</p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search quotes..."
            className="h-9"
            prefix={<Search className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="h-9">
              All
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5"></span>
              Sent
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <span className="h-2 w-2 rounded-full bg-purple-500 mr-1.5"></span>
              Viewed
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Accepted
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></span>
              Rejected
            </Button>
          </div>
          <Button className="h-9" size="sm" asChild>
            <Link href="/quotes/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Quote
            </Link>
          </Button>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Quote #</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden sm:table-cell">Date Sent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell className="font-medium">{quote.id}</TableCell>
                <TableCell className="hidden md:table-cell">{quote.client}</TableCell>
                <TableCell className="hidden sm:table-cell">{formatDate(quote.dateSent)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`
                      ${quote.status === "sent" ? "border-blue-500 bg-blue-500/10 text-blue-500" : ""}
                      ${quote.status === "viewed" ? "border-purple-500 bg-purple-500/10 text-purple-500" : ""}
                      ${quote.status === "accepted" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : ""}
                      ${quote.status === "rejected" ? "border-red-500 bg-red-500/10 text-red-500" : ""}
                    `}
                  >
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(quote.amount)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/quotes/edit/${quote.id}`)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Convert to Invoice</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="mr-2 h-4 w-4" />
                        <span>Resend</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 focus:text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View - Only visible on very small screens */}
      <div className="sm:hidden space-y-4 mt-4">
        <h2 className="text-sm font-medium text-muted-foreground">Mobile View</h2>
        {quotes.map((quote) => (
          <div key={quote.id} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{quote.id}</div>
              <Badge
                variant="outline"
                className={`
                  ${quote.status === "sent" ? "border-blue-500 bg-blue-500/10 text-blue-500" : ""}
                  ${quote.status === "viewed" ? "border-purple-500 bg-purple-500/10 text-purple-500" : ""}
                  ${quote.status === "accepted" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : ""}
                  ${quote.status === "rejected" ? "border-red-500 bg-red-500/10 text-red-500" : ""}
                `}
              >
                {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">{quote.client}</div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-muted-foreground">Sent: </span>
                {formatDate(quote.dateSent)}
              </div>
              <div className="font-medium">{formatCurrency(quote.amount)}</div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => router.push(`/quotes/${quote.id}`)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/quotes/edit/${quote.id}`)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
