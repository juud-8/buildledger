import { supabase } from '../lib/supabase';

export const clientsService = {
  // Get all clients for the current user
  async getClients() {
    try {
      console.log('Attempting to fetch clients...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        throw new Error('User not authenticated');
      }
      console.log('User authenticated:', user.id);

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        console.error('Error fetching user profile or company_id:', profileError);
        throw new Error('User profile or company not found');
      }
      console.log('User profile found with company_id:', userProfile.company_id);

      const companyId = userProfile.company_id;

      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) {
        console.error('Error fetching clients from Supabase:', error);
        throw error;
      }
      
      console.log(`Found ${clients?.length || 0} clients for company ${companyId}.`);
      return clients || [];
    } catch (error) {
      console.error('Error in getClients service:', error.message);
      throw error;
    }
  },

  // Get a single client by ID
  async getClient(id) {
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

      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  },

  // Create a new client
  async createClient(clientData) {
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

      const { data: client, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          company_id: companyId
        })
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update a client
  async updateClient(id, updates) {
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

      const { data: client, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return client;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete a client
  async deleteClient(id) {
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
        .from('clients')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
}; 