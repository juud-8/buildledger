import React from 'react';
import Icon from '../../../components/AppIcon';
import { Card, CardHeader, CardContent, CardTitle } from '../../../components/ui/Card';

const KPICard = ({ title, value, change, changeType, icon, color = 'primary' }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getIconBgColor = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary text-primary-foreground';
      case 'construction':
        return 'bg-construction text-construction-foreground';
      case 'warning':
        return 'bg-warning text-warning-foreground';
      case 'success':
        return 'bg-success text-success-foreground';
      case 'error':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconBgColor()}`}>
          <Icon name={icon} size={24} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            <Icon 
              name={changeType === 'positive' ? 'TrendingUp' : changeType === 'negative' ? 'TrendingDown' : 'Minus'} 
              size={16} 
              className={`mr-1 ${getChangeColor()}`}
            />
            <span className={`text-sm font-medium ${getChangeColor()}`}>
              {change}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPICard;