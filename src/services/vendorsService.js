import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

const isDev = import.meta.env.DEV;

export const vendorsService = {
  // Get all vendors for the current user
  async getVendors() {
    try {
      console.log('Attempting to fetch vendors...');
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

      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) {
        console.error('Error fetching vendors from Supabase:', error);
        throw error;
      }
      
      console.log(`Found ${vendors?.length || 0} vendors for company ${companyId}.`);
      return vendors || [];
    } catch (error) {
      showErrorToast('Failed to fetch vendors', error);
      console.error('Error in getVendors service:', error.message);
      throw error;
    }
  },

  // Get a single vendor by ID
  async getVendor(id) {
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

      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return vendor;
    } catch (error) {
      showErrorToast('Failed to fetch vendor details', error);
      throw error;
    }
  },

  // Create a new vendor
  async createVendor(vendorData) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CREATE_VENDOR_START:`, vendorData);
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (isDev) console.error('Error getting user:', userError);
        throw new Error('User not authenticated');
      }
      if (isDev) console.log('User authenticated for vendor creation:', user.id);

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        if (isDev) console.error('Error fetching user profile or company_id:', profileError);
        throw new Error('User profile or company not found');
      }
      if (isDev) console.log('User profile found with company_id:', userProfile.company_id);

      const companyId = userProfile.company_id;

      const { data: vendor, error } = await supabase
        .from('vendors')
        .insert({
          ...vendorData,
          company_id: companyId
        })
        .select()
        .single();

      if (error) {
        if (isDev) console.error('Error creating vendor in Supabase:', error);
        throw error;
      }
      
      showSuccessToast(`Vendor "${vendor.name}" created successfully`);
      return vendor;
    } catch (error) {
      showErrorToast('Failed to create vendor', error);
      throw error;
    }
  },

  // Update a vendor
  async updateVendor(id, updates) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UPDATE_VENDOR_START:`, { id, updates });
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

      const { data: vendor, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Vendor "${vendor.name}" updated successfully`);
      return vendor;
    } catch (error) {
      showErrorToast('Failed to update vendor', error);
      throw error;
    }
  },

  // Delete a vendor
  async deleteVendor(id) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DELETE_VENDOR_START:`, { id });
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

      // First get the vendor name for the success message
      const { data: vendor } = await supabase
        .from('vendors')
        .select('name')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(`Vendor "${vendor?.name || 'Vendor'}" deleted successfully`);
      return true;
    } catch (error) {
      showErrorToast('Failed to delete vendor', error);
      throw error;
    }
  }
};