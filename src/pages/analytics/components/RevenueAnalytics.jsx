import React, { useState } from 'react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const RevenueAnalytics = ({ dateRange, filters, data: injectedData }) => {
  const [chartType, setChartType] = useState('line');
  const [showComparison, setShowComparison] = useState(false);

  const defaultData = [
    { period: 'Jan 2025', revenue: 68000, projects: 12, target: 70000, previousYear: 58000 },
    { period: 'Feb 2025', revenue: 72000, projects: 14, target: 70000, previousYear: 62000 },
    { period: 'Mar 2025', revenue: 65000, projects: 11, target: 70000, previousYear: 59000 },
    { period: 'Apr 2025', revenue: 78000, projects: 16, target: 75000, previousYear: 67000 },
    { period: 'May 2025', revenue: 82000, projects: 18, target: 75000, previousYear: 71000 },
    { period: 'Jun 2025', revenue: 89000, projects: 20, target: 80000, previousYear: 75000 },
    { period: 'Jul 2025', revenue: 94000, projects: 22, target: 85000, previousYear: 79000 },
    { period: 'Aug 2025', revenue: 87000, projects: 19, target: 85000, previousYear: 73000 }
  ];

  // Use injected data if provided (even if empty). Fallback to defaults only when prop is undefined.
  const revenueData = Array.isArray(injectedData) ? injectedData : defaultData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-4 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-popover-foreground">
                {entry?.name?.includes('revenue') || entry?.name?.includes('target') 
                  ? `$${entry?.value?.toLocaleString()}` 
                  : entry?.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: revenueData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="period" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
              name="Revenue"
            />
            {showComparison && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="var(--color-muted-foreground)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "var(--color-muted-foreground)", strokeWidth: 2, r: 3 }}
                  name="Target"
                />
                <Line 
                  type="monotone" 
                  dataKey="previousYear" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 3 }}
                  name="Previous Year"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="period" 
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
            name="Revenue"
          />
          {showComparison && (
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="var(--color-muted-foreground)" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: "var(--color-muted-foreground)", strokeWidth: 2, r: 3 }}
              name="Target"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Analytics</h3>
          <p className="text-sm text-muted-foreground">Track revenue performance and trends</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={chartType === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
              className="px-3 py-1"
            >
              <Icon name="TrendingUp" size={16} />
            </Button>
            <Button
              variant={chartType === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="px-3 py-1"
            >
              <Icon name="BarChart3" size={16} />
            </Button>
          </div>
          
          <Button
            variant={showComparison ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowComparison(!showComparison)}
          >
            <Icon name="GitCompare" size={16} className="mr-1" />
            Compare
          </Button>
        </div>
      </div>

      <div className="h-80 w-full">
        {renderChart()}
      </div>

      {/* Revenue Insights */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {revenueData && revenueData.length > 0 ? (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{
                `$${revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0).toLocaleString()}`
              }</p>
              <p className="text-sm text-muted-foreground">Total Revenue (period)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{
                `$${Math.round(
                  revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0) / revenueData.length
                ).toLocaleString()}`
              }</p>
              <p className="text-sm text-muted-foreground">Average Monthly Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{revenueData.length}</p>
              <p className="text-sm text-muted-foreground">Months</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">$0</p>
              <p className="text-sm text-muted-foreground">Total Revenue (period)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">$0</p>
              <p className="text-sm text-muted-foreground">Average Monthly Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Months</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueAnalytics;