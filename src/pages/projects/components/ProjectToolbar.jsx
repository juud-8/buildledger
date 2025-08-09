import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const ProjectToolbar = ({ 
  selectedProjects, 
  onBulkAction, 
  sortBy, 
  onSortChange, 
  viewMode, 
  onViewModeChange,
  onNewProject 
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);

  const sortOptions = [
    { value: 'name', label: 'Project Name' },
    { value: 'date', label: 'Start Date' },
    { value: 'budget', label: 'Budget' },
    { value: 'status', label: 'Status' },
    { value: 'progress', label: 'Progress' },
    { value: 'client', label: 'Client' }
  ];

  const bulkActions = [
    { value: 'update-status', label: 'Update Status', icon: 'Edit' },
    { value: 'export', label: 'Export Selected', icon: 'Download' },
    { value: 'archive', label: 'Archive Projects', icon: 'Archive' },
    { value: 'delete', label: 'Delete Projects', icon: 'Trash2' }
  ];

  const handleBulkAction = (action) => {
    onBulkAction(action, selectedProjects);
    setShowBulkActions(false);
  };

  return (
    <div className="bg-card border border-border rounded-xl construction-card-3d construction-depth-3 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Section - Bulk Actions */}
        <div className="flex items-center space-x-4">
          {selectedProjects?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedProjects?.length} selected
              </span>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  iconName="ChevronDown"
                  iconPosition="right"
                >
                  Bulk Actions
                </Button>
                
                {showBulkActions && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-md construction-shadow-lg z-50">
                    <div className="py-1">
                      {bulkActions?.map((action) => (
                        <button
                          key={action?.value}
                          onClick={() => handleBulkAction(action?.value)}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-popover-foreground hover:bg-muted construction-transition"
                        >
                          <Icon name={action?.icon} size={16} />
                          <span>{action?.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Sort, View, New Project */}
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Sort by"
              className="w-40"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              iconName="Grid3X3"
              className="rounded-r-none border-r border-border"
            />
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              iconName="List"
              className="rounded-l-none"
            />
          </div>

          {/* New Project Button */}
          <Button
            variant="default"
            onClick={onNewProject}
            iconName="Plus"
            iconPosition="left"
            className="bg-primary hover:bg-primary/90"
          >
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
      {/* Advanced Search Toggle */}
      <div className="mt-4 pt-4 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          iconName="Search"
          iconPosition="left"
          className="text-muted-foreground"
        >
          Advanced Search
        </Button>
      </div>
    </div>
  );
};

export default ProjectToolbar;