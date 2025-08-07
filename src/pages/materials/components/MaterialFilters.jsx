import React from 'react';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cn } from '../../../utils/cn';

const MaterialFilters = ({ activeFilters, onFiltersChange, vendors = [] }) => {
  const filterOptions = {
    category: {
      label: 'Category',
      options: [
        { value: 'materials', label: 'Materials', count: 0 },
        { value: 'labor', label: 'Labor', count: 0 },
        { value: 'equipment', label: 'Equipment', count: 0 },
        { value: 'subcontractor', label: 'Subcontractor', count: 0 },
        { value: 'overhead', label: 'Overhead', count: 0 },
        { value: 'other', label: 'Other', count: 0 }
      ]
    },
    vendor: {
      label: 'Vendor',
      options: vendors.map(vendor => ({
        value: vendor.id,
        label: vendor.name,
        count: 0
      }))
    },
    stock: {
      label: 'Stock Level',
      options: [
        { value: 'low', label: 'Low Stock', count: 0 },
        { value: 'out', label: 'Out of Stock', count: 0 },
        { value: 'adequate', label: 'Adequate Stock', count: 0 }
      ]
    },
    status: {
      label: 'Status',
      options: [
        { value: 'active', label: 'Active', count: 0 },
        { value: 'inactive', label: 'Inactive', count: 0 }
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
        {Object.entries(filterOptions).map(([category, { label, options }]) => {
          if (category === 'vendor' && options.length === 0) return null;
          
          return (
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
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            iconName="Box"
            iconPosition="left"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => onFiltersChange({ stock: ['low'] })}
          >
            Low Stock Items
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconName="AlertTriangle"
            iconPosition="left"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => onFiltersChange({ stock: ['out'] })}
          >
            Out of Stock
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

export default MaterialFilters;