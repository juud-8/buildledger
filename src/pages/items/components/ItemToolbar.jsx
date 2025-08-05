import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ItemToolbar = ({
  searchQuery,
  onSearchChange,
  onAddItem,
  onBulkImport,
  onBulkExport,
  selectedItems,
  totalItems,
  viewMode,
  onViewModeChange
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);

  const exportOptions = [
    { value: 'csv', label: 'Export as CSV', icon: 'FileText' },
    { value: 'excel', label: 'Export as Excel', icon: 'FileSpreadsheet' },
    { value: 'pdf', label: 'Export as PDF', icon: 'FileImage' }
  ];

  const importOptions = [
    { value: 'csv', label: 'Import from CSV', icon: 'FileText' },
    { value: 'excel', label: 'Import from Excel', icon: 'FileSpreadsheet' },
    { value: 'template', label: 'Download Template', icon: 'Download' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="text"
              placeholder="Search items by name, SKU, description..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e?.target?.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle - Desktop Only */}
          <div className="hidden lg:flex items-center space-x-1 mr-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              iconName="Grid3X3"
              onClick={() => onViewModeChange?.('grid')}
            />
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              iconName="List"
              onClick={() => onViewModeChange?.('list')}
            />
          </div>

          {/* Bulk Actions */}
          {selectedItems?.length > 0 && (
            <div className="flex items-center space-x-2 mr-2">
              <span className="text-sm text-muted-foreground">
                {selectedItems?.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                iconName="Trash2"
                onClick={() => console.log('Bulk delete')}
              >
                Delete
              </Button>
            </div>
          )}

          {/* Import Options */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              iconName="Upload"
              iconPosition="left"
              onClick={() => setShowImportOptions(!showImportOptions)}
            >
              <span className="hidden sm:inline">Import</span>
            </Button>
            {showImportOptions && (
              <div className="absolute top-10 right-0 bg-card border border-border rounded-lg shadow-lg py-2 z-10 min-w-[180px]">
                {importOptions?.map((option) => (
                  <button
                    key={option?.value}
                    onClick={() => {
                      if (option?.value === 'template') {
                        console.log('Downloading template');
                      } else {
                        onBulkImport?.(option?.value);
                      }
                      setShowImportOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted construction-transition flex items-center"
                  >
                    <Icon name={option?.icon} size={16} className="mr-2" />
                    {option?.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              <span className="hidden sm:inline">Export</span>
            </Button>
            {showExportOptions && (
              <div className="absolute top-10 right-0 bg-card border border-border rounded-lg shadow-lg py-2 z-10 min-w-[180px]">
                {exportOptions?.map((option) => (
                  <button
                    key={option?.value}
                    onClick={() => {
                      onBulkExport?.(option?.value);
                      setShowExportOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted construction-transition flex items-center"
                  >
                    <Icon name={option?.icon} size={16} className="mr-2" />
                    {option?.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Item */}
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={onAddItem}
          >
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>
      {/* Mobile View Mode Toggle */}
      <div className="flex lg:hidden items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            iconName="Grid3X3"
            onClick={() => onViewModeChange?.('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            iconName="List"
            onClick={() => onViewModeChange?.('list')}
          >
            List
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalItems} items
        </div>
      </div>
      {/* Quick Filters */}
      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border overflow-x-auto">
        <span className="text-sm text-muted-foreground whitespace-nowrap">Quick filters:</span>
        <Button variant="ghost" size="sm" onClick={() => console.log('Filter in stock')}>
          In Stock
        </Button>
        <Button variant="ghost" size="sm" onClick={() => console.log('Filter low stock')}>
          Low Stock
        </Button>
        <Button variant="ghost" size="sm" onClick={() => console.log('Filter recently used')}>
          Recently Used
        </Button>
        <Button variant="ghost" size="sm" onClick={() => console.log('Filter favorites')}>
          Favorites
        </Button>
      </div>
    </div>
  );
};

export default ItemToolbar;