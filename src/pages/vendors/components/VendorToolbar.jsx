import React from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const VendorToolbar = ({
  searchQuery,
  onSearchChange,
  onAddVendor,
  onBulkEmail,
  onExport,
  selectedVendors,
  totalVendors,
  onSelectAll
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search vendors by name, company, email, or contact person..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          {/* Selection Info */}
          {totalVendors > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSelectAll}
                className="text-xs px-2 py-1 h-auto"
              >
                {selectedVendors.length === totalVendors ? 'Deselect All' : 'Select All'}
              </Button>
              <span>
                {selectedVendors.length} of {totalVendors} selected
              </span>
            </div>
          )}

          {/* Bulk Actions */}
          {selectedVendors.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                iconName="Mail"
                iconPosition="left"
                onClick={onBulkEmail}
              >
                Email ({selectedVendors.length})
              </Button>
            </div>
          )}

          {/* Export */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={() => onExport('csv')}
            >
              Export
            </Button>

            {/* Add Vendor - Mobile */}
            <div className="lg:hidden">
              <Button
                variant="default"
                size="sm"
                iconName="Plus"
                iconPosition="left"
                onClick={onAddVendor}
              >
                Add Vendor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorToolbar;