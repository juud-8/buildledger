import { supabase } from '../lib/supabase';

export const dashboardService = {
  // Get KPI data for dashboard
  async getKPIData() {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('User not authenticated, returning default KPI data');
        return [
          {
            title: 'Active Projects',
            value: '0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'Building2',
            color: 'primary'
          },
          {
            title: 'Pending Revenue',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'FileText',
            color: 'construction'
          },
          {
            title: 'Overdue Amount',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'AlertTriangle',
            color: 'warning'
          },
          {
            title: 'Monthly Revenue',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'DollarSign',
            color: 'success'
          }
        ];
      }

      // Get user profile to get company_id
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
      
      // If no profile or company_id, return default data
      if (profileError || !userProfile?.company_id) {
        console.log('No user profile or company found, returning default KPI data');
        return [
          {
            title: 'Active Projects',
            value: '0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'Building2',
            color: 'primary'
          },
          {
            title: 'Pending Revenue',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'FileText',
            color: 'construction'
          },
          {
            title: 'Overdue Amount',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'AlertTriangle',
            color: 'warning'
          },
          {
            title: 'Monthly Revenue',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'DollarSign',
            color: 'success'
          }
        ];
      }

      const companyId = userProfile.company_id;

      // Get active projects count
      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'active');

      // Get pending invoices
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('company_id', companyId)
        .eq('status', 'sent');

      const pendingAmount = pendingInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

      // Get overdue invoices
      const { data: overdueInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('company_id', companyId)
        .eq('status', 'overdue');

      const overdueAmount = overdueInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

      // Get monthly revenue (invoices paid this month)
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: monthlyInvoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('company_id', companyId)
        .eq('status', 'paid')
        .gte('paid_date', startOfMonth.toISOString().split('T')[0])
        .lte('paid_date', endOfMonth.toISOString().split('T')[0]);

      const monthlyRevenue = monthlyInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

      return [
        {
          title: 'Active Projects',
          value: activeProjects || 0,
          change: '+2',
          changeType: 'positive'
        },
        {
          title: 'Pending Revenue',
          value: `$${pendingAmount.toLocaleString()}`,
          change: '+12%',
          changeType: 'positive'
        },
        {
          title: 'Overdue Amount',
          value: `$${overdueAmount.toLocaleString()}`,
          change: '-5%',
          changeType: 'negative'
        },
        {
          title: 'Monthly Revenue',
          value: `$${monthlyRevenue.toLocaleString()}`,
          change: '+8%',
          changeType: 'positive'
        }
      ];
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      // Return default data instead of throwing error
      return [
        {
          title: 'Active Projects',
          value: '0',
          change: 'No data',
          changeType: 'neutral',
          icon: 'Building2',
          color: 'primary'
        },
        {
          title: 'Pending Revenue',
          value: '$0',
          change: 'No data',
          changeType: 'neutral',
          icon: 'FileText',
          color: 'construction'
        },
        {
          title: 'Overdue Amount',
          value: '$0',
          change: 'No data',
          changeType: 'neutral',
          icon: 'AlertTriangle',
          color: 'warning'
        },
        {
          title: 'Monthly Revenue',
          value: '$0',
          change: 'No data',
          changeType: 'neutral',
          icon: 'DollarSign',
          color: 'success'
        }
      ];
    }
  },

  // Get recent projects
  async getRecentProjects() {
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
      
      // If no profile or company_id, return empty array
      if (profileError || !userProfile?.company_id) {
        console.log('No user profile or company found, returning empty projects list');
        return [];
      }

      const companyId = userProfile.company_id;

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          completion_percentage,
          start_date,
          end_date,
          clients(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return projects || [];
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      return [];
    }
  },

  // Get recent invoices
  async getRecentInvoices() {
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

      const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          title,
          status,
          total_amount,
          created_at,
          clients(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return invoices || [];
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
      throw error;
    }
  },

  // Get recent quotes
  async getRecentQuotes() {
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

      const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
          id,
          quote_number,
          title,
          status,
          total_amount,
          created_at,
          clients(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return quotes || [];
    } catch (error) {
      console.error('Error fetching recent quotes:', error);
      throw error;
    }
  },

  // Get recent activity
  async getRecentActivity() {
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
      
      // If no profile or company_id, return empty array
      if (profileError || !userProfile?.company_id) {
        console.log('No user profile or company found, returning empty activity list');
        return [];
      }

      const companyId = userProfile.company_id;

      const { data: activity, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return activity || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  // Get revenue chart data
  async getRevenueData() {
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
      
      // If no profile or company_id, return default chart data
      if (profileError || !userProfile?.company_id) {
        console.log('No user profile or company found, returning default revenue data');
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [0, 0, 0, 0, 0, 0]
        };
      }

      const companyId = userProfile.company_id;

      // Get last 6 months of revenue data
      const months = [];
      const revenueData = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const { data: monthlyInvoices } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('company_id', companyId)
          .eq('status', 'paid')
          .gte('paid_date', startOfMonth.toISOString().split('T')[0])
          .lte('paid_date', endOfMonth.toISOString().split('T')[0]);

        const monthlyRevenue = monthlyInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

        months.push(startOfMonth.toLocaleDateString('en-US', { month: 'short' }));
        revenueData.push(monthlyRevenue);
      }

      return {
        labels: months,
        data: revenueData
      };
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [0, 0, 0, 0, 0, 0]
      };
    }
  }
};