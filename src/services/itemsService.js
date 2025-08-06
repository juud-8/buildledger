import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

export const itemsService = {
  // Get all items for the current user
  async getItems() {
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

      const { data: items, error } = await supabase
        .from('items_database')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return items || [];
    } catch (error) {
      showErrorToast('Failed to fetch items', error);
      throw error;
    }
  },

  // Get a single item by ID
  async getItem(id) {
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

      const { data: item, error } = await supabase
        .from('items_database')
        .select('*')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return item;
    } catch (error) {
      showErrorToast('Failed to fetch item details', error);
      throw error;
    }
  },

  // Create a new item
  async createItem(itemData) {
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

      const { data: item, error } = await supabase
        .from('items_database')
        .insert({
          ...itemData,
          company_id: companyId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Item "${item.name}" created successfully`, item);
      return item;
    } catch (error) {
      showErrorToast('Failed to create item', error);
      throw error;
    }
  },

  // Update an item
  async updateItem(id, updates) {
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

      const { data: item, error } = await supabase
        .from('items_database')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Item "${item.name}" updated successfully`, item);
      return item;
    } catch (error) {
      showErrorToast('Failed to update item', error);
      throw error;
    }
  },

  // Delete an item (soft delete by setting is_active to false)
  async deleteItem(id) {
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

      // First get the item name for the success message
      const { data: item } = await supabase
        .from('items_database')
        .select('name')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('items_database')
        .update({ is_active: false })
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(`Item "${item?.name || 'Item'}" deleted successfully`);
      return true;
    } catch (error) {
      showErrorToast('Failed to delete item', error);
      throw error;
    }
  }
}; 