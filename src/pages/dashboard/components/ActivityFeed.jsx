import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities = [] }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'invoice':
        return status === 'paid' ? 'DollarSign' : 'FileText';
      case 'quote':
        return 'FileText';
      default:
        return 'Activity';
    }
  };

  const getActivityColor = (type, status) => {
    switch (type) {
      case 'invoice':
        return status === 'paid' ? 'success' : 'construction';
      case 'quote':
        return status === 'accepted' ? 'success' : 'primary';
      default:
        return 'primary';
    }
  };

  const getIconColor = (color) => {
    switch (color) {
      case 'success':
        return 'text-success bg-success/10';
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'error':
        return 'text-error bg-error/10';
      case 'construction':
        return 'text-construction-orange bg-construction-orange/10';
      default:
        return 'text-primary bg-primary/10';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {activities?.length > 0 ? (
          activities.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(getActivityColor(activity?.type, activity?.status))}`}>
                <Icon name={getActivityIcon(activity?.type, activity?.status)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{activity?.title}</p>
                  {activity?.description && activity?.description.includes('$') && (
                    <span className="text-sm font-medium text-foreground ml-2">
                      {activity?.description.match(/\$[\d,]+/)?.[0]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{activity?.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(activity?.timestamp)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium construction-transition">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;