/**
 * BuildLedger Type Definitions
 * 
 * Comprehensive type system for the entire application.
 * Includes database entities, API responses, UI components, and utility types.
 * 
 * @author BuildLedger Team
 * @version 1.0.0
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

// Base entity interface for all database entities
export interface BaseEntity {
  id: string
  created_at: string
  updated_at?: string
}

// User and authentication types
export interface User {
  id: string
  email: string
  email_confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
}

// Plan tiers for subscription management
export type PlanTier = 'free' | 'pro' | 'business'

// Subscription status types
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

// User profile with business information - matches live database structure
export interface Profile extends BaseEntity {
  // Basic information
  name?: string
  company_name?: string
  logo_url?: string
  plan_tier: PlanTier
  subscription_status: SubscriptionStatus
  
  // Business settings
  default_payment_terms?: number // days
  default_tax_rate?: number // percentage
  business_address?: string
  business_phone?: string
  business_email?: string
  
  // Stripe integration
  stripe_customer_id?: string
  stripe_subscription_id?: string
  
  // Metadata
  settings?: UserSettings
}

// User preferences and settings
export interface UserSettings {
  currency: string
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  number_format: 'US' | 'EU' | 'UK'
  timezone: string
  notifications: NotificationSettings
  invoice_branding: InvoiceBranding
}

export interface NotificationSettings {
  email_on_payment: boolean
  email_on_overdue: boolean
  email_weekly_summary: boolean
  browser_notifications: boolean
}

export interface InvoiceBranding {
  primary_color: string
  secondary_color: string
  show_logo: boolean
  footer_text?: string
}

// Plan features interface
export interface PlanFeatures {
  max_clients: number
  max_invoices_per_month: number
  max_quotes_per_month: number
  custom_branding: boolean
  priority_support: boolean
  advanced_analytics: boolean
}

// ============================================================================
// BUSINESS ENTITY TYPES
// ============================================================================

// Client management - matches live database structure
export interface Client extends BaseEntity {
  user_id: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  
  // Enhanced client information
  tags?: string[]
  contact_person?: string
  website?: string
  industry?: string
  
  // Business metrics
  total_invoiced?: number
  total_paid?: number
  last_invoice_date?: string
  payment_terms?: number // days
  tax_exempt?: boolean
}

// Quote status and workflow
export type QuoteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired'

// Quote item for line items
export interface QuoteItem extends BaseEntity {
  quote_id: string
  description: string
  quantity: number
  rate: number
  tax_rate?: number
  discount_percentage?: number
  // Calculated fields
  line_total?: number
  tax_amount?: number
  net_amount?: number
}

// Quote entity - matches live database structure
export interface Quote extends BaseEntity {
  user_id: string
  client_id: string | null
  title: string
  status: QuoteStatus
  total: number
  pdf_url?: string
  notes?: string
  // Relationships
  clients?: Pick<Client, 'id' | 'name' | 'email'>
  quote_items?: QuoteItem[]
}

// Invoice status and workflow
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'

// Payment methods
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'paypal' | 'stripe' | 'other'

// Invoice item for line items
export interface InvoiceItem extends BaseEntity {
  invoice_id: string
  description: string
  quantity: number
  rate: number
  tax_rate?: number
  discount_percentage?: number
  // Calculated fields
  line_total?: number
  tax_amount?: number
  net_amount?: number
}

// Payment tracking
export interface Payment extends BaseEntity {
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  payment_date: string
  reference_number?: string
  notes?: string
  stripe_payment_intent_id?: string
}

// Invoice entity - matches live database structure
export interface Invoice extends BaseEntity {
  user_id: string
  client_id: string | null
  quote_id: string | null
  status: InvoiceStatus
  due_date?: string
  total: number
  pdf_url?: string
  notes?: string
  invoice_number?: string
  // Relationships
  clients?: Pick<Client, 'id' | 'name' | 'email' | 'phone' | 'address'>
  invoice_items?: InvoiceItem[]
  payments?: Payment[]
}

// ============================================================================
// API AND RESPONSE TYPES
// ============================================================================

// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
}

// Paginated response for lists
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

// Dashboard analytics types
export interface DashboardStats {
  // Financial metrics
  totalRevenueThisMonth: number
  totalRevenueLastMonth: number
  totalRevenueYtd: number
  // Invoice metrics
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  overdueInvoices: number
  draftInvoices: number
  // Amount metrics
  totalPaidAmount: number
  totalUnpaidAmount: number
  totalOverdueAmount: number
  averageInvoiceAmount: number
  // Growth metrics
  revenueGrowthRate: number
  invoiceGrowthRate: number
  clientGrowthRate: number
}

export interface RecentActivity {
  type: 'invoice_created' | 'invoice_paid' | 'quote_sent' | 'client_added' | 'payment_received'
  title: string
  description: string
  timestamp: string
  amount?: number
  invoice_id?: string
  client_id?: string
}

export interface ChartData {
  name: string
  value: number
  color?: string
  percentage?: number
}

// ============================================================================
// UI AND COMPONENT TYPES
// ============================================================================

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Form validation
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface FormState<T = Record<string, unknown>> {
  data: T
  errors: ValidationError[]
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
}

// Modal and dialog types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Table column definition
export interface TableColumn<T = unknown> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T) => React.ReactNode
}

// Search and filtering
export interface SearchFilters {
  query?: string
  status?: string[]
  dateRange?: {
    start: string
    end: string
  }
  amountRange?: {
    min: number
    max: number
  }
  clientIds?: string[]
  tags?: string[]
}

export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

// ============================================================================
// EMAIL AND NOTIFICATION TYPES
// ============================================================================

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  type: 'invoice' | 'quote' | 'reminder' | 'receipt'
}

export interface EmailData {
  to_email: string
  to_name: string
  subject: string
  template_id?: string
  variables: Record<string, string>
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: string // base64 encoded
  type: string
  disposition?: 'attachment' | 'inline'
}

export interface NotificationPreference {
  type: string
  enabled: boolean
  frequency?: 'immediate' | 'daily' | 'weekly'
}

// ============================================================================
// UTILITY AND HELPER TYPES
// ============================================================================

// Database query options
export interface QueryOptions {
  page?: number
  limit?: number
  sort?: SortConfig
  filters?: SearchFilters
  include?: string[]
}

// File upload types
export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
}

// Export/import types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  dateRange?: {
    start: string
    end: string
  }
  includeItems?: boolean
  includePayments?: boolean
}

// Audit log for tracking changes
export interface AuditLog extends BaseEntity {
  user_id: string
  entity_type: string
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'view'
  changes?: Record<string, { old: unknown; new: unknown }>
  ip_address?: string
  user_agent?: string
}

// System health and monitoring
export interface HealthCheck {
  service: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  response_time?: number
  last_checked: string
  details?: Record<string, unknown>
}

// ============================================================================
// TYPE GUARDS AND VALIDATORS
// ============================================================================

// Type guard for checking if an object is a valid Invoice
export function isInvoice(obj: unknown): obj is Invoice {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'status' in obj &&
    'total' in obj
  )
}

// Type guard for checking if an object is a valid Client
export function isClient(obj: unknown): obj is Client {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'name' in obj
  )
}

// Type guard for checking if an object is a valid Quote
export function isQuote(obj: unknown): obj is Quote {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'user_id' in obj &&
    'status' in obj &&
    'total' in obj
  )
}

// Type guard for checking if an object is a valid Profile
export function isProfile(obj: unknown): obj is Profile {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'plan_tier' in obj &&
    'subscription_status' in obj
  )
}

// ============================================================================
// BRANDED TYPES FOR ADDITIONAL TYPE SAFETY
// ============================================================================

// Branded string types for IDs to prevent mixing different ID types
export type UserId = string & { readonly __brand: 'UserId' }
export type ClientId = string & { readonly __brand: 'ClientId' }
export type InvoiceId = string & { readonly __brand: 'InvoiceId' }
export type QuoteId = string & { readonly __brand: 'QuoteId' }

// Currency amount with proper decimal handling
export type CurrencyAmount = number & { readonly __brand: 'CurrencyAmount' }

// Email address validation
export type EmailAddress = string & { readonly __brand: 'EmailAddress' }

// URL validation
export type URL = string & { readonly __brand: 'URL' } 