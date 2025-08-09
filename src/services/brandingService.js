import { supabase } from '../lib/supabase';

export const brandingService = {
  // Compatibility wrappers used by UI components
  getLogoAssets: async (userId) => brandingService.getCompanyLogos(userId),
  getLogoUrl: (filePath) => {
    if (!filePath) return null;
    const { data } = supabase.storage.from('company-assets').getPublicUrl(filePath);
    return data?.publicUrl || null;
  },
  optimizeImage: async (file) => file,
  uploadLogo: async (file, logoType, userId, brandingId) => {
    // Upload to storage then insert record
    const { data: userProfile } = await supabase
      .from('user_profiles').select('company_id').eq('id', userId).single();
    if (!userProfile?.company_id) throw new Error('Company not found');
    const companyId = userProfile.company_id;

    const ext = file.name?.split('.').pop() || 'png';
    // Storage policy expects path: company-logos/{auth.uid()}/<filename>
    const storagePath = `company-logos/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(storagePath, file, { upsert: false, cacheControl: '3600' });
    if (uploadError) throw uploadError;

    const { data, error } = await supabase.from('company_logos').insert({
      company_id: companyId,
      logo_type: logoType || 'full_logo',
      file_name: file.name,
      file_path: storagePath,
      file_size: file.size,
      is_primary: false
    }).select().single();
    if (error) throw error;
    return data;
  },
  deleteLogo: async (logoId, filePath) => {
    if (filePath) {
      await supabase.storage.from('company-assets').remove([filePath]);
    }
    const { error } = await supabase.from('company_logos').delete().eq('id', logoId);
    if (error) throw error;
    return true;
  },
  setPrimaryLogo: async (logoId, userId) => brandingService.setPrimaryLogo(userId, logoId),
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

      // Map and sanitize fields for companies table
      const ALLOWED_FIELDS = [
        'name',
        'description',
        'industry',
        'website',
        'phone',
        'email',
        'address',
        'tax_id',
        'logo_url',
        'primary_color',
        'secondary_color',
        'accent_color',
        'font_family',
        'settings',
      ];

      const normalized = { ...brandingData };
      // Map company_name -> name (UI legacy field)
      if (normalized.company_name) {
        normalized.name = normalized.company_name;
        delete normalized.company_name;
      }
      // Remove unsupported fields
      delete normalized.font_size_base;

      // Only persist fields that exist on companies
      const updates = Object.fromEntries(
        Object.entries(normalized).filter(([key]) => ALLOWED_FIELDS.includes(key))
      );

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', companyId)
        .select()
        .single();
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
        console.log('No user profile or company found for brand guidelines');
        return [];
      }

      const companyId = userProfile.company_id;

      // Check if brand_guidelines table exists, if not return empty array
      const { data, error } = await supabase
        .from('brand_guidelines')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('Brand guidelines table not found or error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching brand guidelines:', error);
      return []; // Return empty array instead of throwing
    }
  },

  // Create brand guideline
  async createBrandGuideline(guidelineData) {
    try {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .insert(guidelineData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating brand guideline:', error);
      throw error;
    }
  },

  // Update brand guideline
  async updateBrandGuideline(guidelineId, updates) {
    try {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .update(updates)
        .eq('id', guidelineId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating brand guideline:', error);
      throw error;
    }
  },

  // Delete brand guideline
  async deleteBrandGuideline(guidelineId) {
    try {
      const { error } = await supabase
        .from('brand_guidelines')
        .delete()
        .eq('id', guidelineId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting brand guideline:', error);
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