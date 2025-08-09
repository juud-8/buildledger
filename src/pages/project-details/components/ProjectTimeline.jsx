import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ProjectTimeline = ({ project }) => {
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'in progress':
        return 'bg-blue-500 border-blue-500';
      case 'pending':
        return 'bg-gray-300 border-gray-300';
      case 'delayed':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  const getMilestoneIcon = (type) => {
    switch (type) {
      case 'permit':
        return 'FileCheck';
      case 'inspection':
        return 'Search';
      case 'milestone':
        return 'Flag';
      case 'weather':
        return 'Cloud';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Header */}
      <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Project Timeline</h3>
            <p className="text-sm text-muted-foreground">Track milestones, permits, and inspections</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-muted-foreground">Delayed</span>
            </div>
          </div>
        </div>
      </div>
      {/* Timeline View */}
      <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {/* Timeline Items */}
            <div className="space-y-8">
              {project?.timeline?.map((item, index) => (
                <div key={index} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 w-4 h-4 rounded-full border-2 ${getStatusColor(item?.status)}`}>
                    <div className="absolute -inset-2 rounded-full bg-background"></div>
                  </div>
                  
                  {/* Content */}
                  <div className="ml-6 flex-1">
                    <div className="bg-background border border-border rounded-xl p-4 construction-card-3d construction-depth-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Icon name={getMilestoneIcon(item?.type)} size={16} className="text-primary" />
                            <h4 className="font-semibold text-foreground">{item?.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item?.status === 'completed' ? 'bg-green-100 text-green-800' :
                              item?.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                              item?.status === 'delayed'? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item?.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{item?.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Icon name="Calendar" size={12} />
                              <span>Due: {item?.dueDate}</span>
                            </div>
                            {item?.assignee && (
                              <div className="flex items-center space-x-1">
                                <Icon name="User" size={12} />
                                <span>{item?.assignee}</span>
                              </div>
                            )}
                            {item?.duration && (
                              <div className="flex items-center space-x-1">
                                <Icon name="Clock" size={12} />
                                <span>{item?.duration}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedMilestone(selectedMilestone === index ? null : index)}
                          className="ml-4 p-1 hover:bg-muted rounded construction-transition"
                        >
                          <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
                        </button>
                      </div>
                      
                      {/* Expanded Details */}
                      {selectedMilestone === index && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-foreground mb-1">Progress</p>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full construction-transition"
                                  style={{ width: `${item?.progress || 0}%` }}
                                ></div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{item?.progress || 0}% complete</p>
                            </div>
                            <div>
                              <p className="font-medium text-foreground mb-1">Dependencies</p>
                              <p className="text-muted-foreground">{item?.dependencies || 'None'}</p>
                            </div>
                          </div>
                          {item?.notes && (
                            <div className="mt-3">
                              <p className="font-medium text-foreground mb-1">Notes</p>
                              <p className="text-sm text-muted-foreground">{item?.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden space-y-4">
          {project?.timeline?.map((item, index) => (
            <div key={index} className="bg-background border border-border rounded-xl p-4 construction-card-3d construction-depth-3">
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(item?.status)?.replace('border-', 'bg-')}`}></div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name={getMilestoneIcon(item?.type)} size={14} className="text-primary" />
                    <h4 className="font-semibold text-foreground text-sm">{item?.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{item?.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item?.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item?.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                      item?.status === 'delayed'? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item?.status}
                    </span>
                    <p className="text-xs text-muted-foreground">{item?.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Weather Delays Section */}
      {project?.weatherDelays && project?.weatherDelays?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 construction-card-3d construction-depth-3">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Cloud" size={20} className="mr-2 text-blue-500" />
            Weather Delays
          </h3>
          <div className="space-y-3">
            {project?.weatherDelays?.map((delay, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon name="CloudRain" size={16} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">{delay?.reason}</p>
                    <p className="text-sm text-blue-700">{delay?.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-900">{delay?.duration}</p>
                  <p className="text-sm text-blue-700">Impact: ${delay?.cost?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;