import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import Icon from '../../../components/AppIcon';

const SeasonalPatterns = ({ dateRange, filters }) => {
  const seasonalData = [
    { month: 'Jan', current: 68000, previous: 58000, average: 62000, season: 'Winter' },
    { month: 'Feb', current: 72000, previous: 62000, average: 65000, season: 'Winter' },
    { month: 'Mar', current: 85000, previous: 75000, average: 78000, season: 'Spring' },
    { month: 'Apr', current: 92000, previous: 82000, average: 85000, season: 'Spring' },
    { month: 'May', current: 108000, previous: 95000, average: 98000, season: 'Spring' },
    { month: 'Jun', current: 125000, previous: 112000, average: 115000, season: 'Summer' },
    { month: 'Jul', current: 135000, previous: 118000, average: 122000, season: 'Summer' },
    { month: 'Aug', current: 128000, previous: 115000, average: 118000, season: 'Summer' },
    { month: 'Sep', current: 115000, previous: 105000, average: 108000, season: 'Fall' },
    { month: 'Oct', current: 98000, previous: 88000, average: 92000, season: 'Fall' },
    { month: 'Nov', current: 78000, previous: 72000, average: 75000, season: 'Fall' },
    { month: 'Dec', current: 65000, previous: 58000, average: 60000, season: 'Winter' }
  ];

  const seasonalInsights = [
    {
      season: 'Spring',
      peak: 'May',
      growth: '+18%',
      description: 'Peak construction season begins',
      icon: 'Flower',
      color: 'text-green-600 bg-green-100'
    },
    {
      season: 'Summer',
      peak: 'July',
      growth: '+22%',
      description: 'Highest activity period',
      icon: 'Sun',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      season: 'Fall',
      peak: 'September',
      growth: '-15%',
      description: 'Projects rush to completion',
      icon: 'Leaf',
      color: 'text-amber-600 bg-amber-100'
    },
    {
      season: 'Winter',
      peak: 'February',
      growth: '-25%',
      description: 'Slowest period, planning phase',
      icon: 'Snowflake',
      color: 'text-blue-600 bg-blue-100'
    }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = seasonalData?.find(d => d?.month === label);
      return (
        <div className="bg-popover border border-border rounded-xl p-4 construction-depth-3">
          <p className="text-sm font-medium text-popover-foreground mb-2">{label} 2025 - {data?.season}</p>
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
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seasonal Revenue Patterns</h3>
          <p className="text-sm text-muted-foreground">Construction cycle analysis and trends</p>
        </div>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>

      {/* Seasonal Revenue Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
            <Area
              type="monotone"
              dataKey="average"
              stackId="1"
              stroke="var(--color-muted-foreground)"
              strokeDasharray="5 5"
              fill="transparent"
              name="3-Year Average"
            />
            <Area
              type="monotone"
              dataKey="previous"
              stackId="2"
              stroke="#22c55e"
              fill="#22c55e20"
              name="Previous Year"
            />
            <Area
              type="monotone"
              dataKey="current"
              stackId="3"
              stroke="var(--color-primary)"
              fill="var(--color-primary)20"
              name="Current Year"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal Insights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {seasonalInsights?.map((insight, index) => (
          <div key={index} className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${insight?.color}`}>
                <Icon name={insight?.icon} size={16} />
              </div>
              <span className={`text-sm font-medium ${
                insight?.growth?.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {insight?.growth}
              </span>
            </div>
            <h4 className="font-medium text-foreground mb-1">{insight?.season}</h4>
            <p className="text-xs text-muted-foreground mb-2">Peak: {insight?.peak}</p>
            <p className="text-xs text-muted-foreground">{insight?.description}</p>
          </div>
        ))}
      </div>

      {/* Key Seasonal Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">$135k</p>
          <p className="text-xs text-muted-foreground">Peak Month (July)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">$65k</p>
          <p className="text-xs text-muted-foreground">Low Month (Dec)</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-primary">52%</p>
          <p className="text-xs text-muted-foreground">Summer Revenue</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-green-600">+12%</p>
          <p className="text-xs text-muted-foreground">YoY Growth</p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalPatterns;