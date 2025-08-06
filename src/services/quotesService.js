import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

const isDev = import.meta.env.DEV;

export const quotesService = {
  // Get all quotes for the current user
  async getQuotes() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(name),
          project:projects(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return quotes || [];
    } catch (error) {
      showErrorToast('Failed to fetch quotes', error);
      throw error;
    }
  },

  // Get a single quote by ID
  async getQuote(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data: quote, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:clients(name, email, phone, address),
          project:projects(name),
          quote_items(
            *,
            item:items_database(name, description, unit_price)
          )
        `)
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return quote;
    } catch (error) {
      showErrorToast('Failed to fetch quote details', error);
      throw error;
    }
  },

  // Create a new quote
  async createQuote(quoteData) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CREATE_QUOTE_START:`, quoteData);
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          ...quoteData,
          company_id: companyId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Quote #${quote.quote_number} created successfully`, quote);
      return quote;
    } catch (error) {
      showErrorToast('Failed to create quote', error);
      throw error;
    }
  },

  // Update a quote
  async updateQuote(id, updates) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UPDATE_QUOTE_START:`, { id, updates });
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data: quote, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Quote #${quote.quote_number} updated successfully`, quote);
      return quote;
    } catch (error) {
      showErrorToast('Failed to update quote', error);
      throw error;
    }
  },

  // Delete a quote
  async deleteQuote(id) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DELETE_QUOTE_START:`, { id });
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // First get the quote number for the success message
      const { data: quote } = await supabase
        .from('quotes')
        .select('quote_number')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(`Quote #${quote?.quote_number || 'Quote'} deleted successfully`);
      return true;
    } catch (error) {
      showErrorToast('Failed to delete quote', error);
      throw error;
    }
  }
}; 