"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Eye, Pencil, Trash2, Download } from "lucide-react"
import { useEffect, useState } from 'react'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import type { Invoice } from '@/types/database'

// Mock data for invoices
const invoices = [
  {
    id: "INV-001",
    client: "Acme Corporation",
    date: "2023-04-15",
    dueDate: "2023-05-15",
    amount: 2500.0,
    status: "paid",
  },
  {
    id: "INV-002",
    client: "Globex Industries",
    date: "2023-04-20",
    dueDate: "2023-05-20",
    amount: 1750.5,
    status: "outstanding",
  },
  {
    id: "INV-003",
    client: "Stark Enterprises",
    date: "2023-04-25",
    dueDate: "2023-05-25",
    amount: 3200.75,
    status: "paid",
  },
  {
    id: "INV-004",
    client: "Wayne Industries",
    date: "2023-04-28",
    dueDate: "2023-05-28",
    amount: 4500.0,
    status: "overdue",
  },
  {
    id: "INV-005",
    client: "Oscorp",
    date: "2023-05-01",
    dueDate: "2023-06-01",
    amount: 1850.25,
    status: "outstanding",
  },
  {
    id: "INV-006",
    client: "Umbrella Corporation",
    date: "2023-05-05",
    dueDate: "2023-06-05",
    amount: 3750.0,
    status: "paid",
  },
  {
    id: "INV-007",
    client: "LexCorp",
    date: "2023-05-10",
    dueDate: "2023-06-10",
    amount: 2100.5,
    status: "overdue",
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

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/invoices')
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      const data = await response.json()
      setInvoices(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  // Set up real-time updates
  useRealtimeSubscription('invoices', fetchInvoices)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  {invoice.project_name}
                </h2>
                <p className="text-gray-600">
                  {invoice.customer_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${invoice.total_amount.toFixed(2)}
                </p>
                <p className={`text-sm ${
                  invoice.status === 'paid'
                    ? 'text-green-600'
                    : invoice.status === 'overdue'
                    ? 'text-red-600'
                    : 'text-orange-600'
                }`}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Due: {new Date(invoice.due_date!).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
