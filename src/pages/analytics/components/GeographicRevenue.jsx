import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const GeographicRevenue = ({ dateRange, filters }) => {
  const [viewType, setViewType] = useState('bars');

  const geographicData = [
    {
      region: 'Downtown Core',
      revenue: 245000,
      projects: 8,
      avgProjectValue: 30625,
      growth: 18.5,
      marketShare: 28,
      color: '#3b82f6'
    },
    {
      region: 'North Suburbs',
      revenue: 198000,
      projects: 12,
      avgProjectValue: 16500,
      growth: 12.3,
      marketShare: 23,
      color: '#22c55e'
    },
    {
      region: 'West Industrial',
      revenue: 167000,
      projects: 6,
      avgProjectValue: 27833,
      growth: 8.7,
      marketShare: 19,
      color: '#f59e0b'
    },
    {
      region: 'East Residential',
      revenue: 142000,
      projects: 9,
      avgProjectValue: 15778,
      growth: -3.2,
      marketShare: 16,
      color: '#8b5cf6'
    },
    {
      region: 'South Commercial',
      revenue: 118000,
      projects: 5,
      avgProjectValue: 23600,
      growth: 22.1,
      marketShare: 14,
      color: '#ef4444'
    }
  ];

  const chartData = geographicData?.map(region => ({
    name: region?.region?.split(' ')?.[0],
    revenue: region?.revenue,
    projects: region?.projects,
    growth: region?.growth
  }));

  const pieData = geographicData?.map(region => ({
    name: region?.region,
    value: region?.marketShare,
    revenue: region?.revenue,
    color: region?.color
  }));

  const getGrowthColor = (growth) => {
    if (growth > 15) return 'text-green-600 bg-green-100';
    if (growth > 5) return 'text-blue-600 bg-blue-100';
    if (growth > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const region = geographicData?.find(r => r?.region?.split(' ')?.[0] === label);
      return (
        <div className="bg-popover border border-border rounded-lg p-4 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground mb-2">{region?.region}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Revenue: <span className="font-medium text-foreground">${region?.revenue?.toLocaleString()}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Projects: <span className="font-medium text-foreground">{region?.projects}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Avg Value: <span className="font-medium text-foreground">${region?.avgProjectValue?.toLocaleString()}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Growth: <span className={`font-medium ${region?.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {region?.growth > 0 ? '+' : ''}{region?.growth}%
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 construction-shadow-md">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">{data?.value}% market share</p>
          <p className="text-sm font-medium text-popover-foreground">
            ${data?.revenue?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (viewType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="name" 
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
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Geographic Revenue Distribution</h3>
          <p className="text-sm text-muted-foreground">Regional performance and market analysis</p>
        </div>
        
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewType === 'bars' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('bars')}
              className="px-3 py-1"
            >
              <Icon name="BarChart3" size={16} />
            </Button>
            <Button
              variant={viewType === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('pie')}
              className="px-3 py-1"
            >
              <Icon name="PieChart" size={16} />
            </Button>
          </div>
          <Icon name="Map" size={16} className="text-muted-foreground" />
        </div>
      </div>
      {/* Geographic Chart */}
      <div className="h-64 mb-6">
        {renderChart()}
      </div>
      {/* Market Share Legend (for pie chart) */}
      {viewType === 'pie' && (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
          {geographicData?.map((region, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: region?.color }}
                />
                <span className="text-xs font-medium text-foreground">{region?.region?.split(' ')?.[0]}</span>
              </div>
              <p className="text-sm font-bold text-foreground">{region?.marketShare}%</p>
              <p className="text-xs text-muted-foreground">
                ${region?.revenue?.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {/* Regional Performance Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Region</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Revenue</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Projects</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Avg Value</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Growth</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Market Share</th>
            </tr>
          </thead>
          <tbody>
            {geographicData?.map((region, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="py-2 text-foreground font-medium">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: region?.color }}
                    />
                    <span>{region?.region}</span>
                  </div>
                </td>
                <td className="py-2 text-right text-foreground font-medium">
                  ${region?.revenue?.toLocaleString()}
                </td>
                <td className="py-2 text-center text-foreground">
                  {region?.projects}
                </td>
                <td className="py-2 text-right text-foreground">
                  ${region?.avgProjectValue?.toLocaleString()}
                </td>
                <td className="py-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(region?.growth)}`}>
                    {region?.growth > 0 ? '+' : ''}{region?.growth}%
                  </span>
                </td>
                <td className="py-2 text-center text-foreground">
                  {region?.marketShare}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Geographic Insights */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Icon name="MapPin" size={16} className="text-primary" />
          <h4 className="text-sm font-medium text-foreground">Geographic Insights</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <Icon name="TrendingUp" size={14} className="text-green-600 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Top Growth:</span> South Commercial (+22.1% YoY)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="DollarSign" size={14} className="text-primary mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Highest Revenue:</span> Downtown Core ($245k)
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <Icon name="Building2" size={14} className="text-orange-600 mt-0.5" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Most Projects:</span> North Suburbs (12 projects)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicRevenue;