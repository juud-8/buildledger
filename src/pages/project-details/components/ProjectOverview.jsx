import React from 'react';
import Icon from '../../../components/AppIcon';


const ProjectOverview = ({ project }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'on hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Summary Card */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left Section - Project Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">{project?.name}</h2>
                <p className="text-muted-foreground">{project?.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project?.status)}`}>
                {project?.status}
              </span>
            </div>

            {/* Client Information */}
            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={24} color="white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{project?.client?.name}</h3>
                <p className="text-sm text-muted-foreground">{project?.client?.email}</p>
                <p className="text-sm text-muted-foreground">{project?.client?.phone}</p>
              </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon name="Calendar" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium text-foreground">{project?.startDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="CalendarCheck" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium text-foreground">{project?.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="MapPin" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">{project?.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium text-foreground">${project?.budget?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Spent</p>
                    <p className="font-medium text-foreground">${project?.spent?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Icon name="AlertTriangle" size={16} className={getPriorityColor(project?.priority)} />
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <p className={`font-medium ${getPriorityColor(project?.priority)}`}>{project?.priority}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Progress & Metrics */}
          <div className="lg:w-80 space-y-4">
            {/* Progress Card */}
            <div className="bg-background border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Project Progress</h3>
                <span className="text-2xl font-bold text-primary">{project?.progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-3">
                <div 
                  className="bg-primary h-3 rounded-full construction-transition"
                  style={{ width: `${project?.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground">
                {project?.progress < 25 ? 'Just getting started' :
                 project?.progress < 50 ? 'Making good progress' :
                 project?.progress < 75 ? 'More than halfway there' :
                 project?.progress < 100 ? 'Almost complete' : 'Project completed!'}
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <Icon name="Users" size={20} className="text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{project?.teamSize}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <Icon name="Clock" size={20} className="text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{project?.daysRemaining}</p>
                <p className="text-xs text-muted-foreground">Days Left</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <Icon name="CheckCircle" size={20} className="text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{project?.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-center">
                <Icon name="AlertCircle" size={20} className="text-primary mx-auto mb-2" />
                <p className="text-lg font-bold text-foreground">{project?.pendingTasks}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Recent Activity Feed */}
      <div className="bg-card border border-border rounded-lg p-6 construction-shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Icon name="Activity" size={20} className="mr-2" />
          Recent Activity
        </h3>
        <div className="space-y-4">
          {project?.recentActivity?.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity?.type === 'update' ? 'bg-blue-100' :
                activity?.type === 'milestone' ? 'bg-green-100' :
                activity?.type === 'issue' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <Icon 
                  name={
                    activity?.type === 'update' ? 'Edit' :
                    activity?.type === 'milestone' ? 'CheckCircle' :
                    activity?.type === 'issue' ? 'AlertTriangle' : 'Info'
                  } 
                  size={16} 
                  className={
                    activity?.type === 'update' ? 'text-blue-600' :
                    activity?.type === 'milestone' ? 'text-green-600' :
                    activity?.type === 'issue' ? 'text-red-600' : 'text-gray-600'
                  }
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">{activity?.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-muted-foreground">{activity?.user}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">{activity?.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;