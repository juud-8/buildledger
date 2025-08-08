import { supabase } from '../lib/supabase';

function buildCompanyPayloadFromProfileForm(form) {
  const address = {
    street: form?.address || '',
    city: form?.city || '',
    state: form?.state || '',
    zip: form?.zipCode || ''
  };
  const settings = {
    business_type: form?.businessType || null,
    license_number: form?.licenseNumber || null
  };
  return {
    name: form?.companyName || '',
    phone: form?.phone || null,
    email: form?.email || null,
    website: form?.website || null,
    tax_id: form?.taxId || null,
    address,
    settings
  };
}

export const companyService = {
  async getCompanyForCurrentUser() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id, full_name, email')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    const companyId = profile?.company_id;
    if (!companyId) return null;

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    if (error) throw error;
    return company;
  },

  async upsertCompanyForCurrentUser(formData) {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();
    if (profileError) throw profileError;

    const payload = buildCompanyPayloadFromProfileForm(formData);

    // Create new company if none exists
    if (!profile?.company_id) {
      const { data: inserted, error: insertError } = await supabase
        .from('companies')
        .insert({ ...payload, is_active: true })
        .select()
        .single();
      if (insertError) throw insertError;

      // Link to user profile
      const { error: linkError } = await supabase
        .from('user_profiles')
        .update({ company_id: inserted.id })
        .eq('id', user.id);
      if (linkError) throw linkError;
      return inserted;
    }

    // Update existing company
    const { data: updated, error: updateError } = await supabase
      .from('companies')
      .update(payload)
      .eq('id', profile.company_id)
      .select()
      .single();
    if (updateError) throw updateError;
    return updated;
  },

  async setCompanyLogoPath(path) {
    // Store storage path (e.g., company-logos/<companyId>/file.png) in companies.logo_url
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();
    if (!profile?.company_id) throw new Error('Company not found');

    const { data, error } = await supabase
      .from('companies')
      .update({ logo_url: path })
      .eq('id', profile.company_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export default companyService;


