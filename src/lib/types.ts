// Database Types
export interface User {
  id: string
  email: string
}

export interface Client {
  id: string
  name: string
  user_id: string
}

export interface QuoteItem {
  id?: string
  quote_id?: string
  description: string
  quantity: number
  rate: number
}

export interface Quote {
  id: string
  user_id: string
  client_id: string | null
  title: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  total: number
  created_at: string
  clients?: { name: string }
  quote_items?: QuoteItem[]
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  description: string
  quantity: number
  rate: number
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string
  quote_id: string | null
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  total: number
  created_at: string
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
} 