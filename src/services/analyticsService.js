import { supabase } from '../lib/supabase';

/**
 * Service for analytics data management and calculations
 */
class AnalyticsService {
  /**
   * Fetches comprehensive analytics data for the current user
   */
  async getAnalyticsData(userId, dateRange = {}) {
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
      const { startDate, endDate } = dateRange;
      
      // Base queries with company filtering
      let invoicesQuery = supabase?.from('invoices')?.select(`
          *,
          client:clients(name),
          invoice_items(quantity, unit_price, total_price, item:items_database(name, category))
        `)?.eq('company_id', companyId);

      let projectsQuery = supabase?.from('projects')?.select(`
          *,
          client:clients(name)
        `)?.eq('company_id', companyId);

      let itemsQuery = supabase?.from('items_database')?.select('*')?.eq('company_id', companyId)?.eq('is_active', true);

      // Apply date filters if provided
      if (startDate) {
        invoicesQuery = invoicesQuery?.gte('created_at', startDate);
        projectsQuery = projectsQuery?.gte('created_at', startDate);
      }
      if (endDate) {
        invoicesQuery = invoicesQuery?.lte('created_at', endDate);
        projectsQuery = projectsQuery?.lte('created_at', endDate);
      }

      // Execute queries
      const [invoicesResult, projectsResult, itemsResult] = await Promise.all([
        invoicesQuery,
        projectsQuery,
        itemsQuery
      ]);

      if (invoicesResult?.error) throw invoicesResult?.error;
      if (projectsResult?.error) throw projectsResult?.error;
      if (itemsResult?.error) throw itemsResult?.error;

      return {
        invoices: invoicesResult?.data || [],
        projects: projectsResult?.data || [],
        items: itemsResult?.data || []
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
  }

  /**
   * Calculates revenue analytics with item-level insights
   */
  calculateRevenueAnalytics(analyticsData) {
    const { invoices, items } = analyticsData;
    
    // Calculate total revenue
    const totalRevenue = invoices
      ?.filter(invoice => invoice.status === 'paid')
      ?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

    // Calculate pending revenue
    const pendingRevenue = invoices
      ?.filter(invoice => invoice.status === 'sent')
      ?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

    // Calculate overdue revenue
    const overdueRevenue = invoices
      ?.filter(invoice => invoice.status === 'overdue')
      ?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

    // Calculate monthly revenue trends
    const monthlyRevenue = {};
    invoices
      ?.filter(invoice => invoice.status === 'paid' && invoice.paid_date)
      ?.forEach(invoice => {
        const month = invoice.paid_date.substring(0, 7); // YYYY-MM format
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (invoice.total_amount || 0);
      });

    // Calculate item-level revenue
    const itemRevenue = {};
    invoices
      ?.filter(invoice => invoice.status === 'paid')
      ?.forEach(invoice => {
        invoice.invoice_items?.forEach(item => {
          const itemName = item.item?.name || item.name;
          if (!itemRevenue[itemName]) {
            itemRevenue[itemName] = {
              totalRevenue: 0,
              quantity: 0,
              category: item.item?.category || 'unknown'
            };
          }
          itemRevenue[itemName].totalRevenue += item.total_price || 0;
          itemRevenue[itemName].quantity += item.quantity || 0;
        });
      });

    return {
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      monthlyRevenue,
      itemRevenue,
      invoiceCount: invoices?.length || 0,
      paidInvoiceCount: invoices?.filter(invoice => invoice.status === 'paid')?.length || 0
    };
  }

  /**
   * Calculates project profitability metrics
   */
  calculateProjectProfitability(analyticsData) {
    const { projects, invoices } = analyticsData;
    
    const projectMetrics = projects?.map(project => {
      const projectInvoices = invoices?.filter(invoice => invoice.project_id === project.id) || [];
      const totalRevenue = projectInvoices
        ?.filter(invoice => invoice.status === 'paid')
        ?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;
      
      const totalCost = project.actual_cost || 0;
      const profit = totalRevenue - totalCost;
      const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
      
      return {
        id: project.id,
        name: project.name,
        totalRevenue,
        totalCost,
        profit,
        profitMargin,
        status: project.status,
        completionPercentage: project.completion_percentage || 0
      };
    }) || [];

    return {
      projects: projectMetrics,
      totalProfit: projectMetrics.reduce((sum, project) => sum + project.profit, 0),
      averageProfitMargin: projectMetrics.length > 0 
        ? projectMetrics.reduce((sum, project) => sum + project.profitMargin, 0) / projectMetrics.length 
        : 0
    };
  }

  /**
   * Analyzes items database for insights
   */
  analyzeItemsDatabase(analyticsData) {
    const { items, invoices } = analyticsData;
    
    // Calculate item usage statistics
    const itemUsage = {};
    invoices?.forEach(invoice => {
      invoice.invoice_items?.forEach(item => {
        const itemName = item.item?.name || item.name;
        if (!itemUsage[itemName]) {
          itemUsage[itemName] = {
            usageCount: 0,
            totalQuantity: 0,
            totalRevenue: 0,
            category: item.item?.category || 'unknown'
          };
        }
        itemUsage[itemName].usageCount++;
        itemUsage[itemName].totalQuantity += item.quantity || 0;
        itemUsage[itemName].totalRevenue += item.total_price || 0;
      });
    });

    // Get most profitable items
    const mostProfitable = Object.entries(itemUsage)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Get most used items
    const mostUsed = Object.entries(itemUsage)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);

    // Calculate category statistics
    const categoryStats = {};
    items?.forEach(item => {
      const category = item.category || 'unknown';
      if (!categoryStats[category]) {
        categoryStats[category] = {
          count: 0,
          totalValue: 0,
          averagePrice: 0
        };
      }
      categoryStats[category].count++;
      categoryStats[category].totalValue += item.unit_price || 0;
    });

    // Calculate average prices
    Object.keys(categoryStats).forEach(category => {
      if (categoryStats[category].count > 0) {
        categoryStats[category].averagePrice = categoryStats[category].totalValue / categoryStats[category].count;
      }
    });

    return {
      mostProfitable,
      mostUsed,
      categoryStats,
      totalItems: items?.length || 0,
      activeItems: items?.filter(item => item.is_active)?.length || 0
    };
  }

  /**
   * Updates analytics data in the database for tracking
   */
  async updateAnalyticsMetrics(userId, metrics) {
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

      const analyticsRecords = Object.entries(metrics)?.map(([metricName, metricValue]) => ({
        company_id: companyId,
        data_type: metricName,
        period: 'monthly',
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1)?.toISOString()?.split('T')?.[0],
        end_date: new Date()?.toISOString()?.split('T')?.[0],
        data: typeof metricValue === 'object' ? metricValue : { value: metricValue }
      }));

      const { error } = await supabase?.from('analytics_data')?.upsert(analyticsRecords, {
          onConflict: 'company_id,data_type,period,start_date'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating analytics metrics:', error);
      throw error;
    }
  }

  /**
   * Generates comprehensive analytics report with logo branding
   */
  async generateAnalyticsReport(userId, brandingData = null) {
    try {
      const analyticsData = await this.getAnalyticsData(userId);
      const revenueAnalytics = this.calculateRevenueAnalytics(analyticsData);
      const projectProfitability = this.calculateProjectProfitability(analyticsData);
      const itemsAnalysis = this.analyzeItemsDatabase(analyticsData);

      // Update metrics in database
      await this.updateAnalyticsMetrics(userId, {
        total_revenue: revenueAnalytics?.totalRevenue,
        pending_revenue: revenueAnalytics?.pendingRevenue,
        active_projects: analyticsData?.projects?.filter(p => p?.status === 'active')?.length,
        items_count: analyticsData?.items?.length,
        top_item_revenue: itemsAnalysis?.mostProfitable?.[0]?.totalRevenue || 0
      });

      return {
        revenueAnalytics,
        projectProfitability,
        itemsAnalysis,
        rawData: analyticsData,
        branding: brandingData, // Include branding for report generation
        generatedAt: new Date()?.toISOString()
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();