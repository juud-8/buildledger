import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const QuoteFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'expired', label: 'Expired' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const clientOptions = [
    { value: 'all', label: 'All Clients' },
    { value: 'residential-homes', label: 'Residential Homes LLC' },
    { value: 'commercial-builders', label: 'Commercial Builders Inc' },
    { value: 'green-construction', label: 'Green Construction Co' },
    { value: 'urban-developers', label: 'Urban Developers Group' },
    { value: 'heritage-builders', label: 'Heritage Builders' }
  ];

  const amountRangeOptions = [
    { value: 'all', label: 'All Amounts' },
    { value: '0-5000', label: '$0 - $5,000' },
    { value: '5000-15000', label: '$5,000 - $15,000' },
    { value: '15000-50000', label: '$15,000 - $50,000' },
    { value: '50000-100000', label: '$50,000 - $100,000' },
    { value: '100000+', label: '$100,000+' }
  ];

  const projectTypeOptions = [
    { value: 'all', label: 'All Project Types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'new-construction', label: 'New Construction' },
    { value: 'repair', label: 'Repair & Maintenance' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl construction-card-3d construction-depth-3">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Filter" size={20} className="mr-2" />
            Filters
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </Button>
        </div>
      </div>
      <div className={`p-4 space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Status Filter */}
        <div>
          <Select
            label="Status"
            options={statusOptions}
            value={filters?.status}
            onChange={(value) => handleFilterChange('status', value)}
            className="w-full"
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 gap-3">
          <Input
            label="From Date"
            type="date"
            value={filters?.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={filters?.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
          />
        </div>

        {/* Client Filter */}
        <div>
          <Select
            label="Client"
            options={clientOptions}
            value={filters?.client}
            onChange={(value) => handleFilterChange('client', value)}
            searchable
          />
        </div>

        {/* Amount Range */}
        <div>
          <Select
            label="Amount Range"
            options={amountRangeOptions}
            value={filters?.amountRange}
            onChange={(value) => handleFilterChange('amountRange', value)}
          />
        </div>

        {/* Project Type */}
        <div>
          <Select
            label="Project Type"
            options={projectTypeOptions}
            value={filters?.projectType}
            onChange={(value) => handleFilterChange('projectType', value)}
          />
        </div>

        {/* Search */}
        <div>
          <Input
            label="Search Quotes"
            type="search"
            placeholder="Quote number, project name..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Clear Filters */}
        <div className="pt-2">
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

export default QuoteFilters;