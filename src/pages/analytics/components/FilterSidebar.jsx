import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const FilterSidebar = ({ isOpen, filters, onFiltersChange, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const projectTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'retail', label: 'Retail' },
    { value: 'infrastructure', label: 'Infrastructure' }
  ];

  const clientSegments = [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'small-business', label: 'Small Business' },
    { value: 'government', label: 'Government' },
    { value: 'individual', label: 'Individual' }
  ];

  const regions = [
    { value: 'downtown', label: 'Downtown Core' },
    { value: 'north-suburbs', label: 'North Suburbs' },
    { value: 'west-industrial', label: 'West Industrial' },
    { value: 'east-residential', label: 'East Residential' },
    { value: 'south-commercial', label: 'South Commercial' }
  ];

  const customKPIs = [
    { 
      id: 'revenue-per-project',
      title: 'Revenue per Project',
      value: '$35,600',
      change: '+8.2%',
      icon: 'DollarSign'
    },
    { 
      id: 'project-efficiency',
      title: 'Project Efficiency',
      value: '94.5%',
      change: '+2.1%',
      icon: 'Zap'
    },
    {
      id: 'client-satisfaction',
      title: 'Client Satisfaction',
      value: '4.7/5',
      change: '+0.3',
      icon: 'Heart'
    },
    {
      id: 'safety-score',
      title: 'Safety Score',
      value: '98.2%',
      change: '+1.5%',
      icon: 'Shield'
    }
  ];

  const handleCheckboxChange = (category, value) => {
    const current = localFilters?.[category] || [];
    const updated = current?.includes(value)
      ? current?.filter(item => item !== value)
      : [...current, value];
    
    setLocalFilters(prev => ({
      ...prev,
      [category]: updated
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev?.dateRange,
        [field]: value
      }
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: { start: null, end: null },
      projectTypes: [],
      clientSegments: [],
      regions: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose}></div>
      {/* Sidebar */}
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border construction-shadow-lg z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Filters & KPIs</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <Icon name="X" size={20} />
            </Button>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="Calendar" size={16} className="mr-2" />
              Custom Date Range
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={localFilters?.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e?.target?.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={localFilters?.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e?.target?.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Project Types */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="Building2" size={16} className="mr-2" />
              Project Types
            </h4>
            <div className="space-y-2">
              {projectTypes?.map((type) => (
                <div key={type?.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type?.value}
                    checked={localFilters?.projectTypes?.includes(type?.value) || false}
                    onCheckedChange={() => handleCheckboxChange('projectTypes', type?.value)}
                  />
                  <label 
                    htmlFor={type?.value}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {type?.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Client Segments */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="Users" size={16} className="mr-2" />
              Client Segments
            </h4>
            <div className="space-y-2">
              {clientSegments?.map((segment) => (
                <div key={segment?.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={segment?.value}
                    checked={localFilters?.clientSegments?.includes(segment?.value) || false}
                    onCheckedChange={() => handleCheckboxChange('clientSegments', segment?.value)}
                  />
                  <label 
                    htmlFor={segment?.value}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {segment?.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="MapPin" size={16} className="mr-2" />
              Regions
            </h4>
            <div className="space-y-2">
              {regions?.map((region) => (
                <div key={region?.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={region?.value}
                    checked={localFilters?.regions?.includes(region?.value) || false}
                    onCheckedChange={() => handleCheckboxChange('regions', region?.value)}
                  />
                  <label 
                    htmlFor={region?.value}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {region?.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Custom KPI Widgets */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="BarChart3" size={16} className="mr-2" />
              Custom KPIs
            </h4>
            <div className="space-y-3">
              {customKPIs?.map((kpi) => (
                <div key={kpi?.id} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-primary/10 rounded-md">
                        <Icon name={kpi?.icon} size={14} className="text-primary" />
                      </div>
                      <span className="text-xs font-medium text-foreground">{kpi?.title}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">
                      {kpi?.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{kpi?.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Actions */}
          <div className="space-y-3">
            <Button onClick={applyFilters} className="w-full">
              <Icon name="Filter" size={16} className="mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              <Icon name="FilterX" size={16} className="mr-2" />
              Clear All
            </Button>
          </div>

          {/* Goal Setting */}
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center">
              <Icon name="Target" size={16} className="mr-2" />
              Goal Tracking
            </h4>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Monthly Revenue Goal</span>
                  <span className="text-xs text-green-600">85%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">$72k / $85k target</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">Project Completion</span>
                  <span className="text-xs text-blue-600">92%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">11 / 12 projects on time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;