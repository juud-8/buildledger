import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import AnalyticsHeader from './components/AnalyticsHeader';
import KPISummary from './components/KPISummary';
import RevenueAnalytics from './components/RevenueAnalytics';
import InvoiceBreakdown from './components/InvoiceBreakdown';
import ProjectProfitability from './components/ProjectProfitability';
import ClientPerformance from './components/ClientPerformance';
import SeasonalPatterns from './components/SeasonalPatterns';
import CashFlowProjections from './components/CashFlowProjections';
import ProjectCompletion from './components/ProjectCompletion';
import SubcontractorPerformance from './components/SubcontractorPerformance';
import CostAnalysis from './components/CostAnalysis';
import GeographicRevenue from './components/GeographicRevenue';
import FilterSidebar from './components/FilterSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission, FEATURES } from '../../utils/rbac';
import Icon from '../../components/AppIcon';

const Analytics = () => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('yearly');
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    projectTypes: [],
    clientSegments: [],
    regions: []
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate loading analytics data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!hasPermission(userProfile?.role, FEATURES.VIEW_ANALYTICS)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <Breadcrumb />
          <main className="px-4 lg:px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Icon name="Lock" size={48} className="text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
                <p className="text-muted-foreground">You do not have permission to view this page. Please upgrade to an Enterprise plan.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <Breadcrumb />
          <main className="px-4 lg:px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading analytics...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Analytics - BuildLedger</title>
        <meta name="description" content="Comprehensive business intelligence and analytics for construction operations" />
      </Helmet>
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <main className="px-4 lg:px-6 py-8">
          {/* Analytics Header with Controls */}
          <AnalyticsHeader 
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            onToggleSidebar={toggleSidebar}
          />

          <div className="flex gap-6">
            {/* Filter Sidebar */}
            <FilterSidebar 
              isOpen={isSidebarOpen}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className={`flex-1 space-y-8 ${isSidebarOpen ? 'lg:ml-80' : ''} transition-all duration-300`}>
              {/* KPI Summary Cards */}
              <KPISummary dateRange={dateRange} filters={filters} />

              {/* Revenue Analytics */}
              <RevenueAnalytics dateRange={dateRange} filters={filters} />

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InvoiceBreakdown dateRange={dateRange} filters={filters} />
                <ProjectProfitability dateRange={dateRange} filters={filters} />
              </div>

              {/* Client Performance */}
              <ClientPerformance dateRange={dateRange} filters={filters} />

              {/* Seasonal and Cash Flow */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SeasonalPatterns dateRange={dateRange} filters={filters} />
                <CashFlowProjections dateRange={dateRange} filters={filters} />
              </div>

              {/* Project Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProjectCompletion dateRange={dateRange} filters={filters} />
                <SubcontractorPerformance dateRange={dateRange} filters={filters} />
              </div>

              {/* Cost Analysis and Geographic Revenue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CostAnalysis dateRange={dateRange} filters={filters} />
                <GeographicRevenue dateRange={dateRange} filters={filters} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-border mt-12">
            <p className="text-sm text-muted-foreground">
              BuildLedger Analytics - Data-Driven Construction Management
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date()?.toLocaleString()}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;