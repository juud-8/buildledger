import React, { useState } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import Icon from '../../../components/AppIcon';
import { showSuccessToast, showErrorToast } from '../../../utils/toastHelper';

export function BrandingOverview({ branding, onUpdate, onError }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    company_name: branding?.company_name || '',
    primary_color: branding?.primary_color || '#3B82F6',
    secondary_color: branding?.secondary_color || '#1E40AF',
    accent_color: branding?.accent_color || '#F59E0B',
    font_family: branding?.font_family || 'Inter',
    font_size_base: branding?.font_size_base || 14
  });
  const [saving, setSaving] = useState(false);

  const fontOptions = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' }
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      onError?.(null);
      
      const updates = { ...formData };
      const updatedBranding = await brandingService?.updateCompanyBranding(branding?.id, updates);
      
      onUpdate?.(updatedBranding);
      setEditing(false);
      showSuccessToast('Brand settings updated successfully!');
    } catch (err) {
      showErrorToast('Failed to update branding settings', err);
      onError?.('Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      company_name: branding?.company_name || '',
      primary_color: branding?.primary_color || '#3B82F6',
      secondary_color: branding?.secondary_color || '#1E40AF',
      accent_color: branding?.accent_color || '#F59E0B',
      font_family: branding?.font_family || 'Inter',
      font_size_base: branding?.font_size_base || 14
    });
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Company Information Card */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon name="Building2" size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Company Information</h2>
              <p className="text-muted-foreground">Basic company branding settings</p>
            </div>
          </div>
          {!editing && (
            <Button 
              onClick={() => setEditing(true)} 
              variant="outline"
              iconName="Edit"
              iconPosition="left"
            >
              Edit Settings
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Name
            </label>
            {editing ? (
              <Input
                value={formData?.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e?.target?.value })}
                placeholder="Enter company name"
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border">
                <p className="text-foreground font-medium">{branding?.company_name || 'Not set'}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Font Family
            </label>
            {editing ? (
              <Select
                value={formData?.font_family}
                onValueChange={(value) => setFormData({ ...formData, font_family: value })}
                options={fontOptions}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border">
                <p className="text-foreground font-medium" style={{ fontFamily: branding?.font_family }}>
                  {branding?.font_family || 'Inter'}
                </p>
              </div>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex gap-3 pt-4 border-t border-border">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              iconName={saving ? "Loader2" : "Save"}
              iconPosition="left"
              className={saving ? "animate-spin" : ""}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={saving}>
              Cancel
            </Button>
          </div>
        )}
      </Card>
      {/* Color Palette Card */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-construction/10 rounded-xl flex items-center justify-center">
            <Icon name="Palette" size={24} className="text-construction" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Color Palette</h2>
            <p className="text-muted-foreground">Your brand colors for documents and templates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Primary Color
            </label>
            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData?.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e?.target?.value })}
                    className="w-12 h-10 rounded-md border border-border cursor-pointer"
                  />
                  <Input
                    value={formData?.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e?.target?.value })}
                    placeholder="#3B82F6"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <div 
                  className="w-full h-12 rounded-md border border-border construction-shadow-sm"
                  style={{ backgroundColor: formData?.primary_color }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border">
                  <div 
                    className="w-8 h-8 rounded-md border border-border construction-shadow-sm"
                    style={{ backgroundColor: branding?.primary_color }}
                  />
                  <span className="font-mono text-sm text-foreground">{branding?.primary_color}</span>
                </div>
                <div 
                  className="w-full h-12 rounded-md border border-border construction-shadow-sm"
                  style={{ backgroundColor: branding?.primary_color }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Secondary Color
            </label>
            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData?.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e?.target?.value })}
                    className="w-12 h-10 rounded-md border border-border cursor-pointer"
                  />
                  <Input
                    value={formData?.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e?.target?.value })}
                    placeholder="#1E40AF"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <div 
                  className="w-full h-12 rounded-md border border-border construction-shadow-sm"
                  style={{ backgroundColor: formData?.secondary_color }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border">
                  <div 
                    className="w-8 h-8 rounded-md border border-border construction-shadow-sm"
                    style={{ backgroundColor: branding?.secondary_color }}
                  />
                  <span className="font-mono text-sm text-foreground">{branding?.secondary_color}</span>
                </div>
                <div 
                  className="w-full h-12 rounded-md border border-border construction-shadow-sm"
                  style={{ backgroundColor: branding?.secondary_color }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Accent Color
            </label>
            {editing ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData?.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e?.target?.value })}
                    className="w-12 h-10 rounded-md border border-border cursor-pointer"
                  />
                  <Input
                    value={formData?.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e?.target?.value })}
                    placeholder="#F59E0B"
                    className="flex-1 font-mono text-sm"
                  />
                </div>
                <div 
                  className="w-full h-12 rounded-md border border-border construction-shadow-sm"
                  style={{ backgroundColor: formData?.accent_color }}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border">
                  <div 
                    className="w-8 h-8 rounded-md border border-border construction-shadow-sm"
                    style={{ backgroundColor: branding?.accent_color }}
                  />
                  <span className="font-mono text-sm text-foreground">{branding?.accent_color}</span>
                </div>
                <div 
                  className="w-full h-12 rounded-md border border-border construction-shadow-sm"
                  style={{ backgroundColor: branding?.accent_color }}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
      {/* Typography Preview Card */}
      <Card className="p-6 bg-card border border-border construction-shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
            <Icon name="Type" size={24} className="text-success" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Typography Preview</h2>
            <p className="text-muted-foreground">How your brand fonts will look in documents</p>
          </div>
        </div>

        <div 
          className="space-y-6 p-6 bg-background border border-border rounded-lg construction-shadow-sm" 
          style={{ fontFamily: editing ? formData?.font_family : branding?.font_family }}
        >
          {/* Company Header Preview */}
          <div className="space-y-3">
            <h1 
              className="text-4xl font-bold"
              style={{ color: (editing ? formData?.primary_color : branding?.primary_color) || '#3B82F6' }}
            >
              {editing ? formData?.company_name || 'Your Company Name' : branding?.company_name || 'Your Company Name'}
            </h1>
            <p className="text-lg text-muted-foreground">
              Professional construction services and project management
            </p>
          </div>
          
          {/* Document Sample */}
          <div className="pt-6 border-t border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 
                className="text-xl font-semibold"
                style={{ color: (editing ? formData?.secondary_color : branding?.secondary_color) || '#1E40AF' }}
              >
                INVOICE #12345
              </h3>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">Due: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Bill To:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Sample Client Name</p>
                  <p>123 Client Street</p>
                  <p>City, State 12345</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Services:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Construction Services</span>
                    <span>$2,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Materials</span>
                    <span>$1,200.00</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: (editing ? formData?.accent_color : branding?.accent_color) || '#F59E0B' }}
                >
                  $3,700.00
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}