import { supabase } from '../supabase'
import type { Quote, QuoteItem } from '@/types/database'

export const quoteService = {
  async createQuote(quote: Partial<Quote>) {
    const { data, error } = await supabase
      .from('quotes')
      .insert(quote)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getQuotes(userId: string) {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getQuoteById(id: string) {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        quote_items (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateQuote(id: string, quote: Partial<Quote>) {
    const { data, error } = await supabase
      .from('quotes')
      .update(quote)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteQuote(id: string) {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async addQuoteItems(items: Partial<QuoteItem>[]) {
    const { data, error } = await supabase
      .from('quote_items')
      .insert(items)
      .select()
    
    if (error) throw error
    return data
  }
} 