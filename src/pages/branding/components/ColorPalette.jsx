import React, { useState } from 'react';
import { brandingService } from '../../../services/brandingService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Palette, Copy, Check, RefreshCw } from 'lucide-react';

export function ColorPalette({ branding, onUpdate, onError }) {
  const [colors, setColors] = useState({
    primary_color: branding?.primary_color || '#3B82F6',
    secondary_color: branding?.secondary_color || '#1E40AF',
    accent_color: branding?.accent_color || '#F59E0B'
  });
  const [saving, setSaving] = useState(false);
  const [copiedColor, setCopiedColor] = useState(null);

  const colorPresets = [
    { name: 'Professional Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#F59E0B' },
    { name: 'Corporate Gray', primary: '#6B7280', secondary: '#374151', accent: '#EF4444' },
    { name: 'Modern Green', primary: '#10B981', secondary: '#059669', accent: '#F59E0B' },
    { name: 'Creative Purple', primary: '#8B5CF6', secondary: '#7C3AED', accent: '#F59E0B' },
    { name: 'Bold Orange', primary: '#F97316', secondary: '#EA580C', accent: '#3B82F6' },
    { name: 'Elegant Black', primary: '#1F2937', secondary: '#111827', accent: '#EF4444' }
  ];

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({ ...prev, [colorType]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      onError?.(null);
      
      const updatedBranding = await brandingService?.updateCompanyBranding(branding?.id, colors);
      onUpdate?.(updatedBranding);
    } catch (err) {
      onError?.('Failed to update color palette');
    } finally {
      setSaving(false);
    }
  };

  const applyPreset = (preset) => {
    setColors({
      primary_color: preset?.primary,
      secondary_color: preset?.secondary,
      accent_color: preset?.accent
    });
  };

  const copyColor = async (color) => {
    try {
      await navigator.clipboard?.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      onError?.('Failed to copy color to clipboard');
    }
  };

  const generateRandomColors = () => {
    const generateColor = () => {
      return '#' + Math.floor(Math.random()*16777215)?.toString(16)?.padStart(6, '0');
    };
    
    setColors({
      primary_color: generateColor(),
      secondary_color: generateColor(),
      accent_color: generateColor()
    });
  };

  const hasChanges = 
    colors?.primary_color !== branding?.primary_color ||
    colors?.secondary_color !== branding?.secondary_color ||
    colors?.accent_color !== branding?.accent_color;

  return (
    <div className="space-y-6">
      {/* Current Colors */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Color Palette</h2>
              <p className="text-gray-600">Customize your brand colors</p>
            </div>
          </div>
          <Button onClick={generateRandomColors} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Random Colors
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { key: 'primary_color', label: 'Primary Color', description: 'Main brand color' },
            { key: 'secondary_color', label: 'Secondary Color', description: 'Supporting color' },
            { key: 'accent_color', label: 'Accent Color', description: 'Highlight color' }
          ]?.map(({ key, label, description }) => (
            <div key={key} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <p className="text-xs text-gray-500">{description}</p>
              
              <div className="flex gap-2">
                <input
                  type="color"
                  value={colors?.[key]}
                  onChange={(e) => handleColorChange(key, e?.target?.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <div className="flex-1">
                  <Input
                    value={colors?.[key]}
                    onChange={(e) => handleColorChange(key, e?.target?.value)}
                    placeholder="#000000"
                    className="font-mono"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyColor(colors?.[key])}
                >
                  {copiedColor === colors?.[key] ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div 
                className="w-full h-16 rounded-lg border flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: colors?.[key] }}
              >
                {colors?.[key]}
              </div>
            </div>
          ))}
        </div>

        {hasChanges && (
          <div className="mt-6 pt-6 border-t">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Color Palette'
              )}
            </Button>
          </div>
        )}
      </div>
      {/* Color Presets */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Presets</h3>
        <p className="text-gray-600 mb-6">Choose from professionally curated color combinations</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colorPresets?.map((preset, index) => (
            <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-2 mb-3">
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: preset?.primary }}
                ></div>
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: preset?.secondary }}
                ></div>
                <div 
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: preset?.accent }}
                ></div>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">{preset?.name}</h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyPreset(preset)}
                className="w-full"
              >
                Apply Preset
              </Button>
            </div>
          ))}
        </div>
      </div>
      {/* Color Usage Preview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
        <p className="text-gray-600 mb-6">See how your colors will look in documents</p>
        
        <div className="space-y-4">
          {/* Header Preview */}
          <div 
            className="p-6 rounded-lg text-white"
            style={{ backgroundColor: colors?.primary_color }}
          >
            <h2 className="text-2xl font-bold mb-2">{branding?.company_name || 'Your Company'}</h2>
            <p className="opacity-90">Professional invoicing and project management</p>
          </div>
          
          {/* Button Preview */}
          <div className="flex gap-4">
            <button 
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors?.primary_color }}
            >
              Primary Button
            </button>
            <button 
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors?.secondary_color }}
            >
              Secondary Button
            </button>
            <button 
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors?.accent_color }}
            >
              Accent Button
            </button>
          </div>
          
          {/* Document Preview */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors?.primary_color }}>
                  Invoice #001
                </h3>
                <p className="text-gray-600">Date: January 15, 2025</p>
              </div>
              <div 
                className="px-3 py-1 rounded text-sm font-medium text-white"
                style={{ backgroundColor: colors?.accent_color }}
              >
                Paid
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-gray-800">This is how your documents will look with the selected color palette.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}