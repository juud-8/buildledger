import { supabase } from '../supabase'
import type { Invoice, InvoiceItem } from '@/types/database'

export const invoiceService = {
  async createInvoice(invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getInvoices(userId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateInvoice(id: string, invoice: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(invoice)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async addInvoiceItems(items: Partial<InvoiceItem>[]) {
    const { data, error } = await supabase
      .from('invoice_items')
      .insert(items)
      .select()
    
    if (error) throw error
    return data
  }
} 