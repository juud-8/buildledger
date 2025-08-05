import React, { useState } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Building, Palette, Type, Save } from 'lucide-react';

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
    } catch (err) {
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
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Company Information</h2>
              <p className="text-gray-600">Basic company branding settings</p>
            </div>
          </div>
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              Edit Settings
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            {editing ? (
              <Input
                value={formData?.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e?.target?.value })}
                placeholder="Enter company name"
              />
            ) : (
              <p className="text-gray-900 font-medium">{branding?.company_name || 'Not set'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Family
            </label>
            {editing ? (
              <Select
                value={formData?.font_family}
                onValueChange={(value) => setFormData({ ...formData, font_family: value })}
                options={fontOptions}
              />
            ) : (
              <p className="text-gray-900 font-medium" style={{ fontFamily: branding?.font_family }}>
                {branding?.font_family || 'Inter'}
              </p>
            )}
          </div>
        </div>

        {editing && (
          <div className="mt-6 flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={saving}>
              Cancel
            </Button>
          </div>
        )}
      </div>
      {/* Color Preview Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Color Palette</h2>
            <p className="text-gray-600">Current brand colors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData?.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e?.target?.value })}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData?.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e?.target?.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: branding?.primary_color }}
                ></div>
                <span className="font-mono text-sm">{branding?.primary_color}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData?.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e?.target?.value })}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData?.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e?.target?.value })}
                  placeholder="#1E40AF"
                  className="flex-1"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: branding?.secondary_color }}
                ></div>
                <span className="font-mono text-sm">{branding?.secondary_color}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            {editing ? (
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData?.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e?.target?.value })}
                  className="w-12 h-10 rounded border"
                />
                <Input
                  value={formData?.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e?.target?.value })}
                  placeholder="#F59E0B"
                  className="flex-1"
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border"
                  style={{ backgroundColor: branding?.accent_color }}
                ></div>
                <span className="font-mono text-sm">{branding?.accent_color}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Typography Preview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Type className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Typography Preview</h2>
            <p className="text-gray-600">How your brand fonts will look</p>
          </div>
        </div>

        <div className="space-y-4" style={{ fontFamily: editing ? formData?.font_family : branding?.font_family }}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {editing ? formData?.company_name || 'Your Company' : branding?.company_name}
            </h1>
            <p className="text-lg text-gray-600 mt-2">Professional invoicing and project management</p>
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sample Document Header</h3>
            <p className="text-base text-gray-800">
              This is how your company name and content will appear in invoices, quotes, and other business documents.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}