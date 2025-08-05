import { supabase } from '../lib/supabase';

export const brandingService = {
  // Get company branding settings
  async getCompanyBranding(userId) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      // If no profile or company_id, return null (will show "Get Started" screen)
      if (profileError || !userProfile?.company_id) {
        console.log('No user profile or company found, returning null for branding');
        return null;
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('companies')?.select('*')?.eq('id', companyId)?.single();
      if (error) {
        console.log('Company not found, returning null for branding');
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching company branding:', error);
      return null; // Return null instead of throwing error
    }
  },

  // Update company branding settings
  async updateCompanyBranding(userId, brandingData) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('companies')?.update(brandingData)?.eq('id', companyId)?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating company branding:', error);
      throw error;
    }
  },

  // Get company logos
  async getCompanyLogos(userId) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('company_logos')?.select('*')?.eq('company_id', companyId)?.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company logos:', error);
      throw error;
    }
  },

  // Upload company logo
  async uploadCompanyLogo(userId, logoData) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('company_logos')?.insert({
        ...logoData,
        company_id: companyId
      })?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading company logo:', error);
      throw error;
    }
  },

  // Set primary logo
  async setPrimaryLogo(userId, logoId) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      // First, set all logos to not primary
      await supabase?.from('company_logos')?.update({ is_primary: false })?.eq('company_id', companyId);

      // Then set the selected logo as primary
      const { data, error } = await supabase?.from('company_logos')?.update({ is_primary: true })?.eq('id', logoId)?.eq('company_id', companyId)?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error setting primary logo:', error);
      throw error;
    }
  },

  // Get document templates
  async getDocumentTemplates(userId) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('document_templates')?.select('*')?.eq('company_id', companyId)?.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching document templates:', error);
      throw error;
    }
  },

  // Create document template
  async createDocumentTemplate(userId, templateData) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('document_templates')?.insert({
        ...templateData,
        company_id: companyId,
        created_by: userId
      })?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating document template:', error);
      throw error;
    }
  },

  // Update document template
  async updateDocumentTemplate(userId, templateId, updates) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('document_templates')?.update(updates)?.eq('id', templateId)?.eq('company_id', companyId)?.select()?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating document template:', error);
      throw error;
    }
  },

  // Get brand guidelines
  async getBrandGuidelines(userId) {
    try {
      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single();
      
      if (profileError || !userProfile?.company_id) {
        throw new Error('User profile or company not found');
      }

      const companyId = userProfile.company_id;

      const { data, error } = await supabase?.from('document_templates')?.select('*')?.eq('company_id', companyId)?.eq('document_type', 'brand_guidelines')?.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching brand guidelines:', error);
      throw error;
    }
  },

  // Get user branding
  async getUserBranding() {
    try {
      // Get current user
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

      const { data, error } = await supabase?.from('companies')?.select('*')?.eq('id', companyId)?.single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user branding:', error);
      throw error;
    }
  }
};