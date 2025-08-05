import React from 'react';
import Icon from '../../../components/AppIcon';

const ProjectTimelineWidget = ({ projects = [] }) => {
  // Transform projects into timeline items
  const timelineItems = projects.map((project, index) => ({
    id: project.id || index,
    type: 'project',
    title: project.name,
    project: project.client,
    date: project.startDate || new Date().toISOString().split('T')[0],
    time: 'Ongoing',
    status: project.status === 'active' ? 'scheduled' : 
            project.status === 'completed' ? 'completed' : 'upcoming',
    icon: project.status === 'active' ? 'Building2' : 
          project.status === 'completed' ? 'CheckCircle2' : 'Clock',
    progress: project.progress
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'warning':
        return 'text-warning bg-warning/10';
      case 'upcoming':
        return 'text-primary bg-primary/10';
      case 'scheduled':
        return 'text-success bg-success/10';
      case 'completed':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow?.setDate(tomorrow?.getDate() + 1);

    if (date?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (date?.toDateString() === tomorrow?.toDateString()) {
      return 'Tomorrow';
    } else {
      return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Project Timeline</h3>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {timelineItems?.map((item) => (
          <div key={item?.id} className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(item?.status)}`}>
              <Icon name={item?.icon} size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{item?.title}</p>
                <span className="text-xs text-muted-foreground ml-2">{item?.time}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{item?.project}</p>
              <p className="text-xs font-medium text-primary">{formatDate(item?.date)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <button className="w-full text-sm text-primary hover:text-primary/80 font-medium construction-transition">
          View Full Schedule
        </button>
      </div>
    </div>
  );
};

export default ProjectTimelineWidget;