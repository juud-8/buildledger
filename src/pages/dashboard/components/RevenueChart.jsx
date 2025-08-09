import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data = { labels: [], data: [] } }) => {
  // Transform data for the chart
  const revenueData = (data.labels || []).map((month, index) => ({
    month,
    revenue: (data.data || [])[index] || 0,
    projects: 0 // Will be implemented with real data later
  }));

  // Calculate current month revenue
  const currentMonthRevenue = (data.data || [])[(data.data || []).length - 1] || 0;
  const previousMonthRevenue = (data.data || [])[(data.data || []).length - 2] || 0;
  const revenueChange = previousMonthRevenue > 0 
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-xl p-3 construction-depth-2">
          <p className="text-sm font-medium text-popover-foreground">{`${label} 2025`}</p>
          <p className="text-sm text-primary">
            Revenue: ${payload?.[0]?.value?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Projects: {payload?.[0]?.payload?.projects}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monthly Revenue</h3>
          <p className="text-sm text-muted-foreground">Revenue trends for 2025</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">${currentMonthRevenue.toLocaleString()}</p>
          <p className={`text-sm ${revenueChange >= 0 ? 'text-success' : 'text-error'}`}>
            {revenueChange >= 0 ? '+' : ''}{revenueChange}% from last month
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="month" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;