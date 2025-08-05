import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';

import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import { brandingService } from '../../../services/brandingService';

const AnalyticsHeader = ({ title, onExport, onRefresh, isLoading }) => {
  const { user } = useAuth();
  const [brandingData, setBrandingData] = useState(null);

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const branding = await brandingService?.getUserBranding();
        setBrandingData(branding);
      } catch (error) {
        console.error('Error loading branding:', error);
      }
    };

    if (user) {
      loadBranding();
    }
  }, [user]);

  const handleExportWithBranding = () => {
    if (onExport) {
      onExport(brandingData);
    }
  };

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          {/* Company Logo Integration */}
          {brandingData?.logoUrl && (
            <div className="w-10 h-10 rounded-lg overflow-hidden border">
              <img 
                src={brandingData?.logoUrl} 
                alt="Company Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title || 'Analytics Dashboard'}</h1>
            <p className="text-sm text-muted-foreground">
              {brandingData?.companyName || 'BuildLedger'} • {new Date()?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <Icon name={isLoading ? "Loader2" : "RefreshCw"} size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={handleExportWithBranding}
          >
            <Icon name="Download" size={16} className="mr-2" />
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;