import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const CashFlowProjections = ({ dateRange, filters }) => {
  const [projectionPeriod, setProjectionPeriod] = useState('90');

  const cashFlowData = [
    { date: '2025-08-01', actual: 125000, projected: null, inflow: 45000, outflow: 38000 },
    { date: '2025-08-15', actual: 142000, projected: null, inflow: 52000, outflow: 35000 },
    { date: '2025-09-01', actual: 138000, projected: 140000, inflow: 48000, outflow: 44000 },
    { date: '2025-09-15', actual: null, projected: 155000, inflow: 55000, outflow: 38000 },
    { date: '2025-10-01', actual: null, projected: 162000, inflow: 58000, outflow: 51000 },
    { date: '2025-10-15', actual: null, projected: 149000, inflow: 42000, outflow: 55000 },
    { date: '2025-11-01', actual: null, projected: 168000, inflow: 62000, outflow: 43000 },
    { date: '2025-11-15', actual: null, projected: 175000, inflow: 65000, outflow: 58000 },
    { date: '2025-12-01', actual: null, projected: 158000, inflow: 48000, outflow: 65000 }
  ];

  const projectionMetrics = [
    {
      label: 'Projected Cash Balance',
      value: '$158,000',
      change: '+12.5%',
      icon: 'Wallet',
      color: 'text-primary'
    },
    {
      label: 'Expected Inflow',
      value: '$330,000',
      change: '+8.2%',
      icon: 'TrendingUp',
      color: 'text-green-600'
    },
    {
      label: 'Planned Outflow',
      value: '$312,000',
      change: '+5.1%',
      icon: 'TrendingDown',
      color: 'text-orange-600'
    },
    {
      label: 'Net Projection',
      value: '+$18,000',
      change: '+15.7%',
      icon: 'Activity',
      color: 'text-green-600'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = cashFlowData?.find(d => d?.date === label);
      return (
        <div className="bg-popover border border-border rounded-lg p-4 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground mb-2">
            {formatDate(label)}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-muted-foreground">{entry?.name}:</span>
              </div>
              <span className="font-medium text-popover-foreground">
                ${entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
          {data?.inflow && (
            <div className="mt-2 pt-2 border-t border-border text-xs">
              <p className="text-muted-foreground">
                Inflow: <span className="text-green-600">${data?.inflow?.toLocaleString()}</span>
              </p>
              <p className="text-muted-foreground">
                Outflow: <span className="text-red-600">${data?.outflow?.toLocaleString()}</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Cash Flow Projections</h3>
          <p className="text-sm text-muted-foreground">90-day cash flow forecasting and trends</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={projectionPeriod === '30' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProjectionPeriod('30')}
              className="px-3 py-1 text-xs"
            >
              30D
            </Button>
            <Button
              variant={projectionPeriod === '90' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProjectionPeriod('90')}
              className="px-3 py-1 text-xs"
            >
              90D
            </Button>
            <Button
              variant={projectionPeriod === '180' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setProjectionPeriod('180')}
              className="px-3 py-1 text-xs"
            >
              180D
            </Button>
          </div>
          <Icon name="Target" size={16} className="text-muted-foreground" />
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cashFlowData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={formatDate}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-primary)"
              fill="var(--color-primary)40"
              strokeWidth={3}
              name="Actual Cash"
            />
            <Area
              type="monotone"
              dataKey="projected"
              stroke="var(--color-muted-foreground)"
              fill="var(--color-muted-foreground)20"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Projected Cash"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Projection Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {projectionMetrics?.map((metric, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-background rounded-lg">
                <Icon name={metric?.icon} size={16} className={metric?.color} />
              </div>
              <span className="text-xs text-green-600 font-medium">
                {metric?.change}
              </span>
            </div>
            <p className={`text-lg font-bold ${metric?.color} mb-1`}>
              {metric?.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {metric?.label}
            </p>
          </div>
        ))}
      </div>

      {/* Cash Flow Analysis */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="Brain" size={16} className="text-primary" />
          <h4 className="text-sm font-medium text-foreground">AI Insights</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-start space-x-2">
            <Icon name="AlertCircle" size={14} className="text-yellow-600 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Cash Flow Alert:</span> October 15th shows potential dip below optimal cash reserves.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="TrendingUp" size={14} className="text-green-600 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Opportunity:</span> November shows strong inflow potential from project completions.
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Target" size={14} className="text-blue-600 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Recommendation:</span> Consider scheduling large expenses after November 15th.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowProjections;