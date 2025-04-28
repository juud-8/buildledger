export type Invoice = {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  project_name: string
  issue_date: string
  due_date: string | null
  status: 'paid' | 'outstanding' | 'overdue'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  notes: string | null
  public_token: string
  created_at: string
  updated_at: string
}

export type Quote = {
  id: string
  user_id: string
  client_name: string
  client_email: string
  client_phone: string
  project_name: string
  issue_date: string
  status: 'sent' | 'viewed' | 'accepted' | 'rejected'
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  notes: string | null
  public_token: string
  created_at: string
  updated_at: string
}

export type LibraryItem = {
  id: string
  user_id: string
  item_name: string
  description: string | null
  unit_price: number
  type: 'service' | 'material'
  created_at: string
  updated_at: string
}

export type InvoiceItem = {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  created_at: string
}

export type QuoteItem = {
  id: string
  quote_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: string
  plan_name: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export type Database = {
  invoices: Invoice
  quotes: Quote
  library_items: LibraryItem
  invoice_items: InvoiceItem
  quote_items: QuoteItem
  subscriptions: Subscription
} 