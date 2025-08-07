import React from 'react';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const VendorFilters = ({ activeFilters, onFiltersChange }) => {
  const filterOptions = {
    status: {
      label: 'Status',
      options: [
        { value: 'active', label: 'Active', count: 0 },
        { value: 'inactive', label: 'Inactive', count: 0 }
      ]
    },
    paymentTerms: {
      label: 'Payment Terms',
      options: [
        { value: 'Net 15', label: 'Net 15', count: 0 },
        { value: 'Net 30', label: 'Net 30', count: 0 },
        { value: 'Net 45', label: 'Net 45', count: 0 },
        { value: 'Net 60', label: 'Net 60', count: 0 },
        { value: 'COD', label: 'COD', count: 0 },
        { value: 'Prepaid', label: 'Prepaid', count: 0 }
      ]
    }
  };

  const handleFilterChange = (category, value) => {
    const currentFilters = activeFilters[category] || [];
    let newFilters;

    if (currentFilters.includes(value)) {
      newFilters = currentFilters.filter(item => item !== value);
    } else {
      newFilters = [...currentFilters, value];
    }

    onFiltersChange({
      ...activeFilters,
      [category]: newFilters
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(activeFilters).some(filters => filters?.length > 0);

  return (
    <Card className="p-4 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(filterOptions).map(([category, { label, options }]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-foreground mb-3">{label}</h4>
            <div className="space-y-2">
              {options.map((option) => {
                const isActive = activeFilters[category]?.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors hover:bg-muted/50",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => handleFilterChange(category, option.value)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 mr-3"
                      />
                      <span className={cn(
                        "text-sm",
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {option.label}
                      </span>
                    </div>
                    {option.count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {option.count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Store"
            iconPosition="left"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            View All Vendors
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="Package"
            iconPosition="left"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            View Materials
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="TrendingUp"
            iconPosition="left"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            Cost Analysis
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VendorFilters;