import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import KPICard from './components/KPICard';
import ProjectTimelineWidget from './components/ProjectTimelineWidget';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import WeatherWidget from './components/WeatherWidget';
import RevenueChart from './components/RevenueChart';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [kpiData, setKpiData] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [revenueData, setRevenueData] = useState({ months: [], revenue: [] });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        // Load all dashboard data in parallel with timeout
        const [kpi, projects, activity, revenue] = await Promise.race([
          Promise.all([
            dashboardService.getKPIData(),
            dashboardService.getRecentProjects(),
            dashboardService.getRecentActivity(),
            dashboardService.getRevenueData()
          ]),
          timeoutPromise
        ]);

        setKpiData(kpi);
        setRecentProjects(projects);
        setRecentActivity(activity);
        setRevenueData(revenue);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set fallback data for new users
        setKpiData([
          {
            title: 'Active Projects',
            value: '0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'Building2',
            color: 'primary'
          },
          {
            title: 'Pending Invoices',
            value: '$0',
            change: 'No data',
            changeType: 'neutral',
            icon: 'FileText',
            color: 'construction'
          },
          {
            title: 'Overdue Payments',
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
        ]);
        setRecentProjects([]);
        setRecentActivity([]);
        setRevenueData({ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], data: [0, 0, 0, 0, 0, 0] });
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

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
                <p className="text-muted-foreground">Loading dashboard...</p>
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
        <title>Dashboard - BuildLedger</title>
        <meta name="description" content="Construction business management dashboard with project overview, invoicing, and analytics" />
      </Helmet>
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <main className="px-4 lg:px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Welcome back, {userProfile?.full_name || 'User'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-muted-foreground">
                  Last updated: {currentTime.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData?.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi?.title}
                value={kpi?.value}
                change={kpi?.change}
                changeType={kpi?.changeType}
                icon={kpi?.icon}
                color={kpi?.color}
              />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Timeline and Weather */}
            <div className="lg:col-span-1 space-y-6">
              <ProjectTimelineWidget projects={recentProjects} />
              <WeatherWidget />
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-2">
              <ActivityFeed activities={recentActivity} />
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="mb-8">
            <RevenueChart data={revenueData} />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Footer Info */}
          <div className="text-center py-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              BuildLedger - From Invoice to Insight
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date()?.getFullYear()} BuildLedger. All rights reserved.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;