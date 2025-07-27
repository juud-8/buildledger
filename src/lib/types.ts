/**
 * BuildLedger Type Definitions
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * Types are organized by domain and include comprehensive documentation for maintainability.
 */

// ============================================================================
// AUTHENTICATION & USER TYPES
// ============================================================================

/**
 * Core user interface from Supabase Auth
 */
export interface User {
  id: string
  email: string
  created_at?: string
  updated_at?: string
}

/**
 * User profile with business information and subscription details
 */
export interface Profile {
  id: string
  name?: string
  company_name?: string
  logo_url?: string
  plan_tier: 'free' | 'pro' | 'business'
  created_at?: string
  updated_at?: string
}

/**
 * Subscription plan features and limits
 */
export interface PlanFeatures {
  max_clients: number
  max_invoices_per_month: number
  max_quotes_per_month: number
  custom_branding: boolean
  priority_support: boolean
  advanced_analytics: boolean
}

// ============================================================================
// CLIENT MANAGEMENT TYPES
// ============================================================================

/**
 * Client/customer information
 */
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

/**
 * Client with additional computed fields
 */
export interface ClientWithStats extends Client {
  total_invoices?: number
  total_paid?: number
  total_outstanding?: number
  last_invoice_date?: string
}

// ============================================================================
// QUOTE MANAGEMENT TYPES
// ============================================================================

/**
 * Individual line item in a quote
 */
export interface QuoteItem {
  id?: string
  quote_id?: string
  description: string
  quantity: number
  rate: number
  created_at?: string
}

/**
 * Quote status enumeration
 */
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

/**
 * Quote with full details including client and items
 */
export interface Quote {
  id: string
  user_id: string
  client_id: string | null
  title: string
  status: QuoteStatus
  total: number
  pdf_url?: string
  created_at: string
  notes?: string
  updated_at?: string
  // Related data (populated by joins)
  clients?: { name: string; email?: string; phone?: string; address?: string }
  quote_items?: QuoteItem[]
}

/**
 * Quote with computed fields for display
 */
export interface QuoteWithStats extends Quote {
  days_since_created?: number
  is_expired?: boolean
  client_name?: string
}

// ============================================================================
// INVOICE MANAGEMENT TYPES
// ============================================================================

/**
 * Individual line item in an invoice
 */
export interface InvoiceItem {
  id?: string
  invoice_id?: string
  description: string
  quantity: number
  rate: number
  created_at?: string
}

/**
 * Invoice status enumeration
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

/**
 * Invoice with full details including client and items
 */
export interface Invoice {
  id: string
  user_id: string
  client_id: string | null
  quote_id: string | null
  invoice_number?: string
  due_date: string | null
  status: InvoiceStatus
  total: number
  pdf_url?: string
  notes?: string
  created_at: string
  updated_at?: string
  // Related data (populated by joins)
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
}

/**
 * Invoice with computed fields for display and business logic
 */
export interface InvoiceWithStats extends Invoice {
  days_overdue?: number
  is_overdue?: boolean
  days_until_due?: number
  client_name?: string
  payment_status?: 'paid' | 'partial' | 'unpaid'
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ============================================================================
// FORM & UI TYPES
// ============================================================================

/**
 * Form validation error structure
 */
export interface FormErrors {
  [field: string]: string
}

/**
 * Loading state for UI components
 */
export interface LoadingState {
  loading: boolean
  error?: string
}

/**
 * File upload result
 */
export interface FileUploadResult {
  success: boolean
  url?: string
  filename?: string
  error?: string
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Database entity with common fields
 */
export interface BaseEntity {
  id: string
  created_at?: string
  updated_at?: string
}

/**
 * User-owned entity
 */
export interface UserOwnedEntity extends BaseEntity {
  user_id: string
}

/**
 * Soft deletable entity
 */
export interface SoftDeletableEntity extends BaseEntity {
  deleted_at?: string
}

/**
 * Type for database query filters
 */
export type QueryFilter = {
  [key: string]: string | number | boolean | null | undefined
}

/**
 * Type for database query sorting
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Type for database query pagination
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
}

// ============================================================================
// DATABASE SCHEMA TYPES
// ============================================================================

/**
 * Database schema type for Supabase
 * This should be generated from your Supabase schema
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      clients: {
        Row: Client
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>
      }
      quotes: {
        Row: Quote
        Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Quote, 'id' | 'created_at' | 'updated_at'>>
      }
      quote_items: {
        Row: QuoteItem
        Insert: Omit<QuoteItem, 'id' | 'created_at'>
        Update: Partial<Omit<QuoteItem, 'id' | 'created_at'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>
      }
      invoice_items: {
        Row: InvoiceItem
        Insert: Omit<InvoiceItem, 'id' | 'created_at'>
        Update: Partial<Omit<InvoiceItem, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 