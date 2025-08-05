import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const QuoteToolbar = ({ 
  selectedQuotes, 
  onCreateQuote, 
  onBulkAction, 
  sortBy, 
  onSortChange,
  viewMode,
  onViewModeChange 
}) => {
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'amount-desc', label: 'Highest Amount' },
    { value: 'amount-asc', label: 'Lowest Amount' },
    { value: 'status', label: 'Status' },
    { value: 'client', label: 'Client Name' },
    { value: 'expiration', label: 'Expiration Date' }
  ];

  const bulkActions = [
    { id: 'send', label: 'Send Selected', icon: 'Send' },
    { id: 'download', label: 'Download PDFs', icon: 'Download' },
    { id: 'duplicate', label: 'Duplicate Selected', icon: 'Copy' },
    { id: 'delete', label: 'Delete Selected', icon: 'Trash2', destructive: true }
  ];

  const handleBulkAction = (actionId) => {
    onBulkAction(actionId, selectedQuotes);
    setIsBulkMenuOpen(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg construction-shadow-sm p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-foreground">
            Quotes
          </h2>
          
          {selectedQuotes?.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedQuotes?.length} selected
              </span>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
                  iconName="ChevronDown"
                  iconPosition="right"
                >
                  Bulk Actions
                </Button>
                
                {isBulkMenuOpen && (
                  <div className="absolute left-0 top-8 w-48 bg-popover border border-border rounded-md construction-shadow-lg z-20">
                    <div className="py-1">
                      {bulkActions?.map((action) => (
                        <button
                          key={action?.id}
                          onClick={() => handleBulkAction(action?.id)}
                          className={`flex items-center w-full px-4 py-2 text-sm hover:bg-muted construction-transition ${
                            action?.destructive 
                              ? 'text-error hover:text-error' :'text-popover-foreground'
                          }`}
                        >
                          <Icon name={action?.icon} size={16} className="mr-2" />
                          {action?.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              className="w-40"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
            >
              <Icon name="Grid3X3" size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
            >
              <Icon name="List" size={16} />
            </Button>
          </div>

          {/* Create Quote Button */}
          <Button
            variant="default"
            onClick={onCreateQuote}
            iconName="Plus"
            iconPosition="left"
            className="bg-primary hover:bg-primary/90"
          >
            Create Quote
          </Button>
        </div>
      </div>
      {/* Click outside handler for bulk menu */}
      {isBulkMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsBulkMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default QuoteToolbar;