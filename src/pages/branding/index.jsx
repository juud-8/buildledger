import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { brandingService } from '../../services/brandingService';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { BrandingOverview } from './components/BrandingOverview';
import { LogoManagement } from './components/LogoManagement';
import { ColorPalette } from './components/ColorPalette';
import { DocumentTemplates } from './components/DocumentTemplates';
import { BrandGuidelines } from './components/BrandGuidelines';

export default function BrandingPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [branding, setBranding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadBrandingData();
    }
  }, [user]);

  const loadBrandingData = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await brandingService?.getCompanyBranding(user?.id);
      setBranding(data);
    } catch (err) {
      setError('Failed to load branding data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranding = async () => {
    try {
      setError(null);
      const brandingData = {
        name: branding?.name || 'My Company',
        primary_color: '#3B82F6',
        secondary_color: '#1E40AF',
        accent_color: '#F59E0B',
        font_family: 'Inter'
      };
      
      const newBranding = await brandingService?.updateCompanyBranding(user?.id, brandingData);
      setBranding(newBranding);
    } catch (err) {
      setError('Failed to create branding configuration');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Brand Management - BuildLedger</title>
          <meta name="description" content="Customize your company branding, logos, colors, and document templates" />
        </Helmet>
        <Header />
        <div className="pt-16">
          <Breadcrumb />
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading branding data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Brand Management - BuildLedger</title>
          <meta name="description" content="Customize your company branding, logos, colors, and document templates" />
        </Helmet>
        <Header />
        <div className="pt-16">
          <Breadcrumb />
          <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Icon name="Palette" size={48} className="text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Set Up Your Brand Identity
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                Create a consistent brand experience across all your documents, invoices, and communications with professional customization tools.
              </p>
              <Button onClick={handleCreateBranding} size="lg" iconName="Sparkles" iconPosition="left">
                Get Started with Branding
              </Button>
              {error && (
                <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Brand Management - BuildLedger</title>
        <meta name="description" content="Customize your company branding, logos, colors, and document templates" />
      </Helmet>
      <Header />
      <div className="pt-16">
        <Breadcrumb />
        
        <div className="px-4 lg:px-6 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name="Palette" size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Brand Management</h1>
                  <p className="text-muted-foreground mt-1">
                    Customize your company's visual identity and document templates
                  </p>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="hidden lg:flex space-x-3">
                <Button variant="outline" iconName="Eye" iconPosition="left">
                  Preview Brand
                </Button>
                <Button variant="outline" iconName="Download" iconPosition="left">
                  Export Assets
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:w-max bg-card border border-border">
              <TabsTrigger 
                value="overview" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Settings" size={16} />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="logos" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Upload" size={16} />
                <span className="hidden sm:inline">Logos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="colors" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Palette" size={16} />
                <span className="hidden sm:inline">Colors</span>
              </TabsTrigger>
              <TabsTrigger 
                value="templates" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="FileText" size={16} />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger 
                value="guidelines" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon name="Book" size={16} />
                <span className="hidden sm:inline">Guidelines</span>
              </TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <BrandingOverview 
              branding={branding} 
              onUpdate={setBranding}
              onError={setError}
            />
          </TabsContent>

          <TabsContent value="logos" className="space-y-6">
            <LogoManagement 
              branding={branding}
              userId={user?.id}
              onError={setError}
            />
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <ColorPalette 
              branding={branding}
              onUpdate={setBranding}
              onError={setError}
            />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <DocumentTemplates 
              branding={branding}
              userId={user?.id}
              onError={setError}
            />
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6">
            <BrandGuidelines 
              branding={branding}
              userId={user?.id}
              onError={setError}
            />
          </TabsContent>
        </Tabs>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Icon name="AlertCircle" size={20} className="text-destructive mt-0.5" />
                  <div>
                    <p className="text-destructive font-medium">Error</p>
                    <p className="text-destructive/80 text-sm mt-1">{error}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setError(null)}
                  iconName="X"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}