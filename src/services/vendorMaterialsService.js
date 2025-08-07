import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

const isDev = import.meta.env.DEV;

export const vendorMaterialsService = {
  // Get all vendor-material relationships for the current user's company
  async getVendorMaterials() {
    try {
      console.log('Attempting to fetch vendor-material relationships...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Error getting user:', userError);
        throw new Error('User not authenticated');
      }

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

      const companyId = userProfile.company_id;

      const { data: relationships, error } = await supabase
        .from('vendor_materials')
        .select(`
          *,
          vendors!inner (
            id,
            name,
            company_name,
            company_id
          ),
          materials!inner (
            id,
            name,
            description,
            unit,
            company_id
          )
        `)
        .eq('vendors.company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendor-material relationships from Supabase:', error);
        throw error;
      }
      
      console.log(`Found ${relationships?.length || 0} vendor-material relationships for company ${companyId}.`);
      return relationships || [];
    } catch (error) {
      showErrorToast('Failed to fetch vendor-material relationships', error);
      console.error('Error in getVendorMaterials service:', error.message);
      throw error;
    }
  },

  // Get materials for a specific vendor
  async getMaterialsByVendor(vendorId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: relationships, error } = await supabase
        .from('vendor_materials')
        .select(`
          *,
          materials (
            id,
            name,
            description,
            unit,
            category
          )
        `)
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return relationships || [];
    } catch (error) {
      showErrorToast('Failed to fetch materials for vendor', error);
      throw error;
    }
  },

  // Get vendors for a specific material
  async getVendorsByMaterial(materialId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: relationships, error } = await supabase
        .from('vendor_materials')
        .select(`
          *,
          vendors (
            id,
            name,
            company_name,
            contact_person,
            email,
            phone
          )
        `)
        .eq('material_id', materialId)
        .order('is_preferred', { ascending: false })
        .order('unit_cost', { ascending: true });

      if (error) throw error;
      return relationships || [];
    } catch (error) {
      showErrorToast('Failed to fetch vendors for material', error);
      throw error;
    }
  },

  // Link a vendor to a material
  async linkVendorMaterial(vendorId, materialId, relationshipData = {}) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] LINK_VENDOR_MATERIAL_START:`, { vendorId, materialId, relationshipData });
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (isDev) console.error('Error getting user:', userError);
        throw new Error('User not authenticated');
      }

      // Check if relationship already exists
      const { data: existing } = await supabase
        .from('vendor_materials')
        .select('id')
        .eq('vendor_id', vendorId)
        .eq('material_id', materialId)
        .single();

      if (existing) {
        throw new Error('This vendor-material relationship already exists');
      }

      const { data: relationship, error } = await supabase
        .from('vendor_materials')
        .insert({
          vendor_id: vendorId,
          material_id: materialId,
          ...relationshipData
        })
        .select(`
          *,
          vendors (id, name),
          materials (id, name)
        `)
        .single();

      if (error) {
        if (isDev) console.error('Error creating vendor-material relationship in Supabase:', error);
        throw error;
      }
      
      showSuccessToast(`Linked ${relationship.materials.name} to ${relationship.vendors.name}`);
      return relationship;
    } catch (error) {
      showErrorToast('Failed to link vendor and material', error);
      throw error;
    }
  },

  // Update a vendor-material relationship
  async updateVendorMaterial(id, updates) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UPDATE_VENDOR_MATERIAL_START:`, { id, updates });
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data: relationship, error } = await supabase
        .from('vendor_materials')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          vendors (id, name),
          materials (id, name)
        `)
        .single();

      if (error) throw error;
      
      showSuccessToast(`Updated relationship for ${relationship.materials.name} and ${relationship.vendors.name}`);
      return relationship;
    } catch (error) {
      showErrorToast('Failed to update vendor-material relationship', error);
      throw error;
    }
  },

  // Remove a vendor-material relationship
  async unlinkVendorMaterial(id) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UNLINK_VENDOR_MATERIAL_START:`, { id });
      }
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // First get the relationship details for the success message
      const { data: relationship } = await supabase
        .from('vendor_materials')
        .select(`
          id,
          vendors (id, name),
          materials (id, name)
        `)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('vendor_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(
        relationship 
          ? `Unlinked ${relationship.materials.name} from ${relationship.vendors.name}`
          : 'Vendor-material relationship removed successfully'
      );
      return true;
    } catch (error) {
      showErrorToast('Failed to remove vendor-material relationship', error);
      throw error;
    }
  },

  // Set a vendor as preferred for a material
  async setPreferredVendor(materialId, vendorId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // First, unset all preferred vendors for this material
      await supabase
        .from('vendor_materials')
        .update({ is_preferred: false })
        .eq('material_id', materialId);

      // Then set the specified vendor as preferred
      const { data: relationship, error } = await supabase
        .from('vendor_materials')
        .update({ is_preferred: true })
        .eq('material_id', materialId)
        .eq('vendor_id', vendorId)
        .select(`
          *,
          vendors (id, name),
          materials (id, name)
        `)
        .single();

      if (error) throw error;
      
      showSuccessToast(`Set ${relationship.vendors.name} as preferred vendor for ${relationship.materials.name}`);
      return relationship;
    } catch (error) {
      showErrorToast('Failed to set preferred vendor', error);
      throw error;
    }
  }
};