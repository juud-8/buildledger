import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const ClientFilters = ({ onFiltersChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterCategories = [
    {
      title: "Client Type",
      key: "clientType",
      options: [
        { value: "residential", label: "Residential" },
        { value: "commercial", label: "Commercial" },
        { value: "repeat", label: "Repeat Clients" }
      ]
    },
    {
      title: "Project Status",
      key: "projectStatus",
      options: [
        { value: "active", label: "Active Projects" },
        { value: "completed", label: "Completed" },
        { value: "pending", label: "Pending Start" },
        { value: "on-hold", label: "On Hold" }
      ]
    },
    {
      title: "Location",
      key: "location",
      options: [
        { value: "local", label: "Local (< 25 miles)" },
        { value: "regional", label: "Regional (25-100 miles)" },
        { value: "distant", label: "Distant (> 100 miles)" }
      ]
    },
    {
      title: "Relationship Duration",
      key: "relationship",
      options: [
        { value: "new", label: "New (< 6 months)" },
        { value: "established", label: "Established (6m - 2y)" },
        { value: "long-term", label: "Long-term (> 2 years)" }
      ]
    },
    {
      title: "Payment History",
      key: "paymentHistory",
      options: [
        { value: "excellent", label: "Excellent" },
        { value: "good", label: "Good" },
        { value: "fair", label: "Fair" },
        { value: "poor", label: "Poor" }
      ]
    }
  ];

  const handleFilterChange = (category, value, checked) => {
    const newFilters = { ...activeFilters };
    
    if (!newFilters?.[category]) {
      newFilters[category] = [];
    }
    
    if (checked) {
      newFilters[category] = [...newFilters?.[category], value];
    } else {
      newFilters[category] = newFilters?.[category]?.filter(item => item !== value);
    }
    
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters)?.flat()?.length;
  };

  return (
    <div className="bg-card border border-border rounded-lg construction-shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={20} className="text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
            {getActiveFilterCount() > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            </Button>
          </div>
        </div>
      </div>
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          {filterCategories?.map((category) => (
            <div key={category?.key}>
              <h4 className="font-medium text-foreground mb-3 text-sm">
                {category?.title}
              </h4>
              <div className="space-y-2">
                {category?.options?.map((option) => (
                  <Checkbox
                    key={option?.value}
                    label={option?.label}
                    checked={activeFilters?.[category?.key]?.includes(option?.value) || false}
                    onChange={(e) => handleFilterChange(category?.key, option?.value, e?.target?.checked)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientFilters;