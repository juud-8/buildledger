import React from 'react';
import Icon from '../../../components/AppIcon';

const KPISummary = ({ dateRange, filters, kpiData }) => {
  const defaultKpiData = [
    {
      title: 'Total Revenue',
      value: '$847,250',
      change: '+15.2%',
      changeType: 'positive',
      icon: 'DollarSign',
      color: 'primary',
      description: 'vs last period'
    },
    {
      title: 'Active Projects',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: 'Building2',
      color: 'construction',
      description: 'this month'
    },
    {
      title: 'Collection Rate',
      value: '87.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'TrendingUp',
      color: 'success',
      description: 'payment efficiency'
    },
    {
      title: 'Profit Margin',
      value: '22.8%',
      change: '-1.3%',
      changeType: 'negative',
      icon: 'Percent',
      color: 'warning',
      description: 'gross margin'
    }
  ];

  // Use provided kpiData if defined (even if empty). Fallback only when prop is undefined.
  const data = Array.isArray(kpiData) ? kpiData : defaultKpiData;

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary',
      construction: 'bg-orange-100 text-orange-600',
      success: 'bg-green-100 text-green-600',
      warning: 'bg-yellow-100 text-yellow-600'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  const getChangeColor = (changeType) => {
    return changeType === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {data?.map((kpi, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6 construction-shadow-sm hover:construction-shadow-md construction-transition">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${getColorClasses(kpi?.color)}`}>
              <Icon name={kpi?.icon} size={24} />
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium ${getChangeColor(kpi?.changeType)}`}>
                {kpi?.change}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-1">
              {kpi?.value}
            </h3>
            <p className="text-sm font-medium text-foreground mb-1">
              {kpi?.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {kpi?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPISummary;