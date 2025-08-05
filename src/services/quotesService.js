import { supabase } from '../lib/supabase';

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
      console.error('Error fetching quotes:', error);
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
      console.error('Error fetching quote:', error);
      throw error;
    }
  },

  // Create a new quote
  async createQuote(quoteData) {
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
        .insert({
          ...quoteData,
          company_id: companyId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return quote;
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  },

  // Update a quote
  async updateQuote(id, updates) {
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
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return quote;
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  },

  // Delete a quote
  async deleteQuote(id) {
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

      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  }
}; 