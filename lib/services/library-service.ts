import { supabase } from '../supabase'
import type { LibraryItem } from '@/types/database'

export const libraryService = {
  async createItem(item: Partial<LibraryItem>) {
    const { data, error } = await supabase
      .from('library_items')
      .insert(item)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getItems(userId: string) {
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .eq('user_id', userId)
      .order('item_name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async updateItem(id: string, item: Partial<LibraryItem>) {
    const { data, error } = await supabase
      .from('library_items')
      .update(item)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .from('library_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async getItemsByType(userId: string, type: 'service' | 'material') {
    const { data, error } = await supabase
      .from('library_items')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('item_name', { ascending: true })
    
    if (error) throw error
    return data
  }
} 