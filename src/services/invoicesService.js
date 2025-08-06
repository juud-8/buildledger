import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

const isDev = import.meta.env.DEV;

export const invoicesService = {
  // Get all invoices for the current user
  async getInvoices() {
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

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(name),
          project:projects(name),
          quote:quotes(quote_number)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return invoices || [];
    } catch (error) {
      showErrorToast('Failed to fetch invoices', error);
      throw error;
    }
  },

  // Get a single invoice by ID
  async getInvoice(id) {
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

      const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients(name, email, phone, address),
          project:projects(name),
          quote:quotes(quote_number),
          invoice_items(
            *,
            item:items_database(name, description, unit_price)
          )
        `)
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return invoice;
    } catch (error) {
      showErrorToast('Failed to fetch invoice details', error);
      throw error;
    }
  },

  // Create a new invoice
  async createInvoice(invoiceData) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CREATE_INVOICE_START:`, invoiceData);
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

      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          company_id: companyId,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Invoice #${invoice.invoice_number} created successfully`, invoice);
      return invoice;
    } catch (error) {
      showErrorToast('Failed to create invoice', error);
      throw error;
    }
  },

  // Update an invoice
  async updateInvoice(id, updates) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UPDATE_INVOICE_START:`, { id, updates });
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

      const { data: invoice, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Invoice #${invoice.invoice_number} updated successfully`, invoice);
      return invoice;
    } catch (error) {
      showErrorToast('Failed to update invoice', error);
      throw error;
    }
  },

  // Delete an invoice
  async deleteInvoice(id) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DELETE_INVOICE_START:`, { id });
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

      // First get the invoice number for the success message
      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(`Invoice #${invoice?.invoice_number || 'Invoice'} deleted successfully`);
      return true;
    } catch (error) {
      showErrorToast('Failed to delete invoice', error);
      throw error;
    }
  }
}; 