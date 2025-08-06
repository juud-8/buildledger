import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load message templates
  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) throw new Error('Company not found');

      const { data, error: templatesError } = await supabase
        .from('message_templates')
        .select('*')
        .or(`company_id.eq.${userProfile.company_id},company_id.is.null`)
        .eq('is_active', true)
        .order('name');

      if (templatesError) throw templatesError;

      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading message templates:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new template
  const createTemplate = useCallback(async (templateData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userProfile?.company_id) throw new Error('Company not found');

      const newTemplate = {
        ...templateData,
        company_id: userProfile.company_id,
        created_by: user.id,
        is_active: true
      };

      const { data, error } = await supabase
        .from('message_templates')
        .insert(newTemplate)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [...prev, data]);
      showSuccessToast('Message template created successfully');
      return data;
    } catch (err) {
      console.error('Error creating message template:', err);
      showErrorToast('Failed to create message template');
      throw err;
    }
  }, []);

  // Update template
  const updateTemplate = useCallback(async (templateId, updates) => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => 
        prev.map(template => 
          template.id === templateId ? data : template
        )
      );

      showSuccessToast('Message template updated successfully');
      return data;
    } catch (err) {
      console.error('Error updating message template:', err);
      showErrorToast('Failed to update message template');
      throw err;
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (templateId) => {
    try {
      const { error } = await supabase
        .from('message_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== templateId));
      showSuccessToast('Message template deleted successfully');
    } catch (err) {
      console.error('Error deleting message template:', err);
      showErrorToast('Failed to delete message template');
      throw err;
    }
  }, []);

  // Get template by type
  const getTemplatesByType = useCallback((templateType) => {
    return templates.filter(template => template.template_type === templateType);
  }, [templates]);

  // Interpolate template variables
  const interpolateTemplate = useCallback((template, variables = {}) => {
    let content = template.content;
    
    // Parse template variables if they're stored as JSON string
    let templateVars = [];
    if (template.variables) {
      try {
        templateVars = typeof template.variables === 'string' 
          ? JSON.parse(template.variables) 
          : template.variables;
      } catch (e) {
        console.warn('Error parsing template variables:', e);
      }
    }

    // Replace template variables with actual values
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value || `{{${key}}}`);
    });

    return content;
  }, []);

  // Get default templates for different contexts
  const getQuoteReminderTemplate = useCallback((quoteData) => {
    const template = templates.find(t => t.template_type === 'quote_reminder');
    if (!template) return null;

    const variables = {
      client_name: quoteData.client_name,
      quote_number: quoteData.quote_number,
      quote_title: quoteData.title,
      quote_amount: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(quoteData.total_amount),
      expiry_date: new Date(quoteData.valid_until).toLocaleDateString('en-US')
    };

    return {
      ...template,
      interpolatedContent: interpolateTemplate(template, variables)
    };
  }, [templates, interpolateTemplate]);

  const getPaymentFollowupTemplate = useCallback((invoiceData) => {
    const template = templates.find(t => t.template_type === 'payment_followup');
    if (!template) return null;

    const variables = {
      client_name: invoiceData.client_name,
      invoice_number: invoiceData.invoice_number,
      invoice_amount: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(invoiceData.total_amount),
      due_date: new Date(invoiceData.due_date).toLocaleDateString('en-US')
    };

    return {
      ...template,
      interpolatedContent: interpolateTemplate(template, variables)
    };
  }, [templates, interpolateTemplate]);

  const getProjectUpdateTemplate = useCallback((projectData) => {
    const template = templates.find(t => t.template_type === 'project_update');
    if (!template) return null;

    const variables = {
      client_name: projectData.client_name,
      project_name: projectData.name,
      update_message: projectData.update_message || 'We have updates on your project.'
    };

    return {
      ...template,
      interpolatedContent: interpolateTemplate(template, variables)
    };
  }, [templates, interpolateTemplate]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    templates,
    isLoading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByType,
    interpolateTemplate,
    getQuoteReminderTemplate,
    getPaymentFollowupTemplate,
    getProjectUpdateTemplate
  };
};