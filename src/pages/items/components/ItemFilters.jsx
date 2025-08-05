import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const ItemFilters = ({ activeFilters, onFiltersChange }) => {
  const filterCategories = [
    {
      id: 'category',
      title: 'Category',
      icon: 'Layers',
      options: [
        { value: 'Foundation', label: 'Foundation', icon: 'Building' },
        { value: 'Framing', label: 'Framing', icon: 'Grid3X3' },
        { value: 'Electrical', label: 'Electrical', icon: 'Zap' },
        { value: 'Plumbing', label: 'Plumbing', icon: 'Droplets' },
        { value: 'HVAC', label: 'HVAC', icon: 'Wind' },
        { value: 'Roofing', label: 'Roofing', icon: 'Home' },
        { value: 'Labor', label: 'Labor', icon: 'Users' },
        { value: 'Equipment', label: 'Equipment', icon: 'Truck' }
      ]
    },
    {
      id: 'unit',
      title: 'Unit of Measurement',
      icon: 'Ruler',
      options: [
        { value: 'each', label: 'Each' },
        { value: 'linear foot', label: 'Linear Foot' },
        { value: 'square foot', label: 'Square Foot' },
        { value: 'cubic yard', label: 'Cubic Yard' },
        { value: 'hour', label: 'Hour' },
        { value: 'day', label: 'Day' },
        { value: 'square', label: 'Square (Roofing)' }
      ]
    },
    {
      id: 'priceRange',
      title: 'Price Range',
      icon: 'DollarSign',
      options: [
        { value: 'under50', label: 'Under $50' },
        { value: '50to200', label: '$50 - $200' },
        { value: '200to500', label: '$200 - $500' },
        { value: 'over500', label: 'Over $500' }
      ]
    },
    {
      id: 'availability',
      title: 'Availability',
      icon: 'Package',
      options: [
        { value: 'inStock', label: 'In Stock' },
        { value: 'outOfStock', label: 'Out of Stock' },
        { value: 'lowStock', label: 'Low Stock' }
      ]
    },
    {
      id: 'recentlyUsed',
      title: 'Recently Used',
      icon: 'Clock',
      options: [
        { value: 'lastWeek', label: 'Last 7 Days' },
        { value: 'lastMonth', label: 'Last 30 Days' }
      ]
    }
  ];

  const handleFilterChange = (categoryId, optionValue, checked) => {
    const currentValues = activeFilters?.[categoryId] || [];
    let newValues;

    if (checked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues?.filter(value => value !== optionValue);
    }

    onFiltersChange({
      ...activeFilters,
      [categoryId]: newValues
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters)?.reduce((count, values) => count + (values?.length || 0), 0);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Icon name="Filter" size={20} className="mr-2" />
          Filters
        </h3>
        {getActiveFilterCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80 construction-transition"
          >
            Clear All ({getActiveFilterCount()})
          </button>
        )}
      </div>

      <div className="space-y-6">
        {filterCategories?.map((category) => (
          <div key={category?.id} className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center">
              <Icon name={category?.icon} size={16} className="mr-2" />
              {category?.title}
            </h4>
            <div className="space-y-2 pl-6">
              {category?.options?.map((option) => (
                <label key={option?.value} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={activeFilters?.[category?.id]?.includes(option?.value) || false}
                    onChange={(e) => 
                      handleFilterChange(category?.id, option?.value, e.target.checked)
                    }
                  />
                  <div className="flex items-center space-x-2">
                    {option?.icon && (
                      <Icon name={option?.icon} size={14} className="text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">{option?.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Quick Stats</h4>
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Total Items:</span>
            <span className="font-medium">156</span>
          </div>
          <div className="flex justify-between">
            <span>In Stock:</span>
            <span className="font-medium text-success">142</span>
          </div>
          <div className="flex justify-between">
            <span>Low Stock:</span>
            <span className="font-medium text-warning">8</span>
          </div>
          <div className="flex justify-between">
            <span>Out of Stock:</span>
            <span className="font-medium text-error">6</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemFilters;