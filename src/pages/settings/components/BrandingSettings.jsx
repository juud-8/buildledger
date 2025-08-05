import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BrandingSettings = () => {
  const [brandingData, setBrandingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading branding data
    const timer = setTimeout(() => {
      setBrandingData({
        hasLogo: true,
        logoUrl: '/assets/images/company-logo.png',
        companyName: 'ABC Construction',
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
        accentColor: '#F59E0B'
      });
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-4"></div>
        <div className="h-4 bg-muted rounded w-96 mb-8"></div>
        <div className="space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Logo & Branding</h2>
        <p className="text-sm text-muted-foreground">
          Manage your company logo, colors, and branding elements that appear on quotes, invoices, and reports.
        </p>
      </div>

      {/* Quick Overview */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
              {brandingData?.hasLogo ? (
                <img 
                  src={brandingData?.logoUrl} 
                  alt="Company Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-12 h-12 bg-primary rounded flex items-center justify-center" style={{display: brandingData?.hasLogo ? 'none' : 'flex'}}>
                <Icon name="Building2" size={20} color="white" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground">{brandingData?.companyName}</h3>
              <p className="text-sm text-muted-foreground">
                {brandingData?.hasLogo ? 'Logo configured' : 'No logo uploaded'}
              </p>
            </div>
          </div>
          <Link to="/branding">
            <Button variant="outline" size="sm">
              <Icon name="ExternalLink" size={16} className="mr-2" />
              Full Branding Suite
            </Button>
          </Link>
        </div>
      </div>

      {/* Color Palette Preview */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <h3 className="font-medium text-foreground mb-3">Brand Colors</h3>
        <div className="flex space-x-4">
          <div className="text-center">
            <div 
              className="w-12 h-12 rounded-lg border mb-2" 
              style={{ backgroundColor: brandingData?.primaryColor }}
            ></div>
            <p className="text-xs text-muted-foreground">Primary</p>
          </div>
          <div className="text-center">
            <div 
              className="w-12 h-12 rounded-lg border mb-2" 
              style={{ backgroundColor: brandingData?.secondaryColor }}
            ></div>
            <p className="text-xs text-muted-foreground">Secondary</p>
          </div>
          <div className="text-center">
            <div 
              className="w-12 h-12 rounded-lg border mb-2" 
              style={{ backgroundColor: brandingData?.accentColor }}
            ></div>
            <p className="text-xs text-muted-foreground">Accent</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Upload" size={16} className="text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Upload Logo</h4>
              <p className="text-xs text-muted-foreground">Add or update company logo</p>
            </div>
          </div>
          <Link to="/branding">
            <Button variant="outline" size="sm" className="w-full">
              Manage Logos
            </Button>
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-construction/10 rounded-lg flex items-center justify-center">
              <Icon name="Palette" size={16} className="text-construction" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Brand Guidelines</h4>
              <p className="text-xs text-muted-foreground">Set brand colors and fonts</p>
            </div>
          </div>
          <Link to="/branding">
            <Button variant="outline" size="sm" className="w-full">
              Edit Guidelines
            </Button>
          </Link>
        </div>
      </div>

      {/* Document Integration Info */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Automatic Integration</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your logo and brand colors are automatically applied to quotes, invoices, and analytics reports. 
              Changes made in the full branding suite will reflect across all documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;