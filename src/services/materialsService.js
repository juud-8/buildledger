import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

const isDev = import.meta.env.DEV;

export const materialsService = {
  // Get all materials for the current user
  async getMaterials() {
    try {
      console.log('Attempting to fetch materials...');
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

      const { data: materials, error } = await supabase
        .from('materials')
        .select(`
          *,
          vendors (
            id,
            name,
            company_name
          )
        `)
        .eq('company_id', companyId)
        .order('name');

      if (error) {
        console.error('Error fetching materials from Supabase:', error);
        throw error;
      }
      
      console.log(`Found ${materials?.length || 0} materials for company ${companyId}.`);
      return materials || [];
    } catch (error) {
      showErrorToast('Failed to fetch materials', error);
      console.error('Error in getMaterials service:', error.message);
      throw error;
    }
  },

  // Get materials by vendor
  async getMaterialsByVendor(vendorId) {
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

      const { data: materials, error } = await supabase
        .from('materials')
        .select(`
          *,
          vendors (
            id,
            name,
            company_name
          )
        `)
        .eq('company_id', companyId)
        .eq('vendor_id', vendorId)
        .order('name');

      if (error) throw error;
      return materials || [];
    } catch (error) {
      showErrorToast('Failed to fetch materials for vendor', error);
      throw error;
    }
  },

  // Get a single material by ID
  async getMaterial(id) {
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

      const { data: material, error } = await supabase
        .from('materials')
        .select(`
          *,
          vendors (
            id,
            name,
            company_name
          )
        `)
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return material;
    } catch (error) {
      showErrorToast('Failed to fetch material details', error);
      throw error;
    }
  },

  // Create a new material
  async createMaterial(materialData) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CREATE_MATERIAL_START:`, materialData);
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (isDev) console.error('Error getting user:', userError);
        throw new Error('User not authenticated');
      }
      if (isDev) console.log('User authenticated for material creation:', user.id);

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

      const { data: material, error } = await supabase
        .from('materials')
        .insert({
          ...materialData,
          company_id: companyId
        })
        .select(`
          *,
          vendors (
            id,
            name,
            company_name
          )
        `)
        .single();

      if (error) {
        if (isDev) console.error('Error creating material in Supabase:', error);
        throw error;
      }
      
      showSuccessToast(`Material "${material.name}" created successfully`);
      return material;
    } catch (error) {
      showErrorToast('Failed to create material', error);
      throw error;
    }
  },

  // Update a material
  async updateMaterial(id, updates) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UPDATE_MATERIAL_START:`, { id, updates });
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

      const { data: material, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select(`
          *,
          vendors (
            id,
            name,
            company_name
          )
        `)
        .single();

      if (error) throw error;
      
      showSuccessToast(`Material "${material.name}" updated successfully`);
      return material;
    } catch (error) {
      showErrorToast('Failed to update material', error);
      throw error;
    }
  },

  // Delete a material
  async deleteMaterial(id) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DELETE_MATERIAL_START:`, { id });
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

      // First get the material name for the success message
      const { data: material } = await supabase
        .from('materials')
        .select('name')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(`Material "${material?.name || 'Material'}" deleted successfully`);
      return true;
    } catch (error) {
      showErrorToast('Failed to delete material', error);
      throw error;
    }
  },

  // Track cost history for a material
  async addCostTracking(materialId, costData) {
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

      const { data: costRecord, error } = await supabase
        .from('cost_tracking')
        .insert({
          ...costData,
          material_id: materialId,
          company_id: companyId
        })
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast('Cost tracking record added successfully');
      return costRecord;
    } catch (error) {
      showErrorToast('Failed to add cost tracking record', error);
      throw error;
    }
  },

  // Get cost history for a material
  async getCostHistory(materialId) {
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

      const { data: costHistory, error } = await supabase
        .from('cost_tracking')
        .select(`
          *,
          vendors (
            id,
            name,
            company_name
          )
        `)
        .eq('company_id', companyId)
        .eq('material_id', materialId)
        .order('effective_date', { ascending: false });

      if (error) throw error;
      return costHistory || [];
    } catch (error) {
      showErrorToast('Failed to fetch cost history', error);
      throw error;
    }
  }
};