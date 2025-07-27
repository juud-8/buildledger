// Database Types
export interface User {
  id: string
  email: string
}

export interface Profile {
  id: string
  name?: string
  company_name?: string
  logo_url?: string
  plan_tier: 'free' | 'pro' | 'business'
  created_at?: string
}

export interface Client {
  id: string
  name: string
  user_id: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface QuoteItem {
  id?: string
  quote_id?: string
  description: string
  quantity: number
  rate: number
  created_at?: string
}

export interface Quote {
  id: string
  user_id: string
  client_id: string | null
  title: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  total: number
  pdf_url?: string
  created_at: string
  notes?: string
  updated_at?: string
  clients?: { name: string }
  quote_items?: QuoteItem[]
}

export interface InvoiceItem {
  id?: string
  invoice_id?: string
  description: string
  quantity: number
  rate: number
  created_at?: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id: string | null
  quote_id: string | null
  invoice_number?: string
  due_date: string | null
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  total: number
  pdf_url?: string
  notes?: string
  created_at: string
  updated_at?: string
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
} 