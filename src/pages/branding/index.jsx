import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { brandingService } from '../../services/brandingService';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { BrandingOverview } from './components/BrandingOverview';
import { LogoManagement } from './components/LogoManagement';
import { ColorPalette } from './components/ColorPalette';
import { DocumentTemplates } from './components/DocumentTemplates';
import { BrandGuidelines } from './components/BrandGuidelines';
import { Upload, Palette, FileText, Book, Settings } from 'lucide-react';

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
        name: userProfile?.company_name || 'My Company',
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
      <div className="min-h-screen bg-gray-50">
        <Header title="Brand Management" />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading branding data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!branding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Brand Management" />
        <div className="max-w-4xl mx-auto py-12 px-4">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Palette className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Set Up Your Brand Identity
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create a consistent brand experience across all your documents, invoices, and communications.
            </p>
            <Button onClick={handleCreateBranding} className="px-8 py-3">
              Get Started with Branding
            </Button>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Brand Management" />
      
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Brand Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your company's brand identity, logos, and document templates.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-max">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="logos" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Logos
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="flex items-center gap-2">
              <Book className="w-4 h-4" />
              Guidelines
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

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}