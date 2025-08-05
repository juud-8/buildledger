import React from 'react';
import ProjectCard from './ProjectCard';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';



const ProjectGrid = ({ projects, selectedProjects, onProjectSelect, viewMode }) => {
  if (projects?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Icon name="Building2" size={32} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Projects Found</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first construction project.
        </p>
        <Button variant="default" iconName="Plus" iconPosition="left">
          Create New Project
        </Button>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-card border border-border rounded-lg construction-shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="bg-muted/30 px-6 py-3 border-b border-border">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-1">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-border"
                onChange={(e) => {
                  if (e?.target?.checked) {
                    onProjectSelect(projects?.map(p => p?.id));
                  } else {
                    onProjectSelect([]);
                  }
                }}
              />
            </div>
            <div className="col-span-3">Project</div>
            <div className="col-span-2">Client</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Progress</div>
            <div className="col-span-2">Budget</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>
        {/* Table Body */}
        <div className="divide-y divide-border">
          {projects?.map((project) => (
            <div key={project?.id} className="px-6 py-4 hover:bg-muted/20 construction-transition">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-border"
                    checked={selectedProjects?.includes(project?.id)}
                    onChange={(e) => {
                      if (e?.target?.checked) {
                        onProjectSelect([...selectedProjects, project?.id]);
                      } else {
                        onProjectSelect(selectedProjects?.filter(id => id !== project?.id));
                      }
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <h4 className="font-medium text-foreground">{project?.name}</h4>
                  <p className="text-sm text-muted-foreground">{project?.type}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-foreground">{project?.client}</p>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project?.status)}`}>
                    {project?.status}
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${project?.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">{project?.progress}%</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-foreground">
                    ${project?.budget?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Spent: ${project?.actualCost?.toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" iconName="Eye" />
                    <Button variant="ghost" size="sm" iconName="Edit" />
                    <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects?.map((project) => (
        <div key={project?.id} className="relative">
          {/* Selection Checkbox */}
          <div className="absolute top-4 left-4 z-10">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-card"
              checked={selectedProjects?.includes(project?.id)}
              onChange={(e) => {
                if (e?.target?.checked) {
                  onProjectSelect([...selectedProjects, project?.id]);
                } else {
                  onProjectSelect(selectedProjects?.filter(id => id !== project?.id));
                }
              }}
            />
          </div>
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'bg-success text-success-foreground';
    case 'completed':
      return 'bg-primary text-primary-foreground';
    case 'on-hold':
      return 'bg-warning text-warning-foreground';
    case 'planning':
      return 'bg-secondary text-secondary-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default ProjectGrid;