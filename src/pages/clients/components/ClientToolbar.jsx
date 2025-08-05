import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ClientToolbar = ({ 
  searchQuery, 
  onSearchChange, 
  onAddClient, 
  onBulkEmail, 
  onExport, 
  selectedClients,
  totalClients 
}) => {
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleExport = (format) => {
    onExport(format);
  };

  return (
    <div className="bg-card border border-border rounded-lg construction-shadow-sm mb-6">
      <div className="p-4">
        {/* Top Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              type="search"
              placeholder="Search clients by name, email, or project..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e?.target?.value)}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
              iconName="Users"
              iconPosition="left"
              iconSize={16}
            >
              Bulk Actions
            </Button>
            
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                iconName="Download"
                iconPosition="left"
                iconSize={16}
                onClick={() => handleExport('csv')}
              >
                Export
              </Button>
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={onAddClient}
              iconName="Plus"
              iconPosition="left"
              iconSize={16}
            >
              Add Client
            </Button>
          </div>
        </div>

        {/* Bulk Actions Row */}
        {showBulkActions && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {selectedClients?.length} of {totalClients} clients selected
                </span>
                {selectedClients?.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    Select All
                  </Button>
                )}
              </div>

              {selectedClients?.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBulkEmail}
                    iconName="Mail"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Send Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="MessageSquare"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Send SMS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Tag"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Add Tags
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalClients}</div>
              <div className="text-xs text-muted-foreground">Total Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">156</div>
              <div className="text-xs text-muted-foreground">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$2.4M</div>
              <div className="text-xs text-muted-foreground">Total Value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">89%</div>
              <div className="text-xs text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientToolbar;