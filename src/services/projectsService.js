import { supabase } from '../lib/supabase';
import { showSuccessToast, showErrorToast } from '../utils/toastHelper';

const isDev = import.meta.env.DEV;

export const projectsService = {
  // Get all projects for the current user
  async getProjects() {
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

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name),
          project_manager:user_profiles(full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return projects || [];
    } catch (error) {
      showErrorToast('Failed to fetch projects', error);
      throw error;
    }
  },

  // Get a single project by ID
  async getProject(id) {
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

      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name),
          project_manager:user_profiles(full_name)
        `)
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      if (error) throw error;
      return project;
    } catch (error) {
      showErrorToast('Failed to fetch project details', error);
      throw error;
    }
  },

  // Create a new project
  async createProject(projectData) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] CREATE_PROJECT_START:`, projectData);
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

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          company_id: companyId,
          project_manager_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Project "${project.name}" created successfully`, project);
      return project;
    } catch (error) {
      showErrorToast('Failed to create project', error);
      throw error;
    }
  },

  // Update a project
  async updateProject(id, updates) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] UPDATE_PROJECT_START:`, { id, updates });
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

      const { data: project, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('company_id', companyId)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      showSuccessToast(`Project "${project.name}" updated successfully`, project);
      return project;
    } catch (error) {
      showErrorToast('Failed to update project', error);
      throw error;
    }
  },

  // Delete a project
  async deleteProject(id) {
    try {
      if (isDev) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] DELETE_PROJECT_START:`, { id });
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

      // First get the project name for the success message
      const { data: project } = await supabase
        .from('projects')
        .select('name')
        .eq('company_id', companyId)
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('company_id', companyId)
        .eq('id', id);

      if (error) throw error;
      
      showSuccessToast(`Project "${project?.name || 'Project'}" deleted successfully`);
      return true;
    } catch (error) {
      showErrorToast('Failed to delete project', error);
      throw error;
    }
  }
}; 
