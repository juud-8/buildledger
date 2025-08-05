import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Button from '../../../components/ui/Button';

const ProjectFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'planning', label: 'Planning' }
  ];

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'johnson-family', label: 'Johnson Family' },
    { value: 'smith-enterprises', label: 'Smith Enterprises' },
    { value: 'brown-construction', label: 'Brown Construction' },
    { value: 'davis-properties', label: 'Davis Properties' },
    { value: 'wilson-homes', label: 'Wilson Homes' }
  ];

  const projectTypes = [
    { id: 'residential', label: 'Residential' },
    { id: 'commercial', label: 'Commercial' },
    { id: 'renovation', label: 'Renovation' },
    { id: 'new-construction', label: 'New Construction' },
    { id: 'landscaping', label: 'Landscaping' }
  ];

  const handleStatusChange = (value) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleClientChange = (value) => {
    onFiltersChange({ ...filters, client: value });
  };

  const handleDateRangeChange = (field, value) => {
    onFiltersChange({
      ...filters,
      dateRange: { ...filters?.dateRange, [field]: value }
    });
  };

  const handleProjectTypeChange = (typeId, checked) => {
    const updatedTypes = checked
      ? [...filters?.projectTypes, typeId]
      : filters?.projectTypes?.filter(id => id !== typeId);
    onFiltersChange({ ...filters, projectTypes: updatedTypes });
  };

  return (
    <div className="bg-card border border-border rounded-lg construction-shadow-sm">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between p-4 rounded-none border-b border-border"
        >
          <span className="flex items-center space-x-2">
            <Icon name="Filter" size={20} />
            <span>Filters</span>
          </span>
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={20} />
        </Button>
      </div>
      {/* Filter Content */}
      <div className={`p-4 space-y-6 ${!isExpanded ? 'hidden lg:block' : ''}`}>
        {/* Status Filter */}
        <div>
          <Select
            label="Project Status"
            options={statusOptions}
            value={filters?.status}
            onChange={handleStatusChange}
            className="w-full"
          />
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Date Range
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">From</label>
              <input
                type="date"
                value={filters?.dateRange?.from}
                onChange={(e) => handleDateRangeChange('from', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">To</label>
              <input
                type="date"
                value={filters?.dateRange?.to}
                onChange={(e) => handleDateRangeChange('to', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Client Filter */}
        <div>
          <Select
            label="Client"
            options={clientOptions}
            value={filters?.client}
            onChange={handleClientChange}
            className="w-full"
          />
        </div>

        {/* Project Type Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Project Type
          </label>
          <div className="space-y-2">
            {projectTypes?.map((type) => (
              <Checkbox
                key={type?.id}
                label={type?.label}
                checked={filters?.projectTypes?.includes(type?.id)}
                onChange={(e) => handleProjectTypeChange(type?.id, e?.target?.checked)}
              />
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
            iconName="X"
            iconPosition="left"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;